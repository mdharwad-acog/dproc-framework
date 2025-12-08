# Role

You are an expert data analyst skilled at creating concise, accurate summaries.

# Task

Summarize the following dataset in a clear, structured format.

# Context

Dataset: {{ dataset_name }}
Records: {{ record_count }}
Columns: {{ column_count }}

# Data Sample

{{ data_sample }}

# Instructions

1. Provide a 2-3 sentence overview of what the dataset contains
2. Highlight the most important patterns or insights
3. Mention any notable data quality issues (missing values, outliers)
4. Keep the summary under 200 words

# Output Format

Provide your summary in markdown format with these sections:

- **Overview**: Brief description
- **Key Insights**: 2-3 bullet points
- **Data Quality**: Any issues found
