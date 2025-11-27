import YahooFinance from 'yahoo-finance2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pMap from 'p-map';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const yahooFinance = new YahooFinance();

type MonthlyReturn = {
  year: number;
  month: number;
  return: number;
}

type StockMetadata = {
  ticker: string;
  name: string;
  lastUpdated: string;
  dataSource: string;
  totalMonths: number;
  dateRange: {
    start: { year: number; month: number };
    end: { year: number; month: number };
  };
}

// Popular stocks to fetch + TFC
const STOCKS = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.' },
  { ticker: 'TSLA', name: 'Tesla Inc.' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'META', name: 'Meta Platforms Inc.' },
  { ticker: 'BRK-B', name: 'Berkshire Hathaway Inc.' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
  { ticker: 'V', name: 'Visa Inc.' },
  { ticker: 'TFC', name: 'Truist Financial Corporation' },
];

async function fetchStockData(ticker: string, name: string) {
  console.log(`\nFetching data for ${ticker} (${name})...`);

  try {
    // Fetch historical data going back to 1950 (or as far as available)
    const startDate = new Date('1950-01-01');
    const endDate = new Date();

    const result = await yahooFinance.chart(ticker, {
      period1: startDate,
      period2: endDate,
      interval: '1mo', // Monthly data
    });

    const quotes = result.quotes;
    console.log(`  Fetched ${quotes.length} months of data`);

    if (quotes.length === 0) {
      console.log(`  ⚠️  No data available for ${ticker}`);
      return null;
    }

    // Transform the data into our format (calculate monthly returns)
    const monthlyReturns: MonthlyReturn[] = [];

    for (let i = 1; i < quotes.length; i++) {
      const currentMonth = quotes[i];
      const previousMonth = quotes[i - 1];

      const date = new Date(currentMonth.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed

      // Calculate monthly return percentage
      // Return = ((Current Close - Previous Close) / Previous Close) * 100
      const monthlyReturn = ((currentMonth.close - previousMonth.close) / previousMonth.close) * 100;

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

    console.log(`  ✓ Processed ${monthlyReturns.length} months of returns`);
    console.log(`  Date range: ${monthlyReturns[0].year}-${monthlyReturns[0].month} to ${monthlyReturns[monthlyReturns.length - 1].year}-${monthlyReturns[monthlyReturns.length - 1].month}`);

    return {
      returns: monthlyReturns,
      metadata: {
        ticker,
        name,
        lastUpdated: new Date().toISOString(),
        dataSource: 'Yahoo Finance',
        totalMonths: monthlyReturns.length,
        dateRange: {
          start: { year: monthlyReturns[0].year, month: monthlyReturns[0].month },
          end: { year: monthlyReturns[monthlyReturns.length - 1].year, month: monthlyReturns[monthlyReturns.length - 1].month },
        },
      }
    };

  } catch (error) {
    console.error(`  ✗ Error fetching ${ticker}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

async function fetchAllStocks() {
  console.log('Fetching historical data for popular stocks...\n');

  // Create output directory if it doesn't exist
  const publicDir = path.join(__dirname, '..', 'public');
  const stocksDir = path.join(publicDir, 'stocks');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  if (!fs.existsSync(stocksDir)) {
    fs.mkdirSync(stocksDir, { recursive: true });
  }

  const successfulStocks: { ticker: string; name: string }[] = [];
  const failedStocks: string[] = [];

  // Fetch stocks in parallel with concurrency limit
  await pMap(
    STOCKS,
    async (stock) => {
      const data = await fetchStockData(stock.ticker, stock.name);

      if (data) {
        // Save returns data
        const returnsPath = path.join(stocksDir, `${stock.ticker}-data.json`);
        fs.writeFileSync(returnsPath, JSON.stringify(data.returns, null, 2));

        // Save metadata
        const metadataPath = path.join(stocksDir, `${stock.ticker}-metadata.json`);
        fs.writeFileSync(metadataPath, JSON.stringify(data.metadata, null, 2));

        successfulStocks.push({ ticker: stock.ticker, name: stock.name });
      } else {
        failedStocks.push(stock.ticker);
      }
    },
    { concurrency: 3 } // Fetch 3 stocks at a time to avoid rate limiting
  );

  // Create an index file with all available stocks
  const indexPath = path.join(stocksDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(successfulStocks, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log(`✓ Successfully fetched ${successfulStocks.length} stocks`);
  console.log(`✗ Failed to fetch ${failedStocks.length} stocks: ${failedStocks.join(', ')}`);
  console.log(`\nStock data saved to: ${stocksDir}`);
  console.log('='.repeat(60));
}

fetchAllStocks();
