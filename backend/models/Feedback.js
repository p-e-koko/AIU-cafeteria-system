import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  menuItemId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

export default Feedback;
