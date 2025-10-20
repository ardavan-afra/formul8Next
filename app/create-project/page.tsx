'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from 'react-query'
import { Plus, X, Upload } from 'lucide-react'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'

export default function CreateProjectPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { token } = useAuth()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    skills: [] as string[],
    requirements: {
      gpa: '',
      year: [] as string[],
      prerequisites: [] as string[]
    },
    duration: '',
    timeCommitment: '',
    compensation: 'unpaid',
    compensationAmount: '',
    maxStudents: 1,
    applicationDeadline: '',
    startDate: '',
    endDate: '',
    tags: [] as string[]
  })

  const [materials, setMaterials] = useState([] as any[])
  const [newSkill, setNewSkill] = useState('')
  const [newPrerequisite, setNewPrerequisite] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    type: 'document',
    url: '',
    description: ''
  })

  const createProjectMutation = useMutation(
    (projectData: any) => fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(projectData)
    }).then(res => res.json()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects')
        queryClient.invalidateQueries('recent-projects')
        router.push('/my-projects')
      }
    }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleArrayChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !formData.requirements.prerequisites.includes(newPrerequisite.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          prerequisites: [...prev.requirements.prerequisites, newPrerequisite.trim()]
        }
      }))
      setNewPrerequisite('')
    }
  }

  const removePrerequisite = (prereqToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        prerequisites: prev.requirements.prerequisites.filter(prereq => prereq !== prereqToRemove)
      }
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addMaterial = () => {
    if (newMaterial.name.trim() && newMaterial.url.trim()) {
      setMaterials(prev => [...prev, { ...newMaterial }])
      setNewMaterial({
        name: '',
        type: 'document',
        url: '',
        description: ''
      })
    }
  }

  const removeMaterial = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      router.push('/login')
      return
    }
    
    const projectData = {
      ...formData,
      materials,
      requirements: {
        ...formData.requirements,
        gpa: formData.requirements.gpa ? parseFloat(formData.requirements.gpa) : undefined
      },
      maxStudents: parseInt(formData.maxStudents.toString()),
      applicationDeadline: formData.applicationDeadline || undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined
    }

    createProjectMutation.mutate(projectData)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="card">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Project</h1>
            <p className="text-gray-600">
              Create a new research project for students to discover and apply to.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="input-field"
                    placeholder="Enter project title"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    required
                    className="input-field"
                    placeholder="e.g., Computer Science"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Students *
                  </label>
                  <input
                    type="number"
                    id="maxStudents"
                    name="maxStudents"
                    required
                    min="1"
                    className="input-field"
                    value={formData.maxStudents}
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    className="input-field"
                    placeholder="Describe the project, its goals, and what students will be working on..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:text-primary-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a skill"
                  className="input-field flex-1"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="btn-secondary flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Requirements */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="requirements.gpa" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum GPA (Optional)
                  </label>
                  <input
                    type="number"
                    id="requirements.gpa"
                    name="requirements.gpa"
                    step="0.01"
                    min="0"
                    max="4"
                    className="input-field"
                    placeholder="3.0"
                    value={formData.requirements.gpa}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year (Optional)
                  </label>
                  <div className="space-y-2">
                    {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'].map((year) => (
                      <label key={year} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.requirements.year.includes(year)}
                          onChange={(e) => {
                            const newYears = e.target.checked
                              ? [...formData.requirements.year, year]
                              : formData.requirements.year.filter(y => y !== year)
                            handleArrayChange('requirements', { ...formData.requirements, year: newYears })
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{year}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prerequisites
                </label>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.requirements.prerequisites.map((prereq, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      {prereq}
                      <button
                        type="button"
                        onClick={() => removePrerequisite(prereq)}
                        className="ml-2 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add a prerequisite"
                    className="input-field flex-1"
                    value={newPrerequisite}
                    onChange={(e) => setNewPrerequisite(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                  />
                  <button
                    type="button"
                    onClick={addPrerequisite}
                    className="btn-secondary flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    required
                    className="input-field"
                    placeholder="e.g., 3 months, 1 semester"
                    value={formData.duration}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="timeCommitment" className="block text-sm font-medium text-gray-700 mb-2">
                    Time Commitment *
                  </label>
                  <input
                    type="text"
                    id="timeCommitment"
                    name="timeCommitment"
                    required
                    className="input-field"
                    placeholder="e.g., 10 hours/week"
                    value={formData.timeCommitment}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="compensation" className="block text-sm font-medium text-gray-700 mb-2">
                    Compensation
                  </label>
                  <select
                    id="compensation"
                    name="compensation"
                    className="input-field"
                    value={formData.compensation}
                    onChange={handleChange}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="stipend">Stipend</option>
                    <option value="course_credit">Course Credit</option>
                    <option value="hourly">Hourly Pay</option>
                  </select>
                </div>

                {formData.compensation !== 'unpaid' && formData.compensation !== 'course_credit' && (
                  <div>
                    <label htmlFor="compensationAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <input
                      type="text"
                      id="compensationAmount"
                      name="compensationAmount"
                      className="input-field"
                      placeholder={formData.compensation === 'hourly' ? '15' : '1000'}
                      value={formData.compensationAmount}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className="input-field"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    id="applicationDeadline"
                    name="applicationDeadline"
                    className="input-field"
                    value={formData.applicationDeadline}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Materials */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Materials</h2>
              
              {materials.length > 0 && (
                <div className="space-y-3 mb-4">
                  {materials.map((material, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{material.name}</h4>
                        <p className="text-sm text-gray-600">{material.description}</p>
                        <p className="text-xs text-gray-500">{material.url}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Document name"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    className="input-field"
                    value={newMaterial.type}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="document">Document</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="link">Link</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://example.com/document.pdf"
                    value={newMaterial.url}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Brief description of the material"
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addMaterial}
                className="btn-secondary flex items-center space-x-2 mt-4"
              >
                <Plus className="h-4 w-4" />
                <span>Add Material</span>
              </button>
            </div>

            {/* Tags */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a tag"
                  className="input-field flex-1"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn-secondary flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="card">
              {createProjectMutation.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                  {createProjectMutation.error.response?.data?.message || 'Failed to create project'}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/my-projects')}
                  className="btn-secondary"
                  disabled={createProjectMutation.isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProjectMutation.isLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {createProjectMutation.isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Create Project</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
