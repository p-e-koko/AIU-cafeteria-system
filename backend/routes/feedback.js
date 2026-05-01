import express from 'express';
import Feedback from '../models/Feedback.js';
import MenuItem from '../models/MenuItem.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Submit feedback
router.post('/', verifyToken, async (req, res) => {
  try {
    const { menuItemId, rating, comment } = req.body;

    if (!menuItemId || !rating) {
      return res.status(400).json({ message: 'Menu item ID and rating are required' });
    }

    const feedback = await Feedback.create({
      userId: req.user.id,
      menuItemId,
      rating,
      comment
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

// Get feedback for a menu item
router.get('/:menuItemId', verifyToken, async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const feedback = await Feedback.findAll({
      where: { menuItemId },
      include: [{ model: User, as: 'user', attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

export default router;
