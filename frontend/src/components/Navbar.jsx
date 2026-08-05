import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Upload, FileText, Briefcase, LogOut, User } from 'lucide-react'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-gray-900/95 backdrop-blur-md shadow-2xl border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Resume AI</span>
              <p className="text-xs text-gray-400 -mt-1">Smart Resume Analyzer</p>
            </div>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-1">
              <Link 
                to="/dashboard" 
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium hover:shadow-lg"
              >
                Dashboard
              </Link>
              <Link 
                to="/upload" 
                className="px-4 py-2 text-gray-300 hover:text-green-400 hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium hover:shadow-lg"
              >
                Upload Resume
              </Link>
              <Link 
                to="/resumes" 
                className="px-4 py-2 text-gray-300 hover:text-purple-400 hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium hover:shadow-lg"
              >
                My Resumes
              </Link>
              <Link 
                to="/jobs" 
                className="px-4 py-2 text-gray-300 hover:text-orange-400 hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium hover:shadow-lg"
              >
                Job Management
              </Link>
              <Link 
                to="/ai-matching" 
                className="px-4 py-2 text-gray-300 hover:text-pink-400 hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium hover:shadow-lg"
              >
                AI Matching
              </Link>
              
              {/* User Menu */}
              <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-700">
                <div className="flex items-center space-x-3 bg-gray-800 rounded-lg px-4 py-2 shadow-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-200">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:shadow-lg"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
