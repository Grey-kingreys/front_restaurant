/**
 * Tests pour src/lib/api/auth.ts
 * Simule les appels API d'authentification
 */

describe('Auth API', () => {
  describe('loginUser', () => {
    it('should send login request with email and password', async () => {
      // Mock fetch
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                access: 'token_access',
                refresh: 'token_refresh',
                user: { id: 1, login: 'admin', email: 'admin@test.com', role: 'Radmin' },
              },
            }),
        })
      ) as jest.Mock;

      const response = await fetch('/api/accounts/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@test.com', password: 'pass' }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.user.login).toBe('admin');
    });

    it('should handle login error response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              success: false,
              message: 'Invalid credentials',
            }),
        })
      ) as jest.Mock;

      const response = await fetch('/api/accounts/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'wrong@test.com', password: 'wrong' }),
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Invalid credentials');
    });
  });

  describe('logoutUser', () => {
    it('should send logout request with refresh token', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      ) as jest.Mock;

      const response = await fetch('/api/accounts/auth/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer access_token',
        },
        body: JSON.stringify({ refresh_token: 'refresh_token' }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('getMe', () => {
    it('should fetch current user profile', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                id: 1,
                login: 'admin',
                email: 'admin@test.com',
                role: 'Radmin',
                restaurant: { id: 1, nom: 'Le Baobab' },
              },
            }),
        })
      ) as jest.Mock;

      const response = await fetch('/api/accounts/auth/me/', {
        headers: { Authorization: 'Bearer access_token' },
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.role).toBe('Radmin');
    });
  });
});
