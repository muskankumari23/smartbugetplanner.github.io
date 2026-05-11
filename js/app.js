/**
 * Main Application Logic
 */

// Application State
let waitlistItems = [];
let optimizationHistory = [];
let currentUser = null;

// DOM Elements - Auth
// const authModal = document.getElementById('auth-modal');
// const authForm = document.getElementById('auth-form');
// const usernameInput = document.getElementById('username');
const appLayout = document.getElementById('app-layout');
const currentUserSpan = document.getElementById('current-user');
const logoutBtn = document.getElementById('logout-btn');

// DOM Elements - Navigation & Theme
const themeToggle = document.getElementById('theme-toggle');
const navItems = document.querySelectorAll('.nav-item[data-view]');
const viewSections = document.querySelectorAll('.view-section');

// DOM Elements - Inputs
const totalBudgetInput = document.getElementById('total-budget');
const addItemForm = document.getElementById('add-item-form');
const itemsListEl = document.getElementById('items-list');
const itemCountSpan = document.getElementById('item-count');
const optimizeBtn = document.getElementById('optimize-btn');

// DOM Elements - Results
const resultsSection = document.getElementById('results-section');
const resultsPlaceholder = document.getElementById('results-placeholder');
const efficiencyScoreEl = document.getElementById('efficiency-score');
const savingsAmountEl = document.getElementById('savings-amount');
const recommendationTextEl = document.getElementById('recommendation-text');
const selectedItemsEl = document.getElementById('selected-items');
const rejectedItemsEl = document.getElementById('rejected-items');
const selCountSpan = document.getElementById('sel-count');
const rejCountSpan = document.getElementById('rej-count');
const tabBtns = document.querySelectorAll('.tab-btn');

// DOM Elements - History
const historyListEl = document.getElementById('history-list');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadLocalState();
  setupEventListeners();
});

function loadLocalState() {
  const savedTheme = localStorage.getItem('sbp-theme');
  if (savedTheme === 'dark') {
    document.body.classList.replace('light-mode', 'dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  // const savedUser = localStorage.getItem('sbp-user');
  // if (savedUser) {
  //   currentUser = savedUser;
  //   loginSuccess(currentUser);
  // }
  currentUser = 'User';
  currentUserSpan.textContent = currentUser;

  const savedHistory = localStorage.getItem('sbp-history');
  if (savedHistory) {
    optimizationHistory = JSON.parse(savedHistory);
  }
}

function setupEventListeners() {
  // Auth
  // authForm.addEventListener('submit', (e) => {
  //   e.preventDefault();
  //   const user = usernameInput.value.trim();
  //   if(user) {
  //     localStorage.setItem('sbp-user', user);
  //     loginSuccess(user);
  //   }
  // });

  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('sbp-user');
    window.location.reload();
  });

  // Navigation
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.getAttribute('data-view');
      
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      
      viewSections.forEach(v => {
        if(v.id === `${targetView}-view`) {
          v.classList.add('active');
        } else {
          v.classList.remove('active');
        }
      });

      if(targetView === 'history') renderHistory();
    });
  });

  // Theme Toggle
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    if (isDark) {
      document.body.classList.replace('dark-mode', 'light-mode');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      localStorage.setItem('sbp-theme', 'light');
    } else {
      document.body.classList.replace('light-mode', 'dark-mode');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      localStorage.setItem('sbp-theme', 'dark');
    }
    // Re-render charts with new theme colors if optimized
    if(resultsSection.classList.contains('slide-in')) {
       // Just a lightweight way to trigger chart update
       optimizeBtn.click();
    }
  });

  // Add Item
  addItemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('item-name').value;
    const category = document.getElementById('item-category').value;
    const cost = parseFloat(document.getElementById('item-cost').value);
    const value = parseInt(document.getElementById('item-value').value);
    const priority = document.getElementById('item-priority').value;

    const newItem = { id: Date.now().toString(), name, category, cost, value, priority };
    waitlistItems.push(newItem);
    
    renderItemsList();
    addItemForm.reset();
  });

  // Tabs in Results
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const target = btn.getAttribute('data-target');
      document.getElementById('selected-items').classList.add('hidden');
      document.getElementById('rejected-items').classList.add('hidden');
      document.getElementById(target).classList.remove('hidden');
    });
  });

  // Optimization
  optimizeBtn.addEventListener('click', runOptimization);
}

// function loginSuccess(user) {
//   authModal.classList.remove('active');
//   appLayout.classList.remove('hidden');
//   currentUserSpan.textContent = user;
// }

function renderItemsList() {
  itemsListEl.innerHTML = '';
  itemCountSpan.textContent = `${waitlistItems.length} items`;
  
  if (waitlistItems.length === 0) {
    itemsListEl.innerHTML = '<div class="empty-state">No items added yet.</div>';
    optimizeBtn.disabled = true;
    return;
  }
  
  optimizeBtn.disabled = false;

  waitlistItems.forEach(item => {
    const el = document.createElement('div');
    el.className = 'list-item';
    el.innerHTML = `
      <div class="item-info">
        <h4>${item.name} <span class="status-badge status-priority-${item.priority}">${item.priority}</span></h4>
        <div class="item-meta">
          <span>Cost: $${item.cost}</span>
          <span>Value: ${item.value}</span>
          <span style="text-transform:capitalize;">${item.category}</span>
        </div>
      </div>
      <button class="remove-btn" onclick="removeItem('${item.id}')">
        <i class="fas fa-trash"></i>
      </button>
    `;
    itemsListEl.appendChild(el);
  });
}

function removeItem(id) {
  waitlistItems = waitlistItems.filter(item => item.id !== id);
  renderItemsList();
}

function runOptimization() {
  const budget = parseFloat(totalBudgetInput.value);
  if (!budget || budget <= 0) {
    alert("Please enter a valid total budget first.");
    totalBudgetInput.focus();
    return;
  }

  // Optimize logic
  const result = optimizeBudget(waitlistItems, budget);
  
  // Show results
  resultsPlaceholder.classList.add('hidden');
  resultsSection.classList.remove('hidden');
  
  // Populate stats
  efficiencyScoreEl.textContent = `${result.efficiencyScore}%`;
  savingsAmountEl.textContent = `$${result.savings.toFixed(2)}`;
  
  // Generate recommendation text
  generateRecommendationMessage(result, budget);

  // Populate lists
  renderResultLists(result.selectedItems, result.rejectedItems);

  // Render Charts
  renderCharts(result.selectedItems, budget, result.totalCost);

  // Save to history
  saveToHistory(result, budget);
}

function generateRecommendationMessage(result, budget) {
  let text = `<p>Based on your <strong>$${budget}</strong> budget and the 0/1 Knapsack optimization algorithm:</p>`;
  
  if (result.selectedItems.length === 0) {
    text += `<p class="text-secondary mt-2">None of the items could fit within your budget. Consider increasing your budget or adding cheaper items.</p>`;
  } else if (result.efficiencyScore > 80) {
    text += `<p class="text-success mt-2">Excellent allocation! You have extracted ${result.efficiencyScore}% of possible value, optimizing perfectly.</p>`;
  } else {
    text += `<p class="text-primary mt-2">We selected ${result.selectedItems.length} item(s) to maximize your satisfaction. You save $${result.savings.toFixed(2)} while capturing ${result.efficiencyScore}% of the total possible value.</p>`;
  }

  recommendationTextEl.innerHTML = text;
}

function renderResultLists(selectedItems, rejectedItems) {
  selCountSpan.textContent = selectedItems.length;
  rejCountSpan.textContent = rejectedItems.length;
  
  const renderList = (items, container) => {
    container.innerHTML = '';
    if(items.length === 0) {
      container.innerHTML = '<div class="empty-state">No items.</div>';
      return;
    }
    items.forEach(item => {
      const iconClass = container.id === 'selected-items' ? 'fa-check text-success' : 'fa-times text-danger';
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <div class="item-info">
          <h4><i class="fas ${iconClass} mr-2"></i> ${item.name}</h4>
          <div class="item-meta">
            <span>$${item.cost}</span> • <span>Value: ${item.value}</span>
          </div>
        </div>
      `;
      container.appendChild(div);
    });
  };

  renderList(selectedItems, selectedItemsEl);
  renderList(rejectedItems, rejectedItemsEl);
}

function saveToHistory(result, budget) {
  const record = {
    id: Date.now(),
    date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
    budget,
    efficiencyScore: result.efficiencyScore,
    savings: result.savings,
    selectedCount: result.selectedItems.length,
    rejectedCount: result.rejectedItems.length
  };
  
  optimizationHistory.unshift(record); // Add to beginning
  // Keep last 10
  if(optimizationHistory.length > 10) optimizationHistory.pop();
  
  localStorage.setItem('sbp-history', JSON.stringify(optimizationHistory));
}

function renderHistory() {
  if (optimizationHistory.length === 0) {
    historyListEl.innerHTML = '<div class="empty-state">No previous plans found.</div>';
    return;
  }
  
  historyListEl.innerHTML = '';
  optimizationHistory.forEach(record => {
    const div = document.createElement('div');
    div.className = 'history-card flex-between';
    div.innerHTML = `
      <div>
        <h4 class="mb-2">Budget: $${record.budget}</h4>
        <div class="text-muted" style="font-size:0.85rem;"><i class="far fa-calendar-alt"></i> ${record.date}</div>
        <div class="mt-2" style="font-size:0.9rem;">
          <span class="badge" style="background:var(--primary); color:white; margin-right:0.5rem;">${record.selectedCount} Selected</span>
          <span class="badge" style="background:var(--secondary); color:white;">${record.rejectedCount} Rejected</span>
        </div>
      </div>
      <div class="text-right">
        <div class="text-gradient" style="font-size:1.5rem; font-weight:bold;">${record.efficiencyScore}% Score</div>
        <div class="text-success mt-1">Saved: $${record.savings.toFixed(2)}</div>
      </div>
    `;
    historyListEl.appendChild(div);
  });
}
