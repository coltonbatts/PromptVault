import { useState, useEffect, useCallback } from 'react'
import { promptsApi } from '../services/api'

export const usePrompts = (searchParams = {}) => {
  const [prompts, setPrompts] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  })

  // Fetch prompts with search parameters
  const fetchPrompts = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await promptsApi.search({
        query: params.query || '',
        tags: params.tags || [],
        limit: params.limit || 20,
        offset: params.offset || 0,
        sort_by: params.sortBy || 'created_at',
        sort_order: params.sortOrder || 'desc'
      })
      
      setPrompts(response.prompts || [])
      setPagination({
        total: response.total || 0,
        limit: response.limit || 20,
        offset: response.offset || 0,
        hasMore: response.has_more || false
      })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch prompts')
      setPrompts([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch available tags
  const fetchTags = useCallback(async () => {
    try {
      const tagsData = await promptsApi.getTags()
      setTags(tagsData || [])
    } catch (err) {
      console.error('Failed to fetch tags:', err)
      setTags([])
    }
  }, [])

  // Create a new prompt
  const createPrompt = useCallback(async (promptData) => {
    try {
      const newPrompt = await promptsApi.create(promptData)
      setPrompts(prev => [newPrompt, ...prev])
      await fetchTags() // Refresh tags in case new ones were added
      return newPrompt
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create prompt'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [fetchTags])

  // Update an existing prompt
  const updatePrompt = useCallback(async (id, promptData) => {
    try {
      const updatedPrompt = await promptsApi.update(id, promptData)
      setPrompts(prev => prev.map(prompt => 
        prompt.id === id ? updatedPrompt : prompt
      ))
      await fetchTags() // Refresh tags in case they changed
      return updatedPrompt
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update prompt'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [fetchTags])

  // Delete a prompt
  const deletePrompt = useCallback(async (id) => {
    try {
      await promptsApi.delete(id)
      setPrompts(prev => prev.filter(prompt => prompt.id !== id))
      await fetchTags() // Refresh tags in case some are no longer used
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete prompt'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [fetchTags])

  // Refetch data
  const refetch = useCallback(() => {
    fetchPrompts(searchParams)
    fetchTags()
  }, [fetchPrompts, fetchTags, searchParams])

  // Effect to fetch prompts when search parameters change
  useEffect(() => {
    fetchPrompts(searchParams)
  }, [fetchPrompts, searchParams.query, searchParams.tags, searchParams.limit, searchParams.offset])

  // Effect to fetch tags on mount
  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  return {
    prompts,
    tags,
    loading,
    error,
    pagination,
    createPrompt,
    updatePrompt,
    deletePrompt,
    refetch,
    fetchPrompts
  }
} 