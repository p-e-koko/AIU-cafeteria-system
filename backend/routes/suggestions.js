import express from 'express';
import Suggestion from '../models/Suggestion.js';
import User from '../models/User.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// Create a new suggestion
router.post('/', verifyToken, async (req, res) => {
  try {
    const { dishName, mealType, description } = req.body;

    if (!dishName || !mealType || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const suggestion = await Suggestion.create({
      dishName,
      mealType,
      description,
      userId: req.user.id
    });

    res.status(201).json({
      message: 'Suggestion submitted successfully',
      suggestion
    });
  } catch (error) {
    console.error('Error creating suggestion:', error);
    res.status(500).json({ message: 'Failed to submit suggestion' });
  }
});

// Get suggestions
router.get('/', verifyToken, async (req, res) => {
  try {
    let suggestions;

    if (req.user.role === 'Admin') {
      // Admin sees all suggestions with user info
      suggestions = await Suggestion.findAll({
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
        order: [['createdAt', 'DESC']]
      });
    } else {
      // Students/Staff see:
      // 1. All Approved suggestions
      // 2. Their own suggestions (even if Pending/Rejected)
      suggestions = await Suggestion.findAll({
        where: {
          [Op.or]: [
            { status: 'Approved' },
            { userId: req.user.id }
          ]
        },
        include: [{ model: User, as: 'user', attributes: ['name'] }],
        order: [['createdAt', 'DESC']]
      });
    }

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Failed to fetch suggestions' });
  }
});

// Update suggestion status (Admin only)
router.put('/:id/status', verifyToken, requireRole('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const suggestion = await Suggestion.findByPk(id);

    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    suggestion.status = status;
    await suggestion.save();

    res.json({
      message: `Suggestion ${status.toLowerCase()} successfully`,
      suggestion
    });
  } catch (error) {
    console.error('Error updating suggestion status:', error);
    res.status(500).json({ message: 'Failed to update suggestion status' });
  }
});

export default router;
