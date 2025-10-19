import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export const GET = requireRole([UserRole.professor])(async (request: NextRequest, user) => {
  try {
    const applications = await prisma.application.findMany({
      where: { professorId: user.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            year: true,
            gpa: true,
            skills: true,
            interests: true
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
      },
      orderBy: { applicationDate: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: { applications }
    })
  } catch (error) {
    console.error('Get professor applications error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
})
