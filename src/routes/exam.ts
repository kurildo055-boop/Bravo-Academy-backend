import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { extractAuthUser } from '../lib/auth';

const router = Router();

// POST /api/exam/submit
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    const { examId, answers, timeSpentSec } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, error: 'No answer submissions provided.' });
    }

    const questionIds = answers.map((a: any) => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { options: true, category: true }
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    let correctCount = 0;
    const reviewedAnswers = [];

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;

      const isCorrect = ans.chosenAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;

      reviewedAnswers.push({
        questionId: q.id,
        questionText: q.questionText,
        options: q.options,
        category: q.category.name,
        difficulty: q.difficulty,
        chosenAnswer: ans.chosenAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || 'Step-by-step military solution.'
      });
    }

    const percentage = Math.round((correctCount / answers.length) * 100);
    const isPassed = percentage >= 60;

    let attemptId = null;
    if (auth) {
      const defaultExam = examId || (await prisma.exam.findFirst())?.id;
      if (defaultExam) {
        const attempt = await prisma.examAttempt.create({
          data: {
            userId: auth.userId,
            examId: defaultExam,
            score: percentage,
            totalScore: 100,
            isPassed,
            timeSpentSec: Number(timeSpentSec) || 60,
            status: 'COMPLETED'
          }
        });
        attemptId = attempt.id;
      }
    }

    return res.json({
      success: true,
      attemptId,
      score: percentage,
      correctCount,
      totalQuestions: answers.length,
      percentage,
      isPassed,
      evaluatedAt: new Date().toISOString(),
      reviewedAnswers
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
