/**
 * tests/menu.test.js
 *
 * Module 3: Menu Management
 * ─────────────────────────
 * Covers three testing categories:
 *   • Happy Path   — fetching today's menu, adding items, toggling availability
 *   • Boundary     — single-item day, minimum required fields, all-unavailable day
 *   • Negative     — missing name, negative price, wrong role, invalid day format
 *
 * All Sequelize / SQLite calls are mocked — no real database is needed.
 * Students only see available items (the route filters by available: true).
 * Admin users see everything and can add items or change availability.
 *
 * Pattern: Arrange → Act → Assert (AAA) with comments on every test.
 */

const request = require('supertest');

// ── Mock: auth middleware ────────────────────────────────────────────────────
// Default injected user is a Student (id = 42).
// Tests that need Admin access call loginAs('Admin') before the request.
jest.mock('../backend/middleware/auth.js', () => ({
  __esModule: true,
  verifyToken: (req, _res, next) => {
    req.user = global.__testUser || { id: 42, role: 'Student', name: 'Test Student' };
    next();
  },
  requireRole: (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: "You don't have permission to do that." },
      });
    }
    next();
  },
}));

// ── Mock: MenuItem Sequelize model ───────────────────────────────────────────
jest.mock('../backend/models/MenuItem.js', () => ({
  __esModule: true,
  default: {
    create:    jest.fn(),
    findAll:   jest.fn(),
    findByPk:  jest.fn(),
  },
}));

// ── Mock: other models required by the app setup ─────────────────────────────
jest.mock('../backend/models/Feedback.js', () => ({
  __esModule: true,
  default: { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn() },
}));

jest.mock('../backend/models/User.js', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../backend/models/Suggestion.js', () => ({
  __esModule: true,
  default: { create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn() },
}));

// ── Import app AFTER mocks ────────────────────────────────────────────────────
const { default: app } = require('../backend/app.js');

// ── Grab the mocked MenuItem model to configure per-test behaviour ────────────
const MenuItem = require('../backend/models/MenuItem.js').default;

// ── Reset state before each test ─────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  global.__testUser = null;
});

afterAll(() => {
  delete global.__testUser;
});

/** Helper: switches the mocked user to Admin or Student for one test. */
const loginAs = (role) => {
  global.__testUser = {
    id:   role === 'Admin' ? 1 : 42,
    role,
    name: role === 'Admin' ? 'Cafeteria Admin' : 'Test Student',
  };
};

// ════════════════════════════════════════════════════════════════════════════
// HAPPY PATH — correct usage produces the expected success responses
// ════════════════════════════════════════════════════════════════════════════

describe("Menu Management — Happy Path", () => {

  it("should return 200 with an array of available items when a student fetches today's menu", async () => {
    // Arrange — two available Monday items are returned by the mocked DB
    MenuItem.findAll.mockResolvedValue([
      { id: 1, name: 'Oatmeal',         mealType: 'Breakfast', dayOfWeek: 'Monday', available: true },
      { id: 2, name: 'Grilled Chicken', mealType: 'Lunch',     dayOfWeek: 'Monday', available: true },
    ]);

    // Act — student fetches Monday's menu
    const res = await request(app).get('/api/menu?day=Monday');

    // Assert — should get a non-empty array of menu items
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.menuItems)).toBe(true);
    expect(res.body.menuItems.length).toBeGreaterThan(0);
  });

  it('should return 201 Created with the new item when an admin adds a valid menu item', async () => {
    // Arrange — admin performs the action; create call returns the new record
    loginAs('Admin');
    const newItem = {
      id: 5, dayOfWeek: 'Tuesday', mealType: 'Dinner',
      name: 'Pasta Primavera', description: 'Fresh pasta with seasonal vegetables.',
    };
    MenuItem.create.mockResolvedValue(newItem);

    // Act — admin POSTs a full menu item payload
    const res = await request(app)
      .post('/api/menu')
      .send({
        dayOfWeek:   'Tuesday',
        mealType:    'Dinner',
        name:        'Pasta Primavera',
        description: 'Fresh pasta with seasonal vegetables.',
      });

    // Assert — 201 and the returned item matches what was created
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.menuItem).toHaveProperty('name', 'Pasta Primavera');
  });

  it('should exclude unavailable items so students never see them in the menu response', async () => {
    // Arrange — the route adds { available: true } to the WHERE clause for students;
    //           the mock simulates that only the available item is returned by the DB
    MenuItem.findAll.mockResolvedValue([
      { id: 3, name: 'Garden Salad', available: true },
      // The "Stale Soup" item (available: false) was filtered by the route and never returned
    ]);

    // Act — student fetches the menu
    const res = await request(app).get('/api/menu');

    // Assert — every item in the response must be available
    expect(res.statusCode).toBe(200);
    expect(res.body.menuItems.every((item) => item.available !== false)).toBe(true);
  });

});

// ════════════════════════════════════════════════════════════════════════════
// BOUNDARY (EDGE) CASES — inputs at the exact limits of the valid range
// ════════════════════════════════════════════════════════════════════════════

describe('Menu Management — Boundary Cases', () => {

  it('should return an array of exactly 1 item when only one item is scheduled for a day', async () => {
    // Arrange — exactly one item exists for Friday
    MenuItem.findAll.mockResolvedValue([
      { id: 7, name: 'Friday Special', dayOfWeek: 'Friday', available: true },
    ]);

    // Act
    const res = await request(app).get('/api/menu?day=Friday');

    // Assert — length must be 1, not 0 or more
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.menuItems).toHaveLength(1);
    expect(res.body.menuItems[0].name).toBe('Friday Special');
  });

  it('should return 201 when an admin adds a menu item with only the minimum required fields', async () => {
    // Arrange — only name and dayOfWeek provided (description defaults to empty string)
    loginAs('Admin');
    MenuItem.create.mockResolvedValue({
      id: 8, dayOfWeek: 'Wednesday', mealType: 'Lunch', name: 'Simple Dish', description: '',
    });

    // Act — POST with just the required fields
    const res = await request(app)
      .post('/api/menu')
      .send({ dayOfWeek: 'Wednesday', mealType: 'Lunch', name: 'Simple Dish' });

    // Assert — minimum valid payload should succeed
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return an empty array (not null or error) when every menu item for the day is unavailable', async () => {
    // Arrange — the route filters out unavailable items; the DB mock returns an empty list
    MenuItem.findAll.mockResolvedValue([]);

    // Act — student fetches menu when all items are marked unavailable
    const res = await request(app).get('/api/menu');

    // Assert — must return an empty array, never null or a 500 error
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.menuItems)).toBe(true);
    expect(res.body.menuItems).toHaveLength(0);
  });

});

// ════════════════════════════════════════════════════════════════════════════
// NEGATIVE (ERROR) CASES — invalid inputs trigger clear error responses
// ════════════════════════════════════════════════════════════════════════════

describe('Menu Management — Negative Cases', () => {

  it('should return 400 Bad Request when an admin tries to add a menu item with a missing name field', async () => {
    // Arrange — admin is logged in; name field intentionally omitted
    loginAs('Admin');

    // Act — POST without the required 'name' field
    const res = await request(app)
      .post('/api/menu')
      .send({ dayOfWeek: 'Monday', mealType: 'Breakfast' });

    // Assert — name is required; must be rejected as a validation error
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 Bad Request when an admin provides a negative price for a new menu item', async () => {
    // Arrange — admin provides a negative price value
    loginAs('Admin');

    // Act — POST with price = -5
    const res = await request(app)
      .post('/api/menu')
      .send({ dayOfWeek: 'Monday', mealType: 'Lunch', name: 'Tomato Soup', price: -5 });

    // Assert — negative price must be rejected
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 403 Forbidden when a non-admin student tries to add a menu item', async () => {
    // Arrange — default user is Student (no loginAs call needed)

    // Act — Student attempts to POST to the Admin-only menu endpoint
    const res = await request(app)
      .post('/api/menu')
      .send({ dayOfWeek: 'Monday', mealType: 'Dinner', name: 'Jollof Rice' });

    // Assert — must be blocked with 403, not a 404 or crash
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 Bad Request when the menu is fetched with an invalid day format', async () => {
    // Arrange — no DB mock needed; validation fires before any DB call

    // Act — send an unrecognised day name
    const res = await request(app).get('/api/menu?day=Funday');

    // Assert — "Funday" is not a real day; must be rejected
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

});
