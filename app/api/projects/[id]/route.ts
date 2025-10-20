import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { updateProjectSchema } from '@/lib/validations'
import { UserRole } from '@prisma/client'

export const dynamic = 'force-dynamic'

type RouteParams = { id: string }

export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
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
        requirements: true,
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

export const PUT = requireRole<RouteParams>([UserRole.professor])(
  async (request: NextRequest, user, context) => {
    try {
      const params = context?.params
      if (!params?.id) {
        return NextResponse.json(
          { error: 'Project ID is required' },
          { status: 400 }
        )
      }

      const body = await request.json()
      const validatedData = updateProjectSchema.parse(body)

      // Ensure project exists and belongs to the requesting professor
      const existingProject = await prisma.project.findUnique({
        where: { id: params.id },
        include: { requirements: true }
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

      const {
        materials,
        requirements,
        applicationDeadline,
        startDate,
        endDate,
        skills,
        tags,
        maxStudents,
        ...rest
      } = validatedData

      const updateData: any = {}

      if (rest.title !== undefined) updateData.title = rest.title
      if (rest.description !== undefined) updateData.description = rest.description
      if (rest.department !== undefined) updateData.department = rest.department
      if (rest.duration !== undefined) updateData.duration = rest.duration
      if (rest.timeCommitment !== undefined) updateData.timeCommitment = rest.timeCommitment
      if (rest.compensation !== undefined) updateData.compensation = rest.compensation
      if (rest.compensationAmount !== undefined) updateData.compensationAmount = rest.compensationAmount
      if (skills !== undefined) {
        updateData.skills = skills
      }

      if (tags !== undefined) {
        updateData.tags = tags
      }

      if (typeof maxStudents === 'number') {
        updateData.maxStudents = maxStudents
      }

      if (applicationDeadline !== undefined) {
        updateData.applicationDeadline = applicationDeadline
          ? new Date(applicationDeadline)
          : null
      }

      if (startDate !== undefined) {
        updateData.startDate = startDate ? new Date(startDate) : null
      }

      if (endDate !== undefined) {
        updateData.endDate = endDate ? new Date(endDate) : null
      }

      if (materials !== undefined) {
        updateData.materials = {
          deleteMany: {},
          create: materials.map(material => ({
            name: material.name,
            type: material.type,
            url: material.url,
            description: material.description
          }))
        }
      }

      if (requirements !== undefined) {
        const hasRequirements =
          (requirements?.gpa ?? undefined) !== undefined ||
          (requirements?.year && requirements.year.length > 0) ||
          (requirements?.prerequisites && requirements.prerequisites.length > 0)

        updateData.requirements = hasRequirements
          ? {
              upsert: {
                update: {
                  gpa: requirements?.gpa,
                  year: requirements?.year ?? [],
                  prerequisites: requirements?.prerequisites ?? []
                },
                create: {
                  gpa: requirements?.gpa,
                  year: requirements?.year ?? [],
                  prerequisites: requirements?.prerequisites ?? []
                }
              }
            }
          : { delete: true }
      }

      const project = await prisma.project.update({
        where: { id: params.id },
        data: updateData,
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
)

export const DELETE = requireRole<RouteParams>([UserRole.professor])(
  async (request: NextRequest, user, context) => {
    try {
      const params = context?.params
      if (!params?.id) {
        return NextResponse.json(
          { error: 'Project ID is required' },
          { status: 400 }
        )
      }

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

      await prisma.$transaction([
        prisma.application.deleteMany({ where: { projectId: params.id } }),
        prisma.project.delete({ where: { id: params.id } })
      ])

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
)
