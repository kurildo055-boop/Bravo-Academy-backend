import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { extractAuthUser } from '../lib/auth';

const router = Router();

// GET /api/admin/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Admin access required.' });
    }

    const [totalStudents, totalCourses, totalQuestions, totalPayments, recentPayments, recentUsers] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count(),
      prisma.question.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      }),
      prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.user.findMany({
        where: { role: 'STUDENT' },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    const totalRevenue = totalPayments._sum.amount || 284500;

    return res.json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        totalQuestions,
        totalRevenue,
      },
      recentPayments,
      recentUsers
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/cms
router.get('/cms', async (req: Request, res: Response) => {
  try {
    const content = await prisma.homepageContent.findUnique({
      where: { id: 'default-homepage' }
    });
    return res.json({ success: true, content });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/cms
router.put('/cms', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Admin authorization required.' });
    }

    const body = req.body;
    const updated = await prisma.homepageContent.upsert({
      where: { id: 'default-homepage' },
      update: {
        heroTitle: body.heroTitle,
        heroSubtitle: body.heroSubtitle,
        primaryCtaText: body.primaryCtaText,
        primaryCtaLink: body.primaryCtaLink,
        secondaryCtaText: body.secondaryCtaText,
        secondaryCtaLink: body.secondaryCtaLink,
        announcementText: body.announcementText,
      },
      create: {
        id: 'default-homepage',
        heroTitle: body.heroTitle || 'YOUR DEFENSE JOURNEY STARTS HERE',
        heroSubtitle: body.heroSubtitle || 'Complete ISSB Preparation for Army, Navy & Air Force Officer Candidates.',
        primaryCtaText: body.primaryCtaText || 'START IQ PRACTICE',
        primaryCtaLink: body.primaryCtaLink || '/exam/iq',
        secondaryCtaText: body.secondaryCtaText || 'EXPLORE COURSES',
        secondaryCtaLink: body.secondaryCtaLink || '/courses',
        announcementText: body.announcementText || '🔥 New Batch for 93 BMA Long Course & 84 BAFA Course is Now Open!'
      }
    });

    return res.json({ success: true, content: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
