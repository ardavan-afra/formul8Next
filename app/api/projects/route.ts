import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { createProjectSchema, projectFiltersSchema } from '@/lib/validations'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get('search') || undefined,
      department: searchParams.get('department') || undefined,
      skills: searchParams.get('skills') || undefined,
      status: searchParams.get('status') as any || 'active',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10')
    }

    const validatedFilters = projectFiltersSchema.parse(filters)

    // Build query
    let where: any = {}

    if (validatedFilters.status) {
      where.status = validatedFilters.status
    }

    if (validatedFilters.department) {
      where.department = {
        contains: validatedFilters.department,
        mode: 'insensitive'
      }
    }

    if (validatedFilters.skills) {
      where.skills = {
        has: validatedFilters.skills
      }
    }

    if (validatedFilters.search) {
      where.OR = [
        { title: { contains: validatedFilters.search, mode: 'insensitive' } },
        { description: { contains: validatedFilters.search, mode: 'insensitive' } },
        { department: { contains: validatedFilters.search, mode: 'insensitive' } },
        { skills: { has: validatedFilters.search } },
        { tags: { has: validatedFilters.search } }
      ]
    }

    // Get projects with pagination
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          professor: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true
            }
          },
          requirements: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (validatedFilters.page - 1) * validatedFilters.limit,
        take: validatedFilters.limit
      }),
      prisma.project.count({ where })
    ])

    const totalPages = Math.ceil(total / validatedFilters.limit)

    return NextResponse.json({
      success: true,
      data: {
        projects,
        totalPages,
        currentPage: validatedFilters.page,
        total
      }
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export const POST = requireRole([UserRole.professor])(async (request, user) => {
  try {
    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    const {
      materials,
      requirements,
      applicationDeadline,
      startDate,
      endDate,
      skills,
      tags,
      maxStudents,
      ...projectFields
    } = validatedData

    const hasRequirements =
      !!requirements &&
      (typeof requirements.gpa === 'number' ||
        (requirements.year && requirements.year.length > 0) ||
        (requirements.prerequisites && requirements.prerequisites.length > 0))

    const project = await prisma.project.create({
      data: {
        ...projectFields,
        professorId: user.id,
        skills: skills ?? [],
        tags: tags ?? [],
        maxStudents: maxStudents ?? 1,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        materials: materials && materials.length > 0
          ? {
              create: materials.map(material => ({
                name: material.name,
                type: material.type,
                url: material.url,
                description: material.description
              }))
            }
          : undefined,
        requirements: hasRequirements
          ? {
              create: {
                gpa: requirements?.gpa,
                year: requirements?.year ?? [],
                prerequisites: requirements?.prerequisites ?? []
              }
            }
          : undefined
      },
      include: {
        professor: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        },
        materials: true,
        requirements: true
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: { project }
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
})
