import React, { useState, useEffect, useMemo } from 'react'
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  CircularProgress
} from '@mui/material'
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material'
import { SearchFieldProps } from '../../types'

const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  placeholder = '検索...',
  debounceMs = 300,
  loading = false
}) => {
  const [internalValue, setInternalValue] = useState(value)

  // Debounced onChange callback
  const debouncedOnChange = useMemo(
    () => debounce((searchValue: string) => {
      onChange(searchValue)
    }, debounceMs),
    [onChange, debounceMs]
  )

  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(value)
  }, [value])

  // Handle input change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setInternalValue(newValue)
    debouncedOnChange(newValue)
  }

  // Handle clear
  const handleClear = () => {
    setInternalValue('')
    onChange('')
  }

  // Handle key press
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onChange(internalValue)
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        value={internalValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                <SearchIcon color="action" />
              )}
            </InputAdornment>
          ),
          endAdornment: internalValue && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                disabled={loading}
                aria-label="検索をクリア"
                edge="end"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main'
              }
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
                borderWidth: 2
              }
            }
          }
        }}
      />
    </Box>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export default SearchField