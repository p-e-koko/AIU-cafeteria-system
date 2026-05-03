/**
 * backend/server.js
 *
 * Entry point for the production server.
 * Responsibilities:
 *   1. Load environment variables
 *   2. Initialise the SQLite database and seed demo data
 *   3. Start listening on the configured port
 *
 * The Express app itself (routes, middleware) lives in app.js so that
 * tests can import the app without triggering DB connections or listen().
 */

import dotenv from 'dotenv';
import sequelize from './models/index.js';
import User      from './models/User.js';
import Suggestion from './models/Suggestion.js';
import MenuItem  from './models/MenuItem.js';
import Feedback  from './models/Feedback.js';
import app       from './app.js';

dotenv.config();

// ── Database bootstrap ───────────────────────────────────────────────────────
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Define model associations
    User.hasMany(Suggestion, { foreignKey: 'userId',     as: 'suggestions' });
    Suggestion.belongsTo(User, { foreignKey: 'userId',   as: 'user' });

    User.hasMany(Feedback,   { foreignKey: 'userId',     as: 'feedbacks' });
    Feedback.belongsTo(User, { foreignKey: 'userId',     as: 'user' });

    MenuItem.hasMany(Feedback,    { foreignKey: 'menuItemId', as: 'feedbacks' });
    Feedback.belongsTo(MenuItem,  { foreignKey: 'menuItemId', as: 'menuItem' });

    await sequelize.sync({ alter: false });
    console.log('✓ Database models synced');

    // Seed demo menu data on first run
    const menuCount = await MenuItem.count();
    if (menuCount === 0) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const menuData = [];

      days.forEach(day => {
        menuData.push({
          dayOfWeek: day, mealType: 'Breakfast',
          name: 'Healthy Start Platter',
          description: 'Avocado toast with poached egg, fresh berries, and Greek yogurt.',
          imageUrl: '/images/breakfast.png', available: true,
        });
        menuData.push({
          dayOfWeek: day, mealType: 'Lunch',
          name: 'Mediterranean Chicken Bowl',
          description: 'Grilled chicken, quinoa, roasted vegetables, and lemon tahini dressing.',
          imageUrl: '/images/lunch.png', available: true,
        });
        menuData.push({
          dayOfWeek: day, mealType: 'Dinner',
          name: 'Pan-Seared Salmon',
          description: 'Fresh salmon with asparagus, garlic mashed potatoes, and herb butter.',
          imageUrl: '/images/dinner.png', available: true,
        });
      });

      await MenuItem.bulkCreate(menuData);
      console.log('✓ Demo menu data created');
    }

    // Seed demo users on first run
    const demoUserExists = await User.findOne({ where: { email: 'demo@aiu.edu' } });
    if (!demoUserExists) {
      await User.create({ name: 'Demo User',  email: 'demo@aiu.edu',  password: 'password123', role: 'Student' });
      console.log('✓ Demo user created');
    }

    const adminExists = await User.findOne({ where: { email: 'admin@aiu.edu' } });
    if (!adminExists) {
      await User.create({ name: 'Admin User', email: 'admin@aiu.edu', password: 'admin123',    role: 'Admin' });
      console.log('✓ Demo admin created');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3333;

const startServer = async () => {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`\n🚀 AIU Cafeteria Backend running at http://localhost:${PORT}`);
    console.log(`📝 CORS enabled for http://localhost:3000\n`);
  });
};

startServer();
