import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { updateApplicationStatusSchema } from '@/lib/validations'
import { UserRole } from '@prisma/client'

export const dynamic = 'force-dynamic'

type RouteParams = { id: string }

export const PUT = requireRole<RouteParams>([UserRole.professor])(
  async (request: NextRequest, user, context) => {
    try {
      const params = context?.params
      if (!params?.id) {
        return NextResponse.json(
          { error: 'Application ID is required' },
          { status: 400 }
        )
      }

      const body = await request.json()
      const validatedData = updateApplicationStatusSchema.parse(body)

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

      if (application.professorId !== user.id) {
        return NextResponse.json(
          { error: 'Not authorized to update this application' },
          { status: 403 }
        )
      }

      if (
        validatedData.status === 'accepted' &&
        application.project.currentStudents >= application.project.maxStudents &&
        application.status !== 'accepted'
      ) {
        return NextResponse.json(
          { error: 'Project has reached maximum capacity' },
          { status: 400 }
        )
      }

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

      if (validatedData.status === 'accepted' && application.status !== 'accepted') {
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
)
