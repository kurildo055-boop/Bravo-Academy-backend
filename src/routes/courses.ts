import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { extractAuthUser } from '../lib/auth';

const router = Router();

// GET /api/courses
router.get('/', async (req: Request, res: Response) => {
  try {
    const { force, category, all } = req.query;

    const where: any = {};
    if (all !== 'true') {
      where.status = 'PUBLISHED';
    }
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

// POST /api/courses (Admin Create Course)
router.post('/', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized: Command admin access required.' });
    }

    const {
      title,
      slug,
      description,
      thumbnail,
      targetForce,
      category,
      regularPrice,
      discountPrice,
      validityDays,
      durationWeeks,
      status,
      isFeatured,
      includedFeatures,
      curriculum
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description are required.' });
    }

    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Handle features: can be array or string
    let featuresJson = '[]';
    if (Array.isArray(includedFeatures)) {
      featuresJson = JSON.stringify(includedFeatures);
    } else if (typeof includedFeatures === 'string') {
      featuresJson = includedFeatures;
    }

    // Handle curriculum: can be array or string
    let curriculumJson = '[]';
    if (Array.isArray(curriculum)) {
      curriculumJson = JSON.stringify(curriculum);
    } else if (typeof curriculum === 'string') {
      curriculumJson = curriculum;
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        description: description.trim(),
        thumbnail: thumbnail || null,
        targetForce: targetForce || 'ALL',
        category: category || 'ISSB_FULL',
        regularPrice: Number(regularPrice) || 5000,
        discountPrice: Number(discountPrice) || 2999,
        validityDays: Number(validityDays) || 90,
        durationWeeks: Number(durationWeeks) || 8,
        status: status || 'PUBLISHED',
        isFeatured: Boolean(isFeatured),
        includedFeatures: featuresJson,
        curriculum: curriculumJson,
      }
    });

    return res.status(201).json({ success: true, course });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/courses/:id (by ID or Slug)
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

// PUT /api/courses/:id (Admin Update Course)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized: Admin access required.' });
    }

    const body = req.body;
    const {
      title,
      slug,
      description,
      thumbnail,
      targetForce,
      category,
      regularPrice,
      discountPrice,
      validityDays,
      durationWeeks,
      status,
      isFeatured,
      includedFeatures,
      curriculum
    } = body;

    let featuresJson = undefined;
    if (includedFeatures !== undefined) {
      featuresJson = Array.isArray(includedFeatures) ? JSON.stringify(includedFeatures) : String(includedFeatures);
    }

    let curriculumJson = undefined;
    if (curriculum !== undefined) {
      curriculumJson = Array.isArray(curriculum) ? JSON.stringify(curriculum) : String(curriculum);
    }

    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        title: title ? title.trim() : undefined,
        slug: slug || undefined,
        description: description ? description.trim() : undefined,
        thumbnail: thumbnail !== undefined ? thumbnail : undefined,
        targetForce: targetForce || undefined,
        category: category || undefined,
        regularPrice: regularPrice !== undefined ? Number(regularPrice) : undefined,
        discountPrice: discountPrice !== undefined ? Number(discountPrice) : undefined,
        validityDays: validityDays !== undefined ? Number(validityDays) : undefined,
        durationWeeks: durationWeeks !== undefined ? Number(durationWeeks) : undefined,
        status: status || undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        includedFeatures: featuresJson,
        curriculum: curriculumJson,
      }
    });

    return res.json({ success: true, course: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/courses/:id (Admin Delete Course)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized: Command admin access required.' });
    }

    const { id } = req.params;

    const existing = await prisma.course.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Course not found in database.' });
    }

    await prisma.course.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: `Course "${existing.title}" deleted from database.`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
