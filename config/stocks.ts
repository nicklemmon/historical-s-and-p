/**
 * Stock ticker configuration
 * Add or remove stocks here to control which stocks are available in the comparison tool
 */

export type StockConfig = {
  ticker: string;
  name: string;
}

export const STOCKS: StockConfig[] = [
  // Major Tech
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.' },
  { ticker: 'META', name: 'Meta Platforms Inc.' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'TSLA', name: 'Tesla Inc.' },

  // Finance
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
  { ticker: 'BAC', name: 'Bank of America Corp.' },
  { ticker: 'WFC', name: 'Wells Fargo & Company' },
  { ticker: 'GS', name: 'Goldman Sachs Group Inc.' },
  { ticker: 'MS', name: 'Morgan Stanley' },
  { ticker: 'C', name: 'Citigroup Inc.' },
  { ticker: 'TFC', name: 'Truist Financial Corporation' },

  // Consumer & Retail
  { ticker: 'WMT', name: 'Walmart Inc.' },
  { ticker: 'HD', name: 'Home Depot Inc.' },
  { ticker: 'COST', name: 'Costco Wholesale Corporation' },
  { ticker: 'NKE', name: 'Nike Inc.' },
  { ticker: 'MCD', name: "McDonald's Corporation" },
  { ticker: 'SBUX', name: 'Starbucks Corporation' },

  // Healthcare & Pharma
  { ticker: 'JNJ', name: 'Johnson & Johnson' },
  { ticker: 'UNH', name: 'UnitedHealth Group Inc.' },
  { ticker: 'PFE', name: 'Pfizer Inc.' },
  { ticker: 'ABBV', name: 'AbbVie Inc.' },
  { ticker: 'TMO', name: 'Thermo Fisher Scientific Inc.' },

  // Industrials & Conglomerates
  { ticker: 'BRK-B', name: 'Berkshire Hathaway Inc.' },
  { ticker: 'BA', name: 'Boeing Company' },
  { ticker: 'CAT', name: 'Caterpillar Inc.' },
  { ticker: 'GE', name: 'General Electric Company' },

  // Telecommunications & Media
  { ticker: 'T', name: 'AT&T Inc.' },
  { ticker: 'VZ', name: 'Verizon Communications Inc.' },
  { ticker: 'DIS', name: 'Walt Disney Company' },
  { ticker: 'NFLX', name: 'Netflix Inc.' },
  { ticker: 'CMCSA', name: 'Comcast Corporation' },

  // Energy
  { ticker: 'XOM', name: 'Exxon Mobil Corporation' },
  { ticker: 'CVX', name: 'Chevron Corporation' },

  // Payment & Financial Services
  { ticker: 'V', name: 'Visa Inc.' },
  { ticker: 'MA', name: 'Mastercard Inc.' },
  { ticker: 'PYPL', name: 'PayPal Holdings Inc.' },

  // Semiconductors
  { ticker: 'INTC', name: 'Intel Corporation' },
  { ticker: 'AMD', name: 'Advanced Micro Devices Inc.' },
  { ticker: 'QCOM', name: 'QUALCOMM Inc.' },
];
