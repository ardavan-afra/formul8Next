'use client'

import React from 'react'
import Link from 'next/link'
import { Calendar, Clock, Users, MapPin, Tag } from 'lucide-react'
import { getStatusBadgeClass, formatDate } from '@/lib/utils'

interface ProjectCardProps {
  project: {
    id: string
    title: string
    description: string
    department: string
    skills: string[]
    status: string
    currentStudents: number
    maxStudents: number
    timeCommitment: string
    startDate?: string
    professor: {
      name: string
    }
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {project.title}
        </h3>
        <span className={`badge ${getStatusBadgeClass(project.status)}`}>
          {project.status}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {project.description}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{project.department}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Users className="h-4 w-4 mr-2" />
          <span>{project.currentStudents}/{project.maxStudents} students</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-2" />
          <span>{project.timeCommitment}</span>
        </div>
        
        {project.startDate && (
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Starts {formatDate(project.startDate)}</span>
          </div>
        )}
      </div>

      {project.skills && project.skills.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Tag className="h-4 w-4 mr-1 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Skills:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {project.skills.slice(0, 3).map((skill, index) => (
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

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          by {project.professor.name}
        </div>
        <Link
          href={`/projects/${project.id}`}
          className="btn-primary text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
