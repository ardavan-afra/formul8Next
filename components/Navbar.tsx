'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  Plus, 
  BookOpen,
  UserCheck,
  Settings
} from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const homeHref = user ? '/dashboard' : '/'

  const browseHref = '/projects'

  const handleBrowseClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      event.preventDefault()
      setIsMenuOpen(false)
      router.push(`/login?redirect=${encodeURIComponent(browseHref)}`)
    }
  }

  const handleMobileBrowseClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      event.preventDefault()
      setIsMenuOpen(false)
      router.push(`/login?redirect=${encodeURIComponent(browseHref)}`)
    } else {
      setIsMenuOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={homeHref} className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Formul8</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href={browseHref} 
              prefetch={!!user}
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
              onClick={handleBrowseClick}
            >
              Browse Projects
            </Link>
            
            {user?.role === 'professor' && (
              <>
                <Link 
                  href="/create-project" 
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Project</span>
                </Link>
                <Link 
                  href="/my-projects" 
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  My Projects
                </Link>
              </>
            )}
            
            {user && (
              <Link 
                href="/applications" 
                className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
              >
                Applications
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
                >
                  <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-primary-700"
                >
                  Create account
                </Link>
                <a
                  href="https://github.com/ardavan-afra/formul8Next"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm transition-colors duration-200 hover:border-primary-300 hover:text-primary-700"
                  aria-label="View source on GitHub"
                >
                  <Image
                    src="/icons/github-mark.svg"
                    alt="GitHub"
                    width={18}
                    height={18}
                  />
                </a>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href={browseHref} 
                prefetch={!!user}
                className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                onClick={handleMobileBrowseClick}
              >
                Browse Projects
              </Link>
              
              {user?.role === 'professor' && (
                <>
                  <Link 
                    href="/create-project" 
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Project</span>
                  </Link>
                  <Link 
                    href="/my-projects" 
                    className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Projects
                  </Link>
                </>
              )}
              
              {user ? (
                <>
                  <Link 
                    href="/applications" 
                    className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Applications
                  </Link>
                  <Link 
                    href="/profile" 
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create account
                  </Link>
                  <a
                    href="https://github.com/ardavan-afra/formul8Next"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="View source on GitHub"
                  >
                    <Image
                      src="/icons/github-mark.svg"
                      alt="GitHub"
                      width={18}
                      height={18}
                    />
                    <span>GitHub</span>
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
