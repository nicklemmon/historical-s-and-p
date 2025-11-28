import './style.css';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

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

type StockInfo = {
  ticker: string;
  name: string;
}

let sp500MonthlyReturns: MonthlyReturn[] = [];
let metadata: Metadata | null = null;
let portfolioChart: Chart | null = null;
let availableStocks: StockInfo[] = [];
let selectedStockReturns: MonthlyReturn[] | null = null;

// Create the app HTML
const app = document.querySelector<HTMLDivElement>('#app')!;

// Show loading state
app.innerHTML = `
  <div class="min-h-screen bg-[#1a1a2e] py-6 px-4 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#3b82f6] mb-4"></div>
      <p class="text-[#9ca3af] text-base">Loading market data...</p>
    </div>
  </div>
`;

// Load data from JSON file
async function loadData() {
  try {
    const [dataResponse, metadataResponse, stocksResponse] = await Promise.all([
      fetch('/sp500-data.json'),
      fetch('/sp500-metadata.json'),
      fetch('/stocks/index.json'),
    ]);

    if (!dataResponse.ok || !metadataResponse.ok) {
      throw new Error('Failed to load data');
    }

    sp500MonthlyReturns = await dataResponse.json();
    metadata = await metadataResponse.json();

    // Load available stocks (optional - won't fail if not available)
    if (stocksResponse.ok) {
      availableStocks = await stocksResponse.json();
    }

    // Initialize the app once data is loaded
    initializeApp();
  } catch (error) {
    console.error('Error loading data:', error);
    app.innerHTML = `
      <div class="min-h-screen bg-[#1a1a2e] py-6 px-4 flex items-center justify-center">
        <div class="bg-[#16213e] border border-[#ef4444] rounded-lg p-6 max-w-md">
          <h2 class="text-lg font-semibold text-[#ef4444] mb-3">Error Loading Data</h2>
          <p class="text-[#9ca3af] text-sm mb-4">Failed to load S&P 500 historical data. Please run:</p>
          <code class="block bg-[#0f1419] border border-[#2d3748] rounded p-3 text-[#10b981] text-sm">npm run update-data</code>
        </div>
      </div>
    `;
  }
}

function initializeApp() {
  const dateRange = {
    earliest: { year: sp500MonthlyReturns[0].year, month: sp500MonthlyReturns[0].month },
    latest: { year: sp500MonthlyReturns[sp500MonthlyReturns.length - 1].year, month: sp500MonthlyReturns[sp500MonthlyReturns.length - 1].month },
  };

  const lastUpdated = metadata ? new Date(metadata.lastUpdated).toLocaleDateString() : 'Unknown';

  app.innerHTML = `
  <div class="min-h-screen bg-[#1a1a2e] py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="bg-[#16213e] border border-[#2d3748] rounded-lg p-6 mb-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-[#2d3748] pb-4 mb-6">
          <div>
            <h1 class="text-2xl font-bold text-[#f3f4f6] mb-1">S&P 500 Portfolio Calculator</h1>
            <p class="text-[#9ca3af] text-sm">Historical returns analysis • ${dateRange.earliest.year}-${dateRange.latest.year}</p>
          </div>
          <div class="text-right">
            <div class="text-[#6b7280] text-xs uppercase tracking-wide">Last Updated</div>
            <div class="text-[#f3f4f6] text-sm font-medium mt-1">${lastUpdated}</div>
          </div>
        </div>

        <form id="calculator-form" class="space-y-5">
          <!-- Input Grid -->
          <div class="grid grid-cols-3 gap-4">
            <!-- Starting Amount -->
            <div>
              <label for="starting-amount" class="block text-[#9ca3af] text-sm font-medium mb-2">
                Starting Amount
              </label>
              <input
                type="text"
                id="starting-amount"
                name="starting-amount"
                value="$10,000"
                class="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-md text-[#f3f4f6] text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] focus:outline-none transition"
                required
              />
            </div>

            <!-- Monthly Contribution -->
            <div>
              <label for="monthly-contribution" class="block text-[#9ca3af] text-sm font-medium mb-2">
                Monthly Contribution
              </label>
              <input
                type="text"
                id="monthly-contribution"
                name="monthly-contribution"
                value="$500"
                class="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-md text-[#f3f4f6] text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] focus:outline-none transition"
                required
              />
            </div>

            <!-- Stock Comparison -->
            ${availableStocks.length > 0 ? `
            <div>
              <label for="compare-stock" class="block text-[#9ca3af] text-sm font-medium mb-2">
                Compare Stock
              </label>
              <select
                id="compare-stock"
                name="compare-stock"
                class="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-md text-[#f3f4f6] text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] focus:outline-none transition"
              >
                <option value="">S&P 500 Only</option>
                ${availableStocks.map(stock => `<option value="${stock.ticker}">${stock.ticker} - ${stock.name}</option>`).join('')}
              </select>
            </div>
            ` : ''}
          </div>

          <!-- Date Range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[#9ca3af] text-sm font-medium mb-2">
                Start Date
              </label>
              <div class="grid grid-cols-2 gap-2">
                <select
                  id="start-month"
                  name="start-month"
                  class="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-md text-[#f3f4f6] text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] focus:outline-none transition"
                >
                  ${generateMonthOptions(1)}
                </select>
                <select
                  id="start-year"
                  name="start-year"
                  class="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-md text-[#f3f4f6] text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] focus:outline-none transition"
                >
                  ${generateYearOptions(dateRange.earliest.year, dateRange.latest.year, 2020)}
                </select>
              </div>
            </div>

            <div>
              <label class="block text-[#9ca3af] text-sm font-medium mb-2">
                End Date
              </label>
              <div class="grid grid-cols-2 gap-2">
                <select
                  id="end-month"
                  name="end-month"
                  class="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-md text-[#f3f4f6] text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] focus:outline-none transition"
                >
                  ${generateMonthOptions(dateRange.latest.month)}
                </select>
                <select
                  id="end-year"
                  name="end-year"
                  class="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-md text-[#f3f4f6] text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] focus:outline-none transition"
                >
                  ${generateYearOptions(dateRange.earliest.year, dateRange.latest.year, dateRange.latest.year)}
                </select>
              </div>
            </div>
          </div>

          <!-- Calculate Button -->
          <button
            type="submit"
            class="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-3 px-6 rounded-md transition duration-200 shadow-lg hover:shadow-xl"
          >
            Calculate Returns
          </button>
        </form>

        <!-- Results Section -->
        <div id="results" class="mt-6 hidden">
          <div class="border-t border-[#2d3748] pt-6">
            <div class="mb-4">
              <h2 class="text-lg font-semibold text-[#f3f4f6]">Results</h2>
            </div>

            <div class="grid grid-cols-4 gap-4 mb-6">
              <div class="bg-[#0f1419] border border-[#10b981] rounded-lg p-4">
                <p class="text-[#9ca3af] text-xs font-medium uppercase tracking-wide mb-2">Final Value</p>
                <p id="final-value" class="text-[#10b981] text-2xl font-bold"></p>
              </div>

              <div class="bg-[#0f1419] border border-[#2d3748] rounded-lg p-4">
                <p class="text-[#9ca3af] text-xs font-medium uppercase tracking-wide mb-2">Contributions</p>
                <p id="total-contributions" class="text-[#f3f4f6] text-xl font-bold"></p>
              </div>

              <div class="bg-[#0f1419] border border-[#2d3748] rounded-lg p-4">
                <p class="text-[#9ca3af] text-xs font-medium uppercase tracking-wide mb-2">Total Gains</p>
                <p id="total-gains" class="text-[#f59e0b] text-xl font-bold"></p>
              </div>

              <div class="bg-[#0f1419] border border-[#2d3748] rounded-lg p-4">
                <p class="text-[#9ca3af] text-xs font-medium uppercase tracking-wide mb-2">Return %</p>
                <p id="total-return" class="text-[#10b981] text-xl font-bold"></p>
              </div>
            </div>

            <!-- Portfolio Growth Chart -->
            <div class="bg-[#0f1419] border border-[#2d3748] rounded-lg p-5">
              <h3 class="text-sm font-semibold text-[#f3f4f6] mb-4">Portfolio Growth Over Time</h3>
              <div class="relative" style="height: 400px;">
                <canvas id="portfolio-chart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div id="error-message" class="mt-6 hidden">
          <div class="bg-[#0f1419] border border-[#ef4444] rounded-lg p-4">
            <p class="text-[#ef4444] text-sm"></p>
          </div>
        </div>
      </div>

      <!-- Data Source -->
      <div class="mt-4 text-center">
        <p class="text-[#6b7280] text-xs">Data: ${metadata?.dataSource || 'Yahoo Finance'} • Updated: ${lastUpdated}</p>
      </div>
    </div>
  </div>
`;

  // Set up event listeners after HTML is rendered
  setupEventListeners();
}

// Helper functions for generating options
function generateMonthOptions(selectedMonth: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return months
    .map((month, index) => {
      const value = index + 1;
      const selected = value === selectedMonth ? 'selected' : '';
      return `<option value="${value}" ${selected}>${month}</option>`;
    })
    .join('');
}

function generateYearOptions(min: number, max: number, selectedYear: number): string {
  const years = [];
  for (let year = max; year >= min; year--) {
    years.push(year);
  }

  return years
    .map(year => {
      const selected = year === selectedYear ? 'selected' : '';
      return `<option value="${year}" ${selected}>${year}</option>`;
    })
    .join('');
}

// Currency formatting helpers
function formatCurrency(value: string): string {
  // Remove all non-numeric characters except decimal point
  const numericValue = value.replace(/[^\d.]/g, '');

  // Parse as number
  const number = parseFloat(numericValue);

  if (isNaN(number)) {
    return '$';
  }

  // Format with commas
  const parts = number.toFixed(0).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return '$' + parts[0];
}

function parseCurrency(value: string): number {
  // Remove all non-numeric characters except decimal point
  let numericValue = value.replace(/[^\d.]/g, '');

  // Handle multiple decimal points by keeping only the first one
  const decimalIndex = numericValue.indexOf('.');
  if (decimalIndex !== -1) {
    numericValue = numericValue.substring(0, decimalIndex + 1) +
                   numericValue.substring(decimalIndex + 1).replace(/\./g, '');
  }

  return parseFloat(numericValue) || 0;
}

// Set up event listeners
function setupEventListeners(): void {
  const form = document.querySelector('#calculator-form') as HTMLFormElement;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateReturns();
  });

  // Currency formatting for starting amount
  const startingAmountInput = document.querySelector('#starting-amount') as HTMLInputElement;
  startingAmountInput.addEventListener('input', (e) => {
    const input = e.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    const oldLength = input.value.length;

    input.value = formatCurrency(input.value);

    // Adjust cursor position after formatting
    const newLength = input.value.length;
    const lengthDiff = newLength - oldLength;
    input.setSelectionRange(cursorPosition + lengthDiff, cursorPosition + lengthDiff);
  });

  // Currency formatting for monthly contribution
  const monthlyContributionInput = document.querySelector('#monthly-contribution') as HTMLInputElement;
  monthlyContributionInput.addEventListener('input', (e) => {
    const input = e.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    const oldLength = input.value.length;

    input.value = formatCurrency(input.value);

    // Adjust cursor position after formatting
    const newLength = input.value.length;
    const lengthDiff = newLength - oldLength;
    input.setSelectionRange(cursorPosition + lengthDiff, cursorPosition + lengthDiff);
  });
}

// Load stock data
async function loadStockData(ticker: string): Promise<MonthlyReturn[] | null> {
  try {
    const response = await fetch(`/stocks/${ticker}-data.json`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${ticker} data:`, error);
    return null;
  }
}

// Helper function to calculate portfolio returns
function calculatePortfolioReturns(
  returns: MonthlyReturn[],
  startingAmount: number,
  monthlyContribution: number,
  startDate: number,
  endDate: number
) {
  // Filter returns for the selected date range
  const relevantReturns = returns.filter((entry) => {
    const entryDate = entry.year * 12 + entry.month;
    return entryDate >= startDate && entryDate <= endDate;
  });

  if (relevantReturns.length === 0) {
    return null;
  }

  // Calculate compound returns and track values over time
  let portfolioValue = startingAmount;
  let totalContributions = startingAmount;

  const chartLabels: string[] = [];
  const chartValues: number[] = [];
  const chartContributions: number[] = [];

  relevantReturns.forEach((monthData, index) => {
    // Add monthly contribution at the beginning of each month (except the first month)
    if (index > 0) {
      portfolioValue += monthlyContribution;
      totalContributions += monthlyContribution;
    }

    // Apply the month's return
    const monthlyReturn = monthData.return / 100;
    portfolioValue *= (1 + monthlyReturn);

    // Track value for chart after each month's returns are applied
    chartLabels.push(`${monthData.year}-${String(monthData.month).padStart(2, '0')}`);
    chartValues.push(portfolioValue);
    chartContributions.push(totalContributions);
  });

  const totalGains = portfolioValue - totalContributions;
  const totalReturnPercentage = totalContributions > 0
    ? ((portfolioValue - totalContributions) / totalContributions) * 100
    : 0;

  return {
    portfolioValue,
    totalContributions,
    totalGains,
    totalReturnPercentage,
    chartLabels,
    chartValues,
    chartContributions,
  };
}

// Calculate returns function
async function calculateReturns(): Promise<void> {
  const startingAmount = parseCurrency((document.querySelector('#starting-amount') as HTMLInputElement).value);
  const monthlyContribution = parseCurrency((document.querySelector('#monthly-contribution') as HTMLInputElement).value);
  const startMonth = parseInt((document.querySelector('#start-month') as HTMLSelectElement).value);
  const startYear = parseInt((document.querySelector('#start-year') as HTMLSelectElement).value);
  const endMonth = parseInt((document.querySelector('#end-month') as HTMLSelectElement).value);
  const endYear = parseInt((document.querySelector('#end-year') as HTMLSelectElement).value);

  const compareStockSelect = document.querySelector('#compare-stock') as HTMLSelectElement | null;
  const selectedStock = compareStockSelect?.value || '';

  // Validate amounts
  if (startingAmount < 0) {
    showError('Starting amount cannot be negative');
    return;
  }

  if (monthlyContribution < 0) {
    showError('Monthly contribution cannot be negative');
    return;
  }

  if (startingAmount === 0 && monthlyContribution === 0) {
    showError('Starting amount and monthly contribution cannot both be zero');
    return;
  }

  // Validate date range
  const startDate = startYear * 12 + startMonth;
  const endDate = endYear * 12 + endMonth;

  if (startDate >= endDate) {
    showError('End date must be after start date');
    return;
  }

  // Calculate S&P 500 returns
  const sp500Results = calculatePortfolioReturns(
    sp500MonthlyReturns,
    startingAmount,
    monthlyContribution,
    startDate,
    endDate
  );

  if (!sp500Results) {
    showError('No S&P 500 data available for the selected date range');
    return;
  }

  // If stock comparison is selected, load and calculate stock returns
  if (selectedStock) {
    const stockReturns = await loadStockData(selectedStock);

    if (!stockReturns) {
      showError(`Failed to load data for ${selectedStock}`);
      return;
    }

    const stockResults = calculatePortfolioReturns(
      stockReturns,
      startingAmount,
      monthlyContribution,
      startDate,
      endDate
    );

    if (!stockResults) {
      showError(`No ${selectedStock} data available for the selected date range`);
      return;
    }

    // Display comparison results
    displayComparisonResults(sp500Results, stockResults, selectedStock);
  } else {
    // Display S&P 500 only results
    displayResults(
      sp500Results.portfolioValue,
      sp500Results.totalContributions,
      sp500Results.totalGains,
      sp500Results.totalReturnPercentage,
      sp500Results.chartLabels,
      sp500Results.chartValues,
      sp500Results.chartContributions
    );
  }
}

function displayResults(
  finalValue: number,
  contributions: number,
  gains: number,
  returnPercentage: number,
  chartLabels: string[],
  chartValues: number[],
  chartContributions: number[]
): void {
  const resultsDiv = document.querySelector('#results') as HTMLDivElement;
  const errorDiv = document.querySelector('#error-message') as HTMLDivElement;

  errorDiv.classList.add('hidden');
  resultsDiv.classList.remove('hidden');

  (document.querySelector('#final-value') as HTMLElement).textContent =
    `$${finalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  (document.querySelector('#total-contributions') as HTMLElement).textContent =
    `$${contributions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  (document.querySelector('#total-gains') as HTMLElement).textContent =
    `$${gains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  (document.querySelector('#total-return') as HTMLElement).textContent =
    `${returnPercentage >= 0 ? '+' : ''}${returnPercentage.toFixed(2)}%`;

  // Create chart
  createPortfolioChart(chartLabels, chartValues, chartContributions);
}

function displayComparisonResults(
  sp500Results: any,
  stockResults: any,
  stockTicker: string
): void {
  const resultsDiv = document.querySelector('#results') as HTMLDivElement;
  const errorDiv = document.querySelector('#error-message') as HTMLDivElement;

  errorDiv.classList.add('hidden');
  resultsDiv.classList.remove('hidden');

  // Replace results content with comparison view
  resultsDiv.innerHTML = `
    <div class="border-t border-[#2d3748] pt-6">
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-[#f3f4f6]">Comparison: S&P 500 vs ${stockTicker}</h2>
      </div>

      <!-- Side-by-side comparison -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <!-- S&P 500 Column -->
        <div class="space-y-3">
          <div class="bg-[#0f1419] border border-[#3b82f6] rounded-lg p-4">
            <h3 class="text-sm font-semibold text-[#3b82f6] mb-3">S&P 500</h3>
            <div class="space-y-3">
              <div>
                <p class="text-[#9ca3af] text-xs font-medium uppercase tracking-wide">Final Value</p>
                <p class="text-[#3b82f6] text-xl font-bold mt-1">$${sp500Results.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p class="text-[#9ca3af] text-xs font-medium uppercase tracking-wide">Total Gains</p>
                <p class="text-[#f3f4f6] text-base font-bold mt-1">$${sp500Results.totalGains.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p class="text-[#9ca3af] text-xs font-medium uppercase tracking-wide">Return %</p>
                <p class="text-[#f3f4f6] text-base font-bold mt-1">${sp500Results.totalReturnPercentage >= 0 ? '+' : ''}${sp500Results.totalReturnPercentage.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stock Column -->
        <div class="space-y-3">
          <div class="bg-[#0f1419] border border-[#10b981] rounded-lg p-4">
            <h3 class="text-sm font-semibold text-[#10b981] mb-3">${stockTicker}</h3>
            <div class="space-y-3">
              <div>
                <p class="text-[#9ca3af] text-xs font-medium uppercase tracking-wide">Final Value</p>
                <p class="text-[#10b981] text-xl font-bold mt-1">$${stockResults.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p class="text-[#9ca3af] text-xs font-medium uppercase tracking-wide">Total Gains</p>
                <p class="text-[#f3f4f6] text-base font-bold mt-1">$${stockResults.totalGains.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p class="text-[#9ca3af] text-xs font-medium uppercase tracking-wide">Return %</p>
                <p class="text-[#f3f4f6] text-base font-bold mt-1">${stockResults.totalReturnPercentage >= 0 ? '+' : ''}${stockResults.totalReturnPercentage.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Delta -->
      <div class="bg-[#0f1419] border ${stockResults.portfolioValue > sp500Results.portfolioValue ? 'border-[#10b981]' : 'border-[#ef4444]'} rounded-lg p-4 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-[#9ca3af] text-xs font-medium uppercase tracking-wide">Performance Difference</p>
            <p class="text-2xl font-bold mt-1 ${stockResults.portfolioValue > sp500Results.portfolioValue ? 'text-[#10b981]' : 'text-[#ef4444]'}">
              ${stockResults.portfolioValue > sp500Results.portfolioValue ? '+' : ''}$${(stockResults.portfolioValue - sp500Results.portfolioValue).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
          <div class="text-right">
            <p class="text-[#9ca3af] text-xs font-medium uppercase tracking-wide">Percentage Diff</p>
            <p class="text-xl font-bold mt-1 ${stockResults.portfolioValue > sp500Results.portfolioValue ? 'text-[#10b981]' : 'text-[#ef4444]'}">
              ${stockResults.portfolioValue > sp500Results.portfolioValue ? '+' : ''}${(stockResults.totalReturnPercentage - sp500Results.totalReturnPercentage).toFixed(2)}%
            </p>
          </div>
        </div>
        <p class="text-[#9ca3af] text-sm mt-3">
          ${stockTicker} ${stockResults.portfolioValue > sp500Results.portfolioValue ? 'outperformed' : 'underperformed'} the S&P 500
        </p>
      </div>

      <!-- Portfolio Growth Chart -->
      <div class="bg-[#0f1419] border border-[#2d3748] rounded-lg p-5">
        <h3 class="text-sm font-semibold text-[#f3f4f6] mb-4">Comparative Growth Over Time</h3>
        <div class="relative" style="height: 400px;">
          <canvas id="portfolio-chart"></canvas>
        </div>
      </div>
    </div>
  `;

  // Create comparison chart
  createComparisonChart(sp500Results, stockResults, stockTicker);
}

function createPortfolioChart(labels: string[], values: number[], contributions: number[]): void {
  // Destroy existing chart if it exists
  if (portfolioChart) {
    portfolioChart.destroy();
  }

  const canvas = document.querySelector('#portfolio-chart') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  // Sample data if there are too many points (show every nth point)
  const maxDataPoints = 100;
  let sampledLabels = labels;
  let sampledValues = values;
  let sampledContributions = contributions;

  if (labels.length > maxDataPoints) {
    const step = Math.ceil(labels.length / maxDataPoints);
    const sampledIndices = new Set<number>();

    // Add every step
    for (let i = 0; i < labels.length; i += step) {
      sampledIndices.add(i);
    }

    // Always include the last point
    sampledIndices.add(labels.length - 1);

    // Convert to sorted array and extract values
    const indices = Array.from(sampledIndices).sort((a, b) => a - b);
    sampledLabels = indices.map(i => labels[i]);
    sampledValues = indices.map(i => values[i]);
    sampledContributions = indices.map(i => contributions[i]);
  }

  portfolioChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sampledLabels,
      datasets: [
        {
          label: 'Portfolio Value',
          data: sampledValues,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBorderWidth: 2,
        },
        {
          label: 'Contributions',
          data: sampledContributions,
          borderColor: '#6b7280',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderDash: [5, 5],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12,
            },
            color: '#9ca3af',
          },
        },
        tooltip: {
          backgroundColor: '#16213e',
          titleColor: '#f3f4f6',
          bodyColor: '#9ca3af',
          borderColor: '#2d3748',
          borderWidth: 1,
          padding: 12,
          titleFont: {
            size: 13,
            weight: 'bold',
          },
          bodyFont: {
            size: 12,
          },
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              const label = context.dataset.label || '';
              return `${label}: $${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            },
          },
        },
        crosshair: {
          line: {
            color: '#6b7280',
            width: 1,
            dashPattern: [5, 5],
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#6b7280',
            font: {
              size: 11,
            },
            callback: (value) => {
              return '$' + (value as number).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
            },
          },
          grid: {
            color: '#2d3748',
            lineWidth: 1,
          },
        },
        x: {
          ticks: {
            color: '#6b7280',
            font: {
              size: 10,
            },
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: 12,
          },
          grid: {
            display: false,
          },
        },
      },
    },
    plugins: [{
      id: 'crosshair',
      afterDraw: (chart) => {
        if (chart.tooltip?.opacity && chart.tooltip.x) {
          const ctx = chart.ctx;
          const x = chart.tooltip.caretX;
          const topY = chart.scales.y.top;
          const bottomY = chart.scales.y.bottom;

          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([5, 5]);
          ctx.moveTo(x, topY);
          ctx.lineTo(x, bottomY);
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#6b7280';
          ctx.stroke();
          ctx.restore();
        }
      }
    }],
  });
}

function createComparisonChart(sp500Results: any, stockResults: any, stockTicker: string): void {
  // Destroy existing chart if it exists
  if (portfolioChart) {
    portfolioChart.destroy();
  }

  const canvas = document.querySelector('#portfolio-chart') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  // Use S&P 500 labels as the base (they should be the same or we'll need to align them)
  const labels = sp500Results.chartLabels;
  const sp500Values = sp500Results.chartValues;
  const stockValues = stockResults.chartValues;
  const contributions = sp500Results.chartContributions;

  // Sample data if there are too many points
  const maxDataPoints = 100;
  let sampledLabels = labels;
  let sampledSP500Values = sp500Values;
  let sampledStockValues = stockValues;
  let sampledContributions = contributions;

  if (labels.length > maxDataPoints) {
    const step = Math.ceil(labels.length / maxDataPoints);
    const sampledIndices = new Set<number>();

    for (let i = 0; i < labels.length; i += step) {
      sampledIndices.add(i);
    }
    sampledIndices.add(labels.length - 1);

    const indices = Array.from(sampledIndices).sort((a, b) => a - b);
    sampledLabels = indices.map(i => labels[i]);
    sampledSP500Values = indices.map(i => sp500Values[i]);
    sampledStockValues = indices.map(i => stockValues[i]);
    sampledContributions = indices.map(i => contributions[i]);
  }

  portfolioChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sampledLabels,
      datasets: [
        {
          label: `${stockTicker}`,
          data: sampledStockValues,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBorderWidth: 2,
        },
        {
          label: 'S&P 500',
          data: sampledSP500Values,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBorderWidth: 2,
        },
        {
          label: 'Contributions',
          data: sampledContributions,
          borderColor: '#6b7280',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderDash: [5, 5],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12,
            },
            color: '#9ca3af',
          },
        },
        tooltip: {
          backgroundColor: '#16213e',
          titleColor: '#f3f4f6',
          bodyColor: '#9ca3af',
          borderColor: '#2d3748',
          borderWidth: 1,
          padding: 12,
          titleFont: {
            size: 13,
            weight: 'bold',
          },
          bodyFont: {
            size: 12,
          },
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              const label = context.dataset.label || '';
              return `${label}: $${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            },
          },
        },
        crosshair: {
          line: {
            color: '#6b7280',
            width: 1,
            dashPattern: [5, 5],
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#6b7280',
            font: {
              size: 11,
            },
            callback: (value) => {
              return '$' + (value as number).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
            },
          },
          grid: {
            color: '#2d3748',
            lineWidth: 1,
          },
        },
        x: {
          ticks: {
            color: '#6b7280',
            font: {
              size: 10,
            },
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: 12,
          },
          grid: {
            display: false,
          },
        },
      },
    },
    plugins: [{
      id: 'crosshair',
      afterDraw: (chart) => {
        if (chart.tooltip?.opacity && chart.tooltip.x) {
          const ctx = chart.ctx;
          const x = chart.tooltip.caretX;
          const topY = chart.scales.y.top;
          const bottomY = chart.scales.y.bottom;

          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([5, 5]);
          ctx.moveTo(x, topY);
          ctx.lineTo(x, bottomY);
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#6b7280';
          ctx.stroke();
          ctx.restore();
        }
      }
    }],
  });
}

function showError(message: string): void {
  const resultsDiv = document.querySelector('#results') as HTMLDivElement;
  const errorDiv = document.querySelector('#error-message') as HTMLDivElement;

  resultsDiv.classList.add('hidden');
  errorDiv.classList.remove('hidden');

  const errorText = errorDiv.querySelector('p') as HTMLParagraphElement;
  errorText.textContent = message;
}

// Start the app by loading data
loadData();
