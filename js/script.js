
const resources = [];

function addResource() {
  const name = document.getElementById('name').value;
  const cost = parseInt(document.getElementById('cost').value);
  const value = parseInt(document.getElementById('value').value);

  if (!name || isNaN(cost) || isNaN(value)) {
    alert('Please enter valid details.');
    return;
  }

  resources.push({ name, cost, value });
  updateTable();

  document.getElementById('name').value = '';
  document.getElementById('cost').value = '';
  document.getElementById('value').value = '';
}

function updateTable() {
  const table = document.getElementById('resourceTable');
  table.innerHTML = '<tr><th>Name</th><th>Cost</th><th>Value</th></tr>';

  for (let res of resources) {
    const row = table.insertRow();
    row.innerHTML = `<td>${res.name}</td><td>${res.cost}</td><td>${res.value}</td>`;
  }
}

function allocateResources() {
  const budget = parseInt(document.getElementById('budget').value);
  if (isNaN(budget)) {
    alert('Please enter a valid budget.');
    return;
  }

  const n = resources.length;
  const W = budget;
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      if (resources[i - 1].cost <= w) {
        dp[i][w] = Math.max(
          resources[i - 1].value + dp[i - 1][w - resources[i - 1].cost],
          dp[i - 1][w]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  let w = W;
  let selected = [];
  for (let i = n; i > 0 && w >= 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(resources[i - 1]);
      w -= resources[i - 1].cost;
    }
  }

  const ul = document.getElementById('selectedList');
  ul.innerHTML = '';
  let totalCost = 0;
  for (let item of selected) {
    const li = document.createElement('li');
    li.textContent = `${item.name} (Cost: ${item.cost}, Value: ${item.value})`;
    ul.appendChild(li);
    totalCost += item.cost;
  }

  document.getElementById('totalValue').textContent = dp[n][W];
  document.getElementById('totalCost').textContent = totalCost;
}
