import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCmsUser() {
  try {
    console.log('🔐 Seeding CMS Super Admin user...')

    // Check if Manager user already exists
    const existingManager = await prisma.user.findUnique({
      where: { email: 'manager@niet.ac.in' }
    })

    if (existingManager) {
      console.log('✅ CMS Manager user already exists, updating password...')
      await prisma.user.update({
        where: { email: 'manager@niet.ac.in' },
        data: {
          password: 'Manager@1234',
          role: 'SUPER_ADMIN',
          name: 'System Manager',
          isActive: true,
        }
      })
    } else {
      // Create the CMS Manager user
      const manager = await prisma.user.create({
        data: {
          email: 'manager@niet.ac.in',
          password: 'Manager@1234',
          name: 'System Manager',
          role: 'SUPER_ADMIN',
          phone: '+91-XXXXXXXXXX',
          isActive: true,
        }
      })
      console.log('✅ Created CMS Manager user:', manager.email)
    }

    // Seed default CMS configurations
    const defaultConfigs = [
      { key: 'site_name', value: 'NIET IQAC Portal', category: 'GENERAL', description: 'Main site name' },
      { key: 'institution_name', value: 'Nehru Institute of Engineering and Technology', category: 'INSTITUTION', description: 'Full institution name' },
      { key: 'academic_year', value: '2024-2025', category: 'ACADEMIC', description: 'Current academic year' },
      { key: 'semester', value: 'Odd', category: 'ACADEMIC', description: 'Current semester' },
      { key: 'maintenance_mode', value: 'false', category: 'SYSTEM', description: 'Maintenance mode status' },
      { key: 'allow_registration', value: 'true', category: 'SYSTEM', description: 'Allow self-registration' },
      { key: 'session_timeout', value: '30', category: 'SYSTEM', description: 'Session timeout in minutes' },
      { key: 'max_file_size', value: '10', category: 'UPLOAD', description: 'Max file upload size in MB' },
      { key: 'allowed_file_types', value: 'pdf,doc,docx,xls,xlsx,jpg,png,jpeg', category: 'UPLOAD', description: 'Allowed file types' },
    ]

    for (const config of defaultConfigs) {
      await prisma.cmsConfig.upsert({
        where: { key: config.key },
        update: { value: config.value, description: config.description },
        create: config
      })
    }
    console.log('✅ Seeded default CMS configurations')

    console.log('\n🎉 CMS seeding completed!')
    console.log('\n📋 CMS Portal Credentials:')
    console.log('   Email: manager@niet.ac.in')
    console.log('   Password: Manager@1234')
    console.log('\n   Or use simplified:')
    console.log('   Username: Manager')
    console.log('   Password: Manager@1234')

  } catch (error) {
    console.error('❌ Error seeding CMS user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedCmsUser()
