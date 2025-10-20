'use client'

import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Tag,
  Eye,
  XCircle,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import { getStatusBadgeClass, formatDate, formatDateTime } from '@/lib/utils'

export default function ApplicationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedApplication, setSelectedApplication] = useState<any>(null)

  // Fetch user's applications
  const { data: applicationsData, isLoading, error } = useQuery(
    'user-applications',
    () => {
      if (user?.role === 'student') {
        return fetch('/api/applications/student/my-applications').then(res => res.json())
      } else {
        return fetch('/api/applications/professor/my-project-applications').then(res => res.json())
      }
    },
    { 
      enabled: !!user,
      staleTime: 2 * 60 * 1000 
    }
  )

  const applications = applicationsData?.data?.applications || []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'withdrawn':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Congratulations! Your application has been accepted.'
      case 'rejected':
        return 'Unfortunately, your application was not selected this time.'
      case 'pending':
        return 'Your application is under review.'
      case 'withdrawn':
        return 'You have withdrawn your application.'
      default:
        return 'Application status unknown.'
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <div>Error loading applications</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === 'professor' ? 'Project Applications' : 'My Applications'}
              </h1>
              <p className="text-gray-600 mt-1">
                {user?.role === 'professor' 
                  ? 'Applications received for your projects'
                  : 'Track your project applications'
                }
              </p>
            </div>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {user?.role === 'professor' ? 'No Applications Yet' : 'No Applications'}
            </h3>
            <p className="text-gray-600 mb-6">
              {user?.role === 'professor' 
                ? 'Applications for your projects will appear here.'
                : 'You haven\'t applied to any projects yet.'
              }
            </p>
            {user?.role === 'student' && (
              <Link
                href="/projects"
                className="btn-primary"
              >
                Browse Projects
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Applications List */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {applications.map((application: any) => (
                  <div
                    key={application.id}
                    className={`card cursor-pointer transition-all duration-200 ${
                      selectedApplication?.id === application.id 
                        ? 'ring-2 ring-primary-500 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedApplication(application)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {user?.role === 'professor' 
                            ? `${application.student?.name} - ${application.project?.title}`
                            : application.project?.title
                          }
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Applied on {formatDate(application.applicationDate)}</span>
                        </div>
                        {application.responseDate && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Responded on {formatDate(application.responseDate)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(application.status)}
                        <span className={`badge ${getStatusBadgeClass(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {user?.role === 'professor' && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>{application.student?.department} • {application.student?.year}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{application.project?.department}</span>
                      </div>

                      {application.student?.skills && application.student.skills.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Tag className="h-4 w-4 mr-2" />
                          <span>{application.student.skills.slice(0, 3).join(', ')}</span>
                          {application.student.skills.length > 3 && (
                            <span className="text-gray-400">+{application.student.skills.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {user?.role === 'professor' 
                          ? `GPA: ${application.student?.gpa || 'N/A'}`
                          : `Professor: ${application.professor?.name}`
                        }
                      </div>
                      <button className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Details Sidebar */}
            <div className="lg:col-span-1">
              {selectedApplication ? (
                <div className="card sticky top-8">
                  <h3 className="text-lg font-semibold mb-4">Application Details</h3>
                  
                  <div className="space-y-6">
                    {/* Status */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedApplication.status)}
                        <span className={`badge ${getStatusBadgeClass(selectedApplication.status)}`}>
                          {selectedApplication.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {getStatusMessage(selectedApplication.status)}
                      </p>
                    </div>

                    {/* Application Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Application Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Applied:</span>
                          <span className="ml-2">{formatDateTime(selectedApplication.applicationDate)}</span>
                        </div>
                        {selectedApplication.responseDate && (
                          <div>
                            <span className="text-gray-600">Response:</span>
                            <span className="ml-2">{formatDateTime(selectedApplication.responseDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedApplication.coverLetter}
                        </p>
                      </div>
                    </div>

                    {/* Relevant Experience */}
                    {selectedApplication.relevantExperience && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Relevant Experience</h4>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {selectedApplication.relevantExperience}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Motivation */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Motivation</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedApplication.motivation}
                        </p>
                      </div>
                    </div>

                    {/* Professor Notes */}
                    {selectedApplication.professorNotes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Professor Notes</h4>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {selectedApplication.professorNotes}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {user?.role === 'student' && selectedApplication.status === 'pending' && (
                      <div className="pt-4 border-t">
                        <button className="btn-danger w-full">
                          Withdraw Application
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select an Application
                    </h3>
                    <p className="text-gray-600">
                      Click on an application to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
