import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PromptCard from './components/PromptCard'
import PromptForm from './components/PromptForm'
import SearchBar from './components/SearchBar'
import TagFilter from './components/TagFilter'
import { usePrompts } from './hooks/usePrompts'
import { useDebounce } from './hooks/useDebounce'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(null)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  
  const {
    prompts,
    loading,
    error,
    tags,
    createPrompt,
    updatePrompt,
    deletePrompt,
    refetch
  } = usePrompts({
    query: debouncedSearchQuery,
    tags: selectedTags
  })

  const handleCreatePrompt = async (promptData) => {
    try {
      await createPrompt(promptData)
      setShowForm(false)
      refetch()
    } catch (error) {
      console.error('Error creating prompt:', error)
    }
  }

  const handleUpdatePrompt = async (id, promptData) => {
    try {
      await updatePrompt(id, promptData)
      setEditingPrompt(null)
      refetch()
    } catch (error) {
      console.error('Error updating prompt:', error)
    }
  }

  const handleDeletePrompt = async (id) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await deletePrompt(id)
        refetch()
      } catch (error) {
        console.error('Error deleting prompt:', error)
      }
    }
  }

  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt)
    setShowForm(true)
  }

  const handleCancelEdit = () => {
    setEditingPrompt(null)
    setShowForm(false)
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Prompt Vault</h1>
                <p className="text-gray-600 mt-1">
                  Your searchable personal library for LLM prompts
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Prompt
              </button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search prompts by title, content, or tags..."
              />
              <TagFilter
                availableTags={tags}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </div>

            {/* Prompt Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4">
                    {editingPrompt ? 'Edit Prompt' : 'Add New Prompt'}
                  </h2>
                  <PromptForm
                    initialData={editingPrompt}
                    onSubmit={editingPrompt ? 
                      (data) => handleUpdatePrompt(editingPrompt.id, data) : 
                      handleCreatePrompt
                    }
                    onCancel={handleCancelEdit}
                    availableTags={tags}
                  />
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Error: {error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Prompts List */}
            {!loading && (
              <div className="space-y-4">
                {prompts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      {searchQuery || selectedTags.length > 0 
                        ? 'No prompts found matching your search criteria.' 
                        : 'No prompts yet. Create your first prompt to get started!'}
                    </p>
                  </div>
                ) : (
                  prompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      onEdit={handleEditPrompt}
                      onDelete={handleDeletePrompt}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        } />
      </Routes>
    </Layout>
  )
}

export default App 