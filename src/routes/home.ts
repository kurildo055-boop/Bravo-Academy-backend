import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/home
router.get('/', async (req: Request, res: Response) => {
  try {
    const [coursesCount, questionsCount, studentsCount, cmsContent, featuredCourses, videos, testimonials, faqs] = await Promise.all([
      prisma.course.count(),
      prisma.question.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.homepageContent.findUnique({ where: { id: 'default-homepage' } }),
      prisma.course.findMany({ where: { isFeatured: true }, take: 4 }),
      prisma.facebookVideo.findMany({ where: { isPublished: true }, orderBy: { orderIndex: 'asc' }, take: 6 }),
      prisma.testimonial.findMany({ where: { isFeatured: true }, take: 6 }),
      prisma.faqItem.findMany({ orderBy: { orderIndex: 'asc' }, take: 6 }),
    ]);

    return res.json({
      success: true,
      stats: {
        totalStudents: studentsCount + 3420,
        availableCourses: coursesCount,
        totalQuestions: questionsCount,
        successfulCandidates: 890,
      },
      cms: cmsContent || {
        heroTitle: 'YOUR DEFENSE JOURNEY STARTS HERE',
        heroSubtitle: 'Complete ISSB Preparation for Army, Navy & Air Force Officer Candidates.',
        primaryCtaText: 'START IQ PRACTICE',
        primaryCtaLink: '/exam/iq',
        secondaryCtaText: 'EXPLORE COURSES',
        secondaryCtaLink: '/courses',
        announcementText: '🔥 New Batch for 93 BMA Long Course & 84 BAFA Course is Now Open!'
      },
      featuredCourses,
      videos,
      testimonials,
      faqs,
    });
  } catch (error: any) {
    console.error('Error fetching home data:', error);
    return res.status(500).json({ success: false, error: 'Failed to load home data' });
  }
});

export default router;
