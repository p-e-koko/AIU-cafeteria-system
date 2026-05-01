import express from 'express';
import MenuItem from '../models/MenuItem.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all menu items
router.get('/', verifyToken, async (req, res) => {
  try {
    const menuItems = await MenuItem.findAll({
      order: [['dayOfWeek', 'ASC'], ['mealType', 'ASC']]
    });
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ message: 'Failed to fetch menu' });
  }
});

// Add menu item (Admin only)
router.post('/', verifyToken, requireRole('Admin'), async (req, res) => {
  try {
    const { dayOfWeek, mealType, name, description, imageUrl } = req.body;
    const menuItem = await MenuItem.create({ dayOfWeek, mealType, name, description, imageUrl });
    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Failed to create menu item' });
  }
});

export default router;
