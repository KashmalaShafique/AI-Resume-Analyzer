import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { FileText, Calendar, Trash2, Eye, User, Mail, Phone, GraduationCap, Briefcase, Sparkles, Download, RefreshCw } from 'lucide-react'

const ResumeList = () => {
  const { isAuthenticated } = useAuth()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchResumes()
    }
  }, [isAuthenticated])

  const fetchResumes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/resumes/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      setResumes(response.data)
    } catch (error) {
      console.error('Error fetching resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseResume = async (id) => {
    try {
      // Update the resume status to parsing
      setResumes(resumes.map(resume => 
        resume.id === id ? { ...resume, status: 'parsing' } : resume
      ))

      const response = await axios.post(
        `http://localhost:8000/api/matching/parse/${id}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      
      if (response.data.message) {
        setNotification({
          type: 'success',
          message: '✅ Resume parsing completed! Check the details below.',
          show: true
        })
        // Refresh to get the latest parsed data
        setTimeout(() => {
          fetchResumes()
        }, 1000)
        // Hide notification after 5 seconds
        setTimeout(() => {
          setNotification(null)
        }, 5000)
      }
    } catch (error) {
      console.error('Error parsing resume:', error)
      alert('❌ Error parsing resume. Please try again.')
      // Reset status on error
      setResumes(resumes.map(resume => 
        resume.id === id ? { ...resume, status: 'uploaded' } : resume
      ))
    }
  }

  const deleteResume = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await axios.delete(`http://localhost:8000/api/resumes/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        setResumes(resumes.filter(resume => resume.id !== id))
      } catch (error) {
        console.error('Error deleting resume:', error)
      }
    }
  }

  if (!isAuthenticated) {
    return <div className="text-white text-center py-12">Please log in to view resumes</div>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notification */}
        {notification && notification.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-2xl max-w-sm ${
            notification.type === 'success' 
              ? 'bg-green-900 border border-green-600 text-green-200' 
              : 'bg-red-900 border border-red-600 text-red-200'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setNotification(null)}
                  className="inline-flex text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Resume Library</h1>
              <p className="text-lg text-gray-300">Manage and analyze your uploaded resumes</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gray-800 rounded-lg px-4 py-2 shadow-lg border border-gray-700">
                <span className="text-sm text-gray-400">Total Resumes</span>
                <div className="text-2xl font-bold text-blue-400">{resumes.length}</div>
              </div>
            </div>
          </div>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-12 max-w-md mx-auto border border-gray-700">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Resumes Yet</h3>
              <p className="text-gray-300 mb-6">Upload your first resume to get started with AI analysis</p>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                Upload Resume
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div key={resume.id} id={`resume-${resume.id}`} className="bg-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden border border-gray-700">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">
                          {resume.parsed_name || resume.original_filename}
                        </h3>
                        <p className="text-blue-100 text-sm">
                          {new Date(resume.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        resume.status === 'parsed' ? 'bg-green-500 text-white' :
                        resume.status === 'parsing' ? 'bg-yellow-500 text-white' :
                        resume.status === 'error' ? 'bg-red-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {resume.status === 'parsed' ? '✓ Parsed' :
                         resume.status === 'parsing' ? '⏳ Parsing' :
                         resume.status === 'error' ? '❌ Error' :
                         '📄 Uploaded'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Debug Info - Show what data we have */}
                  <div className="bg-gray-700 rounded-lg p-3 mb-4 text-xs border border-gray-600">
                    <strong className="text-white">Debug Info:</strong><br/>
                    <span className="text-gray-300">Status: {resume.status}</span><br/>
                    <span className="text-gray-300">Has Email: {resume.parsed_email ? 'Yes' : 'No'} ({resume.parsed_email})</span><br/>
                    <span className="text-gray-300">Has Phone: {resume.parsed_phone ? 'Yes' : 'No'} ({resume.parsed_phone})</span><br/>
                    <span className="text-gray-300">Has Skills: {resume.parsed_skills ? resume.parsed_skills.length : 0}</span><br/>
                    <span className="text-gray-300">Has Summary: {resume.parsed_summary ? 'Yes' : 'No'}</span><br/>
                    <span className="text-gray-300">Has Experience: {resume.parsed_experience ? resume.parsed_experience.length : 0}</span><br/>
                    <span className="text-gray-300">Has Education: {resume.parsed_education ? resume.parsed_education.length : 0}</span><br/>
                    <strong className="text-white">Raw Data:</strong><br/>
                    <pre className="text-gray-300 text-xs overflow-x-auto">
                      {JSON.stringify({
                        parsed_name: resume.parsed_name,
                        parsed_email: resume.parsed_email,
                        parsed_phone: resume.parsed_phone,
                        parsed_skills: resume.parsed_skills,
                        parsed_summary: resume.parsed_summary
                      }, null, 2)}
                    </pre>
                  </div>

                  {/* Parsed Details - Show if we have parsed data */}
                  {(resume.parsed_email || resume.parsed_phone || resume.parsed_skills || resume.parsed_summary || resume.parsed_experience || resume.parsed_education) && (
                    <div className="space-y-4">
                      {/* Contact Info */}
                      {(resume.parsed_email || resume.parsed_phone) && (
                        <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                          <h4 className="text-lg font-semibold text-blue-300 mb-3 flex items-center">
                            <Mail className="h-5 w-5 mr-2" />
                            Contact Information
                          </h4>
                          <div className="space-y-2">
                            {resume.parsed_email && (
                              <div className="flex items-center bg-gray-800 rounded-lg p-3 border border-gray-600">
                                <Mail className="h-4 w-4 mr-3 text-blue-400" />
                                <span className="text-gray-200 font-medium">{resume.parsed_email}</span>
                              </div>
                            )}
                            {resume.parsed_phone && (
                              <div className="flex items-center bg-gray-800 rounded-lg p-3 border border-gray-600">
                                <Phone className="h-4 w-4 mr-3 text-green-400" />
                                <span className="text-gray-200 font-medium">{resume.parsed_phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {resume.parsed_skills && resume.parsed_skills.length > 0 && (
                        <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                          <h4 className="text-lg font-semibold text-green-300 mb-3 flex items-center">
                            <Briefcase className="h-5 w-5 mr-2" />
                            Skills ({resume.parsed_skills.length} found)
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {resume.parsed_skills.slice(0, 8).map((skill, idx) => (
                              <span key={idx} className="bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 text-sm px-4 py-2 rounded-full font-medium shadow-sm">
                                {skill}
                              </span>
                            ))}
                            {resume.parsed_skills.length > 8 && (
                              <span className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full border-2 border-dashed border-gray-300">
                                +{resume.parsed_skills.length - 8} more skills
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* AI Summary */}
                      {resume.parsed_summary && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                          <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                            <Sparkles className="h-5 w-5 mr-2" />
                            AI Analysis Summary
                          </h4>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-gray-700 leading-relaxed">
                              {resume.parsed_summary}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Experience & Education */}
                      {(resume.parsed_experience && resume.parsed_experience.length > 0) || (resume.parsed_education && resume.parsed_education.length > 0) && (
                        <div className="bg-orange-50 rounded-xl p-4">
                          <h4 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                            <GraduationCap className="h-5 w-5 mr-2" />
                            Experience & Education
                          </h4>
                          <div className="space-y-3">
                            {resume.parsed_experience && resume.parsed_experience.length > 0 && (
                              <div>
                                <h5 className="font-medium text-orange-700 mb-2">Work Experience:</h5>
                                <div className="space-y-2">
                                  {resume.parsed_experience.slice(0, 3).map((exp, idx) => (
                                    <div key={idx} className="bg-white rounded-lg p-3 text-sm">
                                      <div className="font-medium text-gray-800">{exp.title || exp.position || 'Experience'}</div>
                                      {exp.company && <div className="text-gray-600">{exp.company}</div>}
                                      {exp.duration && <div className="text-gray-500 text-xs">{exp.duration}</div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {resume.parsed_education && resume.parsed_education.length > 0 && (
                              <div>
                                <h5 className="font-medium text-orange-700 mb-2">Education:</h5>
                                <div className="space-y-2">
                                  {resume.parsed_education.slice(0, 2).map((edu, idx) => (
                                    <div key={idx} className="bg-white rounded-lg p-3 text-sm">
                                      <div className="font-medium text-gray-800">{edu.degree || edu.qualification || 'Education'}</div>
                                      {edu.institution && <div className="text-gray-600">{edu.institution}</div>}
                                      {edu.year && <div className="text-gray-500 text-xs">{edu.year}</div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fallback - Show if no parsed data */}
                  {!(resume.parsed_email || resume.parsed_phone || resume.parsed_skills || resume.parsed_summary || resume.parsed_experience || resume.parsed_education) && (
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                      <h4 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        No Parsed Data Yet
                      </h4>
                      <p className="text-yellow-700 text-sm">
                        {resume.status === 'uploaded' 
                          ? 'Click "Parse with AI" to extract information from this resume.'
                          : resume.status === 'parsing'
                          ? 'AI is currently analyzing this resume...'
                          : 'This resume has not been parsed yet.'}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      {resume.status === 'uploaded' && (
                        <button 
                          onClick={() => parseResume(resume.id)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Parse with AI
                        </button>
                      )}
                      {resume.status === 'parsing' && (
                        <button disabled className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Parsing...
                        </button>
                      )}
                      {resume.status === 'parsed' && (
                        <div className="flex items-center space-x-2">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <Sparkles className="h-4 w-4 mr-1" />
                            AI Parsed
                          </span>
                          <button 
                            onClick={() => {
                              const element = document.getElementById(`resume-${resume.id}`);
                              element?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteResume(resume.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResumeList
