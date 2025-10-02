# Tasks Document

## Phase 1: プロジェクト基盤・設定

- [x] 1. プロジェクト初期設定とビルド環境構築
  - File: package.json, vite.config.ts, tsconfig.json
  - React Native Web + TypeScript + Vite環境を構築
  - Material-UI v5、React Router、React Query設定
  - Purpose: 開発環境の基盤を構築し、必要なライブラリを導入
  - _Leverage: Vite公式テンプレート、Material-UI文書_
  - _Requirements: Requirement 5 認証・認可機能_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Build Engineer with expertise in Vite, React Native Web, and TypeScript configuration | Task: Set up comprehensive development environment with React Native Web, TypeScript, Vite, Material-UI v5, React Router, and React Query following technical standards, creating optimized build configuration for both development and production | Restrictions: Do not use deprecated configurations, ensure compatibility between React Native Web and web-specific libraries, maintain build performance | Leverage: Official Vite templates, Material-UI documentation, React Native Web setup guides | Requirements: Support for authentication, responsive design, and performance requirements | Success: Development server starts without errors, hot reload works correctly, production build is optimized, all required libraries are properly configured and integrated | Instructions: First mark this task as in-progress [-] in tasks.md, then implement the project setup. When complete, mark as [x] in tasks.md._

- [x] 2. TypeScript型定義の作成
  - File: src/types/employee.ts, src/types/site.ts, src/types/assignment.ts, src/types/common.ts
  - Employee、Site、Assignment、共通型のTypeScriptインターフェース定義
  - Purpose: 型安全性を確保し、開発効率を向上
  - _Leverage: 設計ドキュメントのData Models_
  - _Requirements: Data Models from design document_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: TypeScript Developer specializing in type systems and data modeling | Task: Create comprehensive TypeScript interfaces for Employee, Site, Assignment, and common types based on the data models defined in the design document, ensuring type safety and proper relationships between entities | Restrictions: Do not use 'any' types, maintain strict type checking, ensure all optional fields are properly marked | Leverage: Design document data models, TypeScript best practices | Requirements: All data structures from design document must be accurately typed | Success: All interfaces compile without errors, proper relationship types are established, optional/required fields match requirements | Instructions: First mark this task as in-progress [-] in tasks.md, then create the type definitions. When complete, mark as [x] in tasks.md._

- [x] 3. Supabase設定とクライアント初期化
  - File: src/lib/supabase.ts, src/types/supabase.ts
  - Supabase認証とデータベースクライアントの設定
  - 環境変数設定とクライアント初期化
  - Purpose: バックエンドサービスとの接続を確立
  - _Leverage: Supabase公式ドキュメント_
  - _Requirements: Requirement 5 認証・認可機能_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Integration Specialist with expertise in Supabase and authentication systems | Task: Set up Supabase client configuration for authentication and database operations following requirement 5, creating secure client initialization with proper environment variable handling | Restrictions: Do not hardcode credentials, ensure proper error handling for connection issues, maintain security best practices | Leverage: Supabase official documentation, authentication best practices | Requirements: Secure authentication flow, database connection for employees, sites, and assignments | Success: Supabase client connects successfully, authentication methods are available, environment variables are properly configured | Instructions: First mark this task as in-progress [-] in tasks.md, then implement Supabase setup. When complete, mark as [x] in tasks.md._

## Phase 2: 認証システム実装

- [x] 4. 認証コンテキストとプロバイダー作成
  - File: src/contexts/AuthContext.tsx, src/hooks/useAuth.ts
  - React ContextでSupabase認証状態を管理
  - ログイン、ログアウト、ユーザー状態管理機能
  - Purpose: アプリケーション全体で認証状態を共有
  - _Leverage: React Context API、Supabaseクライアント_
  - _Requirements: Requirement 5 認証・認可機能_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Developer with expertise in Context API and authentication flows | Task: Create authentication context and provider using React Context API to manage Supabase authentication state throughout the application following requirement 5, implementing login, logout, and user state management | Restrictions: Do not store sensitive data in context, ensure proper loading states, handle authentication errors gracefully | Leverage: React Context API patterns, Supabase client from previous task | Requirements: Authentication state management, login/logout functionality, session persistence | Success: Authentication context works correctly, login/logout functions properly, user state is maintained across app navigation | Instructions: First mark this task as in-progress [-] in tasks.md, then implement authentication context. When complete, mark as [x] in tasks.md._

- [x] 5. ログイン画面の実装
  - File: src/pages/LoginPage.tsx, src/components/auth/LoginForm.tsx
  - ログイン画面レイアウトとフォーム機能実装
  - バリデーション、エラーハンドリング
  - Purpose: ユーザー認証のエントリーポイント提供
  - _Leverage: Material-UI、React Hook Form、認証コンテキスト_
  - _Requirements: Requirement 5 認証・認可機能、Screen Design 1_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with expertise in React forms and Material-UI | Task: Implement login page and form components following the detailed screen layout design 1, using Material-UI components, React Hook Form for validation, and integrating with authentication context | Restrictions: Do not bypass form validation, ensure accessibility compliance, handle all error states from design | Leverage: Material-UI components, React Hook Form, authentication context from previous task | Requirements: Login screen layout matches design specification, authentication functionality works correctly | Success: Login form renders correctly according to design, validation works properly, successful login redirects to dashboard, error messages display appropriately | Instructions: First mark this task as in-progress [-] in tasks.md, then implement login screen. When complete, mark as [x] in tasks.md._

- [x] 6. ルート保護とナビゲーションガード実装
  - File: src/components/auth/ProtectedRoute.tsx, src/utils/authGuards.ts
  - 認証が必要なルートの保護機能
  - 未認証時のリダイレクト処理
  - Purpose: セキュアなページアクセス制御
  - _Leverage: React Router、認証コンテキスト_
  - _Requirements: Navigation Rules and Guards from design_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Security-focused Frontend Developer with expertise in React Router and authentication | Task: Implement route protection and navigation guards following the Navigation Rules and Guards specification from the design document, ensuring secure access control for protected routes | Restrictions: Do not allow unauthorized access to any protected route, ensure proper redirect behavior, maintain user experience during authentication checks | Leverage: React Router, authentication context | Requirements: All protected routes require authentication, proper redirect handling, maintain navigation state | Success: Protected routes block unauthorized access, redirects work correctly, authenticated users can access all features, navigation state is preserved | Instructions: First mark this task as in-progress [-] in tasks.md, then implement route protection. When complete, mark as [x] in tasks.md._

## Phase 3: 共通コンポーネント・レイアウト

- [x] 7. 共通レイアウトコンポーネント作成
  - File: src/components/layout/MainLayout.tsx, src/components/layout/Header.tsx, src/components/layout/Navigation.tsx
  - ヘッダー、ナビゲーション、フッターの共通レイアウト
  - レスポンシブデザイン対応
  - Purpose: 全画面で一貫したレイアウト提供
  - _Leverage: Material-UI AppBar、Drawer、Box_
  - _Requirements: Screen Layout Structure from design_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: UI/UX Developer with expertise in responsive design and Material-UI layout systems | Task: Create common layout components following the Screen Layout Structure from design document, implementing header, navigation, and main layout with responsive design using Material-UI components | Restrictions: Must be mobile-responsive, follow accessibility guidelines, maintain consistent spacing and theming | Leverage: Material-UI AppBar, Drawer, Box, responsive breakpoints | Requirements: Layout matches design specification, works on all screen sizes, navigation is accessible | Success: Layout renders correctly on all devices, navigation works smoothly, header and drawer function properly, responsive breakpoints work as expected | Instructions: First mark this task as in-progress [-] in tasks.md, then implement layout components. When complete, mark as [x] in tasks.md._

- [x] 8. パンくずリストコンポーネント実装
  - File: src/components/navigation/Breadcrumb.tsx
  - 階層的ナビゲーション表示機能
  - 動的なパンくず生成
  - Purpose: ユーザーの現在位置明示と階層ナビゲーション提供
  - _Leverage: React Router、Material-UI Breadcrumbs_
  - _Requirements: Breadcrumb Navigation from design_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with expertise in React Router and navigation UX | Task: Implement breadcrumb component following the Breadcrumb Navigation specification from design document, creating dynamic breadcrumb generation based on current route and page context | Restrictions: Must update automatically based on route changes, handle nested routes correctly, maintain link functionality for all levels | Leverage: React Router hooks, Material-UI Breadcrumbs component | Requirements: Breadcrumb format matches design examples, dynamic generation works correctly | Success: Breadcrumbs display correct hierarchy, links work properly, updates automatically on navigation, matches design specification | Instructions: First mark this task as in-progress [-] in tasks.md, then implement breadcrumb component. When complete, mark as [x] in tasks.md._

- [x] 9. 共通UIコンポーネント作成
  - File: src/components/common/DataTable.tsx, src/components/common/SearchField.tsx, src/components/common/ConfirmDialog.tsx
  - データテーブル、検索フィールド、確認ダイアログの再利用可能コンポーネント
  - Purpose: 画面間で一貫したUI要素を提供
  - _Leverage: Material-UI Table、TextField、Dialog_
  - _Requirements: Common UI elements from all screen designs_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Component Developer with expertise in reusable component design and Material-UI | Task: Create reusable UI components (DataTable, SearchField, ConfirmDialog) that will be used across multiple screens following the common UI patterns identified in the screen designs | Restrictions: Components must be highly reusable, properly typed with TypeScript, follow Material-UI design patterns | Leverage: Material-UI Table, TextField, Dialog components, TypeScript generic types | Requirements: Components support all use cases shown in screen designs, consistent styling and behavior | Success: Components are reusable across different contexts, properly typed, follow Material-UI patterns, support all required functionality | Instructions: First mark this task as in-progress [-] in tasks.md, then implement common UI components. When complete, mark as [x] in tasks.md._

## Phase 4: データ管理・API統合

- [x] 10. React Query設定とAPIフック作成
  - File: src/hooks/api/useEmployees.ts, src/hooks/api/useSites.ts, src/hooks/api/useAssignments.ts
  - Supabase APIとの統合、データフェッチング・キャッシュ管理
  - CRUD操作のカスタムフック
  - Purpose: 効率的なデータ管理とサーバー状態同期
  - _Leverage: React Query、Supabaseクライアント_
  - _Requirements: Data Models and CRUD operations from requirements_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Developer with expertise in React Query and API integration | Task: Create comprehensive API hooks using React Query for employees, sites, and assignments data management, implementing CRUD operations with Supabase client following the data models and CRUD requirements | Restrictions: Must handle loading, error, and success states properly, implement optimistic updates where appropriate, ensure proper cache invalidation | Leverage: React Query patterns, Supabase client, TypeScript types from phase 1 | Requirements: All CRUD operations for employees, sites, assignments must be supported | Success: All API operations work correctly, caching is effective, error handling is robust, optimistic updates enhance user experience | Instructions: First mark this task as in-progress [-] in tasks.md, then implement API hooks. When complete, mark as [x] in tasks.md._

- [x] 11. データベーステーブル作成（Supabase）
  - File: supabase/migrations/001_initial_schema.sql (documentation)
  - employees、sites、assignmentsテーブルのスキーマ設計
  - 制約、インデックス、RLS（Row Level Security）設定
  - Purpose: データベース構造の確立
  - _Leverage: Supabase管理画面、SQL_
  - _Requirements: Data Models from design document_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Database Administrator with expertise in PostgreSQL and Supabase | Task: Create database schema for employees, sites, and assignments tables following the data models from design document, implementing proper constraints, indexes, and Row Level Security policies | Restrictions: Must ensure data integrity with proper foreign keys, implement security policies correctly, optimize for query performance | Leverage: Supabase dashboard, PostgreSQL documentation, data models from design | Requirements: All fields and relationships from data models must be correctly implemented | Success: All tables are created with correct structure, constraints work properly, RLS policies ensure security, query performance is optimized | Instructions: First mark this task as in-progress [-] in tasks.md, then implement database schema. When complete, mark as [x] in tasks.md._

## Phase 5: 従業員管理機能実装

- [x] 12. 従業員一覧画面実装
  - File: src/pages/employees/EmployeeListPage.tsx, src/components/employees/EmployeeTable.tsx
  - 従業員一覧表示、検索、フィルタリング機能
  - ページネーション、ソート機能
  - Purpose: 従業員データの一覧表示と管理
  - _Leverage: DataTable、SearchField、APIフック_
  - _Requirements: Requirement 1, Screen Design 3_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Developer with expertise in data presentation and user experience | Task: Implement employee list page and table component following requirement 1 and detailed screen layout design 3, integrating search, filtering, pagination, and CRUD operations using common components and API hooks | Restrictions: Must handle all loading and error states, ensure table performance with large datasets, maintain responsive design | Leverage: DataTable component, SearchField component, employee API hooks from previous tasks | Requirements: All functionality from requirement 1 and screen design 3 must work correctly | Success: Employee list displays correctly, search and filtering work properly, pagination functions smoothly, CRUD operations are accessible and functional | Instructions: First mark this task as in-progress [-] in tasks.md, then implement employee list. When complete, mark as [x] in tasks.md._

- [x] 13. 従業員詳細画面実装
  - File: src/pages/employees/EmployeeDetailPage.tsx, src/components/employees/EmployeeInfo.tsx
  - 単一従業員の詳細情報表示
  - 配属履歴、現在の配属状況表示
  - Purpose: 従業員の詳細情報と関連データ表示
  - _Leverage: APIフック、共通コンポーネント_
  - _Requirements: Requirement 1, Screen Design 4_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Developer with expertise in detailed view components and data relationships | Task: Implement employee detail page following requirement 1 and detailed screen layout design 4, displaying employee information, current assignments, and assignment history with proper navigation | Restrictions: Must handle missing data gracefully, ensure proper loading states, maintain consistent styling with other pages | Leverage: Employee and assignment API hooks, common components, navigation components | Requirements: All elements from screen design 4 must be implemented, assignment relationships must be displayed correctly | Success: Employee details display correctly, assignment information is accurate, navigation works properly, edit and delete actions are accessible | Instructions: First mark this task as in-progress [-] in tasks.md, then implement employee detail page. When complete, mark as [x] in tasks.md._

- [x] 14. 従業員フォーム（新規・編集）実装
  - File: src/pages/employees/EmployeeFormPage.tsx, src/components/employees/EmployeeForm.tsx
  - 従業員新規登録・編集フォーム
  - バリデーション、エラーハンドリング
  - Purpose: 従業員データの作成・更新機能
  - _Leverage: React Hook Form、Material-UI、APIフック_
  - _Requirements: Requirement 1, Screen Design 5_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Forms Developer with expertise in React Hook Form and validation | Task: Implement employee form page and component for both new and edit modes following requirement 1 and detailed screen layout design 5, implementing comprehensive validation and error handling | Restrictions: Must validate all required fields, provide clear error messages, handle both create and update operations correctly | Leverage: React Hook Form, Material-UI form components, employee API hooks, validation utilities | Requirements: All form fields from screen design 5, validation rules from requirement 1 | Success: Form renders correctly in both modes, validation works properly, save operations function correctly, navigation after save works as designed | Instructions: First mark this task as in-progress [-] in tasks.md, then implement employee form. When complete, mark as [x] in tasks.md._

## Phase 6: 現場管理機能実装

- [x] 15. 現場一覧画面実装
  - File: src/pages/sites/SiteListPage.tsx, src/components/sites/SiteCards.tsx
  - 現場一覧のカード表示・テーブル表示切り替え
  - 検索、フィルタリング機能
  - Purpose: 現場データの一覧表示と管理
  - _Leverage: 共通コンポーネント、APIフック_
  - _Requirements: Requirement 2, Screen Design 6_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Developer with expertise in flexible data presentation and Material-UI | Task: Implement site list page with card and table view toggle following requirement 2 and detailed screen layout design 6, including search, filtering, and view switching functionality | Restrictions: Must maintain performance with view switching, ensure responsive design in both views, handle all CRUD operations properly | Leverage: Common components, site API hooks, Material-UI Grid and Table components | Requirements: All functionality from requirement 2 and screen design 6 including view toggle | Success: Site list displays correctly in both views, view switching works smoothly, search and filtering function properly, CRUD operations are accessible | Instructions: First mark this task as in-progress [-] in tasks.md, then implement site list. When complete, mark as [x] in tasks.md._

- [x] 16. 現場詳細画面実装
  - File: src/pages/sites/SiteDetailPage.tsx, src/components/sites/SiteInfo.tsx
  - 現場詳細情報と配属従業員一覧表示
  - 配属ボタンから配属管理画面への遷移
  - Purpose: 現場の詳細情報と関連従業員表示
  - _Leverage: APIフック、共通コンポーネント_
  - _Requirements: Requirement 2, Screen Design 7_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Developer with expertise in detailed view components and cross-entity relationships | Task: Implement site detail page following requirement 2 and detailed screen layout design 7, displaying site information and assigned employees with navigation to assignment management | Restrictions: Must handle assignment relationships correctly, ensure proper navigation to assignment page with pre-selected site, maintain consistent styling | Leverage: Site and assignment API hooks, common components, navigation utilities | Requirements: All elements from screen design 7, assignment integration must work correctly | Success: Site details display correctly, assigned employees are shown accurately, assignment button navigates properly with pre-selection, edit and delete actions work | Instructions: First mark this task as in-progress [-] in tasks.md, then implement site detail page. When complete, mark as [x] in tasks.md._

- [x] 17. 現場フォーム（新規・編集）実装
  - File: src/pages/sites/SiteFormPage.tsx, src/components/sites/SiteForm.tsx
  - 現場新規登録・編集フォーム
  - 日付ピッカー、ステータス選択機能
  - Purpose: 現場データの作成・更新機能
  - _Leverage: React Hook Form、Material-UI、APIフック_
  - _Requirements: Requirement 2, Screen Design 8_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Forms Developer with expertise in React Hook Form and Material-UI date components | Task: Implement site form page and component for both new and edit modes following requirement 2 and detailed screen layout design 8, including date pickers and status selection | Restrictions: Must handle date validation properly, provide intuitive date selection, validate all required fields, handle both create and update operations | Leverage: React Hook Form, Material-UI DatePicker and Select components, site API hooks | Requirements: All form fields from screen design 8, proper date handling, status management | Success: Form renders correctly in both modes, date pickers work properly, validation functions correctly, save operations work as designed | Instructions: First mark this task as in-progress [-] in tasks.md, then implement site form. When complete, mark as [x] in tasks.md._

## Phase 7: 配属管理機能実装

- [x] 18. 配属管理画面実装
  - File: src/pages/assignments/AssignmentPage.tsx, src/components/assignments/AssignmentForm.tsx, src/components/assignments/AssignmentList.tsx
  - 配属作成フォームと配属一覧表示
  - オートコンプリート機能による従業員・現場選択
  - Purpose: 従業員と現場の配属関係管理
  - _Leverage: Material-UI Autocomplete、APIフック_
  - _Requirements: Requirement 3, Screen Design 9_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Developer with expertise in complex forms and Material-UI Autocomplete | Task: Implement assignment management page following requirement 3 and detailed screen layout design 9, including assignment creation form with autocomplete and assignment list with management functions | Restrictions: Must prevent duplicate assignments, handle autocomplete performance with large datasets, ensure proper validation of assignment relationships | Leverage: Material-UI Autocomplete, employee and site API hooks, assignment API hooks, common components | Requirements: All functionality from requirement 3 and screen design 9, autocomplete must work efficiently | Success: Assignment form works correctly with autocomplete, duplicate prevention functions, assignment list displays and updates properly, URL parameter pre-selection works | Instructions: First mark this task as in-progress [-] in tasks.md, then implement assignment management. When complete, mark as [x] in tasks.md._

## Phase 8: ダッシュボード・プロフィール

- [x] 19. ダッシュボード画面実装
  - File: src/pages/DashboardPage.tsx, src/components/dashboard/StatsCards.tsx, src/components/dashboard/ActivityFeed.tsx
  - 統計情報カード、クイックアクション、最近の活動表示
  - Purpose: システム概要とクイックアクセス提供
  - _Leverage: APIフック、Material-UI Card_
  - _Requirements: Screen Design 2_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Dashboard Developer with expertise in data visualization and Material-UI layout | Task: Implement dashboard page following detailed screen layout design 2, displaying statistics cards, quick actions, and recent activity feed with proper data integration | Restrictions: Must ensure dashboard loads quickly, handle empty states gracefully, maintain responsive layout for different screen sizes | Leverage: All API hooks for data aggregation, Material-UI Card and Grid components, navigation utilities | Requirements: All elements from screen design 2, statistics must be accurate and real-time | Success: Dashboard displays correct statistics, quick action buttons work properly, activity feed shows recent changes, responsive design functions correctly | Instructions: First mark this task as in-progress [-] in tasks.md, then implement dashboard. When complete, mark as [x] in tasks.md._

- [x] 20. ユーザープロフィール画面実装
  - File: src/pages/ProfilePage.tsx, src/components/profile/ProfileSettings.tsx
  - パスワード変更、表示設定、ログアウト機能
  - タブベースのインターフェース
  - Purpose: ユーザー設定とアカウント管理
  - _Leverage: Material-UI Tabs、認証コンテキスト_
  - _Requirements: Screen Design 10_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with expertise in user settings and Material-UI tabs | Task: Implement user profile page following detailed screen layout design 10, including tabbed interface for account settings, password change, and display preferences | Restrictions: Must handle password change securely, validate password requirements, ensure settings persistence, handle logout confirmation properly | Leverage: Material-UI Tabs component, authentication context, form validation utilities | Requirements: All functionality from screen design 10, secure password handling, proper logout flow | Success: Tab interface works correctly, password change functions securely, settings are saved properly, logout confirmation and execution work as designed | Instructions: First mark this task as in-progress [-] in tasks.md, then implement profile page. When complete, mark as [x] in tasks.md._

## Phase 9: ルーティング・ナビゲーション統合

- [x] 21. React Routerルーティング設定
  - File: src/App.tsx, src/routes/AppRoutes.tsx
  - 全画面のルーティング設定と認証ガード統合
  - ネストされたルート、パラメータ処理
  - Purpose: アプリケーション全体のナビゲーション制御
  - _Leverage: React Router、ProtectedRoute_
  - _Requirements: All navigation requirements from design_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Routing Specialist with expertise in React Router and application architecture | Task: Configure comprehensive routing system following all navigation requirements from design document, implementing nested routes, parameter handling, and authentication guards for all pages | Restrictions: Must ensure all routes are properly protected, handle route parameters correctly, maintain proper route hierarchy, ensure smooth navigation experience | Leverage: React Router v6, ProtectedRoute component, all page components from previous tasks | Requirements: All routes from navigation design must be implemented, authentication protection must work correctly | Success: All pages are accessible via correct routes, authentication guards work properly, route parameters function correctly, navigation flows match design specification | Instructions: First mark this task as in-progress [-] in tasks.md, then implement routing configuration. When complete, mark as [x] in tasks.md._

- [x] 22. 画面遷移とナビゲーション統合テスト
  - File: Manual testing checklist
  - 全画面間のナビゲーション動作確認
  - ボタン遷移、パンくずリスト、URL直接アクセステスト
  - Purpose: ナビゲーション設計通りの動作確認
  - _Leverage: 実装済み全画面、ブラウザ開発者ツール_
  - _Requirements: Button-Specific Navigation Map from design_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Tester with expertise in navigation testing and user experience validation | Task: Perform comprehensive navigation testing following the Button-Specific Navigation Map from design document, validating all button transitions, breadcrumb navigation, and URL direct access scenarios | Restrictions: Must test all navigation paths shown in design, verify URL parameters work correctly, ensure authentication redirects function properly | Leverage: All implemented pages and components, browser developer tools, design document navigation specifications | Requirements: All navigation flows from design must work correctly, no broken links or incorrect redirects | Success: All button transitions work as designed, breadcrumb navigation functions correctly, URL direct access works properly, authentication redirects are seamless | Instructions: First mark this task as in-progress [-] in tasks.md, then perform comprehensive navigation testing. When complete, mark as [x] in tasks.md._

## Phase 10: フロントエンド単体テスト完了

- [x] 23. 単体テスト実装
  - File: src/components/**/*.test.tsx, src/hooks/**/*.test.ts
  - 主要コンポーネントとカスタムフックの単体テスト（14ファイル、90テスト）
  - Vitest、React Testing Library使用
  - Purpose: フロントエンドコンポーネントの信頼性確保
  - _Completed: 認証(13)、従業員管理(22)、現場管理(22)、配属管理(25)、ダッシュボード(12)の全テスト実装完了_
  - _Leverage: Vitest、React Testing Library_
  - _Requirements: Testing Strategy from design document_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with expertise in React testing and Vitest framework | Task: Implement comprehensive unit tests for major components and custom hooks following the Testing Strategy from design document, ensuring high coverage and reliable test cases | Restrictions: Must test component behavior not implementation details, mock external dependencies properly, ensure tests are maintainable and readable | Leverage: Vitest, React Testing Library, testing utilities, mock data fixtures | Requirements: Test coverage for all critical components and hooks, tests must be reliable and maintainable | Success: All tests pass consistently, coverage meets requirements, tests catch regressions effectively, test suite runs efficiently | Instructions: First mark this task as in-progress [-] in tasks.md, then implement unit tests. When complete, mark as [x] in tasks.md._

## Phase 11: 統合テスト・最適化・本番対応

- [x] 24. E2Eテスト実装（Supabase統合）
  - File: e2e/**/*.spec.ts
  - E2Eテストフレームワークと主要ユーザージャーニーテスト（5ファイル、47テスト）
  - Playwright v1.55.1使用、Chromium/Firefox/Webkitサポート、モバイル対応
  - Purpose: フルスタック環境でのエンドツーエンド動作確認
  - _Completed: 認証(8)、従業員(11)、現場(11)、配属(15)、ダッシュボード(9)のE2Eテスト実装完了_
  - _Note: 大部分のテストはSupabase統合後に有効化予定（現在test.skipでスキップ中）_
  - _Implemented: ダッシュボード統計情報のDBデータ整合性チェック機能追加_
  - _Fixed: ダッシュボード統計計算ロジック修正（在職中従業員のみ、稼働中現場のみカウント）_
  - _Leverage: Playwright、テストヘルパー関数、実際のSupabase API_
  - _Requirements: End-to-End Testing from design document_

- [ ] 27. パフォーマンス最適化
  - File: Performance optimization across all components
  - バンドルサイズ最適化、コンポーネント最適化
  - React.memo、useMemo、useCallback適用
  - Purpose: アプリケーションの性能向上
  - _Leverage: React DevTools、Vite Bundle Analyzer_
  - _Requirements: Performance requirements from design document_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Performance Engineer with expertise in React optimization and bundle analysis | Task: Optimize application performance following performance requirements from design document, implementing code splitting, memoization, and bundle size optimization to meet specified performance targets | Restrictions: Must maintain functionality while optimizing, ensure optimizations actually improve performance, avoid premature optimization | Leverage: React DevTools, Vite Bundle Analyzer, React.memo, useMemo, useCallback, code splitting | Requirements: Meet all performance targets specified in design document | Success: Bundle size is under targets, loading times meet requirements, user interactions are responsive, no performance regressions | Instructions: First mark this task as in-progress [-] in tasks.md, then implement performance optimizations. When complete, mark as [x] in tasks.md._

- [ ] 28. アクセシビリティ対応
  - File: Accessibility improvements across all components
  - WCAG 2.1 AA準拠対応
  - スクリーンリーダー、キーボードナビゲーション対応
  - Purpose: インクルーシブなユーザー体験提供
  - _Leverage: Material-UI accessibility、axe-core_
  - _Requirements: Usability requirements from design document_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Accessibility Specialist with expertise in WCAG guidelines and assistive technologies | Task: Implement comprehensive accessibility improvements following WCAG 2.1 AA guidelines and usability requirements from design document, ensuring all components are accessible via keyboard and screen readers | Restrictions: Must not break existing functionality, ensure all interactive elements are accessible, provide appropriate ARIA labels and roles | Leverage: Material-UI accessibility features, axe-core testing tools, WCAG guidelines | Requirements: WCAG 2.1 AA compliance, keyboard navigation, screen reader compatibility | Success: All accessibility audits pass, keyboard navigation works throughout the app, screen readers can access all content, no accessibility regressions | Instructions: First mark this task as in-progress [-] in tasks.md, then implement accessibility improvements. When complete, mark as [x] in tasks.md._

- [ ] 29. 本番ビルド設定とデプロイメント対応
  - File: vite.config.ts, vercel.json, Dockerfile
  - 本番ビルド最適化設定
  - Vercelデプロイメント設定
  - Purpose: 本番環境での安定稼働確保
  - _Leverage: Vite、Vercel_
  - _Requirements: Production deployment requirements_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer with expertise in frontend deployment and Vercel platform | Task: Configure production build optimization and Vercel deployment settings following production deployment requirements, ensuring optimal performance and reliability in production environment | Restrictions: Must ensure secure environment variable handling, optimize build for production, configure proper caching strategies | Leverage: Vite production optimizations, Vercel deployment features, environment configuration best practices | Requirements: Production builds are optimized, deployment is automated, environment variables are secure | Success: Production builds complete successfully, deployment to Vercel works correctly, environment variables are properly configured, performance is optimized for production | Instructions: First mark this task as in-progress [-] in tasks.md, then implement production configuration. When complete, mark as [x] in tasks.md._

## Phase 13: 最終統合・検証

- [ ] 30. 統合テストと不具合修正
  - File: Bug fixes across all components
  - フロントエンド・バックエンド統合後の全機能統合テスト実施
  - 発見された不具合の修正
  - Purpose: フルスタックシステム全体の品質確保
  - _Leverage: 全実装機能、統合テストツール_
  - _Requirements: All requirements from specification_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Integration Tester and Bug Fix Specialist with expertise in full-stack testing and debugging | Task: Perform comprehensive integration testing covering all requirements from specification with full frontend-backend integration, identify and fix any bugs or integration issues to ensure complete system quality | Restrictions: Must not introduce new bugs while fixing existing ones, ensure all fixes are properly tested with integrated backend, maintain code quality standards | Leverage: All implemented features, integrated backend, testing tools, debugging utilities | Requirements: All requirements must be met with full-stack integration, no critical bugs remain, system functions reliably | Success: All features work together correctly with backend, no critical bugs remain, user experience is smooth and reliable, all requirements are fulfilled | Instructions: First mark this task as in-progress [-] in tasks.md, then perform integration testing and bug fixes. When complete, mark as [x] in tasks.md._

- [ ] 31. ドキュメント作成と最終確認
  - File: README.md, docs/deployment.md, docs/user-guide.md
  - プロジェクトドキュメント、デプロイメントガイド作成
  - フルスタックシステムの最終的な動作確認
  - Purpose: プロジェクトの完成と引き継ぎ準備
  - _Leverage: 全実装内容、設計ドキュメント、統合システム_
  - _Requirements: Documentation requirements_
  - _Prompt: Implement the task for spec employee-management, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer and Project Finalizer with expertise in full-stack documentation and project handover | Task: Create comprehensive project documentation including README, deployment guide, and user guide for the complete frontend-backend system, then perform final verification that all requirements are met and integrated system is ready for production use | Restrictions: Documentation must be accurate and up-to-date for both frontend and backend, all setup instructions must be tested with integrated system, ensure complete project is fully functional | Leverage: All implemented features, design documents, deployment configuration, integrated backend system | Requirements: Complete and accurate documentation for full-stack system, fully functional integrated system | Success: Documentation is comprehensive and accurate for complete system, setup instructions work correctly, integrated system meets all requirements, project is ready for production handover | Instructions: First mark this task as in-progress [-] in tasks.md, then create comprehensive documentation and perform final verification. When complete, mark as [x] in tasks.md._