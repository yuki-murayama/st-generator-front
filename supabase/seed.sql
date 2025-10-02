-- Test Data Seed Script
-- This script populates the database with test data for development and testing

-- Clear existing data (in reverse order due to foreign keys)
DELETE FROM assignments;
DELETE FROM sites;
DELETE FROM employees;

-- Insert test employees (8 employees: 7 active, 1 inactive)
INSERT INTO employees (id, first_name, last_name, email, phone, department, position, hire_date, status, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', '太郎', '田中', 'tanaka.taro@example.com', '090-1234-5678', '開発部', 'シニアエンジニア', '2020-04-01', 'active', NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', '花子', '佐藤', 'sato.hanako@example.com', '090-2345-6789', '営業部', '営業主任', '2019-10-15', 'active', NOW(), NOW()),
('00000000-0000-0000-0000-000000000003', '一郎', '鈴木', 'suzuki.ichiro@example.com', '090-3456-7890', '管理部', '部長', '2015-07-01', 'active', NOW(), NOW()),
('00000000-0000-0000-0000-000000000004', '美咲', '高橋', 'takahashi.misaki@example.com', '090-4567-8901', '開発部', 'エンジニア', '2022-03-01', 'active', NOW(), NOW()),
('00000000-0000-0000-0000-000000000005', '次郎', '山田', 'yamada.jiro@example.com', NULL, '人事部', '人事担当', '2018-06-01', 'inactive', NOW(), NOW()),
('00000000-0000-0000-0000-000000000006', '恵美', '伊藤', 'ito.emi@example.com', '090-5678-9012', '企画部', 'プランナー', '2021-01-15', 'active', NOW(), NOW()),
('00000000-0000-0000-0000-000000000007', '健太', '渡辺', 'watanabe.kenta@example.com', '090-6789-0123', '開発部', 'テックリード', '2017-11-01', 'active', NOW(), NOW()),
('00000000-0000-0000-0000-000000000008', 'あゆみ', '中村', 'nakamura.ayumi@example.com', '090-7890-1234', '経理部', '経理担当', '2020-08-01', 'active', NOW(), NOW());

-- Insert test sites (8 sites: 5 active, 2 completed, 1 suspended)
INSERT INTO sites (id, name, description, location, start_date, end_date, status, manager_name, created_at, updated_at) VALUES
('10000000-0000-0000-0000-000000000001', '東京オフィス開発プロジェクト', 'React Native Webを使用した従業員管理システムの開発プロジェクト', '東京都千代田区', '2024-01-01', '2024-12-31', 'active', '田中 一郎', NOW(), NOW()),
('10000000-0000-0000-0000-000000000002', '大阪支店営業展開', '関西地区における営業拠点の拡大と新規顧客開拓', '大阪府大阪市', '2024-03-01', '2025-02-28', 'active', '佐藤 花子', NOW(), NOW()),
('10000000-0000-0000-0000-000000000003', '新規サービス開発', 'AI技術を活用した新しいWebサービスの企画・開発', '東京都渋谷区', '2024-06-01', '2025-05-31', 'active', '高橋 美咲', NOW(), NOW()),
('10000000-0000-0000-0000-000000000004', 'システムアーキテクチャ', 'レガシーシステムのモダナイゼーションとクラウド移行', '東京都港区', '2024-02-01', '2024-11-30', 'active', '渡辺 健太', NOW(), NOW()),
('10000000-0000-0000-0000-000000000005', '人事制度改革プロジェクト', '新しい人事評価制度の設計と導入', '東京都新宿区', '2023-01-01', '2023-12-31', 'completed', '鈴木 一郎', NOW(), NOW()),
('10000000-0000-0000-0000-000000000006', '新規事業企画', 'スタートアップ向けSaaSプロダクトの企画立案', '東京都中央区', '2024-04-01', '2025-03-31', 'active', '伊藤 恵美', NOW(), NOW()),
('10000000-0000-0000-0000-000000000007', '会計システム導入', '新しい会計システムの選定と導入プロジェクト', '東京都品川区', '2023-08-01', '2024-07-31', 'completed', '中村 あゆみ', NOW(), NOW()),
('10000000-0000-0000-0000-000000000008', 'マーケティング戦略立案', 'デジタルマーケティング戦略の立案と実行', '東京都目黒区', '2024-05-01', '2024-10-31', 'suspended', '山田 次郎', NOW(), NOW());

-- Insert test assignments (5 active assignments)
INSERT INTO assignments (id, employee_id, site_id, start_date, end_date, role, notes, created_at, updated_at) VALUES
-- 田中 太郎 → 東京オフィス開発プロジェクト
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2024-01-01', NULL, 'テックリード', 'プロジェクト全体の技術方針を統括', NOW(), NOW()),

-- 佐藤 花子 → 大阪支店営業展開
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '2024-03-01', NULL, '営業主任', '関西地区の営業戦略を推進', NOW(), NOW()),

-- 高橋 美咲 → 新規サービス開発
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', '2024-06-01', NULL, 'フロントエンドエンジニア', 'UIコンポーネント開発を担当', NOW(), NOW()),

-- 渡辺 健太 → システムアーキテクチャ
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', '2024-02-01', NULL, 'アーキテクト', 'システムアーキテクチャ設計を担当', NOW(), NOW()),

-- 伊藤 恵美 → 新規事業企画
('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', '2024-04-01', NULL, '企画担当', 'SaaSプロダクトの企画立案を担当', NOW(), NOW());

-- Completed assignments for history
INSERT INTO assignments (id, employee_id, site_id, start_date, end_date, role, notes, created_at, updated_at) VALUES
-- 鈴木 一郎 → 人事制度改革プロジェクト (完了)
('20000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', '2023-01-01', '2023-12-31', 'プロジェクトマネージャー', '人事制度改革を完了', NOW(), NOW()),

-- 中村 あゆみ → 会計システム導入 (完了)
('20000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000007', '2023-08-01', '2024-07-31', '経理担当', '会計システム導入プロジェクトを完了', NOW(), NOW());

-- Display summary
SELECT 'Test data insertion completed!' as message;
SELECT 'Employees: ' || COUNT(*) || ' (Active: ' || SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) || ')' as summary FROM employees;
SELECT 'Sites: ' || COUNT(*) || ' (Active: ' || SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) || ')' as summary FROM sites;
SELECT 'Assignments: ' || COUNT(*) || ' (Active: ' || SUM(CASE WHEN end_date IS NULL THEN 1 ELSE 0 END) || ')' as summary FROM assignments;
