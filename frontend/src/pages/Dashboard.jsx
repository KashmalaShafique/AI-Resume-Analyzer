import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Upload, FileText, Briefcase, Users, TrendingUp, Clock } from 'lucide-react'

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalJobs: 0,
    totalMatches: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated])

  const fetchDashboardData = async () => {
    try {
      const [resumesResponse, jobsResponse, dashboardResponse] = await Promise.all([
        axios.get('http://localhost:8000/api/resumes/'),
        axios.get('http://localhost:8000/api/jobs/'),
        axios.get('http://localhost:8000/api/export/dashboard/summary', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ])

      setStats({
        totalResumes: dashboardResponse.data.statistics.total_resumes,
        totalJobs: dashboardResponse.data.statistics.total_jobs,
        totalMatches: dashboardResponse.data.statistics.total_matches,
        parsedResumes: dashboardResponse.data.statistics.parsed_resumes,
        recentActivity: dashboardResponse.data.recent_resumes || []
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Fallback to basic stats
      setStats({
        totalResumes: 0,
        totalJobs: 0,
        totalMatches: 0,
        parsedResumes: 0,
        recentActivity: []
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-white mb-4">Welcome to Resume AI</h1>
        <p className="text-gray-300 mb-8">Please sign in to access your dashboard</p>
        <Link 
          to="/login" 
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Sign In
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="text-gray-300 text-lg">
                Here's what's happening with your resume analysis and job matching.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 p-6 border border-gray-700 hover:border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-1">Total Resumes</p>
                <p className="text-3xl font-bold text-white">{stats.totalResumes}</p>
                <p className="text-xs text-gray-400 mt-1">All uploaded files</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 p-6 border border-gray-700 hover:border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-1">Job Descriptions</p>
                <p className="text-3xl font-bold text-white">{stats.totalJobs}</p>
                <p className="text-xs text-gray-400 mt-1">Active positions</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 p-6 border border-gray-700 hover:border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-1">Total Matches</p>
                <p className="text-3xl font-bold text-white">{stats.totalMatches}</p>
                <p className="text-xs text-gray-400 mt-1">AI matches made</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 p-6 border border-gray-700 hover:border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-1">Parsed Resumes</p>
                <p className="text-3xl font-bold text-white">{stats.parsedResumes}</p>
                <p className="text-xs text-gray-400 mt-1">AI analyzed</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 p-6 border border-gray-700 hover:border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-1">Recent Activity</p>
                <p className="text-3xl font-bold text-white">{stats.recentActivity.length}</p>
                <p className="text-xs text-gray-400 mt-1">This week</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <Upload className="h-5 w-5 text-white" />
              </div>
              Quick Actions
            </h3>
            <div className="space-y-4">
              <Link 
                to="/upload" 
                className="flex items-center p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 group border border-gray-600 hover:border-blue-500"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-white font-semibold text-lg group-hover:text-blue-300">Upload New Resume</span>
                  <p className="text-gray-300 text-sm group-hover:text-blue-200">Add a new resume for AI analysis</p>
                </div>
              </Link>
              <Link 
                to="/jobs" 
                className="flex items-center p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 group border border-gray-600 hover:border-green-500"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-white font-semibold text-lg group-hover:text-green-300">Create Job Description</span>
                  <p className="text-gray-300 text-sm group-hover:text-green-200">Define requirements for new positions</p>
                </div>
              </Link>
              <Link 
                to="/resumes" 
                className="flex items-center p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 group border border-gray-600 hover:border-purple-500"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-white font-semibold text-lg group-hover:text-purple-300">View All Resumes</span>
                  <p className="text-gray-300 text-sm group-hover:text-purple-200">Browse and manage your resume library</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Getting Started
            </h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">1</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-white mb-1">Upload Resume</h4>
                  <p className="text-gray-300">Upload your resume in PDF or DOCX format for AI analysis</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">2</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-white mb-1">Create Job Description</h4>
                  <p className="text-gray-300">Define job requirements and skills for matching</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">3</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-white mb-1">AI Matching</h4>
                  <p className="text-gray-300">Use AI to find the best candidates automatically</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
