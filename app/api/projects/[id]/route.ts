import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { createProjectSchema, updateProjectSchema } from '@/lib/validations'
import { UserRole } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        professor: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            bio: true
          }
        },
        materials: true,
        applications: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
                year: true,
                gpa: true,
                skills: true
              }
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { project }
    })
  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (user.role !== UserRole.professor) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }
  try {
    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

    // Check if project exists and user owns it
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (existingProject.professorId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this project' },
        { status: 403 }
      )
    }

    // Extract nested objects for separate handling
    const { requirements, materials, ...projectData } = validatedData

    // Update project
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...projectData,
        ...(requirements && {
          requirements: {
            upsert: {
              create: requirements,
              update: requirements
            }
          }
        }),
        ...(materials && {
          materials: {
            deleteMany: {},
            create: materials
          }
        })
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
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update project error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (user.role !== UserRole.professor) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }
  try {

    // Check if project exists and user owns it
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (existingProject.professorId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this project' },
        { status: 403 }
      )
    }

    // Delete project (cascade will handle related records)
    await prisma.project.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Project deleted successfully' }
    })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
