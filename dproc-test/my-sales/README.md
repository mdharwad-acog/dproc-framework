# LLM Data Report: my-sales

This is an LLM Data Framework project.

## Getting Started

1. Install dependencies and set up the environment:
   ```bash
   llm-framework setup
   ```

2. Add your data to `data/` directory

3. Generate report:
   ```bash
   llm-framework generate
   ```

## Files

- `llm-framework.config.json` - Data sources and field definitions
- `spec.yml` - Report structure and LLM variables
- `prompts/` - LLM prompt templates
- `templates/` - Report layout templates
- `data/` - Your datasets
- `output/` - Generated reports

## Customize

Edit files to:
- Change data sources in config
- Add custom/computed fields in config
- Modify report structure in spec.yml
- Adjust prompts for better output
- Update template layout