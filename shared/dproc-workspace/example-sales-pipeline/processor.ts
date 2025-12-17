
import axios from 'axios';

// This is the main processing function for the pipeline.
// It receives the validated inputs and the pipeline context.
export default async function process(inputs: any, context: any) {
  const { logger, llm } = context;

  logger.log(`Fetching CSV data from: ${inputs.csvUrl}`);
  
  // 1. Fetch CSV data from the provided URL
  const response = await axios.get(inputs.csvUrl);
  const csvData = response.data;
  
  logger.log('Parsing CSV data...');

  // 2. Parse the CSV data (this is a simplified parser)
  const rows = csvData.trim().split('\n').slice(1);
  const sales = rows.map((row: string) => {
    const [date, product, revenue] = row.split(',');
    return { 
      date, 
      product, 
      revenue: parseFloat(revenue) 
    };
  }).filter((s:any) => s.product && !isNaN(s.revenue));
  
  if(sales.length === 0) {
    throw new Error("No valid sales data could be parsed from the CSV.");
  }

  logger.log(`Found ${sales.length} sales records.`);

  // 3. Calculate key metrics from the sales data
  const totalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);
  const avgRevenue = totalRevenue / sales.length;
  const topProducts = sales.sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  logger.log('Generating AI insights...');

  // 4. Use the framework's LLM client to generate insights
  const prompt = `
    Analyze the following sales data summary.
    - Total Revenue: $${totalRevenue.toFixed(2)}
    - Average Revenue per Transaction: $${avgRevenue.toFixed(2)}
    - Top 5 products by revenue: ${JSON.stringify(topProducts)}
    
    Provide three distinct, actionable business insights based on this data.
    Present them as a bulleted list.
  `;
  const insights = await llm.generate(prompt);
  
  logger.log('Data processing complete.');

  // 5. Return the processed data to be used in the template
  return {
    totalRevenue: totalRevenue.toFixed(2),
    avgRevenue: avgRevenue.toFixed(2),
    insights,
    topProducts,
    generatedAt: new Date().toISOString(),
  };
}
