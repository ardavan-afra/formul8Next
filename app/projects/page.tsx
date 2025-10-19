'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { Search, Filter, X, MapPin, Tag } from 'lucide-react'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import ProjectCard from '@/components/ProjectCard'

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    department: '',
    skills: '',
    status: 'active'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch departments and skills for filter options
  const { data: departmentsData } = useQuery(
    'departments',
    () => fetch('/api/users/departments').then(res => res.json()),
    { staleTime: 10 * 60 * 1000 }
  )

  const { data: skillsData } = useQuery(
    'skills',
    () => fetch('/api/users/skills').then(res => res.json()),
    { staleTime: 10 * 60 * 1000 }
  )

  // Build query parameters
  const queryParams = new URLSearchParams()
  if (searchTerm) queryParams.append('search', searchTerm)
  if (filters.department) queryParams.append('department', filters.department)
  if (filters.skills) queryParams.append('skills', filters.skills)
  if (filters.status) queryParams.append('status', filters.status)
  queryParams.append('page', currentPage.toString())
  queryParams.append('limit', '12')

  // Fetch projects
  const { data: projectsData, isLoading, error } = useQuery(
    ['projects', queryParams.toString()],
    () => fetch(`/api/projects?${queryParams.toString()}`).then(res => res.json()),
    { 
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000 
    }
  )

  const projects = projectsData?.data?.projects || []
  const totalPages = projectsData?.data?.totalPages || 1
  const total = projectsData?.data?.total || 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      department: '',
      skills: '',
      status: 'active'
    })
    setSearchTerm('')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || filters.department || filters.skills || filters.status !== 'active'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="card">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Research Projects</h1>
            <p className="text-gray-600">
              Discover exciting research opportunities and find projects that match your interests and skills.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="card">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search projects by title, description, or keywords..."
                  className="input-field pl-10 pr-4"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <Search className="h-5 w-5 text-gray-400 hover:text-primary-600" />
                </button>
              </div>
            </form>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                  <span>Clear filters</span>
                </button>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Departments</option>
                    {departmentsData?.data?.departments?.map((dept: string) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Skills Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills
                  </label>
                  <select
                    value={filters.skills}
                    onChange={(e) => handleFilterChange('skills', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Skills</option>
                    {skillsData?.data?.skills?.map((skill: string) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-4">
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 hover:text-primary-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.department && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                    <MapPin className="h-3 w-3 mr-1" />
                    {filters.department}
                    <button
                      onClick={() => handleFilterChange('department', '')}
                      className="ml-2 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.skills && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                    <Tag className="h-3 w-3 mr-1" />
                    {filters.skills}
                    <button
                      onClick={() => handleFilterChange('skills', '')}
                      className="ml-2 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.status !== 'active' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                    Status: {filters.status}
                    <button
                      onClick={() => handleFilterChange('status', 'active')}
                      className="ml-2 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {isLoading ? 'Loading...' : `${total} project${total !== 1 ? 's' : ''} found`}
              </h2>
            </div>

            {isLoading ? (
              <LoadingSpinner size="lg" className="py-12" />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Error loading projects. Please try again.</p>
              </div>
            ) : projects.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project: any) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg ${
                              currentPage === pageNum
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No projects found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear filters to see all projects
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
