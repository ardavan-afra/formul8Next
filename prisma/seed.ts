import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample users
  const professor1 = await prisma.user.upsert({
    where: { email: 'prof1@university.edu' },
    update: {},
    create: {
      name: 'Dr. Sarah Johnson',
      email: 'prof1@university.edu',
      password: await bcrypt.hash('password123', 10),
      role: 'professor',
      department: 'Computer Science',
      bio: 'Professor of Computer Science with expertise in machine learning and artificial intelligence.',
      skills: ['Machine Learning', 'Python', 'Deep Learning', 'Data Science'],
      interests: ['AI Research', 'Computer Vision', 'Natural Language Processing']
    }
  })

  const professor2 = await prisma.user.upsert({
    where: { email: 'prof2@university.edu' },
    update: {},
    create: {
      name: 'Dr. Michael Chen',
      email: 'prof2@university.edu',
      password: await bcrypt.hash('password123', 10),
      role: 'professor',
      department: 'Biology',
      bio: 'Research professor focusing on molecular biology and genetics.',
      skills: ['Molecular Biology', 'Genetics', 'Bioinformatics', 'Lab Techniques'],
      interests: ['Genomics', 'Evolutionary Biology', 'Biotechnology']
    }
  })

  const student1 = await prisma.user.upsert({
    where: { email: 'student1@university.edu' },
    update: {},
    create: {
      name: 'Alex Rodriguez',
      email: 'student1@university.edu',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      department: 'Computer Science',
      bio: 'Junior computer science student passionate about AI and machine learning.',
      skills: ['Python', 'JavaScript', 'React', 'Machine Learning'],
      interests: ['Artificial Intelligence', 'Web Development', 'Data Science'],
      gpa: 3.7,
      year: 'Junior'
    }
  })

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@university.edu' },
    update: {},
    create: {
      name: 'Emma Wilson',
      email: 'student2@university.edu',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      department: 'Biology',
      bio: 'Senior biology student interested in research and laboratory work.',
      skills: ['Lab Techniques', 'Data Analysis', 'Research Methods', 'Statistics'],
      interests: ['Molecular Biology', 'Genetics', 'Research'],
      gpa: 3.9,
      year: 'Senior'
    }
  })

  console.log('✅ Users created successfully')

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      title: 'Machine Learning for Climate Change Analysis',
      description: 'This project involves developing machine learning models to analyze climate data and predict environmental changes. Students will work with large datasets, implement various ML algorithms, and contribute to climate research.',
      professorId: professor1.id,
      department: 'Computer Science',
      skills: ['Machine Learning', 'Python', 'Data Analysis', 'Statistics'],
      requirements: {
        create: {
          gpa: 3.5,
          year: ['Junior', 'Senior', 'Graduate'],
          prerequisites: ['Data Structures', 'Statistics', 'Linear Algebra']
        }
      },
      duration: '6 months',
      timeCommitment: '15 hours/week',
      compensation: 'stipend',
      compensationAmount: '500',
      maxStudents: 2,
      status: 'active',
      materials: {
        create: [
          {
            name: 'Project Overview Document',
            type: 'document',
            url: 'https://example.com/overview.pdf',
            description: 'Detailed project description and requirements'
          },
          {
            name: 'Sample Dataset',
            type: 'link',
            url: 'https://example.com/dataset',
            description: 'Climate data for initial analysis'
          }
        ]
      },
      tags: ['Climate Change', 'Machine Learning', 'Data Science', 'Research'],
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }
  })

  const project2 = await prisma.project.create({
    data: {
      title: 'Genomic Analysis of Rare Diseases',
      description: 'Research project focusing on analyzing genomic data to identify patterns in rare genetic diseases. Students will learn bioinformatics tools, statistical analysis, and contribute to medical research.',
      professorId: professor2.id,
      department: 'Biology',
      skills: ['Bioinformatics', 'Statistics', 'Genetics', 'Data Analysis'],
      requirements: {
        create: {
          gpa: 3.3,
          year: ['Sophomore', 'Junior', 'Senior'],
          prerequisites: ['Genetics', 'Statistics', 'Biology Lab']
        }
      },
      duration: '4 months',
      timeCommitment: '12 hours/week',
      compensation: 'course_credit',
      maxStudents: 3,
      status: 'active',
      materials: {
        create: [
          {
            name: 'Research Protocol',
            type: 'document',
            url: 'https://example.com/protocol.pdf',
            description: 'Detailed research methodology'
          }
        ]
      },
      tags: ['Genomics', 'Medical Research', 'Bioinformatics', 'Genetics'],
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
    }
  })

  const project3 = await prisma.project.create({
    data: {
      title: 'Web Development for Educational Platform',
      description: 'Develop a web-based educational platform for online learning. Students will work with modern web technologies, user interface design, and backend development.',
      professorId: professor1.id,
      department: 'Computer Science',
      skills: ['React', 'Node.js', 'JavaScript', 'Web Development'],
      requirements: {
        create: {
          gpa: 3.0,
          year: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
          prerequisites: ['Programming Fundamentals', 'Web Development']
        }
      },
      duration: '3 months',
      timeCommitment: '10 hours/week',
      compensation: 'unpaid',
      maxStudents: 4,
      status: 'active',
      tags: ['Web Development', 'Education', 'Full Stack', 'UI/UX'],
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 21 days from now
    }
  })

  console.log('✅ Projects created successfully')

  // Create sample applications
  const application1 = await prisma.application.create({
    data: {
      studentId: student1.id,
      projectId: project1.id,
      professorId: professor1.id,
      coverLetter: 'I am very interested in this machine learning project as it aligns perfectly with my academic goals and career aspirations. I have experience with Python and have taken several courses in data science and machine learning.',
      relevantExperience: 'I have completed projects in data analysis and machine learning, including a final project where I built a recommendation system using collaborative filtering.',
      motivation: 'I am passionate about using technology to address climate change and believe this project will provide valuable experience in applying ML to real-world environmental problems.',
      status: 'pending'
    }
  })

  const application2 = await prisma.application.create({
    data: {
      studentId: student2.id,
      projectId: project2.id,
      professorId: professor2.id,
      coverLetter: 'As a biology student with strong interest in genetics and research, I am excited about the opportunity to contribute to this genomic analysis project.',
      relevantExperience: 'I have completed advanced genetics courses and have experience with laboratory techniques and data analysis.',
      motivation: 'I am particularly interested in medical research and believe this project will help me develop skills in bioinformatics and genomic analysis.',
      status: 'pending'
    }
  })

  const application3 = await prisma.application.create({
    data: {
      studentId: student1.id,
      projectId: project3.id,
      professorId: professor1.id,
      coverLetter: 'I am interested in this web development project as it will allow me to apply my programming skills to create something meaningful for education.',
      relevantExperience: 'I have experience with React and JavaScript from personal projects and coursework.',
      motivation: 'I believe in the power of technology to improve education and want to contribute to making learning more accessible.',
      status: 'accepted',
      professorNotes: 'Strong technical background and good motivation. Looking forward to working together.',
      responseDate: new Date()
    }
  })

  console.log('✅ Applications created successfully')

  // Update project student count for accepted application
  await prisma.project.update({
    where: { id: project3.id },
    data: { currentStudents: 1 }
  })

  console.log('🎉 Database seed completed successfully!')
  console.log('\n📋 Sample accounts created:')
  console.log('Professors:')
  console.log('  - prof1@university.edu (password: password123)')
  console.log('  - prof2@university.edu (password: password123)')
  console.log('Students:')
  console.log('  - student1@university.edu (password: password123)')
  console.log('  - student2@university.edu (password: password123)')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
