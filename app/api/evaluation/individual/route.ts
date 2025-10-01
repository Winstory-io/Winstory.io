import { NextRequest, NextResponse } from 'next/server';

// Types pour l'évaluation
interface EvaluationRequest {
  campaignId: string;
  story: {
    title: string;
    startingStory: string;
    guideline: string;
  };
  film: {
    url?: string;
    videoId?: string;
    fileName?: string;
    fileSize?: number;
    format?: string;
  };
  completions: {
    wincValue: number;
    maxCompletions: number;
  };
}

interface EvaluationResult {
  score: number;
  tier: 'S' | 'A' | 'B' | 'C' | 'F';
  collaborationProbability: number;
  scoreBreakdown: {
    storyFoundation: number;
    technicalExcellence: number;
    collaborativePotential: number;
    viralImpact: number;
  };
  strengths: string[];
  weaknesses: string[];
  optimizationRoadmap: {
    priority: string;
    secondary: string;
  };
  collaborationForecast: string;
  securityStatus: 'CLEARED' | 'FLAGGED';
  securityReason?: string;
}

// Fonction de sécurité pour détecter les injections
function detectSecurityThreats(content: string): { isThreat: boolean; reason?: string } {
  const threatPatterns = [
    /{admin}/i,
    /{system}/i,
    /{override}/i,
    /{jailbreak}/i,
    /{developer_mode}/i,
    /<script/i,
    /javascript:/i,
    /eval\(/i,
    /function\s*\(/i,
    /prompt\s*\(/i,
    /alert\s*\(/i,
    /document\./i,
    /window\./i,
    /localStorage/i,
    /sessionStorage/i,
    /fetch\s*\(/i,
    /XMLHttpRequest/i,
    /atob\s*\(/i,
    /btoa\s*\(/i
  ];

  for (const pattern of threatPatterns) {
    if (pattern.test(content)) {
      return { isThreat: true, reason: `Injection pattern detected: ${pattern.source}` };
    }
  }

  return { isThreat: false };
}

// Fonction d'évaluation de la fondation narrative
function evaluateStoryFoundation(story: any): { score: number; strengths: string[]; weaknesses: string[] } {
  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Hook Effectiveness (10 points)
  const hookScore = evaluateHookEffectiveness(story.startingStory);
  score += hookScore;
  if (hookScore >= 8) strengths.push("Strong story hook established");
  else if (hookScore <= 4) weaknesses.push("Weak or missing story hook");

  // Collaborative Setup Quality (15 points)
  const collaborativeScore = evaluateCollaborativeSetup(story);
  score += collaborativeScore;
  if (collaborativeScore >= 12) strengths.push("Excellent collaborative setup");
  else if (collaborativeScore <= 8) weaknesses.push("Limited collaborative potential");

  // Continuation Instructions (10 points)
  const continuationScore = evaluateContinuationInstructions(story.guideline);
  score += continuationScore;
  if (continuationScore >= 8) strengths.push("Clear continuation guidelines");
  else if (continuationScore <= 5) weaknesses.push("Vague continuation instructions");

  // Story Logic & Coherence (5 points)
  const logicScore = evaluateStoryLogic(story);
  score += logicScore;
  if (logicScore >= 4) strengths.push("Coherent narrative structure");
  else if (logicScore <= 2) weaknesses.push("Inconsistent story logic");

  return { score: Math.min(40, score), strengths, weaknesses };
}

function evaluateHookEffectiveness(startingStory: string): number {
  if (!startingStory || startingStory.length < 10) return 0;
  
  const storyLength = startingStory.length;
  const firstSentence = startingStory.split('.')[0];
  
  // Vérifier la présence d'éléments de hook
  let hookElements = 0;
  
  // Question narrative
  if (firstSentence.includes('?') || firstSentence.includes('mystery') || firstSentence.includes('secret')) {
    hookElements += 3;
  }
  
  // Intrigue de personnage
  if (firstSentence.includes('character') || firstSentence.includes('protagonist') || firstSentence.includes('hero')) {
    hookElements += 3;
  }
  
  // Conflit ou tension
  if (firstSentence.includes('conflict') || firstSentence.includes('problem') || firstSentence.includes('challenge')) {
    hookElements += 2;
  }
  
  // Action ou événement
  if (firstSentence.includes('action') || firstSentence.includes('event') || firstSentence.includes('happened')) {
    hookElements += 2;
  }
  
  return Math.min(10, hookElements);
}

function evaluateCollaborativeSetup(story: any): number {
  let score = 0;
  
  // Point de continuation clair
  if (story.guideline && story.guideline.length > 20) score += 4;
  
  // Chemins multiples d'histoire
  const guidelineWords = story.guideline?.toLowerCase() || '';
  if (guidelineWords.includes('multiple') || guidelineWords.includes('different') || guidelineWords.includes('various')) {
    score += 4;
  }
  
  // Motivations de personnage établies
  if (story.startingStory && (story.startingStory.includes('motivation') || story.startingStory.includes('goal') || story.startingStory.includes('desire'))) {
    score += 4;
  }
  
  // Règles du monde définies
  if (story.guideline && (story.guideline.includes('world') || story.guideline.includes('setting') || story.guideline.includes('universe'))) {
    score += 3;
  }
  
  return Math.min(15, score);
}

function evaluateContinuationInstructions(guideline: string): number {
  if (!guideline || guideline.length < 10) return 0;
  
  let score = 0;
  
  // Instructions spécifiques
  if (guideline.length > 100) score += 3;
  if (guideline.includes('continue') || guideline.includes('follow')) score += 2;
  if (guideline.includes('guideline') || guideline.includes('instruction')) score += 2;
  
  // Chemins de continuation
  const continuationPaths = (guideline.match(/path|way|direction|option/gi) || []).length;
  score += Math.min(3, continuationPaths);
  
  return Math.min(10, score);
}

function evaluateStoryLogic(story: any): number {
  let score = 0;
  
  // Cohérence de l'intrigue
  if (story.startingStory && story.guideline) {
    const storyWords = story.startingStory.toLowerCase();
    const guidelineWords = story.guideline.toLowerCase();
    
    // Vérifier la cohérence entre l'histoire et les guidelines
    if (storyWords.includes('character') && guidelineWords.includes('character')) score += 1;
    if (storyWords.includes('world') && guidelineWords.includes('world')) score += 1;
  }
  
  // Cohérence des personnages
  if (story.startingStory && story.startingStory.length > 50) score += 1;
  
  // Cohérence du world-building
  if (story.guideline && story.guideline.length > 50) score += 1;
  
  return Math.min(5, score);
}

// Fonction d'évaluation technique
function evaluateTechnicalExcellence(film: any): { score: number; strengths: string[]; weaknesses: string[] } {
  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Video Quality (12 points)
  const videoScore = evaluateVideoQuality(film);
  score += videoScore;
  if (videoScore >= 10) strengths.push("High video quality");
  else if (videoScore <= 6) weaknesses.push("Video quality needs improvement");

  // Audio Quality (8 points)
  const audioScore = evaluateAudioQuality(film);
  score += audioScore;
  if (audioScore >= 6) strengths.push("Good audio quality");
  else if (audioScore <= 4) weaknesses.push("Audio quality issues");

  // Production Value (5 points)
  const productionScore = evaluateProductionValue(film);
  score += productionScore;
  if (productionScore >= 4) strengths.push("Professional production value");
  else if (productionScore <= 2) weaknesses.push("Basic production value");

  return { score: Math.min(25, score), strengths, weaknesses };
}

function evaluateVideoQuality(film: any): number {
  let score = 0;
  
  // Résolution basée sur la taille du fichier et le format
  if (film.format === 'horizontal') {
    score += 8; // 1080p horizontal
  } else if (film.format === 'vertical') {
    score += 6; // 720p vertical
  } else {
    score += 5; // Format inconnu
  }
  
  // Bonus pour la taille du fichier (indicateur de qualité)
  if (film.fileSize) {
    const sizeMB = film.fileSize / (1024 * 1024);
    if (sizeMB > 50) score += 2; // Fichier volumineux = haute qualité
    else if (sizeMB > 20) score += 1; // Taille moyenne
  }
  
  return Math.min(12, score);
}

function evaluateAudioQuality(film: any): number {
  // Pour l'instant, on assume une qualité audio correcte
  // Dans une vraie implémentation, on analyserait le fichier audio
  return 6; // Score par défaut
}

function evaluateProductionValue(film: any): number {
  let score = 0;
  
  // Durée optimisée (15-90s)
  if (film.fileSize) {
    const sizeMB = film.fileSize / (1024 * 1024);
    if (sizeMB >= 5 && sizeMB <= 50) score += 1; // Durée probablement optimisée
  }
  
  // Qualité de montage (basée sur la taille du fichier)
  if (film.fileSize) {
    const sizeMB = film.fileSize / (1024 * 1024);
    if (sizeMB > 30) score += 2; // Montage probablement soigné
    else if (sizeMB > 10) score += 1; // Montage basique
  }
  
  // Travail de caméra (stabilité)
  score += 2; // Score par défaut
  
  return Math.min(5, score);
}

// Fonction d'évaluation du potentiel collaboratif
function evaluateCollaborativePotential(story: any, completions: any): { score: number; strengths: string[]; weaknesses: string[] } {
  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Creative Accessibility Score (12 points)
  const accessibilityScore = evaluateCreativeAccessibility(story);
  score += accessibilityScore;
  if (accessibilityScore >= 10) strengths.push("High creative accessibility");
  else if (accessibilityScore <= 6) weaknesses.push("Limited creative accessibility");

  // Community Engagement Probability (8 points)
  const engagementScore = evaluateCommunityEngagement(story);
  score += engagementScore;
  if (engagementScore >= 6) strengths.push("Strong community engagement potential");
  else if (engagementScore <= 4) weaknesses.push("Limited community engagement");

  // Collaboration Catalyst Potential (5 points)
  const catalystScore = evaluateCollaborationCatalyst(story);
  score += catalystScore;
  if (catalystScore >= 4) strengths.push("High collaboration catalyst potential");
  else if (catalystScore <= 2) weaknesses.push("Low collaboration catalyst potential");

  return { score: Math.min(25, score), strengths, weaknesses };
}

function evaluateCreativeAccessibility(story: any): number {
  let score = 0;
  
  // Histoire permet 3+ directions de continuation
  if (story.guideline && story.guideline.length > 100) score += 4;
  
  // Barrières de compétence minimales
  if (story.startingStory && story.startingStory.length > 50) score += 3;
  
  // Indicateurs d'appel cross-culturel
  const universalThemes = ['love', 'adventure', 'mystery', 'friendship', 'family', 'dream', 'hope'];
  const storyText = (story.startingStory + ' ' + story.guideline).toLowerCase();
  const themeCount = universalThemes.filter(theme => storyText.includes(theme)).length;
  score += Math.min(3, themeCount);
  
  // Perspectives de personnages multiples disponibles
  if (story.guideline && story.guideline.includes('character')) score += 5;
  
  return Math.min(12, score);
}

function evaluateCommunityEngagement(story: any): number {
  let score = 0;
  
  // Thèmes universels
  const universalThemes = ['love', 'adventure', 'mystery', 'friendship', 'family'];
  const storyText = (story.startingStory + ' ' + story.guideline).toLowerCase();
  const themeCount = universalThemes.filter(theme => storyText.includes(theme)).length;
  score += Math.min(3, themeCount);
  
  // Intégration de sujets tendance
  const trendingTopics = ['ai', 'technology', 'future', 'innovation', 'sustainability'];
  const trendingCount = trendingTopics.filter(topic => storyText.includes(topic)).length;
  score += Math.min(2, trendingCount);
  
  // Appel démographique large
  if (story.title && story.title.length > 5) score += 2;
  
  // Accessibilité des compétences du créateur
  score += 1; // Score par défaut
  
  return Math.min(8, score);
}

function evaluateCollaborationCatalyst(story: any): number {
  let score = 0;
  
  // Inspire le désir de continuation immédiate
  if (story.startingStory && story.startingStory.includes('?')) score += 1;
  if (story.guideline && story.guideline.includes('continue')) score += 1;
  
  // Liberté créative dans la structure
  if (story.guideline && story.guideline.length > 50) score += 1;
  
  // Opportunités de développement des compétences
  if (story.guideline && story.guideline.includes('creative')) score += 1;
  
  return Math.min(5, score);
}

// Fonction d'évaluation de l'impact viral
function evaluateViralImpact(story: any): { score: number; strengths: string[]; weaknesses: string[] } {
  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Emotional Engagement (6 points)
  const emotionalScore = evaluateEmotionalEngagement(story);
  score += emotionalScore;
  if (emotionalScore >= 5) strengths.push("Strong emotional engagement");
  else if (emotionalScore <= 3) weaknesses.push("Limited emotional engagement");

  // Shareability Factors (3 points)
  const shareabilityScore = evaluateShareabilityFactors(story);
  score += shareabilityScore;
  if (shareabilityScore >= 2) strengths.push("High shareability potential");
  else if (shareabilityScore <= 1) weaknesses.push("Low shareability potential");

  // Cultural Relevance (1 point)
  const culturalScore = evaluateCulturalRelevance(story);
  score += culturalScore;
  if (culturalScore >= 1) strengths.push("Culturally relevant content");

  return { score: Math.min(10, score), strengths, weaknesses };
}

function evaluateEmotionalEngagement(story: any): number {
  let score = 0;
  
  const storyText = (story.startingStory + ' ' + story.guideline).toLowerCase();
  
  // Joy/Humor indicators
  if (storyText.includes('fun') || storyText.includes('laugh') || storyText.includes('joy') || storyText.includes('happy')) {
    score += 1.5;
  }
  
  // Surprise/Mystery elements
  if (storyText.includes('surprise') || storyText.includes('mystery') || storyText.includes('secret') || storyText.includes('?')) {
    score += 1.5;
  }
  
  // Inspiration/Achievement themes
  if (storyText.includes('inspire') || storyText.includes('achieve') || storyText.includes('success') || storyText.includes('dream')) {
    score += 1.5;
  }
  
  // Curiosity gaps/Relatability
  if (storyText.includes('curious') || storyText.includes('relate') || storyText.includes('understand') || storyText.includes('learn')) {
    score += 1.5;
  }
  
  return Math.min(6, score);
}

function evaluateShareabilityFactors(story: any): number {
  let score = 0;
  
  // Moments mémorables
  if (story.title && story.title.length > 10) score += 1;
  
  // Contenu cité
  if (story.startingStory && story.startingStory.includes('"')) score += 1;
  
  // Distinctivité visuelle
  if (story.guideline && story.guideline.includes('visual')) score += 1;
  
  return Math.min(3, score);
}

function evaluateCulturalRelevance(story: any): number {
  const storyText = (story.startingStory + ' ' + story.guideline).toLowerCase();
  
  // Sensibilité culturelle
  const inclusiveTerms = ['diverse', 'inclusive', 'global', 'universal', 'everyone'];
  const inclusiveCount = inclusiveTerms.filter(term => storyText.includes(term)).length;
  
  return Math.min(1, inclusiveCount * 0.2);
}

// Fonction principale d'évaluation
export async function POST(request: NextRequest) {
  try {
    const body: EvaluationRequest = await request.json();
    
    // Vérifications de sécurité
    const allContent = `${body.story.title} ${body.story.startingStory} ${body.story.guideline}`;
    const securityCheck = detectSecurityThreats(allContent);
    
    if (securityCheck.isThreat) {
      return NextResponse.json({
        score: 0,
        tier: 'F',
        collaborationProbability: 0,
        scoreBreakdown: {
          storyFoundation: 0,
          technicalExcellence: 0,
          collaborativePotential: 0,
          viralImpact: 0
        },
        strengths: [],
        weaknesses: ['SECURITY_BREACH_DETECTED'],
        optimizationRoadmap: {
          priority: 'SECURITY_REVIEW_REQUIRED',
          secondary: 'HUMAN_MODERATION_NEEDED'
        },
        collaborationForecast: 'SECURITY_BREACH - EVALUATION_TERMINATED - HUMAN_REVIEW_REQUIRED',
        securityStatus: 'FLAGGED',
        securityReason: securityCheck.reason
      });
    }
    
    // Évaluations par catégorie
    const storyEvaluation = evaluateStoryFoundation(body.story);
    const technicalEvaluation = evaluateTechnicalExcellence(body.film);
    const collaborativeEvaluation = evaluateCollaborativePotential(body.story, body.completions);
    const viralEvaluation = evaluateViralImpact(body.story);
    
    // Calcul du score total
    const totalScore = storyEvaluation.score + technicalEvaluation.score + 
                      collaborativeEvaluation.score + viralEvaluation.score;
    
    // Détermination du tier
    let tier: 'S' | 'A' | 'B' | 'C' | 'F';
    if (totalScore >= 90) tier = 'S';
    else if (totalScore >= 80) tier = 'A';
    else if (totalScore >= 70) tier = 'B';
    else if (totalScore >= 60) tier = 'C';
    else tier = 'F';
    
    // Calcul de la probabilité de collaboration
    const collaborationProbability = Math.min(100, Math.max(0, 
      (collaborativeEvaluation.score / 25) * 100 + 
      (storyEvaluation.score / 40) * 20
    ));
    
    // Compilation des forces et faiblesses
    const allStrengths = [
      ...storyEvaluation.strengths,
      ...technicalEvaluation.strengths,
      ...collaborativeEvaluation.strengths,
      ...viralEvaluation.strengths
    ].slice(0, 2);
    
    const allWeaknesses = [
      ...storyEvaluation.weaknesses,
      ...technicalEvaluation.weaknesses,
      ...collaborativeEvaluation.weaknesses,
      ...viralEvaluation.weaknesses
    ].slice(0, 2);
    
    // Roadmap d'optimisation
    const optimizationRoadmap = {
      priority: allWeaknesses[0] || 'Continue improving content quality',
      secondary: allWeaknesses[1] || 'Enhance collaborative elements'
    };
    
    // Prévision de collaboration
    let collaborationForecast = 'Low success probability';
    if (collaborationProbability >= 70) {
      collaborationForecast = 'High success probability - Strong collaborative setup and engaging content';
    } else if (collaborationProbability >= 50) {
      collaborationForecast = 'Medium success probability - Good foundation with room for improvement';
    }
    
    const result: EvaluationResult = {
      score: Math.round(totalScore),
      tier,
      collaborationProbability: Math.round(collaborationProbability),
      scoreBreakdown: {
        storyFoundation: Math.round(storyEvaluation.score),
        technicalExcellence: Math.round(technicalEvaluation.score),
        collaborativePotential: Math.round(collaborativeEvaluation.score),
        viralImpact: Math.round(viralEvaluation.score)
      },
      strengths: allStrengths,
      weaknesses: allWeaknesses,
      optimizationRoadmap,
      collaborationForecast,
      securityStatus: 'CLEARED'
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate campaign' },
      { status: 500 }
    );
  }
}
