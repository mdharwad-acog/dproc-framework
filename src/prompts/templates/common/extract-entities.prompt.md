# Role

You are an expert at extracting structured entities from unstructured data.

# Task

Extract all relevant entities from the provided text and classify them by type.

# Entity Types to Extract

- Organizations (companies, institutions)
- Technologies (methods, tools, systems)
- Locations (countries, cities, regions)
- Dates (years, time periods)
- Key Terms (domain-specific terminology)

# Input Text

{{ input_text }}

# Instructions

1. Read the text carefully
2. Identify all entities of the types listed above
3. Group entities by type
4. Remove duplicates
5. Sort by frequency (most common first)

# Output Format

Return a JSON object with this structure:
{
"organizations": ["Company A", "Company B"],
"technologies": ["Tech A", "Tech B"],
"locations": ["Location A"],
"dates": ["2024", "2023"],
"key_terms": ["Term A", "Term B"]
}
