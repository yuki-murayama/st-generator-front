#!/bin/bash

# Fix auth component tests
cd tests/unit/components/auth
sed -i "s|from './LoginForm'|from '@/components/auth/LoginForm'|g" LoginForm.test.tsx
sed -i "s|from './ProtectedRoute'|from '@/components/auth/ProtectedRoute'|g" ProtectedRoute.test.tsx
sed -i "s|from '../../contexts/AuthContext'|from '@/contexts/AuthContext'|g" *.test.tsx

# Fix employees component tests
cd ../employees
sed -i "s|from './EmployeeForm'|from '@/components/employees/EmployeeForm'|g" EmployeeForm.test.tsx
sed -i "s|from './EmployeeTable'|from '@/components/employees/EmployeeTable'|g" EmployeeTable.test.tsx
sed -i "s|from '../../types/employee'|from '@/types/employee'|g" *.test.tsx

# Fix assignments component tests
cd ../assignments
sed -i "s|from './AssignmentForm'|from '@/components/assignments/AssignmentForm'|g" AssignmentForm.test.tsx
sed -i "s|from './AssignmentTable'|from '@/components/assignments/AssignmentTable'|g" AssignmentTable.test.tsx
sed -i "s|from '../../types/assignment'|from '@/types/assignment'|g" *.test.tsx
sed -i "s|from '../../types/employee'|from '@/types/employee'|g" *.test.tsx
sed -i "s|from '../../types/site'|from '@/types/site'|g" *.test.tsx

# Fix dashboard component tests
cd ../dashboard
sed -i "s|from './StatsCards'|from '@/components/dashboard/StatsCards'|g" StatsCards.test.tsx
sed -i "s|from './ActivityFeed'|from '@/components/dashboard/ActivityFeed'|g" ActivityFeed.test.tsx
sed -i "s|from '../../types/dashboard'|from '@/types/dashboard'|g" *.test.tsx

# Fix hook tests
cd ../../hooks
sed -i "s|from './useAuth'|from '@/hooks/useAuth'|g" useAuth.test.tsx
sed -i "s|from '../contexts/AuthContext'|from '@/contexts/AuthContext'|g" useAuth.test.tsx

# Fix api hook tests
cd api
sed -i "s|from './useEmployees'|from '@/hooks/api/useEmployees'|g" useEmployees.test.tsx
sed -i "s|from './useSites'|from '@/hooks/api/useSites'|g" useSites.test.tsx
sed -i "s|from './useAssignments'|from '@/hooks/api/useAssignments'|g" useAssignments.test.tsx
