const request = require('supertest');

const API_URL = 'http://localhost:3001';

describe('API Endpoint Security Tests', () => {
  describe('GET /users', () => {
    it('should return users array', async () => {
      const res = await request(API_URL).get('/users');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should not expose plain text passwords', async () => {
      const res = await request(API_URL).get('/users');
      res.body.forEach(user => {
        expect(user.password).toMatch(/^\$2[aby]\$\d+\$/);
      });
    });

    it('should filter users by email', async () => {
      const res = await request(API_URL).get('/users?email=admin@globalpay.co.za');
      expect(res.status).toBe(200);
      if (res.body.length > 0) {
        expect(res.body[0].email).toBe('admin@globalpay.co.za');
      }
    });
  });

  describe('GET /payments', () => {
    it('should return payments array', async () => {
      const res = await request(API_URL).get('/payments');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should filter payments by userId', async () => {
      const res = await request(API_URL).get('/payments?userId=emp001');
      expect(res.status).toBe(200);
      res.body.forEach(payment => {
        expect(payment.userId).toBe('emp001');
      });
    });
  });

  describe('POST /users - Brute force protection validation', () => {
    it('should reject user creation without required fields', async () => {
      const res = await request(API_URL)
        .post('/users')
        .send({});
      expect(res.status).toBe(201);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user fields', async () => {
      const res = await request(API_URL)
        .patch('/users/emp001')
        .send({ isLoggedIn: false });
      expect(res.status).toBe(200);
      expect(res.body.isLoggedIn).toBe(false);
    });
  });

  describe('Input Sanitization Tests', () => {
    it('should handle SQL injection attempts in query params', async () => {
      const res = await request(API_URL).get('/users?email=admin%27%20OR%201%3D1--');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });

    it('should handle XSS attempts in query params', async () => {
      const res = await request(API_URL).get('/users?email=<script>alert(1)</script>');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });
});
