import express from 'express';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// ── POST /api/feedback ──────────────────────────────────────────────────────
// Submit feedback for a menu item. Validates rating range and prevents
// the same user from submitting feedback twice for the same item.
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { menuItemId, rating, comment } = req.body;

    // Validate: menuItemId must be present
    if (menuItemId === undefined || menuItemId === null) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'menuItemId is required.' },
      });
    }

    // Validate: rating must be an integer in the range [1, 5]
    const ratingNum = Number(rating);
    if (
      rating === undefined ||
      rating === null ||
      !Number.isInteger(ratingNum) ||
      ratingNum < 1 ||
      ratingNum > 5
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Rating must be a whole number between 1 and 5.',
        },
      });
    }

    // Prevent duplicate feedback from the same user for the same menu item
    const existing = await Feedback.findOne({
      where: { userId: req.user.id, menuItemId },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'You have already submitted feedback for this menu item.',
        },
      });
    }

    const feedback = await Feedback.create({
      userId:     req.user.id,
      menuItemId,
      rating:     ratingNum,
      comment:    comment ?? '',
    });

    res.status(201).json({ success: true, feedback });
  } catch (error) {
    error.code = 'DB_ERROR';
    next(error);
  }
});

// ── GET /api/feedback/:menuItemId ────────────────────────────────────────────
// Returns all feedback for a given menu item. Always returns an array.
router.get('/:menuItemId', verifyToken, async (req, res, next) => {
  try {
    const { menuItemId } = req.params;

    const feedback = await Feedback.findAll({
      where: { menuItemId },
      include: [{ model: User, as: 'user', attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, feedback });
  } catch (error) {
    error.code = 'DB_ERROR';
    next(error);
  }
});

export default router;
