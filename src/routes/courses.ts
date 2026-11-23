import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { extractAuthUser } from '../lib/auth';

const router = Router();

// GET /api/courses
router.get('/', async (req: Request, res: Response) => {
  try {
    const { force, category } = req.query;

    const where: any = { status: 'PUBLISHED' };
    if (force && force !== 'ALL') {
      where.targetForce = { in: [String(force), 'ALL'] };
    }
    if (category) {
      where.category = String(category);
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, courses });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/courses
router.post('/', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized: Command admin access required.' });
    }

    const { title, slug, description, targetForce, regularPrice, discountPrice, validityDays, includedFeatures, curriculum } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        targetForce: targetForce || 'ALL',
        regularPrice: Number(regularPrice) || 5000,
        discountPrice: Number(discountPrice) || 2999,
        validityDays: Number(validityDays) || 90,
        includedFeatures: typeof includedFeatures === 'string' ? includedFeatures : JSON.stringify(includedFeatures || []),
        curriculum: typeof curriculum === 'string' ? curriculum : JSON.stringify(curriculum || [])
      }
    });

    return res.status(201).json({ success: true, course });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/courses/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      }
    });

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    return res.json({ success: true, course });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/courses/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized: Admin access required.' });
    }

    const body = req.body;
    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        ...body,
        regularPrice: body.regularPrice ? Number(body.regularPrice) : undefined,
        discountPrice: body.discountPrice ? Number(body.discountPrice) : undefined,
        validityDays: body.validityDays ? Number(body.validityDays) : undefined,
      }
    });

    return res.json({ success: true, course: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/courses/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await prisma.course.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Course removed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
