import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, requireAuth, requireRole } from '@/lib/auth'
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

export const POST = requireRole([UserRole.professor])(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    // Create project with materials
    const project = await prisma.project.create({
      data: {
        ...validatedData,
        professorId: user.id,
        materials: {
          create: validatedData.materials || []
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
})

export const PUT = requireRole([UserRole.professor])(async (request: NextRequest, user) => {
  try {
    const { params } = await import('./route')
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

    // Update project
    const project = await prisma.project.update({
      where: { id: params.id },
      data: validatedData,
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
})

export const DELETE = requireRole([UserRole.professor])(async (request: NextRequest, user) => {
  try {
    const { params } = await import('./route')

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
})
