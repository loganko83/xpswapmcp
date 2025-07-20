import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { rateLimiters, validators, handleValidationErrors, preventSQLInjection, preventXSS } from '../server/middleware/security';

const app = express();
app.use(express.json());

// Test endpoints for security middleware
app.post('/api/test-rate-limit', rateLimiters.general, (req, res) => {
  res.json({ success: true });
});

app.post('/api/test-validation', validators.swap, handleValidationErrors, (req, res) => {
  res.json({ success: true });
});

app.post('/api/test-sql-injection', preventSQLInjection, (req, res) => {
  res.json({ success: true });
});

app.post('/api/test-xss', preventXSS, (req, res) => {
  res.json({ success: true, data: req.body });
});

describe('Security Middleware Tests', () => {
  
  describe('Input Validation', () => {
    it('should accept valid swap data', async () => {
      const response = await request(app)
        .post('/api/test-validation')
        .send({
          from: 'XP',
          to: 'USDT',
          amount: '100',
          slippage: '0.5'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject invalid swap data', async () => {
      const response = await request(app)
        .post('/api/test-validation')
        .send({
          from: 'X', // Too short
          to: 'USDT',
          amount: '-100', // Negative amount
          slippage: '100' // Too high slippage
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should allow safe input', async () => {
      const response = await request(app)
        .post('/api/test-sql-injection')
        .send({
          query: 'normal search term'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should block SQL injection attempts', async () => {
      const response = await request(app)
        .post('/api/test-sql-injection')
        .send({
          query: "'; DROP TABLE users; --"
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid input detected');
    });

    it('should block UNION attacks', async () => {
      const response = await request(app)
        .post('/api/test-sql-injection')
        .send({
          query: "1 UNION SELECT * FROM passwords"
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize script tags', async () => {
      const response = await request(app)
        .post('/api/test-xss')
        .send({
          message: '<script>alert("xss")</script>Hello World'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.message).not.toContain('<script>');
    });

    it('should sanitize HTML tags', async () => {
      const response = await request(app)
        .post('/api/test-xss')
        .send({
          message: '<img src="x" onerror="alert(1)">Test'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.message).not.toContain('<img');
    });
  });
});
