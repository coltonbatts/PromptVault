import React from 'react'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8 text-white">
        {children}
      </div>
    </div>
  )
}

export default Layout 