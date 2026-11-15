const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const { setupTestDB, clearCollections, generateAuthToken } = require('./testHelper');

setupTestDB();

describe('Auth & RBAC Test Suite', () => {
  beforeEach(async () => {
    await clearCollections();
  });

  it('should authenticate user with valid credentials and return JWT token', async () => {
    const passwordHash = await User.hashPassword('Admin@123');
    await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      passwordHash,
      role: 'ADMIN',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@test.com');
    expect(res.body.data.user.role).toBe('ADMIN');
    expect(res.body.data.user.passwordHash).toBeUndefined(); // ensure password hash is not leaked
  });

  it('should reject login with invalid password (401)', async () => {
    const passwordHash = await User.hashPassword('Admin@123');
    await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      passwordHash,
      role: 'ADMIN',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject unauthenticated request to protected route (401)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should forbid non-admin roles from accessing Admin-only routes (403)', async () => {
    const passwordHash = await User.hashPassword('Pass@123');
    const guardianUser = await User.create({
      name: 'Test Guardian',
      email: 'guardian@test.com',
      passwordHash,
      role: 'GUARDIAN',
    });

    const token = generateAuthToken(guardianUser);

    // Attempt to access audit logs (Admin only)
    const res = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Forbidden');
  });
});
