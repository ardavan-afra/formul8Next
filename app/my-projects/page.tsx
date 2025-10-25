'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Calendar,
  Clock,
  MapPin,
  Tag,
  MoreVertical
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatDate, getStatusBadgeClass } from '@/lib/utils'
import Link from 'next/link'

export default function MyProjectsPage() {
  const { user, token } = useAuth()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')

  // Fetch professor's projects
  const queryKey = ['professor-projects', user?.id]

  const { data: projectsData, isLoading, error } = useQuery(
    queryKey,
    () => fetch('/api/projects/professor/my-projects', {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }).then(res => res.json()),
    { 
      enabled: user?.role === 'professor' && !!token && !!user?.id,
      staleTime: 2 * 60 * 1000 
    }
  )

  // Delete project mutation
  const deleteProjectMutation = useMutation(
    (projectId: string) => fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['professor-projects'])
        queryClient.invalidateQueries('recent-projects')
      }
    }
  )

  const projects = projectsData?.data?.projects || []

  const filteredProjects = projects.filter((project: any) => {
    if (filter === 'all') return true
    return project.status === filter
  })

  const handleDelete = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProjectMutation.mutate(projectId)
    }
  }

  if (user?.role !== 'professor') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600">Access denied. This page is for professors only.</p>
          </div>
        </div>
      </div>
    )
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
          <p className="text-red-600">Error loading projects. Please try again.</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My Projects</h1>
                <p className="text-gray-600">Manage your research projects and track applications.</p>
              </div>
              <Link
                href="/create-project"
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Project</span>
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="card">
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            </div>
            <div className="flex space-x-2">
              {['all', 'active', 'paused', 'completed', 'cancelled'].map((status) => (
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

          {/* Projects List */}
          <div className="card">
            {filteredProjects.length > 0 ? (
              <div className="space-y-4">
                {filteredProjects.map((project: any) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                          <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{project.department}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{project.currentStudents}/{project.maxStudents} students</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{project.timeCommitment}</span>
                          </div>
                          {project.startDate && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Starts {formatDate(project.startDate)}</span>
                            </div>
                          )}
                        </div>

                        {project.skills && project.skills.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center mb-2">
                              <Tag className="h-4 w-4 mr-1 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Skills:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {project.skills.slice(0, 3).map((skill: string, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {skill}
                                </span>
                              ))}
                              {project.skills.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  +{project.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-2 sm:gap-0 sm:ml-4 w-full sm:w-auto">
                        <Link
                          href={`/projects/${project.id}`}
                          className="btn-secondary flex items-center justify-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Link>
                        <Link
                          href={`/edit-project/${project.id}`}
                          className="btn-primary flex items-center justify-center space-x-1"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="btn-danger flex items-center justify-center space-x-1"
                          disabled={deleteProjectMutation.isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Applications Summary */}
                    {project.applications && project.applications.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{project.applications.length} application{project.applications.length !== 1 ? 's' : ''}</span>
                            <span>
                              {project.applications.filter((app: any) => app.status === 'pending').length} pending
                            </span>
                            <span>
                              {project.applications.filter((app: any) => app.status === 'accepted').length} accepted
                            </span>
                          </div>
                          <Link
                            href="/applications"
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            View Applications
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'No projects found' : `No ${filter} projects found`}
                </h3>
                <p className="text-gray-500 mb-4">
                  {filter === 'all' 
                    ? 'You haven\'t created any projects yet.'
                    : `You don't have any ${filter} projects.`
                  }
                </p>
                <Link
                  href="/create-project"
                  className="btn-primary flex items-center space-x-2 mx-auto w-fit"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Your First Project</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
