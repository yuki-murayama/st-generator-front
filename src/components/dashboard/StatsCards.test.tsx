import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsCards } from './StatsCards'

describe('StatsCards', () => {
  it('renders stats cards with correct values', () => {
    render(
      <StatsCards
        employeeCount={50}
        siteCount={10}
        activeAssignmentCount={35}
        loading={false}
      />
    )

    expect(screen.getByText('従業員数')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('現場数')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('配属中')).toBeInTheDocument()
    expect(screen.getByText('35')).toBeInTheDocument()
  })

  it('renders loading state with skeletons', () => {
    const { container } = render(
      <StatsCards
        employeeCount={0}
        siteCount={0}
        activeAssignmentCount={0}
        loading={true}
      />
    )

    // Check for skeleton elements using MUI class names
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('formats large numbers with locale formatting', () => {
    render(
      <StatsCards
        employeeCount={1234}
        siteCount={567}
        activeAssignmentCount={890}
        loading={false}
      />
    )

    // toLocaleString() adds comma separators
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('567')).toBeInTheDocument()
    expect(screen.getByText('890')).toBeInTheDocument()
  })

  it('renders three stat cards', () => {
    const { container } = render(
      <StatsCards
        employeeCount={10}
        siteCount={5}
        activeAssignmentCount={8}
        loading={false}
      />
    )

    // Check for Card components (using MUI Card class)
    const cards = container.querySelectorAll('.MuiCard-root')
    expect(cards.length).toBe(3)
  })
})