import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword, signJwtToken, extractAuthUser } from '../lib/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, targetForce } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone ? phone.trim() : null,
        role: 'STUDENT',
        targetForce: targetForce || 'ARMY',
        studentProfile: {
          create: {
            preparationGoal: `Preparing for Bangladesh ${targetForce || 'Army'} Officer Commission`
          }
        }
      }
    });

    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: 'STUDENT',
      name: user.name
    });

    res.cookie('bravo_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({
      success: true,
      message: 'Cadet registered successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetForce: user.targetForce,
        enrollments: []
      },
      token
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        studentProfile: true,
        enrollments: {
          where: { status: 'ACTIVE', expiresAt: { gt: new Date() } },
          include: { course: true }
        },
        payments: {
          where: { status: 'PENDING_APPROVAL' },
          include: { course: true },
          take: 1
        }
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid military credentials or account does not exist.' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid password. Check credentials and retry.' });
    }

    const role = user.role === 'ADMIN' ? 'ADMIN' : 'STUDENT';

    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: role as 'STUDENT' | 'ADMIN',
      name: user.name
    });

    res.cookie('bravo_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      message: 'Authentication successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetForce: user.targetForce,
        avatarUrl: user.avatarUrl,
        studentProfile: user.studentProfile,
        enrollments: user.enrollments,
        pendingPayment: user.payments[0] || null
      },
      token
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Login failed.' });
  }
});

// POST /api/auth/google (Google Sign-In)
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { email, name, picture, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Google account email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        studentProfile: true,
        enrollments: {
          include: { course: true }
        },
        payments: {
          where: { status: 'PENDING_APPROVAL' },
          include: { course: true },
          take: 1
        }
      }
    });

    if (!user) {
      // Create new student user via Google
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await hashPassword(randomPassword);

      user = await prisma.user.create({
        data: {
          name: name ? name.trim() : normalizedEmail.split('@')[0],
          email: normalizedEmail,
          passwordHash,
          role: 'STUDENT',
          targetForce: 'ARMY',
          avatarUrl: picture || null,
          studentProfile: {
            create: {
              preparationGoal: 'Preparing for Bangladesh Armed Forces Officer Commission'
            }
          }
        },
        include: {
          studentProfile: true,
          enrollments: {
            include: { course: true }
          },
          payments: {
            include: { course: true },
            take: 1
          }
        }
      });
    } else if (picture && !user.avatarUrl) {
      // Update avatar if not already set
      await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: picture }
      });
      user.avatarUrl = picture;
    }

    const role = user.role === 'ADMIN' ? 'ADMIN' : 'STUDENT';

    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: role as 'STUDENT' | 'ADMIN',
      name: user.name
    });

    res.cookie('bravo_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const activeEnrollments = user.enrollments.filter(
      (e) => e.status === 'ACTIVE' && new Date(e.expiresAt) > new Date()
    );

    return res.json({
      success: true,
      message: 'Google authentication successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetForce: user.targetForce,
        avatarUrl: user.avatarUrl,
        studentProfile: user.studentProfile,
        enrollments: activeEnrollments,
        pendingPayment: user.payments[0] || null
      },
      token
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Google sign-in failed.' });
  }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth) {
      return res.status(401).json({ success: false, user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        targetForce: true,
        avatarUrl: true,
        studentProfile: true,
        enrollments: {
          include: {
            course: true
          }
        },
        payments: {
          where: { status: 'PENDING_APPROVAL' },
          include: { course: true },
          take: 1
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, user: null });
    }

    const activeEnrollments = user.enrollments.filter(
      (e) => e.status === 'ACTIVE' && new Date(e.expiresAt) > new Date()
    );

    return res.json({
      success: true,
      user: {
        ...user,
        enrollments: activeEnrollments,
        allEnrollments: user.enrollments,
        pendingPayment: user.payments[0] || null
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('bravo_token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
