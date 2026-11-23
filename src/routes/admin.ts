import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { extractAuthUser } from '../lib/auth';

const router = Router();

// Middleware: Require Admin
function requireAdmin(req: Request, res: Response): boolean {
  const auth = extractAuthUser(req);
  if (!auth || auth.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Command admin authorization required.' });
    return false;
  }
  return true;
}

// GET /api/admin/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const [totalStudents, totalCourses, totalQuestions, totalPayments, pendingCount, recentPayments, recentUsers] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count(),
      prisma.question.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      }),
      prisma.payment.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.payment.findMany({
        include: { user: true, course: true },
        orderBy: { createdAt: 'desc' },
        take: 8
      }),
      prisma.user.findMany({
        where: { role: 'STUDENT' },
        include: { studentProfile: true },
        orderBy: { createdAt: 'desc' },
        take: 8
      })
    ]);

    const totalRevenue = totalPayments._sum.amount || 0;

    return res.json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        totalQuestions,
        totalRevenue,
        pendingApprovals: pendingCount,
      },
      recentPayments,
      recentUsers
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/payments (List all submitted manual payments)
router.get('/payments', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { status } = req.query;
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            targetForce: true,
            studentProfile: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            targetForce: true,
            discountPrice: true,
            validityDays: true,
            includedFeatures: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // PENDING_APPROVAL first alphabetically or sorted
        { createdAt: 'desc' }
      ]
    });

    // Custom sort: PENDING_APPROVAL at the very top
    const sorted = [...payments].sort((a, b) => {
      if (a.status === 'PENDING_APPROVAL' && b.status !== 'PENDING_APPROVAL') return -1;
      if (a.status !== 'PENDING_APPROVAL' && b.status === 'PENDING_APPROVAL') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return res.json({ success: true, payments: sorted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/payments/:id/approve (Admin Approves Candidate Payment)
router.post('/payments/:id/approve', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { course: true, user: true }
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment application not found.' });
    }

    if (payment.status === 'COMPLETED') {
      return res.status(400).json({ success: false, error: 'Payment was already approved.' });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (payment.course?.validityDays || 90));

    // Transaction: Approve payment, activate enrollment, update candidate avatar/profile, send notification
    const [updatedPayment, enrollment] = await prisma.$transaction([
      prisma.payment.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          verifiedAt: new Date(),
        }
      }),
      prisma.enrollment.upsert({
        where: {
          id: (await prisma.enrollment.findFirst({
            where: { userId: payment.userId, courseId: payment.courseId }
          }))?.id || 'non-existent-id'
        },
        update: {
          status: 'ACTIVE',
          expiresAt,
          paymentId: payment.id,
        },
        create: {
          userId: payment.userId,
          courseId: payment.courseId,
          status: 'ACTIVE',
          expiresAt,
          paymentId: payment.id,
        }
      }),
      // Notification
      prisma.notification.create({
        data: {
          userId: payment.userId,
          title: `Admission Approved: ${payment.course?.title}`,
          message: `Your payment of ৳${payment.amount} (TrxID: ${payment.transactionId}) has been verified and approved by Command HQ. Your full dashboard is now unlocked!`,
          type: 'ENROLLMENT'
        }
      })
    ]);

    // Update user photo if candidate uploaded one
    if (payment.studentPhotoUrl) {
      await prisma.user.update({
        where: { id: payment.userId },
        data: { avatarUrl: payment.studentPhotoUrl }
      });
    }

    return res.json({
      success: true,
      message: `Cadet ${payment.user.name} approved successfully for ${payment.course?.title}!`,
      payment: updatedPayment,
      enrollment
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/payments/:id/reject (Admin Rejects Candidate Payment)
router.post('/payments/:id/reject', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;
    const { reason } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { course: true, user: true }
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment application not found.' });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminRemark: reason || 'Transaction details could not be verified by Command HQ.',
      }
    });

    // Mark any pending enrollment as SUSPENDED
    const pendingEnrollment = await prisma.enrollment.findFirst({
      where: { userId: payment.userId, courseId: payment.courseId, status: 'PENDING' }
    });
    if (pendingEnrollment) {
      await prisma.enrollment.update({
        where: { id: pendingEnrollment.id },
        data: { status: 'SUSPENDED' }
      });
    }

    // Send notification
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        title: `Payment Verification Rejected`,
        message: `Your payment for ${payment.course?.title} could not be approved. Reason: ${reason || 'Transaction could not be verified'}. Please contact Defense Desk or re-submit correct TrxID.`,
        type: 'PAYMENT'
      }
    });

    return res.json({
      success: true,
      message: 'Payment application marked as REJECTED.',
      payment: updatedPayment
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
    if (!requireAdmin(req, res)) return;

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

// GET /api/admin/students (List all registered cadet aspirants)
router.get('/students', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { q, force } = req.query;
    const where: any = { role: 'STUDENT' };

    if (force && force !== 'ALL') {
      where.targetForce = String(force);
    }

    if (q) {
      const searchStr = String(q).trim();
      where.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { email: { contains: searchStr, mode: 'insensitive' } },
        { phone: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.user.findMany({
      where,
      include: {
        studentProfile: true,
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                targetForce: true,
                discountPrice: true
              }
            }
          },
          orderBy: { enrolledAt: 'desc' }
        },
        payments: {
          include: {
            course: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            examAttempts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, students });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/students/:id/grant-course (Direct course grant to cadet)
router.post('/students/:id/grant-course', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id: userId } = req.params;
    const { courseId, validityDays } = req.body;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    const days = Number(validityDays) || course.validityDays || 90;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId }
    });

    let enrollment;
    if (existingEnrollment) {
      enrollment = await prisma.enrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          status: 'ACTIVE',
          expiresAt
        }
      });
    } else {
      enrollment = await prisma.enrollment.create({
        data: {
          userId,
          courseId,
          status: 'ACTIVE',
          expiresAt
        }
      });
    }

    return res.json({ success: true, enrollment });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/students/:id (Delete cadet account)
router.delete('/students/:id', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;
    await prisma.user.delete({ where: { id } });

    return res.json({ success: true, message: 'Student account deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
