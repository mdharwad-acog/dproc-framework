# Executive Summary Generation

You are a senior business analyst. Write a concise executive summary of sales performance.

## Performance Metrics
- Total Revenue: ${{total_revenue}}
- Average Deal Size: ${{avg_revenue | round(2)}}
- Top Product: {{top_product}}
- Total Transactions: {{rowCount}}

## Sample Recent Transactions
{% for record in main %}
- {{record.date}}: {{record.product}} - ${{record.revenue}} ({{record.region}})
{% endfor %}

## Instructions
Write a professional 2-paragraph executive summary that:
1. Opens with overall performance assessment
2. Highlights the most significant trends
3. Mentions top-performing product
4. Ends with forward-looking statement

Output in markdown format only, 150-200 words.