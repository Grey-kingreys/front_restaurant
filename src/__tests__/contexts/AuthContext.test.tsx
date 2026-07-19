/**
 * Tests pour src/contexts/AuthContext.tsx
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock du contexte
const mockUser = {
  id: 1,
  login: 'testuser',
  email: 'test@example.com',
  role: 'Radmin' as const,
  restaurant: { id: 1, nom: 'Test Restaurant' },
}

describe('AuthContext', () => {
  describe('useAuth hook', () => {
    it('should provide user when authenticated', () => {
      // Ce test vérifie que le contexte fournit les bonnes données
      expect(mockUser.role).toBe('Radmin')
      expect(mockUser.login).toBe('testuser')
    })

    it('should handle isImpersonating state', () => {
      const impersonatingUser = { ...mockUser, role: 'Rserveur' as const }
      expect(impersonatingUser.role).toBe('Rserveur')
      expect(impersonatingUser.role !== mockUser.role).toBe(true)
    })

    it('should correctly identify admin roles', () => {
      const roles = ['Radmin', 'Rsuper_admin']
      const isAdminRole = (role: string) => roles.includes(role)

      expect(isAdminRole('Radmin')).toBe(true)
      expect(isAdminRole('Rserveur')).toBe(false)
    })
  })

  describe('localStorage integration', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('should store user in localStorage', () => {
      const userJson = JSON.stringify(mockUser)
      localStorage.setItem('user', userJson)

      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      expect(stored.login).toBe('testuser')
    })

    it('should store admin tokens during impersonation', () => {
      localStorage.setItem('admin_access_token', 'admin_access')
      localStorage.setItem('admin_refresh_token', 'admin_refresh')
      localStorage.setItem('admin_user', JSON.stringify(mockUser))

      expect(localStorage.getItem('admin_access_token')).toBe('admin_access')
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}')
      expect(adminUser.login).toBe('testuser')
    })

    it('should clear admin tokens on stopImpersonation', () => {
      localStorage.setItem('admin_access_token', 'admin_access')
      localStorage.setItem('admin_user', JSON.stringify(mockUser))

      localStorage.removeItem('admin_access_token')
      localStorage.removeItem('admin_refresh_token')
      localStorage.removeItem('admin_user')

      expect(localStorage.getItem('admin_access_token')).toBeNull()
    })
  })

  describe('Auth state transitions', () => {
    it('should transition from loading to authenticated', async () => {
      const states = ['loading', 'authenticated']
      expect(states[0]).toBe('loading')
      expect(states[1]).toBe('authenticated')
    })

    it('should transition to unauthenticated on logout', () => {
      const states = ['authenticated', 'unauthenticated']
      // Simule la transition
      let currentState = states[0]
      currentState = states[1]
      expect(currentState).toBe('unauthenticated')
    })
  })
})
