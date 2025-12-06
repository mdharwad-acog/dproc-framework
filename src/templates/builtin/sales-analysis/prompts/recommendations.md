# Strategic Recommendations

Based on the sales data, provide 3 strategic recommendations.

## Context

- Total Revenue: ${{total_revenue}}
- Growth Rate: {{growth_rate}}%
- Top Product: {{top_product}}

## Recent Activity

{% for record in main %}

- {{record.product}}: ${{record.revenue}}
  {% endfor %}

## Instructions

Generate exactly 3 strategic recommendations that:

1. Address opportunities for growth
2. Suggest risk mitigation strategies
3. Propose operational improvements

Each recommendation should:

- Be specific and actionable
- Reference data from the analysis
- Be achievable within 1-2 quarters

**Output format:** Return ONLY a JSON array:
["Recommendation 1", "Recommendation 2", "Recommendation 3"]
