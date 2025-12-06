# Summary Prompt

Generate a brief 2-sentence summary of this data:

**Records:** {{main | length}}
**Total Revenue:** ${{total_revenue}}

**Sample Data:**
{% for record in main %}

- {{record.date}}: {{record.product}} (${{record.revenue}})
  {% endfor %}

Output only the summary text, no extra formatting.
