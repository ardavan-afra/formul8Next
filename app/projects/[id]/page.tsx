'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Tag, 
  User,
  FileText,
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import ApplicationModal from '@/components/ApplicationModal'
import { formatDate, getStatusBadgeClass } from '@/lib/utils'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const queryClient = useQueryClient()
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const userApplicationsQueryKey = ['user-applications', user?.id, user?.role]
  const projectId = Array.isArray(params?.id) ? params?.id[0] : params?.id
  const projectPath = projectId ? `/projects/${projectId}` : '/projects'

  // Fetch project details
  const { data: projectData, isLoading, error } = useQuery(
    ['project', params.id],
    () => fetch(`/api/projects/${params.id}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }).then(res => res.json()),
    { enabled: !!params.id }
  )

  const project = projectData?.data?.project

  // Check if user has already applied
  const { data: applicationsData } = useQuery(
    userApplicationsQueryKey,
    () => fetch('/api/applications/student/my-applications', {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }).then(res => res.json()),
    { enabled: user?.role === 'student' && !!token }
  )

  const hasApplied = applicationsData?.data?.applications?.some(
    (app: any) => app.project.id === params.id
  )

  const canApply = user?.role === 'student' && 
    project?.status === 'active' && 
    !hasApplied &&
    (!project?.applicationDeadline || new Date() <= new Date(project.applicationDeadline))

  const handleApply = () => {
    if (user?.role === 'student') {
      setShowApplicationModal(true)
    } else {
      router.push(`/login?redirect=${encodeURIComponent(projectPath)}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner size="lg" className="mt-20" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600">Project not found or error loading project.</p>
            <button
              onClick={() => router.back()}
              className="mt-4 btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Projects</span>
          </button>

          {/* Project Header */}
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{project.department}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>by {project.professor.name}</span>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Requirements */}
              {project.requirements && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                  
                  {project.requirements.gpa && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Minimum GPA</h3>
                      <p className="text-gray-600">{project.requirements.gpa}</p>
                    </div>
                  )}

                  {project.requirements.year && project.requirements.year.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Academic Year</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.requirements.year.map((year: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {year}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.requirements.prerequisites && project.requirements.prerequisites.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Prerequisites</h3>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {project.requirements.prerequisites.map((prereq: string, index: number) => (
                          <li key={index}>{prereq}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Skills */}
              {project.skills && project.skills.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {project.materials && project.materials.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Materials</h2>
                  <div className="space-y-3">
                    {project.materials.map((material: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{material.name}</h4>
                          {material.description && (
                            <p className="text-sm text-gray-600">{material.description}</p>
                          )}
                        </div>
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Open</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Applications (Professor only) */}
              {user?.role === 'professor' && project.applications && project.applications.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Applications ({project.applications.length})</h2>
                  <div className="space-y-3">
                    {project.applications.slice(0, 5).map((application: any) => (
                      <div key={application.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{application.student.name}</h4>
                          <p className="text-sm text-gray-500">{application.student.department}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`badge ${
                            application.status === 'pending' ? 'badge-warning' :
                            application.status === 'accepted' ? 'badge-success' :
                            application.status === 'rejected' ? 'badge-danger' :
                            'badge-primary'
                          }`}>
                            {application.status}
                          </span>
                          <button
                            onClick={() => router.push('/applications')}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                    {project.applications.length > 5 && (
                      <button
                        onClick={() => router.push('/applications')}
                        className="w-full text-center text-primary-600 hover:text-primary-700 font-medium py-2"
                      >
                        View all {project.applications.length} applications
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{project.timeCommitment}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{project.duration}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{project.currentStudents}/{project.maxStudents} students</span>
                  </div>

                  {project.startDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Starts {formatDate(project.startDate)}</span>
                    </div>
                  )}

                  {project.applicationDeadline && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Apply by {formatDate(project.applicationDeadline)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Professor Info */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professor</h3>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{project.professor.name}</h4>
                    <p className="text-sm text-gray-600">{project.professor.department}</p>
                  </div>
                </div>
                {project.professor.bio && (
                  <p className="text-sm text-gray-600 mt-3">{project.professor.bio}</p>
                )}
              </div>

              {/* Action Button */}
              {user?.role === 'professor' && project.professor.id === user.id ? (
                <div className="card">
                  <button
                    onClick={() => router.push(`/edit-project/${project.id}`)}
                    className="btn-primary w-full"
                  >
                    Edit Project
                  </button>
                </div>
              ) : canApply ? (
                <div className="card">
                  <button
                    onClick={handleApply}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Apply to Project</span>
                  </button>
                </div>
              ) : hasApplied ? (
                <div className="card">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">You have applied to this project</p>
                    <button
                      onClick={() => router.push('/applications')}
                      className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Application
                    </button>
                  </div>
                </div>
              ) : project.status !== 'active' ? (
                <div className="card">
                  <div className="text-center">
                    <XCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">This project is not accepting applications</p>
                  </div>
                </div>
              ) : (
                <div className="card">
                  <button
                    onClick={() => router.push(`/login?redirect=${encodeURIComponent(projectPath)}`)}
                    className="btn-primary w-full"
                  >
                    Login to Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Application Modal */}
      {showApplicationModal && (
        <ApplicationModal
          project={project}
          onClose={() => setShowApplicationModal(false)}
          onSuccess={() => {
            setShowApplicationModal(false)
            queryClient.invalidateQueries(['user-applications'])
            router.push('/applications')
          }}
        />
      )}
    </div>
  )
}
