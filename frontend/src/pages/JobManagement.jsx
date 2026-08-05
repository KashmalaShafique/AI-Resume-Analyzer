import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Briefcase, Plus, Trash2, Eye } from 'lucide-react'

const JobManagement = () => {
  const { isAuthenticated } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    skills_required: ''
  })

  useEffect(() => {
    if (isAuthenticated) {
      fetchJobs()
    }
  }, [isAuthenticated])

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs/')
      setJobs(response.data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(req => req.trim()),
        skills_required: formData.skills_required.split(',').map(skill => skill.trim()).filter(skill => skill)
      }
      
      const response = await axios.post('/api/jobs/', jobData)
      setJobs([...jobs, response.data])
      setShowForm(false)
      setFormData({ title: '', description: '', requirements: '', skills_required: '' })
    } catch (error) {
      console.error('Error creating job:', error)
    }
  }

  const deleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job description?')) {
      try {
        await axios.delete(`/api/jobs/${id}`)
        setJobs(jobs.filter(job => job.id !== id))
      } catch (error) {
        console.error('Error deleting job:', error)
      }
    }
  }

  if (!isAuthenticated) {
    return <div className="text-white text-center py-12">Please log in to manage jobs</div>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">Job Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-semibold"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Job
        </button>
      </div>

      {/* Add Job Form */}
      {showForm && (
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Create New Job Description</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-lg font-semibold text-gray-300 mb-2">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white text-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white text-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-300 mb-2">Requirements (one per line)</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white text-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Bachelor's degree in Computer Science&#10;3+ years of experience&#10;Knowledge of React and Node.js"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-300 mb-2">Required Skills (comma-separated)</label>
              <input
                type="text"
                value={formData.skills_required}
                onChange={(e) => setFormData({...formData, skills_required: e.target.value})}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white text-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="JavaScript, React, Node.js, Python, SQL"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 text-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-lg font-medium shadow-lg hover:shadow-xl"
              >
                Create Job
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Briefcase className="h-10 w-10 text-white" />
          </div>
          <h3 className="mt-2 text-2xl font-bold text-white">No job descriptions</h3>
          <p className="mt-2 text-lg text-gray-300">Get started by creating a job description.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">{job.title}</h3>
                  <p className="text-lg text-gray-300 mb-4">{job.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {job.skills_required?.map((skill, index) => (
                      <span key={index} className="inline-flex px-4 py-2 text-sm font-medium bg-blue-600 text-blue-100 rounded-full shadow-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-3 ml-6">
                  <button className="p-3 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-all duration-200">
                    <Eye className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={() => deleteJob(job.id)}
                    className="p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default JobManagement
