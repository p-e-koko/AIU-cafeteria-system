import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './models/index.js';
import User from './models/User.js';
import Suggestion from './models/Suggestion.js';
import MenuItem from './models/MenuItem.js';
import Feedback from './models/Feedback.js';

import authRoutes from './routes/auth.js';
import suggestionRoutes from './routes/suggestions.js';
import menuRoutes from './routes/menu.js';
import feedbackRoutes from './routes/feedback.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running' });
});

// Initialize database
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Define associations
    User.hasMany(Suggestion, { foreignKey: 'userId', as: 'suggestions' });
    Suggestion.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    User.hasMany(Feedback, { foreignKey: 'userId', as: 'feedbacks' });
    Feedback.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    MenuItem.hasMany(Feedback, { foreignKey: 'menuItemId', as: 'feedbacks' });
    Feedback.belongsTo(MenuItem, { foreignKey: 'menuItemId', as: 'menuItem' });

    // Sync models with database
    await sequelize.sync({ alter: false });
    console.log('✓ Database models synced');

    // Create demo data if empty
    const menuCount = await MenuItem.count();
    if (menuCount === 0) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const menuData = [];

      days.forEach(day => {
        menuData.push({
          dayOfWeek: day,
          mealType: 'Breakfast',
          name: 'Healthy Start Platter',
          description: 'Avocado toast with poached egg, fresh berries, and Greek yogurt.',
          imageUrl: '/images/breakfast.png'
        });
        menuData.push({
          dayOfWeek: day,
          mealType: 'Lunch',
          name: 'Mediterranean Chicken Bowl',
          description: 'Grilled chicken, quinoa, roasted vegetables, and lemon tahini dressing.',
          imageUrl: '/images/lunch.png'
        });
        menuData.push({
          dayOfWeek: day,
          mealType: 'Dinner',
          name: 'Pan-Seared Salmon',
          description: 'Fresh salmon with asparagus, garlic mashed potatoes, and herb butter.',
          imageUrl: '/images/dinner.png'
        });
      });

      await MenuItem.bulkCreate(menuData);
      console.log('✓ Demo menu data created');
    }

    // Create a demo user if it doesn't exist
    const demoUserExists = await User.findOne({ where: { email: 'demo@aiu.edu' } });
    if (!demoUserExists) {
      await User.create({
        name: 'Demo User',
        email: 'demo@aiu.edu',
        password: 'password123',
        role: 'Student',
      });
      console.log('✓ Demo user created');
    }

    // Create a demo admin user if it doesn't exist
    const adminExists = await User.findOne({ where: { email: 'admin@aiu.edu' } });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@aiu.edu',
        password: 'admin123',
        role: 'Admin',
      });
      console.log('✓ Demo admin created');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 3333;

const startServer = async () => {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`\n🚀 AIU Cafeteria Backend running at port ${PORT}`);
    console.log(`📝 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}\n`);
  });
};

startServer();
