import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import Suggestion from '../models/Suggestion.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';
import sequelize from '../models/index.js';

const router = express.Router();

// Middleware to ensure only admins can access these routes
router.use(verifyToken, requireRole('Admin'));

// Get overall statistics
router.get('/stats', async (req, res) => {
  try {
    const totalSuggestions = await Suggestion.count();
    const pendingSuggestions = await Suggestion.count({ where: { status: 'Pending' } });
    const totalFeedback = await Feedback.count();
    const totalUsers = await User.count();
    
    // Calculate average rating
    const avgRatingResult = await Feedback.findAll({
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
    });
    const avgRating = parseFloat(avgRatingResult[0].dataValues.avgRating || 0).toFixed(1);

    res.json({
      totalSuggestions,
      pendingSuggestions,
      totalFeedback,
      totalUsers,
      avgRating
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Get ratings analytics
router.get('/analytics/ratings', async (req, res) => {
  try {
    // Average rating per menu item
    const ratingsByMenu = await Feedback.findAll({
      attributes: [
        'menuItemId',
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('Feedback.id')), 'feedbackCount']
      ],
      include: [{
        model: MenuItem,
        as: 'menuItem',
        attributes: ['name', 'mealType']
      }],
      group: ['menuItemId', 'menuItem.id'],
      order: [[sequelize.fn('AVG', sequelize.col('rating')), 'DESC']]
    });

    res.json(ratingsByMenu);
  } catch (error) {
    console.error('Error fetching ratings analytics:', error);
    res.status(500).json({ message: 'Failed to fetch ratings analytics' });
  }
});

// Get suggestions distribution analytics
router.get('/analytics/suggestions', async (req, res) => {
  try {
    const suggestionsByStatus = await Suggestion.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const suggestionsByMealType = await Suggestion.findAll({
      attributes: [
        'mealType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['mealType']
    });

    res.json({
      byStatus: suggestionsByStatus,
      byMealType: suggestionsByMealType
    });
  } catch (error) {
    console.error('Error fetching suggestions analytics:', error);
    res.status(500).json({ message: 'Failed to fetch suggestions analytics' });
  }
});

export default router;
