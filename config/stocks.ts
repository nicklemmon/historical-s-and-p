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

  // Popular Mutual Funds - Vanguard
  { ticker: 'VFIAX', name: 'Vanguard 500 Index Fund Admiral' },
  { ticker: 'VTSAX', name: 'Vanguard Total Stock Market Index Admiral' },
  { ticker: 'VTIAX', name: 'Vanguard Total Intl Stock Index Admiral' },
  { ticker: 'VBTLX', name: 'Vanguard Total Bond Market Index Admiral' },
  { ticker: 'VWINX', name: 'Vanguard Wellesley Income Fund' },
  { ticker: 'VWELX', name: 'Vanguard Wellington Fund' },
  { ticker: 'VGENX', name: 'Vanguard Energy Fund' },
  { ticker: 'VGHCX', name: 'Vanguard Health Care Fund' },

  // Popular Mutual Funds - Fidelity
  { ticker: 'FXAIX', name: 'Fidelity 500 Index Fund' },
  { ticker: 'FSKAX', name: 'Fidelity Total Market Index Fund' },
  { ticker: 'FTIHX', name: 'Fidelity Total International Index Fund' },
  { ticker: 'FXNAX', name: 'Fidelity US Bond Index Fund' },
  { ticker: 'FBGRX', name: 'Fidelity Blue Chip Growth Fund' },
  { ticker: 'FCNTX', name: 'Fidelity Contrafund' },

  // Popular Mutual Funds - Schwab
  { ticker: 'SWPPX', name: 'Schwab S&P 500 Index Fund' },
  { ticker: 'SWTSX', name: 'Schwab Total Stock Market Index Fund' },
  { ticker: 'SWISX', name: 'Schwab International Index Fund' },
  { ticker: 'SWAGX', name: 'Schwab US Aggregate Bond Index Fund' },
];
