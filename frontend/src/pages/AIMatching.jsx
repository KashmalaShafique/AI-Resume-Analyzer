import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000'

const AIMatching = () => {
  const { user } = useAuth()

  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [matchResults, setMatchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [parsingResume, setParsingResume] = useState(null)

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/jobs/`,
        {
          headers: authHeaders,
        }
      )

      setJobs(response.data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const parseResume = async (resumeId) => {
    setParsingResume(resumeId)

    try {
      const response = await axios.post(
        `${API_URL}/api/matching/parse/${resumeId}`,
        {},
        {
          headers: authHeaders,
        }
      )

      if (response.data.message) {
        alert('Resume parsed successfully!')
        fetchJobs()
      }
    } catch (error) {
      console.error('Error parsing resume:', error)
      alert(
        error.response?.data?.detail ||
          'Error parsing resume. Please try again.'
      )
    } finally {
      setParsingResume(null)
    }
  }

  const matchResumesWithJob = async (jobId) => {
    setLoading(true)

    try {
      const response = await axios.post(
        `${API_URL}/api/matching/match/${jobId}`,
        {},
        {
          headers: authHeaders,
        }
      )

      setMatchResults(response.data.match_results || [])
      setSelectedJob(response.data.job_title)
    } catch (error) {
      console.error('Error matching resumes:', error)

      alert(
        error.response?.data?.detail ||
          'Error matching resumes. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const getMatchResults = async (jobId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/matching/results/${jobId}`,
        {
          headers: authHeaders,
        }
      )

      setMatchResults(response.data.results || [])
      setSelectedJob(response.data.job_title)
    } catch (error) {
      console.error('Error fetching match results:', error)

      alert(
        error.response?.data?.detail ||
          'Error fetching match results.'
      )
    }
  }

  const exportResults = async (jobId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/export/matches/csv/${jobId}`,
        {
          headers: authHeaders,
          responseType: 'blob',
        }
      )

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      )

      const link = document.createElement('a')

      link.href = url
      link.setAttribute(
        'download',
        `job_${jobId}_matches.csv`
      )

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting results:', error)

      alert(
        error.response?.data?.detail ||
          'Error exporting results. Please try again.'
      )
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            AI Resume Matching
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Use advanced AI to match resumes with job descriptions
            and find the best candidates automatically
          </p>
        </div>

        {/* Job Selection */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl mb-8 overflow-hidden border border-gray-700">

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">
              Select Job Description
            </h2>

            <p className="text-blue-100 mt-2">
              Choose a job to match with your resumes
            </p>
          </div>

          <div className="p-8">

            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 rounded-2xl p-6 hover:shadow-2xl hover:border-blue-400 transition-all duration-300"
                  >

                    <h3 className="text-xl font-bold text-white mb-3">
                      {job.title}
                    </h3>

                    <p className="text-gray-300 mb-6 line-clamp-3">
                      {job.description}
                    </p>

                    <div className="flex flex-col space-y-3">

                      <button
                        onClick={() =>
                          matchResumesWithJob(job.id)
                        }
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                      >
                        {loading
                          ? 'Matching...'
                          : 'Match Resumes'}
                      </button>

                      <div className="flex space-x-2">

                        <button
                          onClick={() =>
                            getMatchResults(job.id)
                          }
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
                        >
                          View Results
                        </button>

                        <button
                          onClick={() =>
                            exportResults(job.id)
                          }
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
                        >
                          Export CSV
                        </button>

                      </div>
                    </div>
                  </div>
                ))}

              </div>
            ) : (
              <div className="text-center py-12">

                <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">

                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
                    />
                  </svg>

                </div>

                <h3 className="text-xl font-semibold text-white mb-2">
                  No Job Descriptions Found
                </h3>

                <p className="text-gray-300 mb-6">
                  Create your first job description to start
                  matching resumes
                </p>

                <button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Create Job Description
                </button>

              </div>
            )}

          </div>
        </div>

        {/* Match Results */}
        {matchResults.length > 0 && (
          <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">

            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">

              <h2 className="text-2xl font-bold text-white">
                Match Results for: {selectedJob}
              </h2>

              <p className="text-green-100 mt-2">
                AI-powered candidate analysis and ranking
              </p>

            </div>

            <div className="p-8">

              <div className="space-y-6">

                {matchResults.map((result, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300"
                  >

                    <div className="flex justify-between items-start mb-6">

                      <div className="flex items-center space-x-4">

                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {index + 1}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {result.resume_name}
                          </h3>

                          <p className="text-gray-300">
                            Candidate #{index + 1}
                          </p>
                        </div>

                      </div>

                      <div className="text-right">

                        <div className="text-4xl font-bold text-blue-400 mb-1">
                          {result.match_percentage}%
                        </div>

                        <div className="text-sm text-gray-400">
                          Match Score
                        </div>

                      </div>

                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                      {/* Matched Skills */}
                      <div className="bg-gray-600 rounded-xl p-4 border border-gray-500">

                        <h4 className="text-lg font-semibold text-green-300 mb-3 flex items-center">

                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>

                          Matched Skills

                        </h4>

                        <div className="flex flex-wrap gap-2">

                          {result.matched_skills &&
                            result.matched_skills.map(
                              (skill, idx) => (
                                <span
                                  key={idx}
                                  className="bg-green-600 text-green-100 text-sm px-3 py-1 rounded-full font-medium"
                                >
                                  {skill}
                                </span>
                              )
                            )}

                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div className="bg-gray-600 rounded-xl p-4 border border-gray-500">

                        <h4 className="text-lg font-semibold text-red-300 mb-3 flex items-center">

                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>

                          Missing Skills

                        </h4>

                        <div className="flex flex-wrap gap-2">

                          {result.missing_skills &&
                            result.missing_skills.map(
                              (skill, idx) => (
                                <span
                                  key={idx}
                                  className="bg-red-600 text-red-100 text-sm px-3 py-1 rounded-full font-medium"
                                >
                                  {skill}
                                </span>
                              )
                            )}

                        </div>
                      </div>

                    </div>

                    {/* AI Analysis */}
                    {result.analysis && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">

                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">

                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>

                          AI Analysis

                        </h4>

                        <p className="text-gray-700 leading-relaxed">
                          {result.analysis}
                        </p>

                      </div>
                    )}

                  </div>
                ))}

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AIMatching