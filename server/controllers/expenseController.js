const Expense = require('../models/Expense');

// @desc    Get all expenses for logged in user
// @route   GET /api/expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
exports.createExpense = async (req, res) => {
  const { title, amount, category, date } = req.body;

  if (!title || !amount || !category || !date) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category,
      date
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
exports.updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // Make sure user owns expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

// @desc    Get AI-powered financial insights
// @route   GET /api/expenses/insights
exports.getInsights = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });
    const user = await User.findById(req.user._id);
    
    if (expenses.length === 0) {
      return res.json(["Start adding expenses to see personalized AI insights!"]);
    }

    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const categoryTotals = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    const insights = [];

    // Overall Budget Insight
    const budgetUsage = (totalSpent / user.monthlyBudget) * 100;
    if (budgetUsage > 90) {
      insights.push(`⚠️ Critical: You've used ${budgetUsage.toFixed(0)}% of your monthly budget. Try to limit non-essential spending.`);
    } else if (budgetUsage > 70) {
      insights.push(`📉 Careful: You are at ${budgetUsage.toFixed(0)}% of your budget. You have $${(user.monthlyBudget - totalSpent).toFixed(2)} remaining.`);
    } else {
      insights.push(`✅ Great job! You are well within your budget with $${(user.monthlyBudget - totalSpent).toFixed(2)} left.`);
    }

    // Category Specific Insights
    const topCategory = Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b);
    if (topCategory === 'Food' && categoryTotals[topCategory] > user.monthlyBudget * 0.3) {
      insights.push("💡 Savings Tip: Dining out is your biggest expense. Reducing restaurant visits by just 20% could save you approx. $" + (categoryTotals[topCategory] * 0.2).toFixed(2) + " next month.");
    }

    if (categoryTotals['Bills'] > user.monthlyBudget * 0.4) {
      insights.push("⚡ Smart Move: Your bills are quite high. Consider checking for unused subscriptions or energy-saving tips.");
    }

    if (expenses.length > 10 && categoryTotals['Entertainment'] > categoryTotals['Shopping']) {
      insights.push("🎭 Experience over items! You're spending more on experiences than shopping. Keep up the healthy balance.");
    }

    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
