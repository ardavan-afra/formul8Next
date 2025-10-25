'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Eye, 
  Check, 
  X, 
  User, 
  Calendar, 
  FileText,
  MessageSquare,
  Clock,
  Filter
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import ApplicationDetailModal from '@/components/ApplicationDetailModal'
import { formatDate, getStatusBadgeClass } from '@/lib/utils'

export default function ApplicationsPage() {
  const { user, token } = useAuth()
  const queryClient = useQueryClient()
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [filter, setFilter] = useState('all')

  // Fetch applications based on user role
  const applicationsQueryKey = ['user-applications', user?.id, user?.role]

  const { data: applicationsData, isLoading, error } = useQuery(
    applicationsQueryKey,
    () => {
      if (!user || !token) return Promise.resolve(null)

      const endpoint = user.role === 'student'
        ? '/api/applications/student/my-applications'
        : '/api/applications/professor/my-project-applications'

      return fetch(endpoint, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      }).then(res => res.json())
    },
    { 
      enabled: !!user && !!token,
      staleTime: 2 * 60 * 1000 
    }
  )

  // Update application status mutation
  const updateStatusMutation = useMutation(
    ({ applicationId, status, notes }: any) => 
      fetch(`/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status, professorNotes: notes })
      }).then(res => res.json()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user-applications'])
        setSelectedApplication(null)
      }
    }
  )

  const applications = applicationsData?.data?.applications || []

  const filteredApplications = applications.filter((application: any) => {
    if (filter === 'all') return true
    return application.status === filter
  })

  const handleStatusUpdate = (applicationId: string, status: string, notes = '') => {
    if (!token) return
    updateStatusMutation.mutate({ applicationId, status, notes })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-warning'
      case 'accepted':
        return 'badge-success'
      case 'rejected':
        return 'badge-danger'
      case 'withdrawn':
        return 'badge-primary'
      default:
        return 'badge-primary'
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-12">
          <p className="text-red-600">Error loading applications. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="card">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {user?.role === 'professor' ? 'Project Applications' : 'My Applications'}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'professor' 
                ? 'Review and manage applications for your research projects.'
                : 'Track the status of your research project applications.'
              }
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="card">
            <div className="flex items-center space-x-4 mb-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            </div>
            <div className="flex space-x-2">
              {['all', 'pending', 'accepted', 'rejected', 'withdrawn'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    filter === status
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Applications List */}
          <div className="card">
            {filteredApplications.length > 0 ? (
              <div className="space-y-4">
                {filteredApplications.map((application: any) => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {user?.role === 'professor' 
                              ? `${application.student.name} - ${application.project.title}`
                              : application.project.title
                            }
                          </h3>
                          <span className={`badge ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Applied {formatDate(application.applicationDate)}</span>
                          </div>
                          {application.responseDate && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>Responded {formatDate(application.responseDate)}</span>
                            </div>
                          )}
                        </div>

                        {user?.role === 'professor' && (
                          <div className="text-sm text-gray-600">
                            <p><strong>Department:</strong> {application.student.department}</p>
                            {application.student.year && (
                              <p><strong>Year:</strong> {application.student.year}</p>
                            )}
                            {application.student.gpa && (
                              <p><strong>GPA:</strong> {application.student.gpa}</p>
                            )}
                          </div>
                        )}

                        {application.professorNotes && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <MessageSquare className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Professor Notes:</span>
                            </div>
                            <p className="text-sm text-gray-600">{application.professorNotes}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-2 sm:gap-0 w-full sm:w-auto">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="btn-secondary flex items-center justify-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>

                        {user?.role === 'professor' && application.status === 'pending' && (
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-2 sm:gap-0 w-full sm:w-auto">
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'accepted')}
                              className="btn-success flex items-center justify-center space-x-1"
                            >
                              <Check className="h-4 w-4" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'rejected')}
                              className="btn-danger flex items-center justify-center space-x-1"
                            >
                              <X className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'No applications found' : `No ${filter} applications found`}
                </h3>
                <p className="text-gray-500">
                  {user?.role === 'professor' 
                    ? 'Applications for your projects will appear here.'
                    : 'Your applications will appear here once you apply to projects.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onStatusUpdate={handleStatusUpdate}
          isProfessor={user?.role === 'professor'}
        />
      )}
    </div>
  )
}
