const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');

const Expense = require('../models/Expense');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const createExpenseSchema = z.object({
  title: z.string().min(1).max(120),
  amount: z.number().positive(),
  category: z.string().min(1).max(80),
  note: z.string().max(500).optional().default(''),
  date: z.string().date(),
});

router.use(requireAuth);

router.post('/', async (req, res, next) => {
  try {
    const body = createExpenseSchema.parse(req.body);

    const expense = await Expense.create({
      companyId: req.auth.companyId,
      userId: req.auth.userId,
      createdBy: req.auth.userId,
      title: body.title,
      amount: body.amount,
      category: body.category,
      note: body.note || '',
      date: new Date(body.date),
    });

    return res.status(201).json({ expense });
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { period, userId } = req.query;

    const filter = {
      companyId: req.auth.companyId,
    };

    if (req.auth.role === 'employee') {
      filter.userId = req.auth.userId;
    } else if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid userId' });
      }
      filter.userId = userId;
    }

    if (period) {
      const periodValue = String(period);
      const regex = /^\d{4}(-\d{2})?$/;
      if (!regex.test(periodValue)) {
        return res.status(400).json({ message: 'Period must be YYYY or YYYY-MM' });
      }
      const [year, month] = periodValue.split('-').map(Number);
      const start = month
        ? new Date(Date.UTC(year, month - 1, 1))
        : new Date(Date.UTC(year, 0, 1));
      const end = month
        ? new Date(Date.UTC(year, month, 1))
        : new Date(Date.UTC(year + 1, 0, 1));

      filter.date = { $gte: start, $lt: end };
    }

    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });

    return res.json({ expenses });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid expense id' });
    }

    const expense = await Expense.findOne({
      _id: id,
      companyId: req.auth.companyId,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (req.auth.role === 'employee' && expense.userId.toString() !== req.auth.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Expense.deleteOne({ _id: expense._id });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
