# Key Insights Extraction

Analyze the sales data and extract 4-5 key insights.

## Metrics

- Total Revenue: ${{total_revenue}}
- Average Revenue: ${{avg_revenue | round(2)}}
- Growth Rate: {{growth_rate}}%
- Top Product: {{top_product}}

## Regional Breakdown

{% for region, revenue in revenue_by_region %}

- {{region}}: ${{revenue}}
  {% endfor %}

## Instructions

Generate 4-5 bullet-point insights that:

- Are specific and data-driven
- Highlight notable patterns or anomalies
- Compare performance across dimensions (products, regions, time)
- Are actionable or decision-relevant

**Output format:** Return ONLY a JSON array of strings:
["Insight 1", "Insight 2", "Insight 3", "Insight 4"]

No additional text or formatting.
