import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { UserRole } from '@prisma/client'

type RouteParams = { id: string }

export const DELETE = requireRole<RouteParams>([UserRole.student])(
  async (request: NextRequest, user, context) => {
    try {
      const params = context?.params
      if (!params?.id) {
        return NextResponse.json(
          { error: 'Application ID is required' },
          { status: 400 }
        )
      }

      const application = await prisma.application.findUnique({
        where: { id: params.id }
      })

      if (!application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        )
      }

      if (application.studentId !== user.id) {
        return NextResponse.json(
          { error: 'Not authorized to withdraw this application' },
          { status: 403 }
        )
      }

      if (application.status !== 'pending') {
        return NextResponse.json(
          { error: 'Cannot withdraw application that has been processed' },
          { status: 400 }
        )
      }

      await prisma.application.update({
        where: { id: params.id },
        data: { status: 'withdrawn' }
      })

      return NextResponse.json({
        success: true,
        data: { message: 'Application withdrawn successfully' }
      })
    } catch (error) {
      console.error('Withdraw application error:', error)
      return NextResponse.json(
        { error: 'Server error' },
        { status: 500 }
      )
    }
  }
)
