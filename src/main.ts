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

let sp500MonthlyReturns: MonthlyReturn[] = [];
let metadata: Metadata | null = null;
let portfolioChart: Chart | null = null;

// Create the app HTML
const app = document.querySelector<HTMLDivElement>('#app')!;

// Show loading state
app.innerHTML = `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p class="text-gray-700 text-lg">Loading S&P 500 data...</p>
    </div>
  </div>
`;

// Load data from JSON file
async function loadData() {
  try {
    const [dataResponse, metadataResponse] = await Promise.all([
      fetch('/sp500-data.json'),
      fetch('/sp500-metadata.json'),
    ]);

    if (!dataResponse.ok || !metadataResponse.ok) {
      throw new Error('Failed to load data');
    }

    sp500MonthlyReturns = await dataResponse.json();
    metadata = await metadataResponse.json();

    // Initialize the app once data is loaded
    initializeApp();
  } catch (error) {
    console.error('Error loading data:', error);
    app.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 flex items-center justify-center">
        <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p class="text-gray-700 mb-4">Failed to load S&P 500 historical data. Please run:</p>
          <code class="block bg-gray-100 p-2 rounded">npm run update-data</code>
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
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Historical S&P 500 Returns</h1>
        <p class="text-gray-600 mb-8">Calculate investment growth based on historical data (${dateRange.earliest.year}-${dateRange.latest.year})</p>

        <form id="calculator-form" class="space-y-6">
          <!-- Starting Amount -->
          <div>
            <label for="starting-amount" class="block text-sm font-medium text-gray-700 mb-2">
              Starting Amount
            </label>
            <input
              type="text"
              id="starting-amount"
              name="starting-amount"
              value="$10,000"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <!-- Monthly Contribution -->
          <div>
            <label for="monthly-contribution" class="block text-sm font-medium text-gray-700 mb-2">
              Monthly Contribution
            </label>
            <input
              type="text"
              id="monthly-contribution"
              name="monthly-contribution"
              value="$500"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <!-- Start Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <select
                  id="start-month"
                  name="start-month"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  ${generateMonthOptions(1)}
                </select>
              </div>
              <div>
                <select
                  id="start-year"
                  name="start-year"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  ${generateYearOptions(dateRange.earliest.year, dateRange.latest.year, 2020)}
                </select>
              </div>
            </div>
          </div>

          <!-- End Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <select
                  id="end-month"
                  name="end-month"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  ${generateMonthOptions(dateRange.latest.month)}
                </select>
              </div>
              <div>
                <select
                  id="end-year"
                  name="end-year"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  ${generateYearOptions(dateRange.earliest.year, dateRange.latest.year, dateRange.latest.year)}
                </select>
              </div>
            </div>
          </div>

          <!-- Calculate Button -->
          <button
            type="submit"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Calculate Returns
          </button>
        </form>

        <!-- Results Section -->
        <div id="results" class="mt-8 hidden">
          <div class="border-t border-gray-200 pt-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Results</h2>

            <div class="space-y-4">
              <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <p class="text-sm text-gray-600 mb-1">Final Portfolio Value</p>
                <p id="final-value" class="text-4xl font-bold text-green-700"></p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p class="text-sm text-gray-600 mb-1">Total Contributions</p>
                  <p id="total-contributions" class="text-2xl font-semibold text-blue-700"></p>
                </div>

                <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p class="text-sm text-gray-600 mb-1">Total Gains</p>
                  <p id="total-gains" class="text-2xl font-semibold text-purple-700"></p>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p class="text-sm text-gray-600 mb-1">Total Return</p>
                <p id="total-return" class="text-xl font-semibold text-gray-700"></p>
              </div>

              <!-- Portfolio Growth Chart -->
              <div class="bg-white rounded-lg p-6 border border-gray-200 mt-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Portfolio Growth Over Time</h3>
                <div class="relative" style="height: 400px;">
                  <canvas id="portfolio-chart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div id="error-message" class="mt-4 hidden">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-700"></p>
          </div>
        </div>
      </div>

      <!-- Data Source -->
      <div class="mt-6 text-center text-sm text-gray-600">
        <p>Data from ${metadata?.dataSource || 'Yahoo Finance'}. Last updated: ${lastUpdated}</p>
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
  const numericValue = value.replace(/[^\d.]/g, '');
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

// Calculate returns function
function calculateReturns(): void {
  const startingAmount = parseCurrency((document.querySelector('#starting-amount') as HTMLInputElement).value);
  const monthlyContribution = parseCurrency((document.querySelector('#monthly-contribution') as HTMLInputElement).value);
  const startMonth = parseInt((document.querySelector('#start-month') as HTMLSelectElement).value);
  const startYear = parseInt((document.querySelector('#start-year') as HTMLSelectElement).value);
  const endMonth = parseInt((document.querySelector('#end-month') as HTMLSelectElement).value);
  const endYear = parseInt((document.querySelector('#end-year') as HTMLSelectElement).value);

  // Validate date range
  const startDate = startYear * 12 + startMonth;
  const endDate = endYear * 12 + endMonth;

  if (startDate >= endDate) {
    showError('End date must be after start date');
    return;
  }

  // Filter returns for the selected date range
  const relevantReturns = sp500MonthlyReturns.filter((entry) => {
    const entryDate = entry.year * 12 + entry.month;
    return entryDate >= startDate && entryDate <= endDate;
  });

  if (relevantReturns.length === 0) {
    showError('No data available for the selected date range');
    return;
  }

  // Calculate compound returns and track values over time
  let portfolioValue = startingAmount;
  let totalContributions = startingAmount;

  const chartLabels: string[] = [];
  const chartValues: number[] = [];

  // Add initial value
  chartLabels.push(`${relevantReturns[0].year}-${String(relevantReturns[0].month).padStart(2, '0')}`);
  chartValues.push(startingAmount);

  relevantReturns.forEach((monthData, index) => {
    // Add monthly contribution at the beginning of each month (except the first month)
    if (index > 0) {
      portfolioValue += monthlyContribution;
      totalContributions += monthlyContribution;
    }

    // Apply the month's return
    const monthlyReturn = monthData.return / 100;
    portfolioValue *= (1 + monthlyReturn);

    // Track value for chart (skip first since we already added it)
    if (index > 0) {
      chartLabels.push(`${monthData.year}-${String(monthData.month).padStart(2, '0')}`);
      chartValues.push(portfolioValue);
    }
  });

  const totalGains = portfolioValue - totalContributions;
  const totalReturnPercentage = ((portfolioValue - totalContributions) / totalContributions) * 100;

  // Display results
  displayResults(portfolioValue, totalContributions, totalGains, totalReturnPercentage, chartLabels, chartValues);
}

function displayResults(
  finalValue: number,
  contributions: number,
  gains: number,
  returnPercentage: number,
  chartLabels: string[],
  chartValues: number[]
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
  createPortfolioChart(chartLabels, chartValues);
}

function createPortfolioChart(labels: string[], values: number[]): void {
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

  if (labels.length > maxDataPoints) {
    const step = Math.ceil(labels.length / maxDataPoints);
    sampledLabels = labels.filter((_, index) => index % step === 0 || index === labels.length - 1);
    sampledValues = values.filter((_, index) => index % step === 0 || index === values.length - 1);
  }

  portfolioChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sampledLabels,
      datasets: [
        {
          label: 'Portfolio Value',
          data: sampledValues,
          borderColor: 'rgb(79, 70, 229)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.1,
          pointRadius: sampledLabels.length < 50 ? 3 : 0,
          pointHoverRadius: 5,
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
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              return `Portfolio Value: $${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => {
              return '$' + (value as number).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
            },
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: 12,
          },
        },
      },
    },
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
