import YahooFinance from 'yahoo-finance2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const yahooFinance = new YahooFinance();

type MonthlyReturn = {
  year: number;
  month: number;
  return: number;
}

type Metadata = {
  lastUpdated: string;
  dataSource: string;
  totalMonths: number;
  dateRange: {
    start: { year: number; month: number };
    end: { year: number; month: number };
  };
}

async function fetchSP500Data() {
  console.log('Fetching S&P 500 historical data from Yahoo Finance...');

  try {
    // Fetch historical data for S&P 500 (^GSPC)
    // Going back to 1950 to get comprehensive historical data
    const startDate = new Date('1950-01-01');
    const endDate = new Date();

    const result = await yahooFinance.chart('^GSPC', {
      period1: startDate,
      period2: endDate,
      interval: '1mo', // Monthly data
    });

    const quotes = result.quotes;
    console.log(`Fetched ${quotes.length} months of data`);

    // Transform the data into our format
    const monthlyReturns: MonthlyReturn[] = [];

    for (let i = 1; i < quotes.length; i++) {
      const currentMonth = quotes[i];
      const previousMonth = quotes[i - 1];

      const date = new Date(currentMonth.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed

      // Calculate monthly return percentage using adjusted close (accounts for dividends & splits)
      // Return = ((Current Adj Close - Previous Adj Close) / Previous Adj Close) * 100
      const monthlyReturn = ((currentMonth.adjclose - previousMonth.adjclose) / previousMonth.adjclose) * 100;

      monthlyReturns.push({
        year,
        month,
        return: parseFloat(monthlyReturn.toFixed(2)),
      });
    }

    // Sort by year and month
    monthlyReturns.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    // Create output directory if it doesn't exist
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Save to JSON file
    const outputPath = path.join(publicDir, 'sp500-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(monthlyReturns, null, 2));

    console.log(`✓ Successfully saved ${monthlyReturns.length} months of data to ${outputPath}`);
    console.log(`  Date range: ${monthlyReturns[0].year}-${monthlyReturns[0].month} to ${monthlyReturns[monthlyReturns.length - 1].year}-${monthlyReturns[monthlyReturns.length - 1].month}`);

    // Also create a metadata file
    const metadata: Metadata = {
      lastUpdated: new Date().toISOString(),
      dataSource: 'Yahoo Finance (^GSPC)',
      totalMonths: monthlyReturns.length,
      dateRange: {
        start: { year: monthlyReturns[0].year, month: monthlyReturns[0].month },
        end: { year: monthlyReturns[monthlyReturns.length - 1].year, month: monthlyReturns[monthlyReturns.length - 1].month },
      },
    };

    const metadataPath = path.join(publicDir, 'sp500-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`✓ Metadata saved to ${metadataPath}`);

  } catch (error) {
    console.error('Error fetching S&P 500 data:', error);
    process.exit(1);
  }
}

fetchSP500Data();
