import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (user.role !== UserRole.student) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id: params.id }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if student owns the application
    if (application.studentId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to withdraw this application' },
        { status: 403 }
      )
    }

    // Check if application is still pending
    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot withdraw application that has been processed' },
        { status: 400 }
      )
    }

    // Update application status to withdrawn
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
