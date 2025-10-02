/**
 * 日付フォーマット関連のユーティリティ関数
 */

/**
 * 日付を yyyy-MM-dd 形式の文字列にフォーマット
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) {
    return '-'
  }

  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * 日付と時刻を yyyy-MM-dd HH:mm 形式の文字列にフォーマット
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) {
    return '-'
  }

  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 相対的な日付表示（例：2日前、3時間前）
 */
export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()

  if (isNaN(d.getTime())) {
    return '-'
  }

  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return '今'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分前`
  } else if (diffHours < 24) {
    return `${diffHours}時間前`
  } else if (diffDays < 30) {
    return `${diffDays}日前`
  } else {
    return formatDate(d)
  }
}

/**
 * 年齢を計算
 */
export const calculateAge = (birthDate: Date | string): number => {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const today = new Date()

  if (isNaN(birth.getTime())) {
    return 0
  }

  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * 入社からの勤続年数を計算
 */
export const calculateYearsOfService = (hireDate: Date | string): number => {
  return calculateAge(hireDate)
}