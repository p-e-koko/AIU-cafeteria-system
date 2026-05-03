/**
 * tests/errorHandler.test.js
 *
 * Task 3 — Humanized Error Handling Middleware
 * ─────────────────────────────────────────────
 * Verifies that the centralised errorHandler middleware:
 *   1. Maps internal errors to user-friendly messages
 *   2. Returns the correct HTTP status code for each error type
 *   3. Always uses the shape: { success: false, error: { code, message, hint } }
 *   4. NEVER leaks stack traces, SQLite codes, file paths, or variable names
 *
 * A minimal Express app is built here specifically to trigger each error type
 * without needing any mocked Sequelize models.
 *
 * Pattern: Arrange → Act → Assert (AAA) with comments on every test.
 */

const request    = require('supertest');
const express    = require('express');

// Import the real middleware under test (no mock — we are testing its logic)
const { default: errorHandler } = require('../backend/middleware/errorHandler.js');

// ── Build a minimal test-only Express app ────────────────────────────────────
// Each route intentionally triggers a specific error code so we can verify
// that errorHandler maps it to the correct humanized response.
const buildTestApp = () => {
  const testApp = express();
  testApp.use(express.json());

  // ── Trigger: DB_ERROR ──────────────────────────────────────────────────────
  // Simulates a SQLite / Sequelize error thrown inside a route handler
  testApp.get('/test/db-crash', (_req, _res, next) => {
    const err = new Error('SQLITE_ERROR: disk I/O error at row 42');
    err.code = 'DB_ERROR';
    next(err); // Pass to errorHandler
  });

  // ── Trigger: VALIDATION_ERROR ─────────────────────────────────────────────
  // Simulates a missing-field validation failure in a route handler
  testApp.get('/test/validation-fail', (_req, _res, next) => {
    const err = new Error('Missing required field: rating');
    err.code = 'VALIDATION_ERROR';
    next(err);
  });

  // ── Trigger: UNAUTHORIZED ─────────────────────────────────────────────────
  // Simulates a role-based access check failure
  testApp.get('/test/forbidden', (_req, _res, next) => {
    const err = new Error('Insufficient permissions — role: Student');
    err.code = 'UNAUTHORIZED';
    next(err);
  });

  // ── Trigger: SERVER_ERROR (untyped crash) ─────────────────────────────────
  // Simulates an unexpected JS crash with no error code set
  testApp.get('/test/crash', (_req, _res, next) => {
    const err = new Error("Cannot read properties of undefined (reading 'id')");
    // Intentionally no err.code — should fall back to SERVER_ERROR
    next(err);
  });

  // ── 404 catch-all ─────────────────────────────────────────────────────────
  // Any unmapped route becomes a NOT_FOUND error (same pattern as app.js)
  testApp.use((_req, _res, next) => {
    const err = new Error('Route not found');
    err.code = 'NOT_FOUND';
    next(err);
  });

  // ── Attach the errorHandler middleware under test ──────────────────────────
  testApp.use(errorHandler);

  return testApp;
};

const app = buildTestApp();

// ════════════════════════════════════════════════════════════════════════════
// DB CRASH — database error must be humanized and must not expose internals
// ════════════════════════════════════════════════════════════════════════════

describe('Error Handler — DB Crash Scenario', () => {

  it('should return 503 with a humanized database message when a DB_ERROR is raised mid-request', async () => {
    // Arrange — the /test/db-crash route raises a DB_ERROR

    // Act
    const res = await request(app).get('/test/db-crash');

    // Assert — correct HTTP status
    expect(res.statusCode).toBe(503);

    // Assert — standard response shape
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('code',    'DB_ERROR');
    expect(res.body.error).toHaveProperty('message');
    expect(res.body.error).toHaveProperty('hint');

    // Assert — user-facing message must mention the database in plain language
    expect(res.body.error.message).toMatch(/database/i);

    // Assert — MUST NOT expose raw SQLite internals
    expect(res.body.error.message).not.toContain('SQLITE_ERROR');
    expect(res.body.error.message).not.toContain('disk I/O');
    expect(res.body.error.message).not.toContain('row 42');
  });

});

// ════════════════════════════════════════════════════════════════════════════
// 404 NOT FOUND — unmapped routes must return a clear human-readable message
// ════════════════════════════════════════════════════════════════════════════

describe('Error Handler — 404 Not Found Scenario', () => {

  it('should return 404 with a humanized message when a completely unknown route is requested', async () => {
    // Arrange — request to a path that no route handles

    // Act — GET a non-existent endpoint
    const res = await request(app).get('/this/path/does/not/exist/at/all');

    // Assert — correct HTTP status
    expect(res.statusCode).toBe(404);

    // Assert — standard response shape
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('code',    'NOT_FOUND');
    expect(res.body.error).toHaveProperty('message');
    expect(res.body.error).toHaveProperty('hint');

    // Assert — message must be non-empty and readable
    expect(res.body.error.message.length).toBeGreaterThan(0);

    // Assert — must NOT expose internal route table details
    expect(res.body.error.message).not.toContain('Route not found');
  });

});

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION FAILURE — bad input must produce a clear 400 with no raw details
// ════════════════════════════════════════════════════════════════════════════

describe('Error Handler — Validation Failure Scenario', () => {

  it('should return 400 with a humanized validation message and never expose internal field names', async () => {
    // Arrange — the /test/validation-fail route raises a VALIDATION_ERROR

    // Act
    const res = await request(app).get('/test/validation-fail');

    // Assert — correct HTTP status
    expect(res.statusCode).toBe(400);

    // Assert — standard response shape
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('code',    'VALIDATION_ERROR');
    expect(res.body.error).toHaveProperty('message');
    expect(res.body.error).toHaveProperty('hint');

    // Assert — must NOT expose the internal error message text
    expect(res.body.error.message).not.toContain('Missing required field');
    expect(res.body.error.message).not.toContain('rating');
  });

});

// ════════════════════════════════════════════════════════════════════════════
// UNAUTHORIZED ACCESS — forbidden actions must return 403 without detail
// ════════════════════════════════════════════════════════════════════════════

describe('Error Handler — Unauthorized Access Scenario', () => {

  it('should return 403 with a humanized forbidden message and never expose role information', async () => {
    // Arrange — the /test/forbidden route raises an UNAUTHORIZED error

    // Act
    const res = await request(app).get('/test/forbidden');

    // Assert — correct HTTP status
    expect(res.statusCode).toBe(403);

    // Assert — standard response shape
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('code',    'UNAUTHORIZED');
    expect(res.body.error).toHaveProperty('message');
    expect(res.body.error).toHaveProperty('hint');

    // Assert — must NOT expose internal role details
    expect(res.body.error.message).not.toContain('Student');
    expect(res.body.error.message).not.toContain('Insufficient permissions');
  });

});

// ════════════════════════════════════════════════════════════════════════════
// UNEXPECTED SERVER CRASH — generic 500 with no stack trace exposed
// ════════════════════════════════════════════════════════════════════════════

describe('Error Handler — Unexpected Server Crash Scenario', () => {

  it('should return 500 with a generic humanized message and no stack trace in the response body', async () => {
    // Arrange — the /test/crash route raises an untyped error (no err.code)

    // Act
    const res = await request(app).get('/test/crash');

    // Assert — correct HTTP status
    expect(res.statusCode).toBe(500);

    // Assert — standard response shape
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('code',    'SERVER_ERROR');
    expect(res.body.error).toHaveProperty('message');
    expect(res.body.error).toHaveProperty('hint');

    // Assert — stack trace / internal paths must NOT appear anywhere in the body
    const bodyText = JSON.stringify(res.body);
    expect(bodyText).not.toContain('at Object');         // stack frame
    expect(bodyText).not.toContain('node_modules');      // internal path
    expect(bodyText).not.toContain("reading 'id'");      // raw JS error text
    expect(bodyText).not.toContain('.js:');              // file line references
  });

});
