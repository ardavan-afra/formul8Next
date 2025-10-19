import { z } from 'zod'

// User validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['professor', 'student']),
  department: z.string().min(2, 'Department is required'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  gpa: z.number().min(0).max(4.0).optional(),
  year: z.enum(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']).optional()
})

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required')
})

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  gpa: z.number().min(0).max(4.0).optional(),
  year: z.enum(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']).optional(),
  avatar: z.string().optional()
})

// Project validation schemas
export const createProjectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000, 'Description must be less than 2000 characters'),
  department: z.string().min(2, 'Department is required'),
  skills: z.array(z.string()).optional(),
  requirements: z.object({
    gpa: z.number().min(0).max(4.0).optional(),
    year: z.array(z.enum(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'])).optional(),
    prerequisites: z.array(z.string()).optional()
  }).optional(),
  duration: z.string().min(1, 'Duration is required'),
  timeCommitment: z.string().min(1, 'Time commitment is required'),
  compensation: z.enum(['unpaid', 'stipend', 'course_credit', 'hourly']).optional(),
  compensationAmount: z.string().optional(),
  maxStudents: z.number().min(1, 'Maximum students must be at least 1').optional(),
  materials: z.array(z.object({
    name: z.string().min(1, 'Material name is required'),
    type: z.enum(['document', 'image', 'video', 'link', 'other']),
    url: z.string().url('Please provide a valid URL'),
    description: z.string().optional()
  })).optional(),
  tags: z.array(z.string()).optional(),
  applicationDeadline: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export const updateProjectSchema = createProjectSchema.partial()

export const projectFiltersSchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  skills: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(50).optional()
})

// Application validation schemas
export const createApplicationSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters').max(1000, 'Cover letter must be less than 1000 characters'),
  relevantExperience: z.string().max(1000, 'Relevant experience must be less than 1000 characters').optional(),
  motivation: z.string().min(50, 'Motivation must be at least 50 characters').max(1000, 'Motivation must be less than 1000 characters')
})

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
  professorNotes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
})

export const applicationFiltersSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']).optional(),
  projectId: z.string().optional(),
  studentId: z.string().optional(),
  professorId: z.string().optional()
})

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type ProjectFiltersInput = z.infer<typeof projectFiltersSchema>
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>
export type ApplicationFiltersInput = z.infer<typeof applicationFiltersSchema>
