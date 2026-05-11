const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, updateExpense, deleteExpense, getInsights } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All expense routes are protected

router.get('/insights', getInsights);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
