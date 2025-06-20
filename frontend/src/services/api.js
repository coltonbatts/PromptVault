import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const promptsApi = {
  // Get all prompts with search and filtering
  search: async (params = {}) => {
    const response = await api.get('/api/prompts', { params })
    return response.data
  },

  // Get a specific prompt by ID
  getById: async (id) => {
    const response = await api.get(`/api/prompts/${id}`)
    return response.data
  },

  // Create a new prompt
  create: async (promptData) => {
    const response = await api.post('/api/prompts', promptData)
    return response.data
  },

  // Update an existing prompt
  update: async (id, promptData) => {
    const response = await api.put(`/api/prompts/${id}`, promptData)
    return response.data
  },

  // Delete a prompt
  delete: async (id) => {
    await api.delete(`/api/prompts/${id}`)
  },

  // Get all available tags
  getTags: async () => {
    const response = await api.get('/api/prompts/tags/all')
    return response.data
  }
}

export default api 