'use client'

import React, { useState } from 'react'
import { 
  X, 
  User, 
  Calendar, 
  FileText, 
  MessageSquare,
  Check,
  XCircle,
  Clock
} from 'lucide-react'
import { formatDate, getStatusBadgeClass } from '@/lib/utils'

interface ApplicationDetailModalProps {
  application: {
    id: string
    coverLetter: string
    relevantExperience?: string
    motivation: string
    status: string
    applicationDate: string
    responseDate?: string
    professorNotes?: string
    student: {
      name: string
      email: string
      department: string
      year?: string
      gpa?: number
      skills: string[]
    }
    project: {
      title: string
      description: string
      department: string
    }
    professor: {
      name: string
      email: string
    }
  }
  onClose: () => void
  onStatusUpdate: (id: string, status: string, notes?: string) => void
  isProfessor: boolean
}

export default function ApplicationDetailModal({ 
  application, 
  onClose, 
  onStatusUpdate, 
  isProfessor 
}: ApplicationDetailModalProps) {
  const [notes, setNotes] = useState(application.professorNotes || '')
  const [showNotes, setShowNotes] = useState(false)

  const handleStatusUpdate = (status: string) => {
    onStatusUpdate(application.id, status, notes)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
            <p className="text-sm text-gray-600">{application.project.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Application Status and Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`badge ${getStatusBadgeClass(application.status)}`}>
                {application.status}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Applied {formatDate(application.applicationDate)}</span>
              </div>
              {application.responseDate && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Responded {formatDate(application.responseDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Student Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Name</p>
                <p className="text-gray-900">{application.student.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-gray-900">{application.student.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Department</p>
                <p className="text-gray-900">{application.student.department}</p>
              </div>
              {application.student.year && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Academic Year</p>
                  <p className="text-gray-900">{application.student.year}</p>
                </div>
              )}
              {application.student.gpa && (
                <div>
                  <p className="text-sm font-medium text-gray-700">GPA</p>
                  <p className="text-gray-900">{application.student.gpa}</p>
                </div>
              )}
            </div>
            
            {application.student.skills && application.student.skills.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {application.student.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Application Content */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cover Letter</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
              </div>
            </div>

            {application.relevantExperience && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Relevant Experience</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{application.relevantExperience}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Motivation</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{application.motivation}</p>
              </div>
            </div>
          </div>

          {/* Professor Notes */}
          {isProfessor && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900">Professor Notes</h3>
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {showNotes ? 'Cancel' : 'Add/Edit Notes'}
                </button>
              </div>
              
              {showNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="input-field"
                    placeholder="Add notes about this application..."
                  />
                </div>
              ) : application.professorNotes ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{application.professorNotes}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No notes added yet.</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {isProfessor && application.status === 'pending' && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => handleStatusUpdate('rejected')}
                className="btn-danger flex items-center space-x-2"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => handleStatusUpdate('accepted')}
                className="btn-success flex items-center space-x-2"
              >
                <Check className="h-4 w-4" />
                <span>Accept</span>
              </button>
            </div>
          )}

          {!isProfessor && (
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
