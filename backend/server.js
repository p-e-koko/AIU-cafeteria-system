import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './models/index.js';
import User from './models/User.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running' });
});

// Initialize database
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Sync models with database
    await sequelize.sync({ alter: false });
    console.log('✓ Database models synced');

    // Create a demo user if it doesn't exist (optional)
    const demoUserExists = await User.findOne({ where: { email: 'demo@aiu.edu' } });
    if (!demoUserExists) {
      await User.create({
        name: 'Demo User',
        email: 'demo@aiu.edu',
        password: 'password123',
        role: 'Student',
      });
      console.log('✓ Demo user created (email: demo@aiu.edu, password: password123)');
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
      console.log('✓ Demo admin created (email: admin@aiu.edu, password: admin123)');
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
    console.log(`\n🚀 AIU Cafeteria Backend running at http://localhost:${PORT}`);
    console.log(`📝 CORS enabled for http://localhost:3000\n`);
  });
};

startServer();
