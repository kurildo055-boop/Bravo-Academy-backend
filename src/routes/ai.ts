import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { extractAuthUser } from '../lib/auth';
import { evaluateCandidateResponse } from '../lib/ai-evaluator';

const router = Router();

// POST /api/ai/evaluate
router.post('/evaluate', async (req: Request, res: Response) => {
  try {
    const auth = extractAuthUser(req);
    const { taskType, prompt, studentResponse, targetForce } = req.body;

    if (!studentResponse || !studentResponse.trim()) {
      return res.status(400).json({ success: false, error: 'Response content is required.' });
    }

    const evaluation = evaluateCandidateResponse({
      taskType: taskType || 'PPDT_STORY',
      prompt: prompt || 'Candidate Practice Response',
      studentResponse,
      targetForce: targetForce || 'ARMY'
    });

    let evaluationId = null;
    if (auth) {
      const record = await prisma.aiEvaluation.create({
        data: {
          userId: auth.userId,
          evaluationType: taskType || 'PPDT_STORY',
          promptContent: prompt || 'Standard ISSB Prompt',
          userSubmission: studentResponse,
          aiScore: evaluation.score,
          analysisJson: JSON.stringify(evaluation)
        }
      });
      evaluationId = record.id;
    }

    return res.json({
      success: true,
      evaluationId,
      evaluation
    });
  } catch (err: any) {
    console.error('AI evaluation error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
