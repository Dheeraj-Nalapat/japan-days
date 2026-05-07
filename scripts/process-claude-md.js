#!/usr/bin/env node

/**
 * Process markdown files from claude-md-files/ and merge into data/ YAML files.
 *
 * Usage:
 *   node scripts/process-claude-md.js                    # process all .md files
 *   node scripts/process-claude-md.js okinawa-plan.md    # process a single file
 *
 * The script detects sections by heading keywords and appends/merges data
 * into the appropriate YAML file in data/.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const CLAUDE_DIR = path.join(__dirname, '..', 'claude-md-files');
const DATA_DIR = path.join(__dirname, '..', 'data');

const SECTION_PATTERNS = {
  itinerary: /itinerary|day\s*\d+|day\s*plan|daily\s*plan|schedule/i,
  flights: /flight|airline|booking|pnr|airport/i,
  budget: /budget|cost|expense|money|price|spend/i,
  food: /food|restaurant|eat|dining|cuisine|meal/i,
  'hidden-gems': /hidden\s*gem|quiet|secret|off.the.beaten|underrated/i,
  checklist: /checklist|todo|prepare|pack|booking|to.do/i,
  route: /route|city|journey|travel\s*path/i,
  trip: /overview|trip\s*info|general|meta/i,
};

function parseMarkdownSections(content) {
  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)/);
    const h3Match = line.match(/^###\s+(.+)/);

    if (h2Match) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        heading: h2Match[1].trim(),
        level: 2,
        subsections: [],
        items: [],
        raw: [],
      };
    } else if (h3Match && currentSection) {
      currentSection.subsections.push({
        heading: h3Match[1].trim(),
        items: [],
        raw: [],
      });
    } else if (currentSection) {
      const target = currentSection.subsections.length > 0
        ? currentSection.subsections[currentSection.subsections.length - 1]
        : currentSection;

      const bulletMatch = line.match(/^[-*]\s+(.+)/);
      if (bulletMatch) {
        const text = bulletMatch[1].trim();
        const boldMatch = text.match(/\*\*(.+?)\*\*\s*[-–—:]\s*(.*)/);
        if (boldMatch) {
          target.items.push({ name: boldMatch[1], desc: boldMatch[2] });
        } else {
          target.items.push({ text });
        }
      }
      target.raw.push(line);
    }
  }
  if (currentSection) sections.push(currentSection);
  return sections;
}

function detectSectionType(heading) {
  for (const [type, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(heading)) return type;
  }
  return null;
}

function loadYAML(name) {
  const filepath = path.join(DATA_DIR, `${name}.yaml`);
  if (!fs.existsSync(filepath)) return null;
  return yaml.load(fs.readFileSync(filepath, 'utf8'));
}

function saveYAML(name, data) {
  const filepath = path.join(DATA_DIR, `${name}.yaml`);
  fs.writeFileSync(filepath, yaml.dump(data, { lineWidth: -1, noRefs: true }), 'utf8');
  console.log(`  ✓ Updated ${filepath}`);
}

function mergeBudgetItems(section, data) {
  if (!data) data = { items: [], total: '', summary: { title: '', paragraphs: [], buffer_amount: '', extra_note: '' } };
  for (const item of section.items) {
    if (item.name && item.desc) {
      const amountMatch = item.desc.match(/[₹¥$]\S+/);
      if (amountMatch) {
        const existing = data.items.find(b => b.name === item.name);
        if (existing) {
          existing.amount = amountMatch[0];
        } else {
          data.items.push({
            name: item.name,
            amount: amountMatch[0],
            weight: 0.2,
          });
        }
      }
    }
  }
  return data;
}

function mergeFoodItems(section, data) {
  if (!data) data = { cities: [] };
  for (const sub of section.subsections) {
    const cityName = sub.heading;
    let city = data.cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (!city) {
      city = { name: cityName, items: [] };
      data.cities.push(city);
    }
    for (const item of sub.items) {
      const text = item.name || item.text;
      if (text && !city.items.includes(text)) {
        city.items.push(text);
      }
    }
  }
  return data;
}

function mergeHiddenGems(section, data) {
  if (!data) data = { gems: [] };
  const items = [...section.items];
  for (const sub of section.subsections) {
    items.push(...sub.items);
  }
  for (const item of items) {
    if (item.name) {
      const existing = data.gems.find(g => g.name === item.name);
      if (!existing) {
        data.gems.push({
          city: '',
          name: item.name,
          description: item.desc || '',
          crowd_level: 1,
          crowd_label: 'Very Low',
        });
      }
    }
  }
  return data;
}

function mergeChecklist(section, data) {
  if (!data) data = { groups: [] };
  const groupTitle = section.heading.replace(/checklist\s*[-–—:]\s*/i, '').trim() || 'New Items';

  let group = data.groups.find(g => g.title.toLowerCase() === groupTitle.toLowerCase());
  if (!group) {
    group = { title: groupTitle, items: [] };
    data.groups.push(group);
  }

  for (const item of section.items) {
    const text = item.name ? `${item.name} — ${item.desc}` : item.text;
    if (text && !group.items.includes(text)) {
      group.items.push(text);
    }
  }
  return data;
}

function processFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const filename = path.basename(filepath);
  console.log(`\nProcessing: ${filename}`);

  const sections = parseMarkdownSections(content);
  if (sections.length === 0) {
    console.log('  No structured sections found. Skipping.');
    return;
  }

  for (const section of sections) {
    const sectionType = detectSectionType(section.heading);
    if (!sectionType) {
      console.log(`  ? Unknown section: "${section.heading}" — skipping`);
      continue;
    }

    console.log(`  → Detected: ${sectionType} from "${section.heading}"`);
    let data = loadYAML(sectionType);

    switch (sectionType) {
      case 'budget':
        data = mergeBudgetItems(section, data);
        break;
      case 'food':
        data = mergeFoodItems(section, data);
        break;
      case 'hidden-gems':
        data = mergeHiddenGems(section, data);
        break;
      case 'checklist':
        data = mergeChecklist(section, data);
        break;
      default:
        console.log(`  ℹ Auto-merge not implemented for "${sectionType}" — please update data/${sectionType}.yaml manually`);
        continue;
    }

    saveYAML(sectionType, data);
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    for (const arg of args) {
      const filepath = path.isAbsolute(arg) ? arg : path.join(CLAUDE_DIR, arg);
      if (!fs.existsSync(filepath)) {
        console.error(`File not found: ${filepath}`);
        continue;
      }
      processFile(filepath);
    }
  } else {
    const files = fs.readdirSync(CLAUDE_DIR)
      .filter(f => f.endsWith('.md') && f !== 'README.md')
      .map(f => path.join(CLAUDE_DIR, f));

    if (files.length === 0) {
      console.log('No markdown files found in claude-md-files/');
      console.log('Drop your Claude conversation exports there and run this script again.');
      return;
    }

    for (const file of files) {
      processFile(file);
    }
  }

  console.log('\nDone! Refresh the website to see the changes.');
}

main();
