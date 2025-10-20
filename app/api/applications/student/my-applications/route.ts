import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export const dynamic = 'force-dynamic'

export const GET = requireRole([UserRole.student])(async (request: NextRequest, user) => {
  try {
    const applications = await prisma.application.findMany({
      where: { studentId: user.id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            department: true,
            status: true
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
    console.error('Get student applications error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
})
