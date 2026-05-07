# Claude Markdown Files

Drop markdown files from your Claude conversations here. These files will be processed and integrated into the Japan trip website.

## How it works

1. Chat with Claude on the web about your Japan trip plans
2. Copy the markdown output and save it as a `.md` file in this folder
3. Run `node scripts/process-claude-md.js` to parse and merge the data into your YAML files in `data/`
4. The website automatically reflects the updated data

## Naming convention

Name your files descriptively so you can track what each conversation covered:

- `accommodation-research.md`
- `okinawa-day-plan.md`
- `budget-update.md`
- `restaurant-recommendations.md`

## Supported sections

The processor can detect and extract data for these sections:

- **Itinerary** — day-by-day plans, places to visit
- **Flights** — flight details, booking changes
- **Budget** — cost breakdowns, new expenses
- **Food** — restaurant and food recommendations
- **Hidden Gems** — off-the-beaten-path places
- **Checklist** — preparation items, things to book/pack
- **Route** — route changes, new city additions

## File format

The processor works best with structured markdown. Example:

```markdown
## Itinerary Update — Tokyo Day 13

### Morning
- **Senso-ji Temple** — arrive before 7am for the misty atmosphere

### Afternoon  
- **Akihabara** — electronics and anime district

## Budget Addition
- Senso-ji: Free
- Akihabara shopping: ₹5,000
```
