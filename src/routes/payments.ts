import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { extractAuthUser } from '../lib/auth';
import { bkashAdapter, nagadAdapter } from '../lib/payment-adapters';

const router = Router();

// POST /api/payments/manual-submit (Primary Manual bKash / Nagad Admission Flow)
router.post('/manual-submit', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please login first.' });
    }

    const {
      courseId,
      paymentMethod,
      amount,
      senderNumber,
      transactionId,
      collegeOrUniversity,
      studentRoll,
      studentPhotoUrl,
      candidatePhone,
      notes,
    } = req.body;

    if (!courseId || !paymentMethod || !senderNumber || !transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Course, Payment Method, Sender Phone, and Transaction ID are required.'
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ success: false, error: 'Target course not found.' });
    }

    // Check if duplicate transactionId already used
    const existingTx = await prisma.payment.findUnique({
      where: { transactionId: transactionId.trim() }
    });
    if (existingTx) {
      return res.status(400).json({
        success: false,
        error: 'This Transaction ID (TrxID) has already been submitted. Please check your transaction details.'
      });
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Create payment in PENDING_APPROVAL status
    const payment = await prisma.payment.create({
      data: {
        userId: auth.userId,
        courseId: course.id,
        amount: Number(amount) || course.discountPrice,
        currency: 'BDT',
        paymentMethod: paymentMethod.toUpperCase(),
        transactionId: transactionId.trim(),
        invoiceNumber,
        status: 'PENDING_APPROVAL',
        senderNumber: senderNumber.trim(),
        collegeOrUniversity: collegeOrUniversity ? collegeOrUniversity.trim() : null,
        studentRoll: studentRoll ? studentRoll.trim() : null,
        studentPhotoUrl: studentPhotoUrl || null,
        notes: notes ? notes.trim() : null,
      }
    });

    // Create or find pending enrollment
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + course.validityDays);

    await prisma.enrollment.create({
      data: {
        userId: auth.userId,
        courseId: course.id,
        status: 'PENDING',
        expiresAt,
        paymentId: payment.id,
      }
    });

    // Update user's profile and phone/avatar if provided
    if (collegeOrUniversity || studentRoll || studentPhotoUrl || candidatePhone) {
      await prisma.user.update({
        where: { id: auth.userId },
        data: {
          phone: candidatePhone || undefined,
          avatarUrl: studentPhotoUrl || undefined,
        }
      });

      await prisma.studentProfile.upsert({
        where: { userId: auth.userId },
        update: {
          collegeOrUniversity: collegeOrUniversity || undefined,
          studentRoll: studentRoll || undefined,
          studentPhotoUrl: studentPhotoUrl || undefined,
        },
        create: {
          userId: auth.userId,
          collegeOrUniversity: collegeOrUniversity || null,
          studentRoll: studentRoll || null,
          studentPhotoUrl: studentPhotoUrl || null,
          preparationGoal: `Preparing for Bangladesh ${course.targetForce || 'Armed Forces'} Officer Commission`,
        }
      });
    }

    // Create notification for candidate
    await prisma.notification.create({
      data: {
        userId: auth.userId,
        title: `Payment Submitted: ${course.title}`,
        message: `Your payment of ৳${payment.amount} (TrxID: ${payment.transactionId}) has been received and is awaiting Command HQ verification.`,
        type: 'PAYMENT'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Payment verification submitted successfully. Awaiting Command HQ review.',
      payment: {
        id: payment.id,
        invoiceNumber: payment.invoiceNumber,
        amount: payment.amount,
        status: payment.status,
        courseTitle: course.title,
        transactionId: payment.transactionId
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/payments/my-status (Candidate Status Check)
router.get('/my-status', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const [payments, enrollments] = await Promise.all([
      prisma.payment.findMany({
        where: { userId: auth.userId },
        include: { course: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.enrollment.findMany({
        where: { userId: auth.userId },
        include: { course: true }
      })
    ]);

    const activeEnrollment = enrollments.find(e => e.status === 'ACTIVE' && new Date(e.expiresAt) > new Date());
    const pendingPayment = payments.find(p => p.status === 'PENDING_APPROVAL');

    return res.json({
      success: true,
      hasActiveCourse: Boolean(activeEnrollment),
      activeEnrollment: activeEnrollment || null,
      pendingPayment: pendingPayment || null,
      allPayments: payments,
      allEnrollments: enrollments
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payments/initiate (Legacy sandbox initiation if needed)
router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth) {
      return res.status(401).json({ success: false, error: 'Please login to enroll in this course.' });
    }

    const { courseId, paymentMethod, customerPhone } = req.body;
    if (!courseId || !paymentMethod) {
      return res.status(400).json({ success: false, error: 'Course and payment method are required.' });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course does not exist.' });
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const payment = await prisma.payment.create({
      data: {
        userId: auth.userId,
        courseId: course.id,
        amount: course.discountPrice,
        currency: 'BDT',
        paymentMethod,
        invoiceNumber,
        status: 'PENDING',
        senderNumber: customerPhone || null
      }
    });

    return res.json({
      success: true,
      paymentId: payment.id,
      invoiceNumber,
      amount: course.discountPrice,
      courseTitle: course.title,
      paymentMethod,
      gatewayUrl: `/checkout?courseId=${course.id}`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
