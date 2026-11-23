import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { extractAuthUser } from '../lib/auth';
import { bkashAdapter, nagadAdapter } from '../lib/payment-adapters';

const router = Router();

// POST /api/payments/initiate
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

    const existingActive = await prisma.enrollment.findFirst({
      where: {
        userId: auth.userId,
        courseId: course.id,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() }
      }
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        error: 'You are already actively enrolled in this course.'
      });
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    let initResult;
    if (paymentMethod === 'BKASH') {
      initResult = await bkashAdapter.createPayment({
        userId: auth.userId,
        courseId: course.id,
        amount: course.discountPrice,
        currency: 'BDT',
        paymentMethod: 'BKASH',
        customerPhone: customerPhone || '01700000000',
        customerName: auth.name
      }, invoiceNumber);
    } else {
      initResult = await nagadAdapter.createPayment({
        userId: auth.userId,
        courseId: course.id,
        amount: course.discountPrice,
        currency: 'BDT',
        paymentMethod: 'NAGAD',
        customerPhone: customerPhone || '01700000000',
        customerName: auth.name
      }, invoiceNumber);
    }

    const payment = await prisma.payment.create({
      data: {
        userId: auth.userId,
        courseId: course.id,
        amount: course.discountPrice,
        currency: 'BDT',
        paymentMethod,
        invoiceNumber,
        status: 'PENDING',
        gatewayRef: initResult.gatewayRef || null,
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
      gatewayUrl: `/payment/gateway?invoice=${invoiceNumber}&method=${paymentMethod}&amount=${course.discountPrice}`,
      instructions: paymentMethod === 'BKASH'
        ? 'Proceed with standard bKash tokenized PIN validation.'
        : 'Enter Nagad registered mobile number and OTP code.'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payments/verify
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { invoiceNumber, transactionId, paymentMethod } = req.body;

    if (!invoiceNumber) {
      return res.status(400).json({ success: false, error: 'Invoice number is required.' });
    }

    const payment = await prisma.payment.findUnique({
      where: { invoiceNumber },
      include: { user: true }
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment transaction record not found.' });
    }

    if (payment.status === 'COMPLETED') {
      return res.json({
        success: true,
        message: 'Payment was already verified and enrollment activated.',
        payment
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: payment.courseId }
    });

    if (!course) {
      return res.status(404).json({ success: false, error: 'Target course not found.' });
    }

    let verification;
    if (payment.paymentMethod === 'BKASH') {
      verification = await bkashAdapter.executePayment(payment.id, transactionId, payment.amount);
    } else {
      verification = await nagadAdapter.verifyPayment(payment.id, transactionId, payment.amount);
    }

    if (!verification.isVerified) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      return res.status(400).json({
        success: false,
        error: verification.message || 'Payment verification failed at gateway level.'
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + course.validityDays);

    const [updatedPayment, enrollment] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          transactionId: verification.transactionId,
          verifiedAt: new Date()
        }
      }),
      prisma.enrollment.create({
        data: {
          userId: payment.userId,
          courseId: course.id,
          status: 'ACTIVE',
          expiresAt
        }
      }),
      prisma.notification.create({
        data: {
          userId: payment.userId,
          title: `Course Enrollment Activated: ${course.title}`,
          message: `Your payment of ৳${payment.amount} has been verified successfully. Your training modules are now unlocked!`,
          type: 'ENROLLMENT'
        }
      })
    ]);

    return res.json({
      success: true,
      message: 'Payment successfully verified. Course access activated!',
      enrollmentId: enrollment.id,
      expiresAt: enrollment.expiresAt,
      courseTitle: course.title,
      transactionId: updatedPayment.transactionId
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
