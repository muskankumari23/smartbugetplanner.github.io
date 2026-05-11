/**
 * 0/1 Knapsack Algorithm Implementation
 * Optimizes selection of items given a budget constraint
 */

function optimizeBudget(items, maxBudget) {
  const n = items.length;
  let originalBudget = maxBudget;
  let scale = 1;
  maxBudget = Math.round(maxBudget);
  
  // Prevent browser memory crash for huge budgets by scaling down
  if (maxBudget > 10000) {
    scale = maxBudget / 10000;
    maxBudget = 10000;
  }

  // Initialize DP table
  const dp = Array(n + 1).fill(0).map(() => Array(maxBudget + 1).fill(0));

  // Build DP table
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    const cost = Math.round(item.cost / scale); // Scale cost
    const value = item.value;

    for (let w = 1; w <= maxBudget; w++) {
      if (cost <= w) {
        dp[i][w] = Math.max(value + dp[i - 1][w - cost], dp[i - 1][w]);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Traceback to find selected items
  let res = dp[n][maxBudget];
  let w = maxBudget;
  const selectedItems = [];
  const rejectedItems = [];

  for (let i = n; i > 0 && res > 0; i--) {
    if (res === dp[i - 1][w]) {
      // This item is NOT included
      rejectedItems.push(items[i - 1]);
    } else {
      // This item IS included
      const item = items[i - 1];
      selectedItems.push(item);
      res -= item.value;
      w -= Math.round(item.cost / scale);
    }
  }

  // Any items that had dp value 0 from the start or were not processed in res > 0 loop
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    if (!selectedItems.includes(item) && !rejectedItems.includes(item)) {
      rejectedItems.push(item);
    }
  }

  // Calculate totals
  const totalCost = selectedItems.reduce((sum, item) => sum + item.cost, 0);
  const totalValue = selectedItems.reduce((sum, item) => sum + item.value, 0);
  const maxPossibleValue = items.reduce((sum, item) => sum + item.value, 0);
  
  // Efficiency Score formula: Value acheived relative to value max, adjusted by what was possible within budget
  const efficiencyScore = maxPossibleValue === 0 ? 0 : Math.round((totalValue / maxPossibleValue) * 100);

  return {
    selectedItems: selectedItems.reverse(), // reverse to maintain original order appearance
    rejectedItems: rejectedItems,
    totalCost,
    totalValue,
    savings: originalBudget - totalCost,
    efficiencyScore
  };
}
