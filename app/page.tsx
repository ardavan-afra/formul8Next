import type { ReactNode } from 'react'
import Link from 'next/link'
import { getCurrentUserFromCookies } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import { ArrowRight, BookOpen, CheckCircle, Users, Globe2 } from 'lucide-react'

export default async function HomePage() {
  const user = await getCurrentUserFromCookies()

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-white pointer-events-none" />
        <div className="container mx-auto px-4 pt-20 pb-24 relative">
          <div className="max-w-4xl">
            <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 mb-6">
              Empowering research collaboration
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
              Connect professors and students through meaningful research opportunities.
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mb-10">
              Formul8 helps faculty launch projects, manage applicants, and collaborate with engaged students.
              Students gain a streamlined way to discover projects, submit applications, and track participation.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={user ? '/dashboard' : '/login'}
                className="inline-flex items-center justify-center rounded-md bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
              >
                {user ? 'Go to Dashboard' : 'Sign In'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              {!user && (
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-md border border-gray-200 px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:border-primary-300 hover:text-primary-700"
                >
                  Create an account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Built for modern research teams</h2>
            <p className="mt-4 text-gray-600">
              Formul8 simplifies the entire lifecycle of research collaboration from discovery through project completion.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<BookOpen className="h-6 w-6 text-primary-600" />}
              title="Project publishing"
              description="Launch research opportunities in minutes with a guided setup, structured requirements, and rich media support."
              items={[
                'Streamlined project creation',
                'Tailored eligibility criteria',
                'Flexible scheduling and enrollment',
              ]}
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-primary-600" />}
              title="Application management"
              description="Review, filter, and respond to applicants with clear status tracking designed for academic workflows."
              items={[
                'Centralized application inbox',
                'Structured student profiles',
                'Decision workflows for teams',
              ]}
            />
            <FeatureCard
              icon={<Globe2 className="h-6 w-6 text-primary-600" />}
              title="Student discovery"
              description="Curated search tools help students find opportunities that match their interests and expertise."
              items={[
                'Advanced research filters',
                'Saved skills and departments',
                'Real-time project availability',
              ]}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Guided experience for every user</h2>
              <p className="text-gray-600 mb-6">
                Whether you're coordinating a multi-semester research program or looking for your first project,
                Formul8 guides each step with clarity and purpose.
              </p>
              <div className="space-y-4">
                <ChecklistItem title="Professors create and manage projects effortlessly" />
                <ChecklistItem title="Students explore projects and submit thoughtful applications" />
                <ChecklistItem title="Teams stay aligned with centralized communication and updates" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Get started now</h3>
              <p className="text-gray-600">
                Sign in or create an account to launch new research initiatives or apply to open opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={user ? '/dashboard' : '/login'}
                  className="inline-flex items-center justify-center rounded-md bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
                >
                  {user ? 'Enter dashboard' : 'Sign in to Formul8'}
                </Link>
                {!user && (
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-md border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-primary-300 hover:text-primary-700"
                  >
                    Join as new user
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  items: string[]
}

function FeatureCard({ icon, title, description, items }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-50 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start space-x-3 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ChecklistItem({ title }: { title: string }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="mt-1">
        <div className="h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-primary-600 text-sm font-semibold">✓</span>
        </div>
      </div>
      <p className="text-gray-700">{title}</p>
    </div>
  )
}
