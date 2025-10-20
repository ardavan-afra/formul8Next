import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export const GET = requireRole([UserRole.professor])(async (request: NextRequest, user) => {
  try {
    const projects = await prisma.project.findMany({
      where: { professorId: user.id },
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: { projects }
    })
  } catch (error) {
    console.error('Get professor projects error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
})
