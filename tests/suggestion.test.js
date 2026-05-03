/**
 * tests/suggestion.test.js
 *
 * Module 2: Suggestion Submission & Approval
 * ──────────────────────────────────────────
 * Covers three testing categories:
 *   • Happy Path   — valid suggestion flow and admin approval / rejection
 *   • Boundary     — 1-char, 500-char descriptions; empty suggestion list
 *   • Negative     — empty description, 501+ chars, wrong role, missing ID
 *
 * All Sequelize / SQLite calls are mocked — no real database is needed.
 *
 * Because the 'approve / reject' route is Admin-only, some tests call
 * loginAs('Admin') to override the default Student user injected by the
 * mocked auth middleware.
 *
 * Pattern: Arrange → Act → Assert (AAA) with comments on every test.
 */

const request = require('supertest');

// ── Mock: auth middleware ────────────────────────────────────────────────────
// Default injected user is a Student (id = 42).
// Tests that need an Admin call loginAs('Admin') before the request.
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

// ── Mock: Suggestion Sequelize model ─────────────────────────────────────────
jest.mock('../backend/models/Suggestion.js', () => ({
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

jest.mock('../backend/models/MenuItem.js', () => ({
  __esModule: true,
  default: { create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn() },
}));

// ── Import app AFTER mocks are registered ────────────────────────────────────
const { default: app } = require('../backend/app.js');

// ── Grab the mocked Suggestion model to configure per-test behaviour ─────────
const Suggestion = require('../backend/models/Suggestion.js').default;

// ── Reset mock state and user role before every test ─────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  global.__testUser = null; // Reset to default Student
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
// HAPPY PATH — end-to-end suggestion lifecycle
// ════════════════════════════════════════════════════════════════════════════

describe('Suggestion Submission & Approval — Happy Path', () => {

  it('should return 201 Created and set status to "Pending" when a student submits a valid suggestion', async () => {
    // Arrange — the DB call to create a suggestion succeeds
    Suggestion.create.mockResolvedValue({
      id: 1,
      dishName:    'Jollof Rice',
      mealType:    'Lunch',
      description: 'A classic West African dish with rich tomato sauce.',
      status:      'Pending',
      userId:      42,
    });

    // Act — student POSTs a well-formed suggestion
    const res = await request(app)
      .post('/api/suggestions')
      .send({
        dishName:    'Jollof Rice',
        mealType:    'Lunch',
        description: 'A classic West African dish with rich tomato sauce.',
      });

    // Assert — 201 and status must be Pending (not pre-approved)
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.suggestion.status).toBe('Pending');
  });

  it('should return 200 and update status to "Approved" when an admin approves a suggestion', async () => {
    // Arrange — admin is performing the action
    loginAs('Admin');
    const mockSuggestion = {
      id:     1,
      status: 'Pending',
      save:   jest.fn().mockResolvedValue(true),
    };
    Suggestion.findByPk.mockResolvedValue(mockSuggestion);

    // Act — admin sends APPROVED status for suggestion #1
    const res = await request(app)
      .put('/api/suggestions/1/status')
      .send({ status: 'Approved' });

    // Assert — 200 returned; the suggestion object now has status Approved
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockSuggestion.status).toBe('Approved');
    expect(mockSuggestion.save).toHaveBeenCalledTimes(1);
  });

  it('should return 200 and update status to "Rejected" when an admin rejects a suggestion', async () => {
    // Arrange — admin is performing the action
    loginAs('Admin');
    const mockSuggestion = {
      id:     2,
      status: 'Pending',
      save:   jest.fn().mockResolvedValue(true),
    };
    Suggestion.findByPk.mockResolvedValue(mockSuggestion);

    // Act — admin sends REJECTED status for suggestion #2
    const res = await request(app)
      .put('/api/suggestions/2/status')
      .send({ status: 'Rejected' });

    // Assert — 200 returned; the suggestion object now has status Rejected
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockSuggestion.status).toBe('Rejected');
  });

});

// ════════════════════════════════════════════════════════════════════════════
// BOUNDARY (EDGE) CASES — inputs at the exact limits of the valid range
// ════════════════════════════════════════════════════════════════════════════

describe('Suggestion Submission & Approval — Boundary Cases', () => {

  it('should accept and return 201 for a suggestion whose description is exactly 500 characters', async () => {
    // Arrange — 500 characters is the maximum allowed length
    const exactly500Chars = 'A'.repeat(500);
    Suggestion.create.mockResolvedValue({
      id: 3, dishName: 'Boundary Dish', mealType: 'Lunch',
      description: exactly500Chars, status: 'Pending',
    });

    // Act — send exactly the maximum allowed length
    const res = await request(app)
      .post('/api/suggestions')
      .send({ dishName: 'Boundary Dish', mealType: 'Lunch', description: exactly500Chars });

    // Assert — 500 chars is still within the limit; should succeed
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should accept and return 201 for a suggestion whose description is exactly 1 character', async () => {
    // Arrange — 1 character is the minimum non-empty description
    Suggestion.create.mockResolvedValue({
      id: 4, dishName: 'Mini Dish', mealType: 'Breakfast',
      description: 'X', status: 'Pending',
    });

    // Act — send a single-character description
    const res = await request(app)
      .post('/api/suggestions')
      .send({ dishName: 'Mini Dish', mealType: 'Breakfast', description: 'X' });

    // Assert — 1 char is the floor of the valid range; should succeed
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return an empty array (not null and not an error) when no suggestions exist in the system', async () => {
    // Arrange — the DB returns zero records
    Suggestion.findAll.mockResolvedValue([]);

    // Act — GET suggestions with no data in the system
    const res = await request(app).get('/api/suggestions');

    // Assert — must return an empty array, never null or a 500 error
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.suggestions)).toBe(true);
    expect(res.body.suggestions).toHaveLength(0);
  });

});

// ════════════════════════════════════════════════════════════════════════════
// NEGATIVE (ERROR) CASES — invalid inputs trigger clear error responses
// ════════════════════════════════════════════════════════════════════════════

describe('Suggestion Submission & Approval — Negative Cases', () => {

  it('should return 400 Bad Request when a student submits an empty description', async () => {
    // Arrange — no DB mock needed; validation fires first

    // Act — send an empty string for description
    const res = await request(app)
      .post('/api/suggestions')
      .send({ dishName: 'Unnamed Dish', mealType: 'Lunch', description: '' });

    // Assert — empty string must be rejected with a 400
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 Bad Request when description exceeds 500 characters (501 chars submitted)', async () => {
    // Arrange — 501 chars is one over the maximum
    const oneOverLimit = 'B'.repeat(501);

    // Act
    const res = await request(app)
      .post('/api/suggestions')
      .send({ dishName: 'Long Dish', mealType: 'Dinner', description: oneOverLimit });

    // Assert — exceeds the character limit; must be rejected
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 403 Forbidden when a non-admin student tries to approve a suggestion', async () => {
    // Arrange — default user is Student (no loginAs call needed)

    // Act — Student attempts to hit the Admin-only status endpoint
    const res = await request(app)
      .put('/api/suggestions/1/status')
      .send({ status: 'Approved' });

    // Assert — must be blocked with 403, not a crash
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 Not Found when an admin tries to approve a suggestion ID that does not exist', async () => {
    // Arrange — admin is logged in; the DB has no record for ID 9999
    loginAs('Admin');
    Suggestion.findByPk.mockResolvedValue(null);

    // Act — admin sends Approved for a non-existent suggestion
    const res = await request(app)
      .put('/api/suggestions/9999/status')
      .send({ status: 'Approved' });

    // Assert — 404 Not Found, not a 500 crash
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

});
