import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { createApplicationSchema } from '@/lib/validations'
import { UserRole } from '@prisma/client'

export const POST = requireRole([UserRole.student])(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const validatedData = createApplicationSchema.parse(body)

    // Check if project exists and is active
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.status !== 'active') {
      return NextResponse.json(
        { error: 'Project is not accepting applications' },
        { status: 400 }
      )
    }

    // Check if application deadline has passed
    if (project.applicationDeadline && new Date() > project.applicationDeadline) {
      return NextResponse.json(
        { error: 'Application deadline has passed' },
        { status: 400 }
      )
    }

    // Check if student has already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_projectId: {
          studentId: user.id,
          projectId: validatedData.projectId
        }
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this project' },
        { status: 400 }
      )
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        ...validatedData,
        studentId: user.id,
        professorId: project.professorId
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

    return NextResponse.json({
      success: true,
      data: { application }
    }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Submit application error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
})
