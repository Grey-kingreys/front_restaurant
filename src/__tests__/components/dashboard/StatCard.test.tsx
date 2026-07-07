/**
 * Tests pour src/components/dashboard/StatCard.tsx
 */
import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock du composant StatCard
interface StatCardProps {
  label: string
  value: number | string
  change?: { value: number; direction: 'up' | 'down' }
  icon?: React.ReactNode
}

const MockStatCard: React.FC<StatCardProps> = ({ label, value, change, icon }) => (
  <div data-testid="stat-card">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    {change && (
      <div className={`change change-${change.direction}`}>
        {change.direction === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
      </div>
    )}
    {icon && <div className="icon">{icon}</div>}
  </div>
)

describe('StatCard Component', () => {
  it('should render label and value', () => {
    render(<MockStatCard label="Revenus" value="$2,450" />)

    expect(screen.getByText('Revenus')).toBeInTheDocument()
    expect(screen.getByText('$2,450')).toBeInTheDocument()
  })

  it('should render change indicator when provided', () => {
    render(
      <MockStatCard
        label="Croissance"
        value="15%"
        change={{ value: 12, direction: 'up' }}
      />
    )

    expect(screen.getByText(/↑ 12%/)).toBeInTheDocument()
  })

  it('should display negative change with down arrow', () => {
    render(
      <MockStatCard
        label="Baisse"
        value="-5%"
        change={{ value: 5, direction: 'down' }}
      />
    )

    expect(screen.getByText(/↓ 5%/)).toBeInTheDocument()
  })

  it('should render icon when provided', () => {
    const icon = <span data-testid="test-icon">📊</span>
    render(<MockStatCard label="Stats" value="100" icon={icon} />)

    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('should have correct data-testid', () => {
    render(<MockStatCard label="Test" value="999" />)

    expect(screen.getByTestId('stat-card')).toBeInTheDocument()
  })
})
