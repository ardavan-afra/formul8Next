import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { updateApplicationStatusSchema } from '@/lib/validations'
import { UserRole } from '@prisma/client'

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
    const validatedData = updateApplicationStatusSchema.parse(body)

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: { project: true }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if professor owns the project
    if (application.professorId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this application' },
        { status: 403 }
      )
    }

    // If accepting, check if project has capacity
    if (validatedData.status === 'accepted') {
      if (application.project.currentStudents >= application.project.maxStudents) {
        return NextResponse.json(
          { error: 'Project has reached maximum capacity' },
          { status: 400 }
        )
      }
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: params.id },
      data: {
        status: validatedData.status,
        professorNotes: validatedData.professorNotes,
        responseDate: new Date()
      },
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
        },
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            department: true
          }
        },
        professor: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        }
      }
    })

    // Update project student count if accepted
    if (validatedData.status === 'accepted') {
      await prisma.project.update({
        where: { id: application.projectId },
        data: {
          currentStudents: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: { application: updatedApplication }
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update application status error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
