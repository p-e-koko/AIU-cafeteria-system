import express from 'express';
import Suggestion from '../models/Suggestion.js';
import User from '../models/User.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

const MAX_DESCRIPTION_LENGTH = 500;

// ── POST /api/suggestions ────────────────────────────────────────────────────
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { dishName, mealType, description } = req.body;

    // Validate: all three fields must be present
    if (!dishName || !mealType || description === undefined || description === null) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'dishName, mealType, and description are required.' },
      });
    }

    // Validate: description must not be empty
    if (description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Suggestion description cannot be empty.' },
      });
    }

    // Validate: description must not exceed 500 characters
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
        },
      });
    }

    const suggestion = await Suggestion.create({
      dishName,
      mealType,
      description,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, suggestion });
  } catch (error) {
    error.code = 'DB_ERROR';
    next(error);
  }
});

// ── GET /api/suggestions ───────────────────────────────────────────────────
router.get('/', verifyToken, async (req, res, next) => {
  try {
    let suggestions;

    if (req.user.role === 'Admin') {
      suggestions = await Suggestion.findAll({
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
        order: [['createdAt', 'DESC']],
      });
    } else {
      // Students / Staff see approved suggestions plus their own
      suggestions = await Suggestion.findAll({
        where: {
          [Op.or]: [
            { status: 'Approved' },
            { userId: req.user.id },
          ],
        },
        include: [{ model: User, as: 'user', attributes: ['name'] }],
        order: [['createdAt', 'DESC']],
      });
    }

    res.json({ success: true, suggestions });
  } catch (error) {
    error.code = 'DB_ERROR';
    next(error);
  }
});

// ── PUT /api/suggestions/:id/status (Admin only) ───────────────────────────
router.put('/:id/status', verifyToken, requireRole('Admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Status must be “Approved” or “Rejected”.' },
      });
    }

    const suggestion = await Suggestion.findByPk(id);
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Suggestion not found.' },
      });
    }

    suggestion.status = status;
    await suggestion.save();

    res.json({ success: true, suggestion });
  } catch (error) {
    error.code = 'DB_ERROR';
    next(error);
  }
});

export default router;
