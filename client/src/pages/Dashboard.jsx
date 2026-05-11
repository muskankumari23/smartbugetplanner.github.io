import { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Trash2, Edit2, Plus, LogOut, TrendingDown, DollarSign, Wallet, PieChart as PieIcon, ArrowUpRight } from 'lucide-react';
import Analytics from '../components/Analytics';
import AIInsights from '../components/AIInsights';
import BudgetOptimizer from '../components/BudgetOptimizer';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [budgetGoal, setBudgetGoal] = useState(2000); // Default budget
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
  const [isEditing, setIsEditing] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const totalSpending = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const remainingBudget = useMemo(() => {
    return budgetGoal - totalSpending;
  }, [budgetGoal, totalSpending]);

  const budgetPercentage = useMemo(() => {
    return Math.min((totalSpending / budgetGoal) * 100, 100);
  }, [totalSpending, budgetGoal]);

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get('/expenses');
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/expenses/${isEditing}`, formData);
        setIsEditing(null);
      } else {
        await api.post('/expenses', formData);
      }
      setFormData({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense', error);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0]
    });
    setIsEditing(expense._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense', error);
      }
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/50 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/50 blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 glass-card p-6 rounded-2xl">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
              <span className="gradient-text">SmartBudget</span>
              <span className="text-gray-400 font-light">Planner</span>
            </h1>
            <p className="text-gray-500 font-medium">Elevate your financial management, {user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Monthly Goal</p>
              <input 
                type="number" 
                value={budgetGoal}
                onChange={(e) => setBudgetGoal(parseFloat(e.target.value) || 0)}
                className="text-xl font-bold bg-transparent text-gray-800 outline-none w-24 text-right focus:text-indigo-600 transition"
              />
            </div>
            <button onClick={logout} className="group flex items-center gap-2 bg-white/50 text-red-500 px-5 py-2.5 rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm">
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Summary Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Remaining Budget Card */}
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Wallet size={80} />
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Remaining Budget</p>
            <h3 className={`text-3xl font-black ${remainingBudget < 0 ? 'text-red-500' : 'text-indigo-600'}`}>
              ${remainingBudget.toFixed(2)}
            </h3>
            <div className="mt-4">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-gray-400">{budgetPercentage.toFixed(0)}% Used</span>
                <span className={remainingBudget < 0 ? 'text-red-500' : 'text-indigo-500'}>
                  Goal: ${budgetGoal}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${remainingBudget < 0 ? 'bg-red-500' : 'bg-indigo-500'}`}
                  style={{ width: `${budgetPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Total Spending */}
          <div className="glass-card p-6 rounded-2xl group border-b-4 border-b-blue-500/50">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-500/10 p-3 rounded-xl text-blue-600">
                <DollarSign size={24} />
              </div>
              <ArrowUpRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Expenses</p>
            <h3 className="text-3xl font-black text-gray-900">${totalSpending.toFixed(2)}</h3>
          </div>

          {/* Transactions */}
          <div className="glass-card p-6 rounded-2xl group border-b-4 border-b-emerald-500/50">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-600">
                <TrendingDown size={24} />
              </div>
              <ArrowUpRight className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Entries</p>
            <h3 className="text-3xl font-black text-gray-900">{expenses.length}</h3>
          </div>

          {/* Average */}
          <div className="glass-card p-6 rounded-2xl group border-b-4 border-b-purple-500/50">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-purple-500/10 p-3 rounded-xl text-purple-600">
                <PieIcon size={24} />
              </div>
              <ArrowUpRight className="text-gray-300 group-hover:text-purple-500 transition-colors" />
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Avg. Expense</p>
            <h3 className="text-3xl font-black text-gray-900">
              ${expenses.length ? (totalSpending / expenses.length).toFixed(2) : '0.00'}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            {/* AI Insights Section */}
            <AIInsights expenses={expenses} />

            {/* Analytics Section */}
            <div className="glass-card p-8 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">Financial Overview</h2>
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                </div>
              </div>
              <Analytics expenses={expenses} />
            </div>

            {/* History Section */}
            <div className="glass-card p-8 rounded-3xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900">Transaction History</h2>
                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
              </div>
              <div className="space-y-4">
                {expenses.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium italic">Your financial journey starts with the first entry.</p>
                  </div>
                ) : (
                  expenses.map((expense) => (
                    <div key={expense._id} className="flex justify-between items-center p-5 rounded-2xl hover:bg-white transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 group border border-transparent hover:border-indigo-100">
                      <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl shadow-sm ${
                          expense.category === 'Food' ? 'bg-orange-100 text-orange-600' :
                          expense.category === 'Transport' ? 'bg-blue-100 text-blue-600' :
                          expense.category === 'Bills' ? 'bg-red-100 text-red-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          <TrendingDown size={22} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{expense.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-black uppercase tracking-tighter text-gray-500">
                              {expense.category}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-sm font-medium text-gray-400">{new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="text-xl font-black text-gray-900">-${expense.amount.toFixed(2)}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                          <button onClick={() => handleEdit(expense)} className="p-2.5 text-indigo-500 bg-indigo-50 rounded-xl hover:bg-indigo-500 hover:text-white transition-all">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(expense._id)} className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pro Optimizer Section */}
            <BudgetOptimizer remainingBudget={remainingBudget} />
          </div>

          {/* Sidebar / Form */}
          <div className="lg:col-span-4">
            <div className="glass-card p-8 rounded-3xl sticky top-8 border-t-8 border-t-indigo-600">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Plus className="text-indigo-600" />
                {isEditing ? 'Revise Entry' : 'New Entry'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">What did you spend on?</label>
                  <input
                    type="text"
                    placeholder="e.g., Starbucks Coffee"
                    className="w-full bg-white/50 p-3.5 rounded-xl border border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">How much?</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-white/50 p-3.5 pl-8 rounded-xl border border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-lg"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                  <select
                    className="w-full bg-white/50 p-3.5 rounded-xl border border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Food">🍔 Food & Drinks</option>
                    <option value="Transport">🚗 Transportation</option>
                    <option value="Entertainment">🎬 Entertainment</option>
                    <option value="Shopping">🛍️ Shopping</option>
                    <option value="Bills">🧾 Monthly Bills</option>
                    <option value="Other">✨ Miscellaneous</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Date</label>
                  <input
                    type="date"
                    className="w-full bg-white/50 p-3.5 rounded-xl border border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                  {isEditing ? <Edit2 size={20} /> : <Plus size={20} />}
                  {isEditing ? 'Apply Changes' : 'Confirm Entry'}
                </button>
                {isEditing && (
                  <button type="button" onClick={() => {
                    setIsEditing(null);
                    setFormData({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
                  }} className="w-full bg-white text-gray-500 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                    Discard Edits
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
