const path = require('path');
const fs = require('fs');

// Simple zero-dependency .env loader
try {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of envLines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {}

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Bravo Academy Database Seeding...');

  // 1. Clean existing records (safe idempotent seeding)
  try {
    await prisma.examAnswer.deleteMany();
    await prisma.examAttempt.deleteMany();
    await prisma.questionOption.deleteMany();
    await prisma.question.deleteMany();
    await prisma.examCategory.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.course.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.homepageContent.deleteMany();
    await prisma.facebookVideo.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.faqItem.deleteMany();
    await prisma.exam.deleteMany();
  } catch (err) {
    console.log('Note on clean slate:', err.message);
  }

  // 2. Create Users (2 Roles strictly: ADMIN and STUDENT)
  const passwordSalt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@Bravo2026!', passwordSalt);
  const studentPasswordHash = await bcrypt.hash('Cadet@Bravo2026!', passwordSalt);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@bravoacademy.com',
      passwordHash: adminPasswordHash,
      name: 'Major General (Retd.) M. Rahman',
      phone: '+8801711000001',
      role: 'ADMIN',
      targetForce: 'ARMY',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    }
  });
  console.log('✅ Admin user created: admin@bravoacademy.com / Admin@Bravo2026!');

  const studentUser = await prisma.user.create({
    data: {
      email: 'cadet@bravoacademy.com',
      passwordHash: studentPasswordHash,
      name: 'Cadet Tanvir Ahmed',
      phone: '+8801812345678',
      role: 'STUDENT',
      targetForce: 'ARMY',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      studentProfile: {
        create: {
          batchNumber: '93 BMA Long Course',
          hscResult: 'GPA 5.00',
          sscResult: 'GPA 5.00',
          heightInches: 70, // 5 ft 10 in
          weightKg: 68,
          medicalStatus: 'FIT',
          preparationGoal: 'Qualify for Bangladesh Army Officer Cadet Commission'
        }
      }
    }
  });
  console.log('✅ Student user created: cadet@bravoacademy.com / Cadet@Bravo2026!');

  // 3. Create Courses
  const coursesData = [
    {
      title: 'Complete ISSB Preparation Mastery',
      slug: 'complete-issb-preparation',
      description: 'The ultimate 4-stage officer selection mastery program for Bangladesh Army, Navy, and Air Force. Includes IQ, PPDT, Psychology (TAT, WAT, SCT, SRT, SDT), GTO Ground Tasks, and Final Board Interview.',
      targetForce: 'ALL',
      category: 'ISSB_FULL',
      regularPrice: 7500,
      discountPrice: 4499,
      validityDays: 120,
      durationWeeks: 12,
      isFeatured: true,
      includedFeatures: JSON.stringify(['iq', 'ppdt', 'psychology', 'gto', 'planning', 'interview', 'physical', 'mock_exam', 'full_simulation', 'ai_eval']),
      curriculum: JSON.stringify([
        { week: 1, title: 'Screening Test Mastery (Verbal & Non-Verbal IQ, PPDT)' },
        { week: 2, title: 'Psychology Test Battery (TAT & WAT Speed Drill)' },
        { week: 3, title: 'SCT & SRT Tactical Response Formulations' },
        { week: 4, title: 'GTO Outdoor Tasks & Command Tasks Tactical Brief' },
        { week: 5, title: 'Military Planning Exercise & Obstacle Run Preparation' },
        { week: 6, title: 'President / Deputy President Personal Interview Tactics' },
        { week: 7, title: 'Conference Simulation & Final Review' }
      ])
    },
    {
      title: 'Bangladesh Army Officer Cadet Course',
      slug: 'bangladesh-army-issb',
      description: 'Dedicated preparation curriculum for BMA Long Course and Special Course candidates with officer-like qualities (OLQ) focus.',
      targetForce: 'ARMY',
      category: 'ARMY_SPECIFIC',
      regularPrice: 6000,
      discountPrice: 3499,
      validityDays: 90,
      durationWeeks: 8,
      isFeatured: true,
      includedFeatures: JSON.stringify(['iq', 'ppdt', 'psychology', 'gto', 'planning', 'interview', 'mock_exam']),
    },
    {
      title: 'Bangladesh Navy Officer Cadet Course',
      slug: 'bangladesh-navy-issb',
      description: 'Specialized maritime tactics, naval IQ problem-solving, and complete psychological readiness for Bangladesh Naval Academy (BNA).',
      targetForce: 'NAVY',
      category: 'NAVY_SPECIFIC',
      regularPrice: 6000,
      discountPrice: 3499,
      validityDays: 90,
      durationWeeks: 8,
      isFeatured: true,
      includedFeatures: JSON.stringify(['iq', 'ppdt', 'psychology', 'gto', 'planning', 'interview', 'mock_exam']),
    },
    {
      title: 'Bangladesh Air Force (BAFA) Flight Cadet Course',
      slug: 'bangladesh-air-force-issb',
      description: 'Aviation aptitude, spatial awareness, rapid decision-making drills, and psychological screening for GD(P) and Air Force branches.',
      targetForce: 'AIR_FORCE',
      category: 'AIR_FORCE_SPECIFIC',
      regularPrice: 6000,
      discountPrice: 3499,
      validityDays: 90,
      durationWeeks: 8,
      isFeatured: true,
      includedFeatures: JSON.stringify(['iq', 'ppdt', 'psychology', 'gto', 'planning', 'interview', 'mock_exam']),
    },
    {
      title: 'Defense IQ & Intelligence Mastery (1000+ Questions)',
      slug: 'defense-iq-mastery',
      description: 'Intensive verbal, non-verbal, spatial, and analytical question bank with timed examination simulations and step-by-step solutions.',
      targetForce: 'ALL',
      category: 'IQ_ONLY',
      regularPrice: 3000,
      discountPrice: 1499,
      validityDays: 60,
      durationWeeks: 4,
      isFeatured: false,
      includedFeatures: JSON.stringify(['iq', 'mock_exam']),
    },
    {
      title: 'Military Psychology & PPDT Intensive',
      slug: 'military-psychology-intensive',
      description: 'Deep dive into TAT, WAT (15-sec words), SCT (sentence completion), SRT (critical situations), and Self-Description Test (SDT) with AI & expert review.',
      targetForce: 'ALL',
      category: 'PSYCHOLOGY_ONLY',
      regularPrice: 3500,
      discountPrice: 1999,
      validityDays: 60,
      durationWeeks: 4,
      isFeatured: false,
      includedFeatures: JSON.stringify(['ppdt', 'psychology', 'ai_eval']),
    },
    {
      title: 'Full 4-Day ISSB Live Practice Simulation',
      slug: 'full-issb-simulation',
      description: 'Simulates the exact 4-day sequence: Day 1 Screening (IQ & PPDT), Day 2 Psychology Battery, Day 3 GTO Tasks & Interview, Day 4 Conference & Assessment.',
      targetForce: 'ALL',
      category: 'SIMULATION_ONLY',
      regularPrice: 4000,
      discountPrice: 2499,
      validityDays: 60,
      durationWeeks: 4,
      isFeatured: false,
      includedFeatures: JSON.stringify(['full_simulation', 'ai_eval', 'mock_exam']),
    }
  ];

  const createdCourses = [];
  for (const c of coursesData) {
    const course = await prisma.course.create({ data: c });
    createdCourses.push(course);
  }
  console.log(`✅ Created ${createdCourses.length} Defense Courses.`);

  // 4. Enroll Student in Course 1 for immediate live testing
  const primaryCourse = createdCourses[0];
  const expires = new Date();
  expires.setDate(expires.getDate() + 90);

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: studentUser.id,
      courseId: primaryCourse.id,
      status: 'ACTIVE',
      expiresAt: expires,
    }
  });

  await prisma.payment.create({
    data: {
      userId: studentUser.id,
      courseId: primaryCourse.id,
      amount: primaryCourse.discountPrice,
      currency: 'BDT',
      paymentMethod: 'BKASH',
      transactionId: 'TRX-BKASH-77112233',
      invoiceNumber: 'INV-BRAVO-2026-0001',
      status: 'COMPLETED',
      senderNumber: '01812345678',
      verifiedAt: new Date()
    }
  });
  console.log('✅ Active student enrollment and bKash transaction created for demo testing.');

  // 5. Load and Seed 1000+ IQ Questions
  const seedDataPath = path.join(__dirname, 'seed-data.json');
  const rawData = fs.readFileSync(seedDataPath, 'utf-8');
  const seedData = JSON.parse(rawData);

  console.log(`📦 Seeding ${seedData.categories.length} Exam Categories...`);
  const categoryMap = {};
  for (const cat of seedData.categories) {
    const record = await prisma.examCategory.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: `Official preparation modules for defense ${cat.name}`
      }
    });
    categoryMap[cat.slug] = record.id;
  }

  console.log(`📦 Seeding ${seedData.allQuestions.length} Questions into Database (Batch Process)...`);
  
  // We insert questions with options
  const chunkSize = 100;
  for (let i = 0; i < seedData.allQuestions.length; i += chunkSize) {
    const chunk = seedData.allQuestions.slice(i, i + chunkSize);
    for (const q of chunk) {
      const catId = categoryMap[q.categorySlug] || Object.values(categoryMap)[0];
      await prisma.question.create({
        data: {
          questionText: q.questionText,
          categoryId: catId,
          subcategory: q.subcategory,
          difficulty: q.difficulty,
          questionType: 'MCQ',
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          timeLimitSec: q.timeLimitSec,
          tags: q.categorySlug,
          isPublished: true,
          options: {
            create: [
              { key: 'A', text: q.options.A },
              { key: 'B', text: q.options.B },
              { key: 'C', text: q.options.C },
              { key: 'D', text: q.options.D },
            ]
          }
        }
      });
    }
    console.log(`   Processed questions ${i + 1} to ${Math.min(i + chunkSize, seedData.allQuestions.length)}...`);
  }
  console.log(`✅ Successfully seeded ${seedData.allQuestions.length} questions.`);

  // 6. Create Standard Mock Exams
  const mockExams = [
    {
      title: 'Full ISSB Screening IQ Examination',
      slug: 'full-issb-screening-iq',
      examType: 'IQ',
      durationMinutes: 40,
      totalQuestions: 50,
      passingScore: 60.0,
      targetForce: 'ALL',
      instructions: 'Standard Bangladesh Armed Forces ISSB Screening Examination. 50 questions, 40 minutes time limit. Server auto-submits on timeout.'
    },
    {
      title: 'Verbal Intelligence Speed Drill',
      slug: 'verbal-iq-speed-drill',
      examType: 'IQ',
      durationMinutes: 20,
      totalQuestions: 30,
      passingScore: 65.0,
      targetForce: 'ALL',
      instructions: 'Fast-paced verbal logic and syllogism practice. Focus on precision and speed.'
    },
    {
      title: 'Non-Verbal & Spatial Aptitude Challenge',
      slug: 'non-verbal-spatial-aptitude',
      examType: 'IQ',
      durationMinutes: 25,
      totalQuestions: 30,
      passingScore: 60.0,
      targetForce: 'ALL',
      instructions: 'Rotations, pattern series, and geometric classification for defense candidates.'
    }
  ];

  for (const ex of mockExams) {
    await prisma.exam.create({ data: ex });
  }
  console.log('✅ Created initial Mock Exams.');

  // 7. Seed Homepage CMS, Facebook Videos, Testimonials, FAQ
  await prisma.homepageContent.create({
    data: {
      id: 'default-homepage',
      heroTitle: 'YOUR DEFENSE JOURNEY STARTS HERE',
      heroSubtitle: 'Complete ISSB Preparation for Army, Navy & Air Force Officer Candidates.',
      primaryCtaText: 'START IQ PRACTICE',
      primaryCtaLink: '/exam/iq',
      secondaryCtaText: 'EXPLORE COURSES',
      secondaryCtaLink: '/courses',
      announcementText: '🔥 New Batch for 93 BMA Long Course & 84 BAFA Course is Now Open!'
    }
  });

  const sampleVideos = [
    {
      title: 'PPDT Story Writing Secret & Perception Tips — Bravo Academy',
      videoUrl: 'https://www.facebook.com/watch/?v=10158912345678',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // fallback embed
      description: 'Exclusive masterclass by former ISSB psychologist on PPDT picture perception and theme crafting.',
      orderIndex: 1
    },
    {
      title: 'GTO Outdoor Command Tasks & Solution Strategies',
      videoUrl: 'https://www.facebook.com/watch/?v=10158912345679',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'Step-by-step breakdown of bridging materials, fulcrum principles, and command task execution.',
      orderIndex: 2
    },
    {
      title: 'Top 10 ISSB Board Interview Questions Explained',
      videoUrl: 'https://www.facebook.com/watch/?v=10158912345680',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'How to present body posture, eye contact, and answer personal background questions with confidence.',
      orderIndex: 3
    }
  ];
  for (const v of sampleVideos) {
    await prisma.facebookVideo.create({ data: v });
  }

  const testimonials = [
    {
      candidateName: 'Lieutenant Fahim Chowdhury',
      forceSelected: 'Bangladesh Army',
      cadetCourse: '88 BMA Long Course',
      reviewText: 'Bravo Academy was the turning point in my preparation. The IQ drills with strict 30-second timers and the PPDT story review helped me clear screening with ease. Green card achieved on first attempt!',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    },
    {
      candidateName: 'Sub-Lieutenant S. M. Rayhan',
      forceSelected: 'Bangladesh Navy',
      cadetCourse: 'BNA 2024A Batch',
      reviewText: 'The maritime reasoning scenarios and full 4-day ISSB mock simulation gave me the exact atmosphere of the real board at Dhaka Cantonment. Highly recommended for every serious defense aspirant.',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
    },
    {
      candidateName: 'Flying Officer Nafisa Islam',
      forceSelected: 'Bangladesh Air Force',
      cadetCourse: '80 BAFA Course',
      reviewText: 'Spatial aptitude and 15-second WAT tests were my weakest areas before joining. The AI-driven feedback immediately pinpointed where my stories lacked leadership actions. Proud to wear the wings today!',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    }
  ];
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  const faqs = [
    {
      question: 'What is ISSB and how does Bravo Academy prepare candidates?',
      answer: 'ISSB (Inter Services Selection Board) is the joint officer selection system for the Bangladesh Army, Navy, and Air Force. Bravo Academy provides scientifically engineered preparation across all 4 stages: Screening (IQ & PPDT), Psychology Battery, GTO Ground Tasks, and the Final Interview.',
      category: 'GENERAL',
      orderIndex: 1
    },
    {
      question: 'Can I access the 1000+ IQ Question Bank on mobile devices?',
      answer: 'Yes! Bravo Academy is 100% responsive, optimized for both desktop and mobile devices with high-speed touch navigation, auto-save, and dark/light modes.',
      category: 'EXAM',
      orderIndex: 2
    },
    {
      question: 'How do bKash and Nagad payments work?',
      answer: 'You can enroll instantly using bKash or Nagad. Once your transaction is confirmed on our secure backend, your course entitlements and practice modules unlock immediately.',
      category: 'PAYMENT',
      orderIndex: 3
    },
    {
      question: 'Does Bravo Academy claim to reproduce confidential official exam questions?',
      answer: 'No. Bravo Academy is an independent educational training platform. Our questions and simulations are original practice materials created by experienced defense educators to develop genuine Officer-Like Qualities (OLQ).',
      category: 'GENERAL',
      orderIndex: 4
    }
  ];
  for (const f of faqs) {
    await prisma.faqItem.create({ data: f });
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
