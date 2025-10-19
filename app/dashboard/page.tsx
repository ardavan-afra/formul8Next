'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from 'react-query'
import { 
  BookOpen, 
  Plus, 
  Search, 
  UserCheck, 
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import Navbar from '@/components/Navbar'

export default function Dashboard() {
  const { user } = useAuth()

  // Fetch recent projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery(
    'recent-projects',
    () => fetch('/api/projects?limit=6').then(res => res.json()),
    { staleTime: 5 * 60 * 1000 }
  )

  // Fetch user's applications (for students) or project applications (for professors)
  const { data: applicationsData, isLoading: applicationsLoading } = useQuery(
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

  const recentProjects = projectsData?.data?.projects || []
  const applications = applicationsData?.data?.applications || []

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getQuickActions = () => {
    if (user?.role === 'professor') {
      return [
        {
          title: 'Create New Project',
          description: 'Post a new research opportunity',
          icon: Plus,
          link: '/create-project',
          color: 'bg-primary-500'
        },
        {
          title: 'Manage Projects',
          description: 'View and edit your projects',
          icon: BookOpen,
          link: '/my-projects',
          color: 'bg-green-500'
        },
        {
          title: 'Review Applications',
          description: 'Check student applications',
          icon: UserCheck,
          link: '/applications',
          color: 'bg-blue-500'
        }
      ]
    } else {
      return [
        {
          title: 'Browse Projects',
          description: 'Find research opportunities',
          icon: Search,
          link: '/projects',
          color: 'bg-primary-500'
        },
        {
          title: 'My Applications',
          description: 'Track your applications',
          icon: UserCheck,
          link: '/applications',
          color: 'bg-green-500'
        },
        {
          title: 'Update Profile',
          description: 'Keep your profile current',
          icon: Users,
          link: '/profile',
          color: 'bg-blue-500'
        }
      ]
    }
  }

  const getStats = () => {
    if (user?.role === 'professor') {
      const pendingApplications = applications.filter((app: any) => app.status === 'pending').length
      const totalApplications = applications.length
      
      return [
        {
          label: 'Active Projects',
          value: recentProjects.filter((p: any) => p.professor.id === user.id && p.status === 'active').length,
          icon: BookOpen,
          color: 'text-blue-600'
        },
        {
          label: 'Pending Applications',
          value: pendingApplications,
          icon: UserCheck,
          color: 'text-yellow-600'
        },
        {
          label: 'Total Applications',
          value: totalApplications,
          icon: TrendingUp,
          color: 'text-green-600'
        }
      ]
    } else {
      const pendingApplications = applications.filter((app: any) => app.status === 'pending').length
      const acceptedApplications = applications.filter((app: any) => app.status === 'accepted').length
      
      return [
        {
          label: 'Applications Submitted',
          value: applications.length,
          icon: UserCheck,
          color: 'text-blue-600'
        },
        {
          label: 'Pending Reviews',
          value: pendingApplications,
          icon: Calendar,
          color: 'text-yellow-600'
        },
        {
          label: 'Accepted Projects',
          value: acceptedApplications,
          icon: TrendingUp,
          color: 'text-green-600'
        }
      ]
    }
  }

  if (projectsLoading || applicationsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner size="lg" className="mt-20" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="card">
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.role === 'professor' 
                ? 'Manage your research projects and review student applications.'
                : 'Discover exciting research opportunities and track your applications.'
              }
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getStats().map((stat, index) => (
              <div key={index} className="card">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getQuickActions().map((action, index) => (
                <Link
                  key={index}
                  href={action.link}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className={`p-3 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
              <Link
                href="/projects"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all projects
              </Link>
            </div>
            
            {recentProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentProjects.slice(0, 6).map((project: any) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {project.department}
                      </span>
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No projects available at the moment.</p>
            )}
          </div>

          {/* Recent Applications (if any) */}
          {applications.length > 0 && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {user?.role === 'professor' ? 'Recent Applications' : 'My Applications'}
                </h2>
                <Link
                  href="/applications"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all applications
                </Link>
              </div>
              
              <div className="space-y-3">
                {applications.slice(0, 3).map((application: any) => (
                  <div key={application.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {user?.role === 'professor' 
                          ? `${application.student?.name} - ${application.project?.title}`
                          : application.project?.title
                        }
                      </h4>
                      <p className="text-sm text-gray-500">
                        Applied on {new Date(application.applicationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`badge ${
                      application.status === 'pending' ? 'badge-warning' :
                      application.status === 'accepted' ? 'badge-success' :
                      application.status === 'rejected' ? 'badge-danger' :
                      'badge-primary'
                    }`}>
                      {application.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
