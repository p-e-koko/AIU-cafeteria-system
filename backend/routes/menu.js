import express from 'express';
import MenuItem from '../models/MenuItem.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

const VALID_DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

// ── GET /api/menu ───────────────────────────────────────────────────────────
// Optional ?day=Monday filter. Students only see available items.
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { day } = req.query;

    // Validate the optional day query parameter
    if (day !== undefined && !VALID_DAYS.includes(day)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `day must be one of: ${VALID_DAYS.join(', ')}.`,
        },
      });
    }

    const where = {};
    if (day) where.dayOfWeek = day;

    // Non-admin users only see items that are marked as available
    if (req.user.role !== 'Admin') {
      where.available = true;
    }

    const menuItems = await MenuItem.findAll({
      where,
      order: [['dayOfWeek', 'ASC'], ['mealType', 'ASC']],
    });

    res.json({ success: true, menuItems });
  } catch (error) {
    error.code = 'DB_ERROR';
    next(error);
  }
});

// ── POST /api/menu (Admin only) ──────────────────────────────────────────────
router.post('/', verifyToken, requireRole('Admin'), async (req, res, next) => {
  try {
    const { dayOfWeek, mealType, name, description, imageUrl, price } = req.body;

    // Validate: name is required
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Menu item name is required.' },
      });
    }

    // Validate: dayOfWeek must be a valid day
    if (!dayOfWeek || !VALID_DAYS.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `dayOfWeek must be one of: ${VALID_DAYS.join(', ')}.`,
        },
      });
    }

    // Validate: price must not be negative
    if (price !== undefined && price !== null && Number(price) < 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Price cannot be negative.' },
      });
    }

    const menuItem = await MenuItem.create({
      dayOfWeek,
      mealType,
      name,
      description: description ?? '',
      imageUrl,
      price,
    });

    res.status(201).json({ success: true, menuItem });
  } catch (error) {
    error.code = 'DB_ERROR';
    next(error);
  }
});

// ── PATCH /api/menu/:id/availability (Admin only) ───────────────────────────
// Marks a menu item available or unavailable.
router.patch('/:id/availability', verifyToken, requireRole('Admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Menu item not found.' },
      });
    }

    menuItem.available = available;
    await menuItem.save();

    res.json({ success: true, menuItem });
  } catch (error) {
    error.code = 'DB_ERROR';
    next(error);
  }
});

export default router;
