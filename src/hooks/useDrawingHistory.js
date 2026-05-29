import { useState, useCallback } from 'react'

/**
 * Hook for managing undo/redo history in drawing operations
 * Uses command pattern: each action is stored as an executable command
 */
export function useDrawingHistory(initialState = null) {
  const [history, setHistory] = useState([initialState])
  const [historyIndex, setHistoryIndex] = useState(0)

  /**
   * Execute a command and add it to history
   */
  const executeCommand = useCallback((command) => {
    // Execute the command to get the new state
    const newState = command.execute()

    // Remove any forward history (redo stack) if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newState)

    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)

    return newState
  }, [history, historyIndex])

  /**
   * Set state directly (for initialization or batch updates)
   */
  const setState = useCallback((newState) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newState)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    return newState
  }, [history, historyIndex])

  /**
   * Undo the last action
   */
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      return history[newIndex]
    }
    return history[historyIndex]
  }, [history, historyIndex])

  /**
   * Redo the last undone action
   */
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      return history[newIndex]
    }
    return history[historyIndex]
  }, [history, historyIndex])

  /**
   * Get current state from history
   */
  const getCurrentState = useCallback(() => {
    return history[historyIndex]
  }, [history, historyIndex])

  /**
   * Check if undo is available
   */
  const canUndo = historyIndex > 0

  /**
   * Check if redo is available
   */
  const canRedo = historyIndex < history.length - 1

  /**
   * Clear history and reset to initial state
   */
  const clearHistory = useCallback((newInitialState = null) => {
    setHistory([newInitialState])
    setHistoryIndex(0)
  }, [])

  return {
    executeCommand,
    setState,
    undo,
    redo,
    getCurrentState,
    canUndo,
    canRedo,
    clearHistory,
    historyLength: history.length,
    currentIndex: historyIndex
  }
}
