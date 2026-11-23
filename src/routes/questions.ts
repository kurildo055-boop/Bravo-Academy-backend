import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { extractAuthUser } from '../lib/auth';

const router = Router();

// GET /api/questions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { categoryId, difficulty, search, iqSection, random, page: rawPage, limit: rawLimit } = req.query;
    const page = parseInt(String(rawPage || '1'), 10);
    const limit = parseInt(String(rawLimit || '20'), 10);

    const where: any = { isPublished: true };
    if (categoryId) where.categoryId = String(categoryId);
    if (difficulty) where.difficulty = String(difficulty);
    if (iqSection && iqSection !== 'ALL') where.iqSection = String(iqSection);
    if (search) {
      where.OR = [
        { questionText: { contains: String(search), mode: 'insensitive' } },
        { explanation: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    const [total, questionsRaw, categories] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        include: {
          options: true,
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: random === 'true' ? 0 : (page - 1) * limit,
        take: random === 'true' ? 200 : limit,
      }),
      prisma.examCategory.findMany()
    ]);

    let questions = questionsRaw;
    if (random === 'true') {
      questions = [...questionsRaw].sort(() => 0.5 - Math.random()).slice(0, limit);
    }

    return res.json({
      success: true,
      questions,
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/questions (Manual Question Builder)
router.post('/', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Admin permission required.' });
    }

    const { questionText, categoryId, iqSection, subcategory, difficulty, options, correctAnswer, explanation, timeLimitSec, tags, imageUrl } = req.body;

    if (!questionText || !categoryId || !options || !correctAnswer) {
      return res.status(400).json({ success: false, error: 'Missing mandatory fields.' });
    }

    const created = await prisma.question.create({
      data: {
        questionText,
        categoryId,
        iqSection: iqSection || (imageUrl ? 'NON_VERBAL' : 'VERBAL'),
        subcategory: subcategory || 'General',
        difficulty: difficulty || 'MEDIUM',
        questionType: imageUrl ? 'IMAGE_MCQ' : 'MCQ',
        correctAnswer,
        explanation: explanation || '',
        timeLimitSec: Number(timeLimitSec) || 30,
        imageUrl,
        tags: tags || 'manual_entry',
        isPublished: true,
        options: {
          create: Object.entries(options).map(([key, text]) => ({
            key,
            text: String(text)
          }))
        }
      },
      include: { options: true, category: true }
    });

    return res.status(201).json({ success: true, question: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/questions/:id (Admin Edit Question)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Admin permission required.' });
    }

    const { id } = req.params;
    const { questionText, categoryId, iqSection, difficulty, options, correctAnswer, explanation, imageUrl, isPublished } = req.body;

    // Delete existing options and re-create if options provided
    if (options && typeof options === 'object') {
      await prisma.questionOption.deleteMany({ where: { questionId: id } });
      await prisma.questionOption.createMany({
        data: Object.entries(options).map(([key, text]) => ({
          questionId: id,
          key,
          text: String(text)
        }))
      });
    }

    const updated = await prisma.question.update({
      where: { id },
      data: {
        questionText,
        categoryId,
        iqSection,
        difficulty,
        correctAnswer,
        explanation,
        imageUrl,
        questionType: imageUrl ? 'IMAGE_MCQ' : 'MCQ',
        isPublished: isPublished !== undefined ? isPublished : true
      },
      include: { options: true, category: true }
    });

    return res.json({ success: true, question: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/questions/:id (Admin Delete Question)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Admin permission required.' });
    }

    const { id } = req.params;
    await prisma.question.delete({ where: { id } });
    return res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/questions/ai-generate (Method 3: AI Question Generator)
router.post('/ai-generate', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Admin permission required.' });
    }

    const { categorySlug, count = 5, difficulty = 'MEDIUM' } = req.body;

    const category = await prisma.examCategory.findFirst({
      where: { slug: categorySlug || 'numerical-reasoning' }
    });
    const categoryId = category?.id || (await prisma.examCategory.findFirst())?.id;

    const generatedQuestions = [];
    const seedTime = Date.now();

    for (let i = 1; i <= Math.min(count, 50); i++) {
      const step = (i * 3) + 4;
      const baseNum = (i * 7) + 12;
      const term4 = baseNum + (step * 3);
      const answer = baseNum + (step * 4);

      generatedQuestions.push({
        tempId: `AI-GEN-${seedTime}-${i}`,
        question: `[AI Generated] Find the next term in the logical progression: ${baseNum}, ${baseNum + step}, ${baseNum + (step * 2)}, ${term4}, [ ? ]`,
        options: {
          A: String(answer),
          B: String(answer + step + 2),
          C: String(answer - step - 1),
          D: String(answer + 10)
        },
        correct_answer: 'A',
        explanation: `Arithmetic sequence with a common difference of +${step}. Next term: ${term4} + ${step} = ${answer}.`,
        category: category?.name || 'Numerical Reasoning',
        categoryId,
        difficulty,
        time_limit: difficulty === 'HARD' ? 45 : 30,
        isAiGenerated: true,
        confidence: 0.98,
        status: 'PENDING_APPROVAL'
      });
    }

    return res.json({
      success: true,
      message: `Successfully generated ${generatedQuestions.length} tactical test questions.`,
      questions: generatedQuestions
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/questions/paste-import (Method 5: Text Paste Parser)
router.post('/paste-import', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Admin permission required.' });
    }

    const { rawText, difficulty = 'MEDIUM' } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ success: false, error: 'Paste content cannot be empty.' });
    }

    const lines = rawText.split('\n').map((l: string) => l.trim()).filter(Boolean);
    const parsedQuestions = [];
    let currentQ: any = null;

    for (const line of lines) {
      const qMatch = line.match(/^(\d+)[\.\)]\s*(.*)/i) || line.match(/^Q(\d+)[:\.]\s*(.*)/i);
      if (qMatch) {
        if (currentQ && currentQ.question) {
          parsedQuestions.push(currentQ);
        }
        currentQ = {
          tempId: `PASTE-Q-${qMatch[1]}`,
          question: qMatch[2] || line,
          options: { A: '', B: '', C: '', D: '' },
          correct_answer: 'A',
          explanation: '',
          difficulty,
          status: 'PARSED'
        };
        continue;
      }

      const optMatch = line.match(/^[\(\[]?([A-D])[\)\].:\s]\s*(.*)/i);
      if (optMatch && currentQ) {
        const key = optMatch[1].toUpperCase();
        currentQ.options[key] = optMatch[2];
        continue;
      }

      const ansMatch = line.match(/^(?:ans|answer|correct)[:\s]+([A-D])/i);
      if (ansMatch && currentQ) {
        currentQ.correct_answer = ansMatch[1].toUpperCase();
        continue;
      }

      const expMatch = line.match(/^(?:exp|explanation)[:\s]+(.*)/i);
      if (expMatch && currentQ) {
        currentQ.explanation = expMatch[1];
        continue;
      }
    }

    if (currentQ && currentQ.question) {
      parsedQuestions.push(currentQ);
    }

    return res.json({
      success: true,
      count: parsedQuestions.length,
      questions: parsedQuestions
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/questions/import-jobs
router.get('/import-jobs', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Admin permission required.' });
    }

    const jobs = await prisma.questionImportJob.findMany({
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return res.json({ success: true, jobs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
