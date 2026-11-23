import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { extractAuthUser } from '../lib/auth';

const router = Router();

function requireAdmin(req: Request, res: Response): boolean {
  const auth = extractAuthUser(req);
  if (!auth || auth.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Admin permission required.' });
    return false;
  }
  return true;
}

/* ========================================================
   OPTION 4: PPDT (Picture Perception & Discussion Test)
   ======================================================== */

// GET /api/modules/ppdt
router.get('/ppdt', async (req: Request, res: Response) => {
  try {
    const scenarios = await prisma.ppdtScenario.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, scenarios });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/modules/ppdt (Admin Create)
router.post('/ppdt', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { title, imageUrl, description, characterHints, modelStory, tips, difficulty } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, error: 'Title and Image URL are required.' });
    }

    const created = await prisma.ppdtScenario.create({
      data: {
        title,
        imageUrl,
        description,
        characterHints: typeof characterHints === 'object' ? JSON.stringify(characterHints) : characterHints,
        modelStory,
        tips,
        difficulty: difficulty || 'MEDIUM',
        isPublished: true
      }
    });

    return res.status(201).json({ success: true, scenario: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/modules/ppdt/:id (Admin Edit)
router.put('/ppdt/:id', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    const { title, imageUrl, description, characterHints, modelStory, tips, difficulty, isPublished } = req.body;

    const updated = await prisma.ppdtScenario.update({
      where: { id },
      data: {
        title,
        imageUrl,
        description,
        characterHints: typeof characterHints === 'object' ? JSON.stringify(characterHints) : characterHints,
        modelStory,
        tips,
        difficulty,
        isPublished
      }
    });

    return res.json({ success: true, scenario: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/modules/ppdt/:id (Admin Delete)
router.delete('/ppdt/:id', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    await prisma.ppdtScenario.delete({ where: { id } });
    return res.json({ success: true, message: 'PPDT scenario deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ========================================================
   OPTION 5: PSYCHOLOGY BATTERY (WAT, TAT, SCT, SRT, SD)
   ======================================================== */

// GET /api/modules/psychology
router.get('/psychology', async (req: Request, res: Response) => {
  try {
    const { type, limit: rawLimit } = req.query;
    const where: any = { isPublished: true };
    if (type) where.testType = String(type);

    const limit = rawLimit ? Number(rawLimit) : undefined;
    const items = await prisma.psychologyItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return res.json({ success: true, items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/modules/psychology (Admin Create single item)
router.post('/psychology', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { testType, promptText, imageUrl, timeLimitSec, sampleAnswer, category } = req.body;

    if (!testType || (!promptText && !imageUrl)) {
      return res.status(400).json({ success: false, error: 'Test type and prompt/image required.' });
    }

    const created = await prisma.psychologyItem.create({
      data: {
        testType,
        promptText: promptText || '',
        imageUrl,
        timeLimitSec: Number(timeLimitSec) || (testType === 'WAT' ? 15 : testType === 'TAT' ? 240 : 30),
        sampleAnswer,
        category,
        isPublished: true
      }
    });

    return res.status(201).json({ success: true, item: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/modules/psychology/bulk-wat (Effortless Bulk WAT Words Paste for Admin)
router.post('/psychology/bulk-wat', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { rawWords } = req.body; // e.g. "COURAGE, LEADER, BLOOD, WAR, DEFEAT..."

    if (!rawWords) {
      return res.status(400).json({ success: false, error: 'Raw words string required.' });
    }

    const words = String(rawWords)
      .split(/[\n,;]+/)
      .map((w) => w.trim().toUpperCase())
      .filter((w) => w.length > 0);

    const created = await prisma.psychologyItem.createMany({
      data: words.map((w) => ({
        testType: 'WAT',
        promptText: w,
        timeLimitSec: 15,
        isPublished: true
      }))
    });

    return res.json({ success: true, count: created.count });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/modules/psychology/:id (Admin Edit)
router.put('/psychology/:id', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    const { promptText, imageUrl, timeLimitSec, sampleAnswer, category, isPublished } = req.body;

    const updated = await prisma.psychologyItem.update({
      where: { id },
      data: {
        promptText,
        imageUrl,
        timeLimitSec: Number(timeLimitSec),
        sampleAnswer,
        category,
        isPublished
      }
    });

    return res.json({ success: true, item: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/modules/psychology/:id (Admin Delete)
router.delete('/psychology/:id', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    await prisma.psychologyItem.delete({ where: { id } });
    return res.json({ success: true, message: 'Psychology item deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ========================================================
   OPTION 6 & 7: GTO & MILITARY PLANNING EXERCISE (MPE)
   ======================================================== */

// GET /api/modules/gto
router.get('/gto', async (req: Request, res: Response) => {
  try {
    const { taskType } = req.query;
    const where: any = { isPublished: true };
    if (taskType) where.taskType = String(taskType);

    const tasks = await prisma.gtoTask.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, tasks });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/modules/gto (Admin Create GTO/MPE task)
router.post('/gto', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { taskType, title, description, mapImageUrl, resources, rules, modelSolution, timeAllowedMin } = req.body;

    if (!taskType || !title || !description) {
      return res.status(400).json({ success: false, error: 'Type, title, and description required.' });
    }

    const created = await prisma.gtoTask.create({
      data: {
        taskType,
        title,
        description,
        mapImageUrl,
        resources: typeof resources === 'object' ? JSON.stringify(resources) : resources,
        rules: typeof rules === 'object' ? JSON.stringify(rules) : rules,
        modelSolution,
        timeAllowedMin: Number(timeAllowedMin) || 30,
        isPublished: true
      }
    });

    return res.status(201).json({ success: true, task: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/modules/gto/:id (Admin Edit)
router.put('/gto/:id', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    const { taskType, title, description, mapImageUrl, resources, rules, modelSolution, timeAllowedMin, isPublished } = req.body;

    const updated = await prisma.gtoTask.update({
      where: { id },
      data: {
        taskType,
        title,
        description,
        mapImageUrl,
        resources: typeof resources === 'object' ? JSON.stringify(resources) : resources,
        rules: typeof rules === 'object' ? JSON.stringify(rules) : rules,
        modelSolution,
        timeAllowedMin: Number(timeAllowedMin),
        isPublished
      }
    });

    return res.json({ success: true, task: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/modules/gto/:id (Admin Delete)
router.delete('/gto/:id', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    await prisma.gtoTask.delete({ where: { id } });
    return res.json({ success: true, message: 'GTO task deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ========================================================
   OPTION 8: BOARD INTERVIEW QUESTIONS
   ======================================================== */

// GET /api/modules/interview
router.get('/interview', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const where: any = { isPublished: true };
    if (category) where.category = String(category);

    const questions = await prisma.interviewQuestion.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, questions });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/modules/interview (Admin Create)
router.post('/interview', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { category, questionText, guidelines, counterQuestions } = req.body;

    if (!questionText) {
      return res.status(400).json({ success: false, error: 'Question text is required.' });
    }

    const created = await prisma.interviewQuestion.create({
      data: {
        category: category || 'DEFENSE_GK',
        questionText,
        guidelines,
        counterQuestions: typeof counterQuestions === 'object' ? JSON.stringify(counterQuestions) : counterQuestions,
        isPublished: true
      }
    });

    return res.status(201).json({ success: true, question: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/modules/interview/:id (Admin Edit)
router.put('/interview/:id', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    const { category, questionText, guidelines, counterQuestions, isPublished } = req.body;

    const updated = await prisma.interviewQuestion.update({
      where: { id },
      data: {
        category,
        questionText,
        guidelines,
        counterQuestions: typeof counterQuestions === 'object' ? JSON.stringify(counterQuestions) : counterQuestions,
        isPublished
      }
    });

    return res.json({ success: true, question: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/modules/interview/:id (Admin Delete)
router.delete('/interview/:id', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    await prisma.interviewQuestion.delete({ where: { id } });
    return res.json({ success: true, message: 'Interview question deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ========================================================
   OPTION 9: PHYSICAL OBSTACLES GUIDE
   ======================================================== */

// GET /api/modules/physical
router.get('/physical', async (req: Request, res: Response) => {
  try {
    const obstacles = await prisma.physicalObstacle.findMany({
      orderBy: { obstacleNumber: 'asc' }
    });
    return res.json({ success: true, obstacles });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/modules/physical (Admin Upsert Obstacle)
router.post('/physical', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { obstacleNumber, name, marks, imageUrl, techniqueGuide, commonMistakes, orderStrategy } = req.body;

    const upserted = await prisma.physicalObstacle.upsert({
      where: { obstacleNumber: Number(obstacleNumber) },
      update: {
        name,
        marks: Number(marks) || 5,
        imageUrl,
        techniqueGuide,
        commonMistakes,
        orderStrategy
      },
      create: {
        obstacleNumber: Number(obstacleNumber),
        name,
        marks: Number(marks) || 5,
        imageUrl,
        techniqueGuide,
        commonMistakes,
        orderStrategy
      }
    });

    return res.json({ success: true, obstacle: upserted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/modules/physical/:id (Admin Delete Obstacle)
router.delete('/physical/:id', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    await prisma.physicalObstacle.delete({ where: { id } });
    return res.json({ success: true, message: 'Physical obstacle deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
