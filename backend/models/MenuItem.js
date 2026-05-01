import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dayOfWeek: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    allowNull: false
  },
  mealType: {
    type: DataTypes.ENUM('Breakfast', 'Lunch', 'Dinner'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

export default MenuItem;
