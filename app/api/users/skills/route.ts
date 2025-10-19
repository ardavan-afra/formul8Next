import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: { skills: true }
    })

    const allSkills = users
      .flatMap(user => user.skills)
      .filter(Boolean)
      .filter((skill, index, array) => array.indexOf(skill) === index) // Remove duplicates
      .sort()

    return NextResponse.json({
      success: true,
      data: { skills: allSkills }
    })
  } catch (error) {
    console.error('Get skills error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
