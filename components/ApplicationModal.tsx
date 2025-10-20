'use client'

import React, { useState } from 'react'
import { useMutation } from 'react-query'
import { X, FileText, User, Send } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'

interface ApplicationModalProps {
  project: {
    id: string
    title: string
    professor: {
      name: string
    }
  }
  onClose: () => void
  onSuccess: () => void
}

export default function ApplicationModal({ project, onClose, onSuccess }: ApplicationModalProps) {
  const [formData, setFormData] = useState({
    coverLetter: '',
    relevantExperience: '',
    motivation: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { token } = useAuth()

  const applyMutation = useMutation(
    (data: any) => fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    {
      onSuccess: () => {
        onSuccess()
      },
      onError: (error) => {
        console.error('Application error:', error)
        setIsSubmitting(false)
      }
    }
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const applicationData = {
      projectId: project.id,
      ...formData
    }

    applyMutation.mutate(applicationData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Apply to Project</h2>
            <p className="text-sm text-gray-600">{project.title}</p>
            <p className="text-sm text-gray-500">Professor: {project.professor.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter *
            </label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              required
              rows={4}
              className="input-field"
              placeholder="Tell the professor why you're interested in this project and what you can contribute..."
              value={formData.coverLetter}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.coverLetter.length}/1000 characters
            </p>
          </div>

          <div>
            <label htmlFor="relevantExperience" className="block text-sm font-medium text-gray-700 mb-2">
              Relevant Experience
            </label>
            <textarea
              id="relevantExperience"
              name="relevantExperience"
              rows={3}
              className="input-field"
              placeholder="Describe any relevant coursework, research experience, or skills..."
              value={formData.relevantExperience}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.relevantExperience.length}/1000 characters
            </p>
          </div>

          <div>
            <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-2">
              Motivation *
            </label>
            <textarea
              id="motivation"
              name="motivation"
              required
              rows={4}
              className="input-field"
              placeholder="Explain what motivates you to work on this project and how it aligns with your goals..."
              value={formData.motivation}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.motivation.length}/1000 characters
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.coverLetter.trim() || !formData.motivation.trim()}
              className="btn-primary flex items-center space-x-2"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
