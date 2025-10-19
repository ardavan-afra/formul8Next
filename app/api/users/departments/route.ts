import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const departments = await prisma.user.findMany({
      select: { department: true },
      distinct: ['department']
    })

    const departmentList = departments
      .map(d => d.department)
      .filter(Boolean)
      .sort()

    return NextResponse.json({
      success: true,
      data: { departments: departmentList }
    })
  } catch (error) {
    console.error('Get departments error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
