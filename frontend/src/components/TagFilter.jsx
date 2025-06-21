import React from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

const TagFilter = ({ availableTags, selectedTags, onTagsChange }) => {
  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const clearAllTags = () => {
    onTagsChange([])
  }

  if (!availableTags || availableTags.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-200">Filter by tags:</h3>
        {selectedTags.length > 0 && (
          <button
            onClick={clearAllTags}
            className="text-sm text-gray-400 hover:text-gray-200 underline"
          >
            Clear all
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={clsx(
                "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors",
                isSelected
                  ? "bg-blue-900 text-blue-200 hover:bg-blue-800"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              )}
            >
              {tag}
              {isSelected && (
                <X className="ml-1 h-3 w-3" />
              )}
            </button>
          )
        })}
      </div>
      
      {selectedTags.length > 0 && (
        <div className="text-sm text-gray-400">
          Filtering by {selectedTags.length} tag{selectedTags.length === 1 ? '' : 's'}
        </div>
      )}
    </div>
  )
}

export default TagFilter 