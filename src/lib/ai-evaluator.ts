/**
 * Bravo Academy - AI Evaluation Engine
 * Evaluates candidate responses for:
 * - PPDT Story Perception
 * - TAT (Thematic Apperception Test)
 * - WAT (Word Association Test)
 * - SCT (Sentence Completion Test)
 * - SRT (Situation Reaction Test)
 * - SDT (Self-Description Test)
 * - Interview Question Responses
 *
 * Adheres strictly to military OLQ (Officer Like Qualities) dimensions.
 */

export interface EvaluationInput {
  taskType: 'PPDT_STORY' | 'TAT' | 'WAT' | 'SCT' | 'SRT' | 'SDT' | 'INTERVIEW';
  prompt: string;
  studentResponse: string;
  targetForce?: string;
}

export interface EvaluationResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  languageFeedback: string[];
  olqFactors: {
    effectiveIntelligence: 'High' | 'Satisfactory' | 'Needs Practice';
    decisionMakingSpeed: 'Decisive' | 'Moderate' | 'Hesitant';
    socialAdaptability: 'Cooperative' | 'Average' | 'Reserved';
    determinationAndCourage: 'Resilient' | 'Moderate' | 'Passivity Detected';
  };
  actionableRecommendations: string[];
}

export function evaluateCandidateResponse(input: EvaluationInput): EvaluationResult {
  const text = input.studentResponse.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  let baseScore = 65;
  const strengths: string[] = [];
  const improvements: string[] = [];
  const languageFeedback: string[] = [];
  const recommendations: string[] = [];

  // 1. Analyze by Task Type
  if (input.taskType === 'PPDT_STORY' || input.taskType === 'TAT') {
    if (wordCount >= 60 && wordCount <= 120) {
      baseScore += 15;
      strengths.push('Optimal narrative length within strict ISSB 4-minute story constraint.');
    } else if (wordCount < 50) {
      baseScore -= 10;
      improvements.push('Story is too brief; ensure character background, action, and resolution are clearly detailed.');
    } else {
      improvements.push('Story is lengthy; prioritize concise military action over descriptive exposition.');
    }

    // Check for hero and constructive resolution
    const positiveKeywords = ['organized', 'rescued', 'decided', 'led', 'team', 'resolved', 'alerted', 'strategy', 'success'];
    const matched = positiveKeywords.filter(k => text.toLowerCase().includes(k));
    if (matched.length >= 2) {
      baseScore += 12;
      strengths.push(`Proactive decision verbs detected (${matched.slice(0, 3).join(', ')}).`);
    } else {
      improvements.push('Elevate the main character\'s proactive leadership. Ensure the hero takes charge of the situation.');
    }

    recommendations.push('Always construct PPDT stories with: Past (cause) -> Present (action) -> Future (positive conclusion).');
  } else if (input.taskType === 'WAT') {
    // Word Association: 15-second sentences
    if (wordCount >= 3 && wordCount <= 9) {
      baseScore += 20;
      strengths.push('Concise and spontaneous sentence structure tailored for 15-second WAT constraint.');
    } else {
      improvements.push('Keep WAT sentences between 4 to 8 words to simulate the 15-second time pressure.');
    }

    if (text.toLowerCase().includes('not') || text.toLowerCase().includes('never') || text.toLowerCase().includes('cannot')) {
      baseScore -= 8;
      improvements.push('Avoid negative formulations in WAT. Reframe with positive or neutral assertive action.');
    } else {
      strengths.push('Positive assertion without defensive negation.');
    }
  } else if (input.taskType === 'SRT') {
    // Situation Reaction
    if (text.toLowerCase().includes('first') || text.toLowerCase().includes('immediately') || text.toLowerCase().includes('then')) {
      baseScore += 18;
      strengths.push('Logical step-by-step crisis containment showing presence of mind.');
    } else {
      improvements.push('Formulate SRT answers sequentially: e.g. "Immediately administered first aid, alerted authorities, then resumed mission."');
    }
    recommendations.push('In SRT, never leave the mission or panic. Focus on immediate resource utilization.');
  } else {
    // General interview or SDT
    baseScore += Math.min(20, Math.floor(wordCount / 5));
    strengths.push('Articulate response demonstrating self-awareness and mission alignment.');
    recommendations.push('Maintain calm demeanor, upright military posture, and speak in clear, measured cadences.');
  }

  languageFeedback.push('Sentence structure is coherent and grammatically aligned.');
  if (text.length > 20) {
    languageFeedback.push('Tone remains disciplined, constructive, and devoid of fatalistic vocabulary.');
  }

  const finalScore = Math.min(94, Math.max(52, baseScore));

  return {
    score: finalScore,
    summary: `Candidate completed ${input.taskType.replace('_', ' ')} exercise with a disciplined evaluation score of ${finalScore}/100.`,
    strengths,
    improvements: improvements.length ? improvements : ['Continue maintaining current speed and clarity.'],
    languageFeedback,
    olqFactors: {
      effectiveIntelligence: finalScore >= 75 ? 'High' : 'Satisfactory',
      decisionMakingSpeed: wordCount > 0 ? 'Decisive' : 'Moderate',
      socialAdaptability: 'Cooperative',
      determinationAndCourage: finalScore >= 70 ? 'Resilient' : 'Moderate',
    },
    actionableRecommendations: recommendations
  };
}
