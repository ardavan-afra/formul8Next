import { User, Project, Application, UserRole, ProjectStatus, ApplicationStatus, AcademicYear, CompensationType, MaterialType } from '@prisma/client'

export type { User, Project, Application, UserRole, ProjectStatus, ApplicationStatus, AcademicYear, CompensationType, MaterialType }

export interface UserWithRelations extends User {
  projectsCreated?: Project[]
  applicationsSent?: Application[]
  applicationsReceived?: Application[]
}

export interface ProjectWithRelations extends Project {
  professor: User
  applications?: Application[]
  materials?: Material[]
}

export interface ApplicationWithRelations extends Application {
  student: User
  project: Project
  professor: User
}

export interface Material {
  id: string
  projectId: string
  name: string
  type: MaterialType
  url: string
  description?: string
}

export interface ProjectRequirements {
  id: string
  projectId: string
  gpa?: number
  year: AcademicYear[]
  prerequisites: string[]
}

export interface CreateProjectData {
  title: string
  description: string
  department: string
  skills: string[]
  requirements: {
    gpa?: number
    year: AcademicYear[]
    prerequisites: string[]
  }
  duration: string
  timeCommitment: string
  compensation: CompensationType
  compensationAmount?: string
  maxStudents: number
  materials: Omit<Material, 'id' | 'projectId'>[]
  tags: string[]
  applicationDeadline?: string
  startDate?: string
  endDate?: string
}

export interface CreateApplicationData {
  projectId: string
  coverLetter: string
  relevantExperience?: string
  motivation: string
}

export interface UpdateApplicationStatusData {
  status: ApplicationStatus
  professorNotes?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  totalPages: number
  currentPage: number
  total: number
}

export interface ProjectFilters {
  search?: string
  department?: string
  skills?: string
  status?: ProjectStatus
  page?: number
  limit?: number
}

export interface ApplicationFilters {
  status?: ApplicationStatus
  projectId?: string
  studentId?: string
  professorId?: string
}
