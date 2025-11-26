# Historical S&P 500 Returns Calculator

A web application that calculates investment growth based on real historical S&P 500 returns data.

## Features

- **Real Historical Data**: Uses actual S&P 500 monthly returns from Yahoo Finance
- **Automatic Data Updates**: Fetch the latest market data with a single command
- **Compound Returns Calculation**: Accurately calculates portfolio growth with monthly contributions
- **Beautiful UI**: Clean, modern interface built with Tailwind CSS v4
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework (using Vite plugin)
- **yahoo-finance2** - Real-time S&P 500 data fetching

## Getting Started

### Installation

```bash
npm install
```

### Fetch Latest S&P 500 Data

Before running the app for the first time, fetch the latest historical data:

```bash
npm run update-data
```

This command:
- Fetches S&P 500 historical monthly returns from Yahoo Finance
- Saves data to `public/sp500-data.json`
- Creates metadata file at `public/sp500-metadata.json`

### Development

```bash
npm run dev
```

Open your browser to the URL shown (typically http://localhost:5173 or http://localhost:5174)

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Updating Data

The S&P 500 data is fetched from Yahoo Finance and stored locally. To update to the latest data:

```bash
npm run update-data
```

You should run this periodically to keep the data current. The app displays the last update date in the footer.

## How It Works

1. **Data Source**: The app uses the `yahoo-finance2` npm package to fetch historical S&P 500 index data (ticker: ^GSPC)
2. **Monthly Returns**: The fetching script calculates month-over-month returns and saves them as JSON
3. **Calculation**: The calculator applies these historical returns month-by-month with compound interest
4. **Monthly Contributions**: Contributions are added at the beginning of each month (except the first)

## Data Coverage

Current data spans from **February 1985** to **November 2025**, giving you over 40 years of historical market data including:
- Black Monday (1987)
- Dot-com bubble (2000-2002)
- Financial crisis (2008-2009)
- COVID-19 pandemic (2020)
- Recent market volatility (2022-2024)

## Example Usage

1. Enter your starting investment amount (e.g., $10,000)
2. Enter your monthly contribution (e.g., $500)
3. Select start date (e.g., January 2020)
4. Select end date (e.g., November 2025)
5. Click "Calculate Returns"

The app will show:
- Final portfolio value
- Total contributions
- Total gains
- Overall return percentage

## License

ISC
