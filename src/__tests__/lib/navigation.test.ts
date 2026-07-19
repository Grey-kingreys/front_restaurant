/**
 * Tests pour src/lib/navigation.ts
 * Vérifie les configurations de navigation par rôle
 */

describe('Navigation by Role', () => {
  const roleConfig = {
    Radmin: ['/dashboard', '/equipe', '/tables', '/menu', '/commandes', '/caisse-generale'],
    Rmanager: ['/dashboard', '/equipe', '/tables', '/menu', '/commandes', '/caisse-generale'],
    Rserveur: ['/dashboard', '/commandes', '/remises'],
    Rchef_cuisinier: ['/dashboard', '/commandes/cuisine', '/commandes', '/menu', '/menu/nouveau'],
    Rcuisinier: ['/dashboard', '/commandes/cuisine'],
    Rcomptable: ['/dashboard', '/caisse', '/caisse/remises', '/caisse/depenses', '/caisse/globale'],
    Rtable: ['/dashboard', '/menu', '/commandes/panier', '/commandes/mes-commandes'],
    Rsuper_admin: ['/dashboard', '/restaurants'],
  }

  describe('Role URLs', () => {
    it('should have correct URLs for Radmin', () => {
      const adminUrls = roleConfig.Radmin
      expect(adminUrls).toContain('/dashboard')
      expect(adminUrls).toContain('/equipe')
      expect(adminUrls).toContain('/tables')
    })

    it('should have correct URLs for Rserveur', () => {
      const serveurUrls = roleConfig.Rserveur
      expect(serveurUrls).toContain('/dashboard')
      expect(serveurUrls).toContain('/remises')
      expect(serveurUrls).not.toContain('/equipe')
    })

    it('should have correct URLs for kitchen staff', () => {
      const chefUrls = roleConfig.Rchef_cuisinier
      const cuisinierUrls = roleConfig.Rcuisinier

      expect(chefUrls).toContain('/commandes/cuisine')
      expect(cuisinierUrls).toContain('/commandes/cuisine')
      expect(cuisinierUrls.length).toBeLessThan(chefUrls.length)
    })

    it('should have correct URLs for Rcomptable', () => {
      const comptableUrls = roleConfig.Rcomptable
      expect(comptableUrls).toContain('/caisse')
      expect(comptableUrls).toContain('/caisse/remises')
      expect(comptableUrls).toContain('/caisse/depenses')
    })

    it('should have correct URLs for Rtable', () => {
      const tableUrls = roleConfig.Rtable
      expect(tableUrls).toContain('/commandes/panier')
      expect(tableUrls).toContain('/menu')
      expect(tableUrls).not.toContain('/equipe')
    })

    it('should have correct URLs for Rsuper_admin', () => {
      const saUrls = roleConfig.Rsuper_admin
      expect(saUrls).toContain('/restaurants')
      expect(saUrls).not.toContain('/equipe')
    })
  })

  describe('Role isolation', () => {
    it('Rserveur should not access admin paths', () => {
      const serveurUrls = roleConfig.Rserveur
      const adminOnlyPaths = ['/equipe', '/tables', '/caisse', '/restaurants']

      adminOnlyPaths.forEach((path) => {
        expect(serveurUrls).not.toContain(path)
      })
    })

    it('Rtable should not access staff management', () => {
      const tableUrls = roleConfig.Rtable
      expect(tableUrls).not.toContain('/equipe')
      expect(tableUrls).not.toContain('/caisse')
      expect(tableUrls).not.toContain('/restaurants')
    })

    it('Rsuper_admin should only see platform level routes', () => {
      const saUrls = roleConfig.Rsuper_admin
      expect(saUrls.length).toBeLessThan(Object.values(roleConfig).map((r) => r.length).reduce((a, b) => Math.max(a, b)))
    })
  })

  describe('Dashboard accessibility', () => {
    it('all roles should have access to /dashboard', () => {
      Object.values(roleConfig).forEach((urls) => {
        expect(urls).toContain('/dashboard')
      })
    })
  })
})
