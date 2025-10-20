import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { projectFiltersSchema, createProjectSchema } from '@/lib/validations'
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
          materials: true,
          requirements: true
        },
        orderBy: { createdAt: 'desc' },
        skip: ((validatedFilters.page || 1) - 1) * (validatedFilters.limit || 10),
        take: validatedFilters.limit || 10
      }),
      prisma.project.count({ where })
    ])

    const totalPages = Math.ceil(total / (validatedFilters.limit || 10))

    return NextResponse.json({
      success: true,
      data: {
        projects,
        totalPages,
        currentPage: validatedFilters.page || 1,
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

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (user.role !== UserRole.professor) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    // Extract nested objects for separate handling
    const { requirements, materials, ...projectData } = validatedData

    // Create project with materials
    const project = await prisma.project.create({
      data: {
        ...projectData,
        professorId: user.id,
        ...(requirements && {
          requirements: {
            create: requirements
          }
        }),
        materials: {
          create: materials || []
        }
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
        materials: true
      }
    })

    return NextResponse.json({
      success: true,
      data: { project }
    }, { status: 201 })
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
}
