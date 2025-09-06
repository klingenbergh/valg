// Party mapping from historical to modern names
const PARTY_MAPPING = {
  'Ap': 'Ap',
  'DNA': 'Ap',
  'H': 'H',
  'V': 'V',
  'KrF': 'KrF',
  'Sp': 'Sp',
  'SV': 'SV',
  'SF': 'SV',
  'FrP': 'FrP',
  'Anders Langes Parti': 'FrP',
  'MDG': 'MDG',
  'R': 'R',
  'RV': 'R',
  'NKP': 'NKP',  // NKP stays as NKP - it's a different party from R!
  'Kp': 'NKP',
  'KP': 'NKP',
  'Dem': 'Others',
  'Pp': 'Others',
  'PP': 'Others',
  'INP': 'Others',
  'BL': 'Sp',  // Bondepartiet merged with Sp
  'NLP': 'Others'
};

// Party colors map
const PARTY_COLORS = {
  'Ap': '#e30613',
  'H': '#0065f1',
  'FrP': '#024785',
  'Sp': '#00843d',
  'SV': '#eb4b69',
  'V': '#006666',
  'KrF': '#ffd500',
  'MDG': '#6bc044',
  'R': '#ae0000',
  'NKP': '#ff0000',
  'Others': '#999999'
};

// Political spectrum order (left to right)
const SPECTRUM_ORDER = [
  'R',      // Far left
  'NKP',    // Far left
  'SV',     // Left
  'Ap',     // Left/Center-left
  'MDG',    // Green/Left
  'Sp',     // Center
  'V',      // Center/Liberal
  'KrF',    // Center-right/Christian
  'H',      // Right
  'FrP',    // Right/Populist right
  'Others'  // Others
];

// Define political blocs
const LEFT_BLOC = ['R', 'NKP', 'SV', 'Ap', 'MDG', 'Sp'];
const RIGHT_BLOC = ['H', 'FrP', 'V', 'KrF'];
// Note: 'Others' is not assigned to any bloc

// Calculate seats from percentages (simplified projection)
function estimateSeats(parties) {
  const TOTAL_SEATS = 169;
  const seats = {};
  let totalPct = 0;
  
  // Calculate total percentage
  Object.entries(parties).forEach(([party, pct]) => {
    const percentage = typeof pct === 'number' ? pct : (pct.pct || 0);
    totalPct += percentage;
  });
  
  // Distribute seats proportionally
  Object.entries(parties).forEach(([party, pct]) => {
    const percentage = typeof pct === 'number' ? pct : (pct.pct || 0);
    // Apply a 4% threshold for parliament representation
    if (party === 'Others' || percentage < 4) {
      seats[party] = 0;
    } else {
      seats[party] = Math.round((percentage / totalPct) * TOTAL_SEATS);
    }
  });
  
  return seats;
}

// Calculate bloc percentages and seats
function calculateBlocs(parties, estimateSeatsForPolls = false) {
  let leftPct = 0;
  let rightPct = 0;
  let leftSeats = 0;
  let rightSeats = 0;
  let othersPct = 0;
  let othersSeats = 0;
  
  // If we need to estimate seats for polls
  let estimatedSeats = {};
  if (estimateSeatsForPolls && typeof Object.values(parties)[0] === 'number') {
    estimatedSeats = estimateSeats(parties);
  }
  
  Object.entries(parties).forEach(([party, data]) => {
    const pct = typeof data === 'number' ? data : (data.pct || 0);
    const seats = estimateSeatsForPolls && estimatedSeats[party] !== undefined ? 
                   estimatedSeats[party] : 
                   (typeof data === 'object' ? (data.seats || 0) : 0);
    
    if (LEFT_BLOC.includes(party)) {
      leftPct += pct;
      leftSeats += seats;
    } else if (RIGHT_BLOC.includes(party)) {
      rightPct += pct;
      rightSeats += seats;
    } else {
      othersPct += pct;
      othersSeats += seats;
    }
  });
  
  return {
    leftPct,
    rightPct,
    othersPct,
    leftSeats,
    rightSeats,
    othersSeats,
    totalSeats: leftSeats + rightSeats + othersSeats
  };
}

// Create bloc balance bar HTML
function createBlocBar(blocs, showSeats = false, includeOthers = true) {
  // For election results, don't include others in the bar
  const total = includeOthers ? 
    (blocs.leftPct + blocs.rightPct + blocs.othersPct) : 
    (blocs.leftPct + blocs.rightPct);
    
  const leftWidth = (blocs.leftPct / total) * 100;
  const rightWidth = (blocs.rightPct / total) * 100;
  const othersWidth = includeOthers ? (blocs.othersPct / total) * 100 : 0;
  
  const majorityLine = showSeats && blocs.totalSeats > 0 ? 
    `<div class="majority-line" style="left: 50%" title="Majority: 85 seats"></div>` : '';
  
  const leftLabel = showSeats && blocs.leftSeats > 0 ? 
    `${blocs.leftSeats} seats (${blocs.leftPct.toFixed(1)}%)` : 
    `${blocs.leftPct.toFixed(1)}%`;
    
  const rightLabel = showSeats && blocs.rightSeats > 0 ? 
    `${blocs.rightSeats} seats (${blocs.rightPct.toFixed(1)}%)` : 
    `${blocs.rightPct.toFixed(1)}%`;
  
  return `
    <div class="bloc-balance">
      <div class="bloc-header">
        <span class="bloc-label bloc-label-left">${leftLabel}</span>
        <span class="bloc-label bloc-label-right">${rightLabel}</span>
      </div>
      <div class="bloc-bar-container">
        <div class="bloc-bar bloc-left" style="width: ${leftWidth}%" title="Left bloc: ${leftLabel}">
          <span class="bloc-bar-text">${blocs.leftSeats > 0 ? blocs.leftSeats : ''}</span>
        </div>
        ${othersWidth > 0 && includeOthers ? `<div class="bloc-bar bloc-others" style="width: ${othersWidth}%" title="Others: ${blocs.othersPct.toFixed(1)}%"></div>` : ''}
        <div class="bloc-bar bloc-right" style="width: ${rightWidth}%" title="Right bloc: ${rightLabel}">
          <span class="bloc-bar-text">${blocs.rightSeats > 0 ? blocs.rightSeats : ''}</span>
        </div>
        ${majorityLine}
      </div>
    </div>
  `;
}

// Global variables
let currentYear = 2021;
let pollChart = null;
let currentPollIndex = 0;
let allPolls = [];
let filteredPolls = [];
let uniquePollsters = new Set();

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  const yearSelect = document.getElementById('yearSelect');
  const prevYearBtn = document.getElementById('prevYearBtn');
  const nextYearBtn = document.getElementById('nextYearBtn');
  
  yearSelect.addEventListener('change', (e) => {
    currentYear = parseInt(e.target.value);
    loadData();
  });
  
  prevYearBtn.addEventListener('click', () => {
    navigateToYear('prev');
  });
  
  nextYearBtn.addEventListener('click', () => {
    navigateToYear('next');
  });
  
  // Load initial data
  loadData();
});

// Navigate to previous or next election year
function navigateToYear(direction) {
  const yearSelect = document.getElementById('yearSelect');
  const options = Array.from(yearSelect.options).map(opt => parseInt(opt.value));
  const currentIndex = options.indexOf(currentYear);
  
  if (direction === 'prev' && currentIndex < options.length - 1) {
    currentYear = options[currentIndex + 1];
    yearSelect.value = currentYear;
    loadData();
  } else if (direction === 'next' && currentIndex > 0) {
    currentYear = options[currentIndex - 1];
    yearSelect.value = currentYear;
    loadData();
  }
}

// Update year navigation buttons
function updateYearNavigation(years) {
  const prevYearBtn = document.getElementById('prevYearBtn');
  const nextYearBtn = document.getElementById('nextYearBtn');
  const prevYearText = document.getElementById('prevYearText');
  const nextYearText = document.getElementById('nextYearText');
  
  const currentIndex = years.indexOf(currentYear);
  
  // Update previous year button (older year on the left)
  if (currentIndex < years.length - 1) {
    prevYearBtn.style.visibility = 'visible';
    prevYearText.textContent = years[currentIndex + 1];
    prevYearBtn.disabled = false;
  } else {
    prevYearBtn.style.visibility = 'hidden';
    prevYearBtn.disabled = true;
  }
  
  // Update next year button (newer year on the right)
  if (currentIndex > 0) {
    nextYearBtn.style.visibility = 'visible';
    nextYearText.textContent = years[currentIndex - 1];
    nextYearBtn.disabled = false;
  } else {
    nextYearBtn.style.visibility = 'hidden';
    nextYearBtn.disabled = true;
  }
}

// Load data for the selected year
async function loadData() {
  try {
    // Show loading state
    showLoading();
    
    // Fetch data in parallel
    // Check which port the server is running on
    const port = window.location.port || '3000';
    const baseUrl = window.location.port ? '' : 'http://localhost:3001';
    
    const [resultsResponse, pollsResponse, yearsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/results?year=${currentYear}`),
      fetch(`${baseUrl}/api/polls?year=${currentYear}`),
      fetch(`${baseUrl}/api/years`)
    ]);
    
    const resultsData = await resultsResponse.json();
    const pollsData = await pollsResponse.json();
    const yearsData = await yearsResponse.json();
    
    // Update year selector if needed
    updateYearSelector(yearsData.years);
    
    // Display results
    displayResults(resultsData.results);
    
    // Display polls
    displayPolls(pollsData.polls);
    
  } catch (error) {
    showError('Failed to load data: ' + error.message);
  }
}

// Show loading state
function showLoading() {
  document.getElementById('resultsTable').innerHTML = '<div class="loading">Loading results...</div>';
  document.getElementById('pollsList').innerHTML = '<div class="loading">Loading polls...</div>';
}

// Show error message
function showError(message) {
  const errorHtml = `<div class="error">${message}</div>`;
  document.getElementById('resultsTable').innerHTML = errorHtml;
  document.getElementById('pollsList').innerHTML = errorHtml;
}

// Update year selector
function updateYearSelector(years) {
  const yearSelect = document.getElementById('yearSelect');
  const currentValue = yearSelect.value;
  
  yearSelect.innerHTML = years.map(year => 
    `<option value="${year}" ${year == currentValue ? 'selected' : ''}>${year}</option>`
  ).join('');
  
  // Update navigation buttons
  updateYearNavigation(years);
}

// Display election results
function displayResults(results) {
  if (!results || results.length === 0) {
    document.getElementById('resultsTable').innerHTML = '';
    document.getElementById('resultsChart').innerHTML = '<p>No election results available for this year.</p>';
    return;
  }
  
  // Aggregate results by modern party mapping
  const aggregatedResults = {};
  results.forEach(r => {
    const modernParty = mapParty(r.party_id, currentYear);
    if (!aggregatedResults[modernParty]) {
      aggregatedResults[modernParty] = { pct: 0, seats: 0 };
    }
    aggregatedResults[modernParty].pct += r.pct;
    aggregatedResults[modernParty].seats += r.seats || 0;
  });
  
  // Sort parties by spectrum order
  const sortedParties = SPECTRUM_ORDER.filter(party => aggregatedResults[party]);
  
  // Create vertical bar chart
  const maxPct = Math.max(...Object.values(aggregatedResults).map(r => r.pct));
  const chartHeight = 300;
  
  const barsHtml = sortedParties.map(party => {
    const result = aggregatedResults[party];
    const height = (result.pct / maxPct) * chartHeight;
    const color = PARTY_COLORS[party] || '#888';
    
    return `
      <div class="vertical-bar-wrapper">
        <div class="vertical-bar-container" style="height: ${chartHeight}px;">
          <div class="vertical-bar" style="height: ${height}px; background: ${color};" title="${party}: ${result.pct.toFixed(1)}%">
            <span class="vertical-bar-value">${result.pct.toFixed(1)}%</span>
            ${result.seats ? `<span class="vertical-bar-seats">${result.seats}</span>` : ''}
          </div>
        </div>
        <div class="vertical-bar-label">${party}</div>
      </div>
    `;
  }).join('');
  
  // Calculate bloc balance
  const blocs = calculateBlocs(aggregatedResults);
  const blocBar = createBlocBar(blocs, true, false); // Don't include others for election results
  
  document.getElementById('resultsChart').innerHTML = `
    ${blocBar}
    <div class="vertical-chart">
      ${barsHtml}
    </div>
  `;
  
  // Clear the table
  document.getElementById('resultsTable').innerHTML = '';
}

// Map party to modern equivalent
function mapParty(party, year) {
  // Handle unnamed parties
  if (party && party.startsWith('Unnamed')) {
    return 'Others';
  }
  
  // After 2007, NKP merged into Rødt
  if (party === 'NKP' && year && year >= 2007) {
    return 'R';
  }
  
  return PARTY_MAPPING[party] || party;
}

// Display opinion polls carousel
function displayPolls(polls) {
  if (!polls || polls.length === 0) {
    document.getElementById('pollsList').innerHTML = '<p>No opinion polls available for this year.</p>';
    document.getElementById('carouselIndicators').innerHTML = '';
    return;
  }
  
  allPolls = polls;
  filteredPolls = polls;
  currentPollIndex = 0;
  
  // Extract unique pollsters and years
  uniquePollsters = new Set(polls.map(p => p.pollster));
  populatePollsterFilter();
  populateYearFilters();
  
  // Setup filter controls
  setupFilterControls();
  
  // Display current poll
  displayCurrentPoll();
  
  // Create indicators
  createCarouselIndicators();
  
  // Setup navigation
  setupCarouselNavigation();
}

// Display the current poll in the carousel
function displayCurrentPoll() {
  if (filteredPolls.length === 0) {
    document.getElementById('pollsList').innerHTML = '<p>No polls match the selected filters.</p>';
    document.getElementById('carouselIndicators').innerHTML = '';
    return;
  }
  
  const pollsToShow = 3; // Show 3 polls at a time
  const startIndex = currentPollIndex;
  const endIndex = Math.min(startIndex + pollsToShow, filteredPolls.length);
  const pollsSlice = filteredPolls.slice(startIndex, endIndex);
  
  // Create vertical bar chart for each poll
  const chartHeight = 140; // Increased height for poll bars
  
  const listHtml = pollsSlice.map(poll => {
    // Aggregate parties by modern mapping
    const aggregatedParties = {};
    Object.entries(poll.parties).forEach(([party, pct]) => {
      const modernParty = mapParty(party, currentYear);
      aggregatedParties[modernParty] = (aggregatedParties[modernParty] || 0) + pct;
    });
    
    // Sort parties by spectrum order
    const sortedParties = SPECTRUM_ORDER.filter(party => aggregatedParties[party]);
    const maxPct = Math.max(...Object.values(aggregatedParties));
    
    // Create vertical bars
    const barsHtml = sortedParties.map(party => {
      const pct = aggregatedParties[party];
      const height = (pct / maxPct) * chartHeight;
      const color = PARTY_COLORS[party] || '#888';
      
      return `
        <div class="poll-vertical-bar-wrapper">
          <div class="poll-vertical-bar" style="height: ${height}px; background: ${color};" title="${party}: ${pct.toFixed(1)}%">
            <span class="poll-bar-value">${pct.toFixed(1)}</span>
          </div>
          <div class="poll-bar-label">${party}</div>
        </div>
      `;
    }).join('');
    
    // Calculate bloc balance for this poll with estimated seats
    const blocs = calculateBlocs(aggregatedParties, true);
    const blocBar = createBlocBar(blocs, true, false); // Don't include others
    
    return `
      <div class="poll-item">
        <div class="poll-header">
          <span class="poll-date">${poll.date}</span>
          <span class="poll-pollster">${poll.pollster}</span>
        </div>
        ${blocBar}
        <div class="poll-vertical-chart" style="height: ${chartHeight}px;">
          ${barsHtml}
        </div>
      </div>
    `;
  }).join('');
  
  document.getElementById('pollsList').innerHTML = listHtml;
  
  // Update indicator active state
  updateIndicators();
  
  // Update navigation buttons
  updateNavigationButtons();
}

// Create carousel indicators
function createCarouselIndicators() {
  const pollsPerPage = 3;
  const pageCount = Math.ceil(filteredPolls.length / pollsPerPage);
  
  const indicatorsHtml = Array.from({ length: pageCount }, (_, i) => 
    `<span class="carousel-indicator${i === 0 ? ' active' : ''}" data-page="${i}"></span>`
  ).join('');
  
  document.getElementById('carouselIndicators').innerHTML = indicatorsHtml;
  
  // Add click handlers to indicators
  document.querySelectorAll('.carousel-indicator').forEach(indicator => {
    indicator.addEventListener('click', (e) => {
      const page = parseInt(e.target.dataset.page);
      currentPollIndex = page * 3;
      displayCurrentPoll();
    });
  });
}

// Update active indicator
function updateIndicators() {
  const currentPage = Math.floor(currentPollIndex / 3);
  document.querySelectorAll('.carousel-indicator').forEach((indicator, i) => {
    indicator.classList.toggle('active', i === currentPage);
  });
}

// Setup carousel navigation buttons
function setupCarouselNavigation() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  // Remove old event listeners
  const newPrevBtn = prevBtn.cloneNode(true);
  const newNextBtn = nextBtn.cloneNode(true);
  prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
  nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
  
  // Add new event listeners
  document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentPollIndex > 0) {
      currentPollIndex = Math.max(0, currentPollIndex - 3);
      displayCurrentPoll();
    }
  });
  
  document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentPollIndex < filteredPolls.length - 3) {
      currentPollIndex = Math.min(filteredPolls.length - 3, currentPollIndex + 3);
      displayCurrentPoll();
    }
  });
  
  // Update button states
  updateNavigationButtons();
}

// Update navigation button states
function updateNavigationButtons() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  prevBtn.disabled = currentPollIndex === 0;
  nextBtn.disabled = currentPollIndex >= filteredPolls.length - 3;
  
  prevBtn.style.opacity = prevBtn.disabled ? '0.3' : '1';
  nextBtn.style.opacity = nextBtn.disabled ? '0.3' : '1';
}

// Populate pollster filter dropdown
function populatePollsterFilter() {
  const select = document.getElementById('pollsterFilter');
  if (!select) return;
  
  // Keep "All Pollsters" option and add unique pollsters
  const pollstersHtml = ['<option value="">All Pollsters</option>'];
  const sortedPollsters = Array.from(uniquePollsters).sort();
  
  sortedPollsters.forEach(pollster => {
    pollstersHtml.push(`<option value="${pollster}">${pollster}</option>`);
  });
  
  select.innerHTML = pollstersHtml.join('');
}

// Populate year filter dropdown
function populateYearFilters() {
  const yearSelect = document.getElementById('yearFilter');
  if (!yearSelect) return;
  
  // Extract unique years from polls
  const years = [...new Set(allPolls.map(p => parseInt(p.date.substring(0, 4))))].sort();
  
  // Populate Year dropdown
  const yearHtml = ['<option value="">All Years</option>'];
  years.forEach(year => {
    yearHtml.push(`<option value="${year}">${year}</option>`);
  });
  yearSelect.innerHTML = yearHtml.join('');
}

// Setup filter controls
function setupFilterControls() {
  const pollsterFilter = document.getElementById('pollsterFilter');
  const yearFilter = document.getElementById('yearFilter');
  
  // Apply filters automatically when selection changes
  if (pollsterFilter) {
    pollsterFilter.addEventListener('change', () => {
      applyFilters();
    });
  }
  
  if (yearFilter) {
    yearFilter.addEventListener('change', () => {
      applyFilters();
    });
  }
}

// Apply filters to polls
function applyFilters() {
  const pollsterFilter = document.getElementById('pollsterFilter').value;
  const yearFilter = document.getElementById('yearFilter').value;
  
  filteredPolls = allPolls.filter(poll => {
    // Filter by pollster
    if (pollsterFilter && poll.pollster !== pollsterFilter) {
      return false;
    }
    
    // Filter by year
    if (yearFilter) {
      const pollYear = parseInt(poll.date.substring(0, 4));
      if (pollYear !== parseInt(yearFilter)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Update filter info
  updateFilterInfo();
  
  // Reset to first page and redisplay
  currentPollIndex = 0;
  displayCurrentPoll();
  createCarouselIndicators();
  updateNavigationButtons();
}

// Clear all filters (kept for programmatic use)
function clearFilters() {
  const pollsterFilter = document.getElementById('pollsterFilter');
  const yearFilter = document.getElementById('yearFilter');
  
  if (pollsterFilter) pollsterFilter.value = '';
  if (yearFilter) yearFilter.value = '';
  
  filteredPolls = allPolls;
  
  // Clear filter info
  document.getElementById('filterInfo').innerHTML = '';
  
  // Reset and redisplay
  currentPollIndex = 0;
  displayCurrentPoll();
  createCarouselIndicators();
  updateNavigationButtons();
}

// Update filter info display
function updateFilterInfo() {
  const filterInfo = document.getElementById('filterInfo');
  const pollsterFilter = document.getElementById('pollsterFilter').value;
  const yearFilter = document.getElementById('yearFilter').value;
  
  const filters = [];
  if (pollsterFilter) filters.push(`Pollster: ${pollsterFilter}`);
  if (yearFilter) filters.push(`Year: ${yearFilter}`);
  
  if (filters.length > 0) {
    filterInfo.innerHTML = `<strong>Active filters:</strong> ${filters.join(', ')} | <strong>Showing ${filteredPolls.length} of ${allPolls.length} polls</strong>`;
  } else {
    filterInfo.innerHTML = '';
  }
}