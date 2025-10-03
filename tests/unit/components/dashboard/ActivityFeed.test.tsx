import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityFeed, Activity } from '@/components/dashboard/ActivityFeed'

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'employee_created',
    description: '山田太郎さんが登録されました',
    timestamp: new Date('2024-01-15T10:30:00'),
    user: '管理者'
  },
  {
    id: '2',
    type: 'site_created',
    description: '東京プロジェクトが作成されました',
    timestamp: new Date('2024-01-15T11:00:00'),
    user: '管理者'
  },
  {
    id: '3',
    type: 'assignment_created',
    description: '山田太郎さんが東京プロジェクトに配属されました',
    timestamp: new Date('2024-01-15T11:30:00'),
    user: '管理者'
  },
  {
    id: '4',
    type: 'employee_updated',
    description: '佐藤花子さんの情報が更新されました',
    timestamp: new Date('2024-01-15T12:00:00')
  },
  {
    id: '5',
    type: 'assignment_deleted',
    description: '鈴木一郎さんの配属が解除されました',
    timestamp: new Date('2024-01-15T13:00:00'),
    user: '管理者'
  }
]

describe('ActivityFeed', () => {
  it('renders activity feed with activities', () => {
    render(<ActivityFeed activities={mockActivities} loading={false} />)

    expect(screen.getByText('最近の活動')).toBeInTheDocument()
    expect(screen.getByText('山田太郎さんが登録されました')).toBeInTheDocument()
    expect(screen.getByText('東京プロジェクトが作成されました')).toBeInTheDocument()
  })

  it('renders loading state with skeletons', () => {
    const { container } = render(<ActivityFeed activities={[]} loading={true} />)

    expect(screen.getByText('最近の活動')).toBeInTheDocument()

    // Check for skeleton elements using MUI class names
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders empty state when no activities', () => {
    render(<ActivityFeed activities={[]} loading={false} />)

    expect(screen.getByText('最近の活動')).toBeInTheDocument()
    expect(screen.getByText('最近の活動はありません')).toBeInTheDocument()
  })

  it('renders correct activity type labels', () => {
    render(<ActivityFeed activities={mockActivities} loading={false} />)

    expect(screen.getByText('従業員登録')).toBeInTheDocument()
    expect(screen.getByText('現場登録')).toBeInTheDocument()
    expect(screen.getByText('配属登録')).toBeInTheDocument()
    expect(screen.getByText('従業員更新')).toBeInTheDocument()
    expect(screen.getByText('配属削除')).toBeInTheDocument()
  })

  it('limits displayed activities to maxItems', () => {
    render(<ActivityFeed activities={mockActivities} loading={false} maxItems={3} />)

    expect(screen.getByText('山田太郎さんが登録されました')).toBeInTheDocument()
    expect(screen.getByText('東京プロジェクトが作成されました')).toBeInTheDocument()
    expect(screen.getByText('山田太郎さんが東京プロジェクトに配属されました')).toBeInTheDocument()

    // Fourth activity should not be rendered
    expect(screen.queryByText('佐藤花子さんの情報が更新されました')).not.toBeInTheDocument()
  })

  it('renders user information when available', () => {
    render(<ActivityFeed activities={mockActivities} loading={false} />)

    const userTexts = screen.getAllByText(/実行者: 管理者/i)
    expect(userTexts.length).toBeGreaterThan(0)
  })

  it('renders activity subheader with count', () => {
    render(<ActivityFeed activities={mockActivities} loading={false} />)

    expect(screen.getByText('直近5件の更新')).toBeInTheDocument()
  })

  it('handles maxItems greater than activities length', () => {
    const twoActivities = mockActivities.slice(0, 2)
    render(<ActivityFeed activities={twoActivities} loading={false} maxItems={10} />)

    expect(screen.getByText('直近2件の更新')).toBeInTheDocument()
    expect(screen.getByText('山田太郎さんが登録されました')).toBeInTheDocument()
    expect(screen.getByText('東京プロジェクトが作成されました')).toBeInTheDocument()
  })
})