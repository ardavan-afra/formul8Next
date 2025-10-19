import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { projectFiltersSchema } from '@/lib/validations'

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
          }
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
