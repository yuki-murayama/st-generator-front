import { EmployeeListItem, EmployeeWithAssignments, EmployeeAssignmentInfo } from '../types/employee'
import { SiteListItem, SiteWithAssignments, SiteCardData, SiteSearchParams } from '../types/site'
import { AssignmentListItem, AssignmentSearchParams } from '../types/assignment'

// 開発用のモック従業員データ
export const mockEmployees: EmployeeListItem[] = [
  {
    id: '1',
    full_name: '田中 太郎',
    email: 'tanaka.taro@example.com',
    department: '開発部',
    position: 'シニアエンジニア',
    status: 'active',
    current_site: '東京オフィス開発プロジェクト',
    hire_date: new Date('2020-04-01')
  },
  {
    id: '2',
    full_name: '佐藤 花子',
    email: 'sato.hanako@example.com',
    department: '営業部',
    position: '営業主任',
    status: 'active',
    current_site: '大阪支店営業展開',
    hire_date: new Date('2019-10-15')
  },
  {
    id: '3',
    full_name: '鈴木 一郎',
    email: 'suzuki.ichiro@example.com',
    department: '管理部',
    position: '部長',
    status: 'active',
    current_site: undefined,
    hire_date: new Date('2015-07-01')
  },
  {
    id: '4',
    full_name: '高橋 美咲',
    email: 'takahashi.misaki@example.com',
    department: '開発部',
    position: 'エンジニア',
    status: 'active',
    current_site: '新規サービス開発',
    hire_date: new Date('2022-03-01')
  },
  {
    id: '5',
    full_name: '山田 次郎',
    email: 'yamada.jiro@example.com',
    department: '人事部',
    position: '人事担当',
    status: 'inactive',
    current_site: undefined,
    hire_date: new Date('2018-06-01')
  },
  {
    id: '6',
    full_name: '伊藤 恵美',
    email: 'ito.emi@example.com',
    department: '企画部',
    position: 'プランナー',
    status: 'active',
    current_site: '新規事業企画',
    hire_date: new Date('2021-01-15')
  },
  {
    id: '7',
    full_name: '渡辺 健太',
    email: 'watanabe.kenta@example.com',
    department: '開発部',
    position: 'テックリード',
    status: 'active',
    current_site: 'システムアーキテクチャ',
    hire_date: new Date('2017-11-01')
  },
  {
    id: '8',
    full_name: '中村 あゆみ',
    email: 'nakamura.ayumi@example.com',
    department: '経理部',
    position: '経理担当',
    status: 'active',
    current_site: undefined,
    hire_date: new Date('2020-08-01')
  }
]

// モック用のAPIレスポンス生成関数
export const generateMockResponse = (
  searchParams?: {
    query?: string
    department?: string
    status?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
) => {
  let filteredData = [...mockEmployees]

  // 検索フィルタリング
  if (searchParams?.query) {
    const query = searchParams.query.toLowerCase()
    filteredData = filteredData.filter(emp =>
      emp.full_name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query)
    )
  }

  // 部署フィルタリング
  if (searchParams?.department) {
    filteredData = filteredData.filter(emp => emp.department === searchParams.department)
  }

  // ステータスフィルタリング
  if (searchParams?.status) {
    filteredData = filteredData.filter(emp => emp.status === searchParams.status)
  }

  // ソート
  if (searchParams?.sortBy) {
    const sortBy = searchParams.sortBy
    const ascending = searchParams.sortOrder === 'asc'

    filteredData.sort((a, b) => {
      let aValue: any = a[sortBy as keyof EmployeeListItem]
      let bValue: any = b[sortBy as keyof EmployeeListItem]

      // 日付の場合
      if (aValue instanceof Date && bValue instanceof Date) {
        return ascending ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
      }

      // 文字列の場合
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return ascending ? -1 : 1
      if (aValue > bValue) return ascending ? 1 : -1
      return 0
    })
  }

  // ページネーション
  const totalCount = filteredData.length
  let paginatedData = filteredData

  if (searchParams?.page !== undefined && searchParams?.limit !== undefined) {
    const start = searchParams.page * searchParams.limit
    const end = start + searchParams.limit
    paginatedData = filteredData.slice(start, end)
  }

  return {
    data: paginatedData,
    count: totalCount
  }
}

// 詳細従業員データ（配属情報付き）
export const mockDetailedEmployees: EmployeeWithAssignments[] = [
  {
    id: '1',
    first_name: '太郎',
    last_name: '田中',
    email: 'tanaka.taro@example.com',
    phone: '090-1234-5678',
    department: '開発部',
    position: 'シニアエンジニア',
    status: 'active',
    hire_date: new Date('2020-04-01'),
    created_at: new Date('2020-03-15'),
    updated_at: new Date('2024-08-15'),
    current_assignments: [
      {
        assignment_id: 'a1',
        site_id: 's1',
        site_name: '東京オフィス開発プロジェクト',
        start_date: new Date('2024-01-01'),
        role: 'テックリード',
        status: 'active'
      }
    ],
    assignment_history: [
      {
        assignment_id: 'a2',
        site_id: 's2',
        site_name: '新人研修プロジェクト',
        start_date: new Date('2020-04-01'),
        end_date: new Date('2020-06-30'),
        role: '研修生',
        status: 'completed'
      },
      {
        assignment_id: 'a3',
        site_id: 's3',
        site_name: 'Webアプリケーション開発',
        start_date: new Date('2020-07-01'),
        end_date: new Date('2023-12-31'),
        role: 'エンジニア',
        status: 'completed'
      }
    ]
  },
  {
    id: '2',
    first_name: '花子',
    last_name: '佐藤',
    email: 'sato.hanako@example.com',
    phone: '090-2345-6789',
    department: '営業部',
    position: '営業主任',
    status: 'active',
    hire_date: new Date('2019-10-15'),
    created_at: new Date('2019-10-01'),
    updated_at: new Date('2024-09-01'),
    current_assignments: [
      {
        assignment_id: 'a4',
        site_id: 's4',
        site_name: '大阪支店営業展開',
        start_date: new Date('2023-04-01'),
        role: '営業主任',
        status: 'active'
      }
    ],
    assignment_history: [
      {
        assignment_id: 'a5',
        site_id: 's5',
        site_name: '新規開拓営業',
        start_date: new Date('2019-10-15'),
        end_date: new Date('2023-03-31'),
        role: '営業担当',
        status: 'completed'
      }
    ]
  },
  {
    id: '3',
    first_name: '一郎',
    last_name: '鈴木',
    email: 'suzuki.ichiro@example.com',
    phone: '090-3456-7890',
    department: '管理部',
    position: '部長',
    status: 'active',
    hire_date: new Date('2015-07-01'),
    created_at: new Date('2015-06-15'),
    updated_at: new Date('2024-07-01'),
    current_assignments: [],
    assignment_history: [
      {
        assignment_id: 'a6',
        site_id: 's6',
        site_name: '人事制度改革プロジェクト',
        start_date: new Date('2020-01-01'),
        end_date: new Date('2021-12-31'),
        role: 'プロジェクトマネージャー',
        status: 'completed'
      }
    ]
  },
  {
    id: '4',
    first_name: '美咲',
    last_name: '高橋',
    email: 'takahashi.misaki@example.com',
    phone: '090-4567-8901',
    department: '開発部',
    position: 'エンジニア',
    status: 'active',
    hire_date: new Date('2022-03-01'),
    created_at: new Date('2022-02-15'),
    updated_at: new Date('2024-09-15'),
    current_assignments: [
      {
        assignment_id: 'a7',
        site_id: 's7',
        site_name: '新規サービス開発',
        start_date: new Date('2022-03-01'),
        role: 'フロントエンドエンジニア',
        status: 'active'
      }
    ],
    assignment_history: []
  },
  {
    id: '5',
    first_name: '次郎',
    last_name: '山田',
    email: 'yamada.jiro@example.com',
    phone: null,
    department: '人事部',
    position: '人事担当',
    status: 'inactive',
    hire_date: new Date('2018-06-01'),
    created_at: new Date('2018-05-15'),
    updated_at: new Date('2024-05-31'),
    current_assignments: [],
    assignment_history: [
      {
        assignment_id: 'a8',
        site_id: 's8',
        site_name: '人事業務システム導入',
        start_date: new Date('2018-06-01'),
        end_date: new Date('2024-05-31'),
        role: '人事担当',
        status: 'completed'
      }
    ]
  },
  {
    id: '6',
    first_name: '恵美',
    last_name: '伊藤',
    email: 'ito.emi@example.com',
    phone: '090-5678-9012',
    department: '企画部',
    position: 'プランナー',
    status: 'active',
    hire_date: new Date('2021-01-15'),
    created_at: new Date('2021-01-01'),
    updated_at: new Date('2024-08-01'),
    current_assignments: [
      {
        assignment_id: 'a9',
        site_id: 's9',
        site_name: '新規事業企画',
        start_date: new Date('2021-01-15'),
        role: '企画担当',
        status: 'active'
      }
    ],
    assignment_history: []
  },
  {
    id: '7',
    first_name: '健太',
    last_name: '渡辺',
    email: 'watanabe.kenta@example.com',
    phone: '090-6789-0123',
    department: '開発部',
    position: 'テックリード',
    status: 'active',
    hire_date: new Date('2017-11-01'),
    created_at: new Date('2017-10-15'),
    updated_at: new Date('2024-09-10'),
    current_assignments: [
      {
        assignment_id: 'a10',
        site_id: 's10',
        site_name: 'システムアーキテクチャ',
        start_date: new Date('2023-01-01'),
        role: 'アーキテクト',
        status: 'active'
      }
    ],
    assignment_history: [
      {
        assignment_id: 'a11',
        site_id: 's11',
        site_name: 'レガシーシステム刷新',
        start_date: new Date('2017-11-01'),
        end_date: new Date('2022-12-31'),
        role: 'テックリード',
        status: 'completed'
      }
    ]
  },
  {
    id: '8',
    first_name: 'あゆみ',
    last_name: '中村',
    email: 'nakamura.ayumi@example.com',
    phone: '090-7890-1234',
    department: '経理部',
    position: '経理担当',
    status: 'active',
    hire_date: new Date('2020-08-01'),
    created_at: new Date('2020-07-15'),
    updated_at: new Date('2024-08-20'),
    current_assignments: [],
    assignment_history: [
      {
        assignment_id: 'a12',
        site_id: 's12',
        site_name: '会計システム導入',
        start_date: new Date('2020-08-01'),
        end_date: new Date('2021-07-31'),
        role: '経理担当',
        status: 'completed'
      }
    ]
  }
]

// 個別従業員詳細取得のモック関数
export const getMockEmployeeDetail = (id: string): EmployeeWithAssignments | null => {
  return mockDetailedEmployees.find(emp => emp.id === id) || null
}

// 開発用のモック現場データ
export const mockSites: SiteListItem[] = [
  {
    id: 'site-1',
    name: '東京オフィス開発プロジェクト',
    location: '東京都千代田区',
    status: 'active',
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-12-31'),
    manager_name: '田中 一郎',
    assigned_count: 5,
    duration: '365日間',
    progress: 75
  },
  {
    id: 'site-2',
    name: '大阪支店営業展開',
    location: '大阪府大阪市',
    status: 'active',
    start_date: new Date('2024-03-01'),
    end_date: new Date('2025-02-28'),
    manager_name: '佐藤 花子',
    assigned_count: 3,
    duration: '365日間',
    progress: 45
  },
  {
    id: 'site-3',
    name: '新規サービス開発',
    location: '東京都渋谷区',
    status: 'active',
    start_date: new Date('2024-06-01'),
    end_date: new Date('2025-05-31'),
    manager_name: '高橋 美咲',
    assigned_count: 4,
    duration: '365日間',
    progress: 25
  },
  {
    id: 'site-4',
    name: 'システムアーキテクチャ',
    location: '東京都港区',
    status: 'active',
    start_date: new Date('2024-02-01'),
    end_date: new Date('2024-11-30'),
    manager_name: '渡辺 健太',
    assigned_count: 2,
    duration: '303日間',
    progress: 80
  },
  {
    id: 'site-5',
    name: '人事制度改革プロジェクト',
    location: '東京都新宿区',
    status: 'completed',
    start_date: new Date('2023-01-01'),
    end_date: new Date('2023-12-31'),
    manager_name: '鈴木 一郎',
    assigned_count: 0,
    duration: '365日間',
    progress: 100
  },
  {
    id: 'site-6',
    name: '新規事業企画',
    location: '東京都中央区',
    status: 'active',
    start_date: new Date('2024-04-01'),
    end_date: new Date('2025-03-31'),
    manager_name: '伊藤 恵美',
    assigned_count: 2,
    duration: '365日間',
    progress: 35
  },
  {
    id: 'site-7',
    name: '会計システム導入',
    location: '東京都品川区',
    status: 'completed',
    start_date: new Date('2023-08-01'),
    end_date: new Date('2024-07-31'),
    manager_name: '中村 あゆみ',
    assigned_count: 0,
    duration: '365日間',
    progress: 100
  },
  {
    id: 'site-8',
    name: 'マーケティング戦略立案',
    location: '東京都目黒区',
    status: 'suspended',
    start_date: new Date('2024-05-01'),
    end_date: new Date('2024-10-31'),
    manager_name: '山田 次郎',
    assigned_count: 1,
    duration: '184日間',
    progress: 20
  }
]

// モック用の現場検索レスポンス生成関数
export const generateMockSiteResponse = (searchParams?: SiteSearchParams): SiteListItem[] => {
  let filteredData = [...mockSites]

  // 検索フィルタリング
  if (searchParams?.query) {
    const query = searchParams.query.toLowerCase()
    filteredData = filteredData.filter(site =>
      site.name.toLowerCase().includes(query) ||
      site.location.toLowerCase().includes(query)
    )
  }

  // 地域フィルタリング
  if (searchParams?.location) {
    filteredData = filteredData.filter(site => site.location.includes(searchParams.location!))
  }

  // ステータスフィルタリング
  if (searchParams?.status) {
    filteredData = filteredData.filter(site => site.status === searchParams.status)
  }

  // 責任者フィルタリング
  if (searchParams?.manager_name) {
    filteredData = filteredData.filter(site =>
      site.manager_name?.toLowerCase().includes(searchParams.manager_name!.toLowerCase())
    )
  }

  return filteredData
}

// 詳細現場データ（配属情報付き）
export const mockDetailedSites: SiteWithAssignments[] = [
  {
    id: 'site-1',
    name: '東京オフィス開発プロジェクト',
    description: 'React Native Webを使用した従業員管理システムの開発プロジェクト',
    location: '東京都千代田区',
    status: 'active',
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-12-31'),
    manager_name: '田中 一郎',
    created_at: new Date('2023-12-15'),
    updated_at: new Date('2024-09-20'),
    assigned_employees: [
      {
        assignment_id: 'a1',
        employee_id: '1',
        employee_name: '田中 太郎',
        start_date: new Date('2024-01-01'),
        role: 'テックリード',
        status: 'active'
      },
      {
        assignment_id: 'a10',
        employee_id: '7',
        employee_name: '渡辺 健太',
        start_date: new Date('2024-03-01'),
        role: 'アーキテクト',
        status: 'active'
      }
    ],
    assignment_count: 2
  },
  {
    id: 'site-2',
    name: '大阪支店営業展開',
    description: '関西地区における営業拠点の拡大と新規顧客開拓',
    location: '大阪府大阪市',
    status: 'active',
    start_date: new Date('2024-03-01'),
    end_date: new Date('2025-02-28'),
    manager_name: '佐藤 花子',
    created_at: new Date('2024-02-15'),
    updated_at: new Date('2024-09-10'),
    assigned_employees: [
      {
        assignment_id: 'a4',
        employee_id: '2',
        employee_name: '佐藤 花子',
        start_date: new Date('2024-03-01'),
        role: '営業主任',
        status: 'active'
      }
    ],
    assignment_count: 1
  },
  {
    id: 'site-3',
    name: '新規サービス開発',
    description: 'AI技術を活用した新しいWebサービスの企画・開発',
    location: '東京都渋谷区',
    status: 'active',
    start_date: new Date('2024-06-01'),
    end_date: new Date('2025-05-31'),
    manager_name: '高橋 美咲',
    created_at: new Date('2024-05-15'),
    updated_at: new Date('2024-09-15'),
    assigned_employees: [
      {
        assignment_id: 'a7',
        employee_id: '4',
        employee_name: '高橋 美咲',
        start_date: new Date('2024-06-01'),
        role: 'フロントエンドエンジニア',
        status: 'active'
      }
    ],
    assignment_count: 1
  }
]

// 個別現場詳細取得のモック関数
export const getMockSiteDetail = (id: string): SiteWithAssignments | null => {
  return mockDetailedSites.find(site => site.id === id) || null
}

// 現場カードデータ生成関数
export const generateMockSiteCards = (searchParams?: SiteSearchParams): SiteCardData[] => {
  const sites = generateMockSiteResponse(searchParams)

  return sites.map((site): SiteCardData => {
    let statusColor: string
    let statusLabel: string

    switch (site.status) {
      case 'active':
        statusColor = '#4caf50'
        statusLabel = '稼働中'
        break
      case 'completed':
        statusColor = '#9e9e9e'
        statusLabel = '完了'
        break
      case 'suspended':
        statusColor = '#ff9800'
        statusLabel = '中断'
        break
      default:
        statusColor = '#666'
        statusLabel = '不明'
    }

    return {
      ...site,
      status_color: statusColor,
      status_label: statusLabel
    }
  })
}

// モック配属データ生成関数
export const generateMockAssignmentResponse = (searchParams?: AssignmentSearchParams): AssignmentListItem[] => {
  // mockDetailedEmployeesからアクティブな配属を抽出
  const assignments: AssignmentListItem[] = []

  mockDetailedEmployees.forEach(emp => {
    emp.current_assignments.forEach(assignment => {
      assignments.push({
        id: assignment.assignment_id,
        employee_id: emp.id,
        employee_name: `${emp.last_name} ${emp.first_name}`,
        site_id: assignment.site_id,
        site_name: assignment.site_name,
        start_date: assignment.start_date,
        end_date: assignment.end_date,
        role: assignment.role,
        status: assignment.status as 'active' | 'completed' | 'upcoming',
        duration: assignment.end_date
          ? `${Math.ceil((assignment.end_date.getTime() - assignment.start_date.getTime()) / (1000 * 60 * 60 * 24))}日間`
          : `${Math.ceil((new Date().getTime() - assignment.start_date.getTime()) / (1000 * 60 * 60 * 24))}日経過`
      })
    })
  })

  let filteredData = [...assignments]

  // 検索フィルタリング
  if (searchParams?.query) {
    const query = searchParams.query.toLowerCase()
    filteredData = filteredData.filter(assignment =>
      assignment.employee_name.toLowerCase().includes(query) ||
      assignment.site_name.toLowerCase().includes(query)
    )
  }

  // 従業員IDフィルタリング
  if (searchParams?.employee_id) {
    filteredData = filteredData.filter(assignment =>
      assignment.employee_id === searchParams.employee_id
    )
  }

  // 現場IDフィルタリング
  if (searchParams?.site_id) {
    filteredData = filteredData.filter(assignment =>
      assignment.site_id === searchParams.site_id
    )
  }

  // ロールフィルタリング
  if (searchParams?.role) {
    filteredData = filteredData.filter(assignment =>
      assignment.role?.toLowerCase().includes(searchParams.role!.toLowerCase())
    )
  }

  // アクティブのみフィルタリング（デフォルト）
  if (searchParams?.active_only !== false) {
    filteredData = filteredData.filter(assignment => assignment.status === 'active')
  }

  return filteredData
}