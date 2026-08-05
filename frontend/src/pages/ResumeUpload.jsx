import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, Shield, Zap } from 'lucide-react'

const ResumeUpload = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please select a PDF or DOCX file')
        return
      }
      
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      setFile(selectedFile)
      setError('')
      setMessage('')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError('')
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post('http://localhost:8000/api/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      })

      setMessage('Resume uploaded successfully! You can now parse it with AI.')
      setFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('file-upload')
      if (fileInput) fileInput.value = ''
      
    } catch (error) {
      console.error('Upload error:', error)
      setError(error.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Upload Your Resume
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload your resume and let our AI analyze it to extract key information, skills, and experience
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-700">
          <div className="text-center">
            {/* Upload Area */}
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Upload className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                {file ? 'File Selected ✓' : 'Choose a file to upload'}
              </h2>
              
              <p className="text-gray-300 mb-8 text-lg">
                Upload your resume in PDF or DOCX format. Maximum file size: 10MB
              </p>
              
              <div className="mb-8">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 inline-flex items-center text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Upload className="w-6 h-6 mr-3" />
                  {file ? 'Change File' : 'Select File'}
                </label>
              </div>
            </div>
            
            {/* File Preview */}
            {file && (
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl p-6 mb-8 border-2 border-dashed border-gray-600">
                <div className="flex items-center justify-center">
                  <FileText className="w-12 h-12 text-blue-400 mr-4" />
                  <div className="text-left">
                    <p className="font-semibold text-white text-lg">{file.name}</p>
                    <p className="text-blue-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Messages */}
            {message && (
              <div className="mb-6 p-6 bg-gradient-to-r from-green-900 to-emerald-900 border-2 border-green-600 text-green-200 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
                <span className="text-lg font-semibold">{message}</span>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-6 bg-gradient-to-r from-red-900 to-pink-900 border-2 border-red-600 text-red-200 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 mr-3 text-red-400" />
                <span className="text-lg font-semibold">{error}</span>
              </div>
            )}
            
            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 text-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
            >
              {uploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Uploading...
                </div>
              ) : (
                'Upload Resume'
              )}
            </button>
            
            {/* Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-700 rounded-2xl border border-gray-600">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">AI Analysis</h3>
                <p className="text-gray-300 text-sm">Extract skills, experience, and contact information</p>
              </div>
              
              <div className="text-center p-6 bg-gray-700 rounded-2xl border border-gray-600">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Smart Matching</h3>
                <p className="text-gray-300 text-sm">Match with job descriptions automatically</p>
              </div>
              
              <div className="text-center p-6 bg-gray-700 rounded-2xl border border-gray-600">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Secure Storage</h3>
                <p className="text-gray-300 text-sm">Your data is safe and encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeUpload