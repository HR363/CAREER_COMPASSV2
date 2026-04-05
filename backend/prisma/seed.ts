import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for all test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@careercompass.com' },
    update: {},
    create: {
      email: 'admin@careercompass.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      profile: {
        create: {
          education: 'Master in Computer Science',
          skills: JSON.stringify(['Platform Management', 'System Administration', 'DevOps']),
          interests: JSON.stringify(['Technology', 'Education']),
          goals: 'Manage and improve the platform',
        },
      },
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create Mentor User 1
  const mentor1 = await prisma.user.upsert({
    where: { email: 'mentor@careercompass.com' },
    update: {},
    create: {
      email: 'mentor@careercompass.com',
      password: hashedPassword,
      name: 'John Mentor',
      role: 'MENTOR',
      profile: {
        create: {
          education: 'PhD in Software Engineering',
          skills: JSON.stringify(['Software Development', 'AI/ML', 'System Design', 'Career Counseling']),
          interests: JSON.stringify(['Mentoring', 'Technology Innovation', 'Teaching']),
          goals: 'Help students achieve their career goals in tech',
        },
      },
      resources: {
        create: [
          {
            title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
            link: 'https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882',
            category: 'book',
          },
          {
            title: 'System Design Interview – An Insider\'s Guide',
            link: 'https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF',
            category: 'book',
          },
          {
            title: 'How to Build a Career in AI - Andrew Ng',
            link: 'https://info.deeplearning.ai/how-to-build-a-career-in-ai-book',
            category: 'pdf',
          },
          {
            title: 'The Pragmatic Engineer Newsletter',
            link: 'https://blog.pragmaticengineer.com/',
            category: 'article',
          },
          {
            title: 'Introduction to Machine Learning - Stanford CS229',
            link: 'https://cs229.stanford.edu/',
            category: 'course',
          },
        ],
      },
    },
  });
  console.log('✅ Created mentor user:', mentor1.email);

  // Create Mentor User 2
  const mentor2 = await prisma.user.upsert({
    where: { email: 'sarah.mentor@careercompass.com' },
    update: {},
    create: {
      email: 'sarah.mentor@careercompass.com',
      password: hashedPassword,
      name: 'Sarah Williams',
      role: 'MENTOR',
      profile: {
        create: {
          education: 'MSc in Data Science, MIT',
          skills: JSON.stringify(['Data Science', 'Python', 'Machine Learning', 'Statistics', 'Deep Learning']),
          interests: JSON.stringify(['Data Analytics', 'Research', 'Open Source']),
          goals: 'Empower the next generation of data scientists',
        },
      },
      resources: {
        create: [
          {
            title: 'Python for Data Analysis by Wes McKinney',
            link: 'https://wesmckinney.com/book/',
            category: 'book',
          },
          {
            title: 'Kaggle - Learn Data Science',
            link: 'https://www.kaggle.com/learn',
            category: 'course',
          },
          {
            title: 'A Beginner\'s Guide to Data Engineering',
            link: 'https://medium.com/@rchang/a-beginners-guide-to-data-engineering-part-i-4227c5c457d7',
            category: 'article',
          },
        ],
      },
    },
  });
  console.log('✅ Created mentor user:', mentor2.email);

  // Create Mentor User 3
  const mentor3 = await prisma.user.upsert({
    where: { email: 'david.mentor@careercompass.com' },
    update: {},
    create: {
      email: 'david.mentor@careercompass.com',
      password: hashedPassword,
      name: 'David Chen',
      role: 'MENTOR',
      profile: {
        create: {
          education: 'BSc Computer Science, Stanford University',
          skills: JSON.stringify(['Web Development', 'React', 'Node.js', 'TypeScript', 'Cloud Architecture']),
          interests: JSON.stringify(['Full Stack Development', 'Startups', 'Product Design']),
          goals: 'Guide aspiring developers to build production-ready applications',
        },
      },
      resources: {
        create: [
          {
            title: 'The Road to React - Robin Wieruch',
            link: 'https://www.roadtoreact.com/',
            category: 'book',
          },
          {
            title: 'Full Stack Open - University of Helsinki',
            link: 'https://fullstackopen.com/en/',
            category: 'course',
          },
          {
            title: 'AWS Well-Architected Framework',
            link: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html',
            category: 'pdf',
          },
          {
            title: 'JavaScript Info - The Modern JS Tutorial',
            link: 'https://javascript.info/',
            category: 'article',
          },
        ],
      },
    },
  });
  console.log('✅ Created mentor user:', mentor3.email);

  // Create Student User
  const student = await prisma.user.upsert({
    where: { email: 'student@careercompass.com' },
    update: {},
    create: {
      email: 'student@careercompass.com',
      password: hashedPassword,
      name: 'Jane Student',
      role: 'STUDENT',
      profile: {
        create: {
          education: 'Bachelor in Computer Science (3rd Year)',
          skills: JSON.stringify(['JavaScript', 'Python', 'React', 'Node.js']),
          interests: JSON.stringify(['Web Development', 'Mobile Apps', 'AI']),
          goals: 'Become a Full Stack Developer',
        },
      },
    },
  });
  console.log('✅ Created student user:', student.email);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('═══════════════════════════════════════');
  console.log('👤 Admin:');
  console.log('   Email: admin@careercompass.com');
  console.log('   Password: password123');
  console.log('');
  console.log('👨‍🏫 Mentor:');
  console.log('   Email: mentor@careercompass.com');
  console.log('   Password: password123');
  console.log('');
  console.log('👩‍🎓 Student:');
  console.log('   Email: student@careercompass.com');
  console.log('   Password: password123');
  console.log('═══════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
