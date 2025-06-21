import React, { useState } from 'react'
import { Edit2, Trash2, Copy, Calendar } from 'lucide-react'

const PromptCard = ({ prompt, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-white flex-1 mr-4">
          {prompt.title}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Copy content"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(prompt)}
            className="p-2 text-gray-300 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
            title="Edit prompt"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(prompt.id)}
            className="p-2 text-gray-300 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
            title="Delete prompt"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">
          {prompt.content}
        </p>
      </div>

      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {prompt.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block bg-gray-700 text-gray-200 px-2 py-1 rounded-md text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Created {formatDate(prompt.created_at)}</span>
        </div>
        {prompt.updated_at !== prompt.created_at && (
          <span>Updated {formatDate(prompt.updated_at)}</span>
        )}
      </div>

      {copied && (
        <div className="absolute top-2 right-2 bg-green-900 text-green-200 px-2 py-1 rounded text-sm">
          Copied!
        </div>
      )}
    </div>
  )
}

export default PromptCard 