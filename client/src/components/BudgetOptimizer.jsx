import { useState, useMemo } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';

const BudgetOptimizer = ({ remainingBudget }) => {
  const [items, setItems] = useState([
    { name: 'Gym Membership', cost: 50, priority: 8 },
    { name: 'Streaming Service', cost: 15, priority: 4 },
    { name: 'New Sneakers', cost: 120, priority: 6 },
    { name: 'Gifts', cost: 80, priority: 7 },
  ]);
  const [newItem, setNewItem] = useState({ name: '', cost: '', priority: 5 });

  const addItem = () => {
    if (newItem.name && newItem.cost) {
      setItems([...items, { ...newItem, cost: parseFloat(newItem.cost) }]);
      setNewItem({ name: '', cost: '', priority: 5 });
    }
  };

  const optimizedSelection = useMemo(() => {
    const W = Math.max(0, remainingBudget);
    const n = items.length;
    const dp = Array.from({ length: n + 1 }, () => Array(Math.floor(W) + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      const { cost, priority } = items[i - 1];
      const w = Math.floor(cost);
      for (let j = 0; j <= Math.floor(W); j++) {
        if (w <= j) {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - w] + priority);
        } else {
          dp[i][j] = dp[i - 1][j];
        }
      }
    }

    // Backtrack to find selected items
    const selected = [];
    let w = Math.floor(W);
    for (let i = n; i > 0; i--) {
      if (dp[i][w] !== dp[i - 1][w]) {
        selected.push(items[i - 1]);
        w -= Math.floor(items[i - 1].cost);
      }
    }
    return selected;
  }, [items, remainingBudget]);

  const totalCost = optimizedSelection.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <div className="glass-card p-8 rounded-3xl mt-10 border-t-8 border-t-emerald-400">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500 rounded-lg text-white">
          <Sparkles size={20} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Pro Budget Optimizer</h2>
      </div>

      <p className="text-sm text-gray-500 mb-8 font-medium">
        Input potential purchases and their priority (1-10). Our AI uses the <strong>0/1 Knapsack Algorithm</strong> to select the best items that fit within your remaining <span className="text-emerald-600 font-bold">${remainingBudget.toFixed(2)}</span>.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-emerald-50/50 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <ShoppingBag size={18} /> Add Wishlist Item
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Item Name" 
                className="col-span-2 bg-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="Cost ($)" 
                className="bg-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm"
                value={newItem.cost}
                onChange={(e) => setNewItem({...newItem, cost: e.target.value})}
              />
              <select 
                className="bg-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm"
                value={newItem.priority}
                onChange={(e) => setNewItem({...newItem, priority: parseInt(e.target.value)})}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i+1} value={i+1}>Priority {i+1}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={addItem}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
            >
              Add to Wishlist
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Current Wishlist</h3>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-gray-100">
                  <span className="font-bold text-gray-700">{item.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">${item.cost}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-md font-black">P{item.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles size={160} />
          </div>
          
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400" /> Optimized Selection
          </h3>

          <div className="space-y-4 relative z-10">
            {optimizedSelection.length === 0 ? (
              <div className="flex items-center gap-3 text-red-400 bg-red-400/10 p-4 rounded-2xl border border-red-400/20">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">No items fit in your current budget!</p>
              </div>
            ) : (
              optimizedSelection.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                  <span className="font-bold">{item.name}</span>
                  <span className="font-black text-emerald-400">${item.cost}</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-end">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Value Optimized Cost</p>
              <h4 className="text-3xl font-black text-emerald-400">${totalCost.toFixed(2)}</h4>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Savings Potential</p>
              <h4 className="text-xl font-bold text-white">${(remainingBudget - totalCost).toFixed(2)}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetOptimizer;
