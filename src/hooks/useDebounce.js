import { useEffect, useState } from 'react'

/**
 * Custom hook for debouncing values
 * Useful for delaying expensive operations like grid regeneration
 *
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500)
 * @returns {any} - Debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up the timeout if value changes before delay expires
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook for debouncing functions
 * Useful for debouncing expensive callbacks
 *
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds (default: 500)
 * @returns {Function} - Debounced function
 */
export function useDebouncedCallback(callback, delay = 500) {
  const [timeoutId, setTimeoutId] = useState(null)

  const debouncedCallback = (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args)
    }, delay)

    setTimeoutId(newTimeoutId)
  }

  return debouncedCallback
}
