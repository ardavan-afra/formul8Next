'use client'

import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Tag, 
  User, 
  DollarSign,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import { getStatusBadgeClass, formatDate } from '@/lib/utils'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    relevantExperience: '',
    motivation: ''
  })

  const projectId = params.id as string

  // Fetch project details
  const { data: projectData, isLoading, error } = useQuery(
    ['project', projectId],
    () => fetch(`/api/projects/${projectId}`).then(res => res.json()),
    { enabled: !!projectId }
  )

  // Check if user has already applied
  const { data: userApplications } = useQuery(
    ['user-applications', user?.id],
    () => fetch('/api/applications/student/my-applications').then(res => res.json()),
    { enabled: !!user && user.role === 'student' }
  )

  const project = projectData?.data?.project
  const applications = userApplications?.data?.applications || []
  const hasApplied = applications.some((app: any) => app.projectId === projectId)

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || user.role !== 'student') return

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          projectId,
          ...applicationData
        })
      })

      if (response.ok) {
        setShowApplicationForm(false)
        setApplicationData({ coverLetter: '', relevantExperience: '', motivation: '' })
        // Refresh applications
        window.location.reload()
      }
    } catch (error) {
      console.error('Application submission error:', error)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error || !project) return <div>Project not found</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {project.title}
                  </h1>
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>by {project.professor.name}</span>
                  </div>
                </div>
                <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                  {project.status}
                </span>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {project.description}
                </p>
              </div>

              {/* Project details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-3" />
                    <span className="font-medium">Department:</span>
                    <span className="ml-2">{project.department}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-3" />
                    <span className="font-medium">Duration:</span>
                    <span className="ml-2">{project.duration}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-3" />
                    <span className="font-medium">Students:</span>
                    <span className="ml-2">{project.currentStudents}/{project.maxStudents}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-3" />
                    <span className="font-medium">Compensation:</span>
                    <span className="ml-2 capitalize">
                      {project.compensation}
                      {project.compensationAmount && ` - ${project.compensationAmount}`}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {project.startDate && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-3" />
                      <span className="font-medium">Start Date:</span>
                      <span className="ml-2">{formatDate(project.startDate)}</span>
                    </div>
                  )}
                  
                  {project.applicationDeadline && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-3" />
                      <span className="font-medium">Application Deadline:</span>
                      <span className="ml-2">{formatDate(project.applicationDeadline)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-3" />
                    <span className="font-medium">Time Commitment:</span>
                    <span className="ml-2">{project.timeCommitment}</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {project.skills && project.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {project.materials && project.materials.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Materials</h3>
                  <div className="space-y-2">
                    {project.materials.map((material: any, index: number) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-4 w-4 mr-3 text-gray-500" />
                        <div className="flex-1">
                          <div className="font-medium">{material.name}</div>
                          {material.description && (
                            <div className="text-sm text-gray-600">{material.description}</div>
                          )}
                        </div>
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {project.requirements && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {project.requirements.gpa && (
                      <div className="mb-2">
                        <span className="font-medium">Minimum GPA:</span> {project.requirements.gpa}
                      </div>
                    )}
                    {project.requirements.year && project.requirements.year.length > 0 && (
                      <div className="mb-2">
                        <span className="font-medium">Academic Year:</span> {project.requirements.year.join(', ')}
                      </div>
                    )}
                    {project.requirements.prerequisites && project.requirements.prerequisites.length > 0 && (
                      <div>
                        <span className="font-medium">Prerequisites:</span>
                        <ul className="list-disc list-inside mt-1">
                          {project.requirements.prerequisites.map((prereq: string, index: number) => (
                            <li key={index}>{prereq}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Professor info */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Professor</h3>
              <div className="space-y-2">
                <div className="font-medium">{project.professor.name}</div>
                <div className="text-sm text-gray-600">{project.professor.department}</div>
                <div className="text-sm text-gray-600">{project.professor.email}</div>
                {project.professor.bio && (
                  <div className="text-sm text-gray-700 mt-3">
                    {project.professor.bio}
                  </div>
                )}
              </div>
            </div>

            {/* Application section */}
            {user?.role === 'student' && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Apply to Project</h3>
                {hasApplied ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-green-600 font-medium">You have already applied to this project</p>
                  </div>
                ) : project.status === 'active' && project.currentStudents < project.maxStudents ? (
                  <div>
                    {!showApplicationForm ? (
                      <button
                        onClick={() => setShowApplicationForm(true)}
                        className="btn-primary w-full"
                      >
                        Apply Now
                      </button>
                    ) : (
                      <form onSubmit={handleApplicationSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cover Letter *
                          </label>
                          <textarea
                            value={applicationData.coverLetter}
                            onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Relevant Experience
                          </label>
                          <textarea
                            value={applicationData.relevantExperience}
                            onChange={(e) => setApplicationData(prev => ({ ...prev, relevantExperience: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Motivation *
                          </label>
                          <textarea
                            value={applicationData.motivation}
                            onChange={(e) => setApplicationData(prev => ({ ...prev, motivation: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            required
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="btn-primary flex-1"
                          >
                            Submit Application
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowApplicationForm(false)}
                            className="btn-secondary flex-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      {project.status !== 'active' 
                        ? 'This project is not currently accepting applications'
                        : 'This project is full'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
