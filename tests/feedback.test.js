/**
 * tests/feedback.test.js
 *
 * Module 1: Feedback & Rating Logic
 * ─────────────────────────────────
 * Covers three testing categories:
 *   • Happy Path   — correct inputs produce the expected success responses
 *   • Boundary     — inputs sitting right at the edge of the valid range
 *   • Negative     — invalid inputs trigger the correct error codes & status
 *
 * All Sequelize / SQLite calls are mocked — no real database is needed.
 * The auth middleware is mocked to inject a Student user (id = 42).
 *
 * Pattern: Arrange → Act → Assert (AAA) with comments on every test.
 */

const request = require('supertest');

// ── Mock: auth middleware ────────────────────────────────────────────────────
// Replaces real JWT verification so requests don't need a live token.
// Injects a Student user (id = 42) into req.user by default.
// Role can be overridden per-test via global.__testUser.
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

// ── Mock: Feedback Sequelize model ──────────────────────────────────────────
// Replaces DB calls with jest.fn() stubs that can be configured per test.
jest.mock('../backend/models/Feedback.js', () => ({
  __esModule: true,
  default: {
    create:  jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  },
}));

// ── Mock: User & MenuItem models (used in Sequelize eager-load includes) ─────
jest.mock('../backend/models/User.js', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../backend/models/MenuItem.js', () => ({
  __esModule: true,
  default: { create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn() },
}));

jest.mock('../backend/models/Suggestion.js', () => ({
  __esModule: true,
  default: { create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn() },
}));

// ── Import app AFTER mocks so routes receive mocked models ──────────────────
const { default: app } = require('../backend/app.js');

// ── Grab the mocked Feedback model so individual tests can configure it ──────
const Feedback = require('../backend/models/Feedback.js').default;

// ── Reset mock state before each test so tests are fully independent ─────────
beforeEach(() => {
  jest.clearAllMocks();
  global.__testUser = null; // Reset to default Student
});

afterAll(() => {
  delete global.__testUser;
});

// ════════════════════════════════════════════════════════════════════════════
// HAPPY PATH — correct data flows from request to 201/200 response
// ════════════════════════════════════════════════════════════════════════════

describe('Feedback & Rating — Happy Path', () => {

  it('should return 201 Created when valid feedback with rating 4 and a comment is submitted', async () => {
    // Arrange — no prior feedback exists; the create call succeeds
    Feedback.findOne.mockResolvedValue(null);
    Feedback.create.mockResolvedValue({
      id: 1, menuItemId: 10, userId: 42, rating: 4, comment: 'Great food!',
    });

    // Act — POST a well-formed feedback payload
    const res = await request(app)
      .post('/api/feedback')
      .send({ menuItemId: 10, rating: 4, comment: 'Great food!' });

    // Assert — 201 status and success flag
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.feedback).toHaveProperty('id');
    expect(res.body.feedback.rating).toBe(4);
  });

  it('should return 200 with a non-empty feedback array when fetching existing reviews for a meal', async () => {
    // Arrange — two reviews already exist in the DB for menu item 10
    Feedback.findAll.mockResolvedValue([
      { id: 1, menuItemId: 10, rating: 4, comment: 'Good', user: { name: 'Alice' } },
      { id: 2, menuItemId: 10, rating: 5, comment: 'Excellent!', user: { name: 'Bob' } },
    ]);

    // Act — GET all feedback for menu item 10
    const res = await request(app).get('/api/feedback/10');

    // Assert — array with correct shape returned
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.feedback)).toBe(true);
    expect(res.body.feedback).toHaveLength(2);
    expect(res.body.feedback[0]).toHaveProperty('rating');
    expect(res.body.feedback[0]).toHaveProperty('comment');
  });

});

// ════════════════════════════════════════════════════════════════════════════
// BOUNDARY (EDGE) CASES — inputs at the exact limits of the valid range
// ════════════════════════════════════════════════════════════════════════════

describe('Feedback & Rating — Boundary Cases', () => {

  it('should accept a rating of exactly 1 (minimum valid value) and return 201', async () => {
    // Arrange — no duplicate exists; create succeeds with rating = 1
    Feedback.findOne.mockResolvedValue(null);
    Feedback.create.mockResolvedValue({ id: 2, rating: 1, menuItemId: 10, userId: 42 });

    // Act
    const res = await request(app)
      .post('/api/feedback')
      .send({ menuItemId: 10, rating: 1, comment: 'Not great, but ok.' });

    // Assert — 1 is the floor of the valid range; must be accepted
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should accept a rating of exactly 5 (maximum valid value) and return 201', async () => {
    // Arrange — no duplicate exists; create succeeds with rating = 5
    Feedback.findOne.mockResolvedValue(null);
    Feedback.create.mockResolvedValue({ id: 3, rating: 5, menuItemId: 10, userId: 42 });

    // Act
    const res = await request(app)
      .post('/api/feedback')
      .send({ menuItemId: 10, rating: 5, comment: 'Absolutely perfect!' });

    // Assert — 5 is the ceiling of the valid range; must be accepted
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should not crash and should return a consistent response when an empty comment string is submitted', async () => {
    // Arrange — comment is optional; empty string is treated as "no comment"
    Feedback.findOne.mockResolvedValue(null);
    Feedback.create.mockResolvedValue({ id: 4, rating: 3, comment: '', menuItemId: 10, userId: 42 });

    // Act
    const res = await request(app)
      .post('/api/feedback')
      .send({ menuItemId: 10, rating: 3, comment: '' });

    // Assert — must not crash; either 201 (accepts empty) or 400 (rejects it)
    //          The response must always contain the 'success' property
    expect([200, 201, 400]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('success');
  });

  it('should return an empty array (not null and not an error) when a meal has zero existing reviews', async () => {
    // Arrange — no feedback records exist for menu item 99
    Feedback.findAll.mockResolvedValue([]);

    // Act
    const res = await request(app).get('/api/feedback/99');

    // Assert — empty array is the correct representation of "no reviews"
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.feedback)).toBe(true);
    expect(res.body.feedback).toHaveLength(0);
  });

});

// ════════════════════════════════════════════════════════════════════════════
// NEGATIVE (ERROR) CASES — invalid inputs must trigger clear error responses
// ════════════════════════════════════════════════════════════════════════════

describe('Feedback & Rating — Negative Cases', () => {

  it('should return 400 Bad Request when rating is 0 (one below the minimum)', async () => {
    // Arrange — no DB mock needed; validation fires before any DB call

    // Act
    const res = await request(app)
      .post('/api/feedback')
      .send({ menuItemId: 10, rating: 0 });

    // Assert — 0 is outside the 1-5 range
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 Bad Request when rating is 6 (one above the maximum)', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .post('/api/feedback')
      .send({ menuItemId: 10, rating: 6 });

    // Assert — 6 is outside the 1-5 range
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 Bad Request when menuItemId is null', async () => {
    // Arrange

    // Act — sending null for the required menuItemId field
    const res = await request(app)
      .post('/api/feedback')
      .send({ menuItemId: null, rating: 4, comment: 'Good food' });

    // Assert — null menuItemId must be caught as a validation error
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 409 Conflict (not a crash) when the same user submits feedback for the same meal twice', async () => {
    // Arrange — simulate finding an existing review from user 42 for item 10
    Feedback.findOne.mockResolvedValue({
      id: 1, menuItemId: 10, userId: 42, rating: 3,
    });

    // Act — the same user tries to submit a second review
    const res = await request(app)
      .post('/api/feedback')
      .send({ menuItemId: 10, rating: 4, comment: 'Trying again' });

    // Assert — must be a 409 Conflict, not a 500 crash
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

});
