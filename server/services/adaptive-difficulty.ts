import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface DifficultyAnalysis {
  currentLevel: "struggling" | "comfortable" | "advanced" | "mastery";
  confidence: number; // 0-1
  indicators: string[];
  recommendations: {
    adjustDifficulty: "increase" | "decrease" | "maintain";
    suggestedContent: string[];
    focusAreas: string[];
  };
  adaptivePrompts: {
    nextLesson: string;
    chatPersona: string;
  };
}

export interface ChatPattern {
  questionComplexity: number; // 0-1
  conceptGrasp: number; // 0-1  
  engagementLevel: number; // 0-1
  needsHelp: boolean;
  topicMastery: number; // 0-1
}

/**
 * Analyzes user chat interactions to determine their current understanding level
 */
export async function analyzeChatDifficulty(
  recentMessages: Array<{ role: string; content: string; createdAt: Date }>,
  currentLesson?: any,
  currentModule?: any
): Promise<DifficultyAnalysis> {
  try {
    // Get last 10 user messages for analysis
    const userMessages = recentMessages
      .filter(msg => msg.role === "user")
      .slice(-10)
      .map(msg => msg.content);

    const assistantMessages = recentMessages
      .filter(msg => msg.role === "assistant")
      .slice(-10)
      .map(msg => msg.content);

    if (userMessages.length < 2) {
      // Not enough data for analysis
      return getDefaultAnalysis();
    }

    const analysisPrompt = `Analyze this student's chat interactions to assess their learning difficulty level and comprehension.

CURRENT CONTEXT:
- Lesson: ${currentLesson?.title || "General learning"}
- Module: ${currentModule?.title || "Unknown"}
- Difficulty Level: ${currentLesson?.difficulty || currentModule?.difficulty || "Unknown"}

RECENT USER MESSAGES:
${userMessages.map((msg, i) => `${i + 1}. ${msg}`).join('\n')}

RECENT AI RESPONSES:
${assistantMessages.map((msg, i) => `${i + 1}. ${msg.substring(0, 200)}...`).join('\n')}

Analyze the user's:
1. Question complexity and depth
2. Concept understanding based on their questions/responses
3. Engagement level and learning patterns
4. Whether they frequently need help or clarification
5. Topic mastery indicators

Respond in JSON format:
{
  "currentLevel": "struggling|comfortable|advanced|mastery",
  "confidence": 0.85,
  "indicators": [
    "Specific observations about their learning level",
    "Evidence from their messages"
  ],
  "recommendations": {
    "adjustDifficulty": "increase|decrease|maintain",
    "suggestedContent": [
      "Additional practice exercises",
      "Advanced concepts to introduce"
    ],
    "focusAreas": [
      "Areas needing reinforcement",
      "Skills to develop"
    ]
  },
  "adaptivePrompts": {
    "nextLesson": "Prompt modifier for generating next lesson content based on their level",
    "chatPersona": "Personality adjustment for AI responses (more supportive, more challenging, etc.)"
  }
}`;

    console.log("🧠 [Adaptive] Analyzing user difficulty level...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are an expert learning analytics AI that assesses student comprehension and learning patterns." },
        { role: "user", content: analysisPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent analysis
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    
    console.log("✅ [Adaptive] Difficulty analysis completed:", {
      level: analysis.currentLevel,
      confidence: analysis.confidence,
      adjustment: analysis.recommendations?.adjustDifficulty
    });

    return analysis as DifficultyAnalysis;
  } catch (error) {
    console.error("❌ [Adaptive] Error analyzing difficulty:", error);
    return getDefaultAnalysis();
  }
}

/**
 * Generates personalized content recommendations based on difficulty analysis
 */
export async function generateAdaptiveContent(
  analysis: DifficultyAnalysis,
  currentLesson: any,
  userProgress: any
): Promise<{
  recommendedActions: string[];
  nextLessonModifications: string[];
  chatSuggestions: string[];
}> {
  try {
    const prompt = `Based on this difficulty analysis, generate adaptive learning recommendations:

ANALYSIS:
- Current Level: ${analysis.currentLevel}
- Confidence: ${analysis.confidence}
- Adjustment Needed: ${analysis.recommendations.adjustDifficulty}
- Focus Areas: ${analysis.recommendations.focusAreas.join(", ")}

CURRENT CONTEXT:
- Lesson: ${currentLesson?.title || "Unknown"}
- Progress: ${userProgress?.completed || 0}/${userProgress?.total || 0} lessons

Generate specific, actionable recommendations in JSON format:
{
  "recommendedActions": [
    "Immediate actions to help the student",
    "Content adjustments to make"
  ],
  "nextLessonModifications": [
    "How to modify the next lesson for their level",
    "Additional exercises or simplified explanations"
  ],
  "chatSuggestions": [
    "Suggested conversation starters",
    "Questions to assess understanding"
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are an adaptive learning specialist creating personalized educational experiences." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("❌ [Adaptive] Error generating adaptive content:", error);
    return {
      recommendedActions: ["Continue with current pace"],
      nextLessonModifications: ["No modifications needed"],
      chatSuggestions: ["How are you finding this lesson?"]
    };
  }
}

/**
 * Updates chat persona based on difficulty analysis
 */
export function getAdaptivePersona(analysis: DifficultyAnalysis): string {
  const basePersona = "You are Sage's AI tutor. You're encouraging, adaptive, and wise.";
  
  switch (analysis.currentLevel) {
    case "struggling":
      return `${basePersona} The student is struggling, so be extra patient and supportive. Break down concepts into smaller steps, use more examples, and offer frequent encouragement. Ask if they need clarification often.`;
    
    case "comfortable":
      return `${basePersona} The student is learning well at the current pace. Maintain your supportive approach while occasionally introducing slightly more challenging concepts to keep them engaged.`;
    
    case "advanced":
      return `${basePersona} The student is grasping concepts quickly. Feel free to introduce more advanced topics, ask thought-provoking questions, and challenge them with deeper applications of the material.`;
    
    case "mastery":
      return `${basePersona} The student has mastered the current material. Focus on advanced applications, encourage them to teach concepts back to you, and suggest extensions or related advanced topics.`;
    
    default:
      return basePersona;
  }
}

/**
 * Checks if difficulty analysis should be performed (every N messages)
 */
export function shouldPerformAnalysis(messageCount: number): boolean {
  // Perform analysis every 5 messages, but at least after 3 messages
  return messageCount >= 3 && messageCount % 5 === 0;
}

function getDefaultAnalysis(): DifficultyAnalysis {
  return {
    currentLevel: "comfortable",
    confidence: 0.5,
    indicators: ["Insufficient data for analysis"],
    recommendations: {
      adjustDifficulty: "maintain",
      suggestedContent: ["Continue with current curriculum"],
      focusAreas: ["General comprehension"]
    },
    adaptivePrompts: {
      nextLesson: "Standard difficulty level",
      chatPersona: "Supportive and encouraging"
    }
  };
}