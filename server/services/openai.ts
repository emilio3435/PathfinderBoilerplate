import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface OnboardingResponse {
  learningPath: {
    title: string;
    description: string;
    motivation: string;
    difficulty: string;
    estimatedDuration: string;
    modules: Array<{
      title: string;
      description: string;
      orderIndex: number;
      lessons: Array<{
        title: string;
        description: string;
        orderIndex: number;
        duration: number;
      }>;
    }>;
  };
  followUpQuestions: string[];
}

export interface ChatResponse {
  message: string;
  suggestions: string[];
  contextualHints?: string[];
}

export async function processOnboardingGoal(
  goal: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<OnboardingResponse> {
  console.log("🤖 [OpenAI] processOnboardingGoal called");
  console.log("📝 [OpenAI] Goal:", goal);
  console.log("📚 [OpenAI] Conversation history:", conversationHistory);
  console.log("🔑 [OpenAI] API key configured:", !!process.env.OPENAI_API_KEY);
  console.log("🔑 [OpenAI] API key preview:", process.env.OPENAI_API_KEY?.substring(0, 10) + "...");
  
  try {
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      {
        role: "system",
        content: `You are Sage's AI learning advisor. Analyze the user's learning goal and create a comprehensive, personalized learning path. 

Your response must be in JSON format with this structure:
{
  "learningPath": {
    "title": "string",
    "description": "string", 
    "motivation": "career|hobby|corporate|personal",
    "difficulty": "beginner|intermediate|advanced",
    "estimatedDuration": "string (e.g., '8 weeks', '3 months')",
    "modules": [
      {
        "title": "string",
        "description": "string",
        "orderIndex": 0,
        "lessons": [
          {
            "title": "string", 
            "description": "string",
            "orderIndex": 0,
            "duration": 15
          }
        ]
      }
    ]
  },
  "followUpQuestions": ["string"]
}

Consider the user's goal, current skill level, timeline, and motivation. Create 4-8 modules with 3-6 lessons each. Make it practical and results-oriented.`
      },
      ...conversationHistory.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      {
        role: "user",
        content: goal
      }
    ];

    console.log("📤 [OpenAI] Sending request to OpenAI with model: gpt-4o");
    console.log("💬 [OpenAI] Messages count:", messages.length);
    console.log("📋 [OpenAI] First message preview:", messages[0]?.content?.substring(0, 100) + "...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    console.log("✅ [OpenAI] Response received from OpenAI");
    console.log("📊 [OpenAI] Response choices count:", response.choices.length);
    console.log("💰 [OpenAI] Token usage:", response.usage);

    const rawContent = response.choices[0].message.content;
    console.log("📝 [OpenAI] Raw response length:", rawContent?.length || 0);
    console.log("📝 [OpenAI] Raw response preview:", rawContent?.substring(0, 200) + "...");

    if (!rawContent) {
      throw new Error("No content received from OpenAI");
    }

    let result;
    try {
      result = JSON.parse(rawContent);
      console.log("✅ [OpenAI] JSON parsing successful");
      console.log("🏗️ [OpenAI] Parsed result structure:", {
        hasLearningPath: !!result.learningPath,
        hasFollowUpQuestions: !!result.followUpQuestions,
        learningPathKeys: result.learningPath ? Object.keys(result.learningPath) : [],
        modulesCount: result.learningPath?.modules?.length || 0
      });
    } catch (parseError) {
      console.error("❌ [OpenAI] JSON parsing failed:", parseError);
      console.error("📝 [OpenAI] Failed to parse content:", rawContent);
      throw new Error("Invalid JSON response from OpenAI: " + (parseError as Error).message);
    }

    return result as OnboardingResponse;
  } catch (error) {
    console.error("💥 [OpenAI] Error in processOnboardingGoal:");
    console.error("- Error type:", error?.constructor?.name);
    console.error("- Error message:", (error as Error).message);
    
    // Check for specific OpenAI API errors
    if ((error as any)?.response) {
      console.error("🔴 [OpenAI] API Response Error:");
      console.error("- Status:", (error as any).response.status);
      console.error("- Status Text:", (error as any).response.statusText);
      console.error("- Response data:", (error as any).response.data);
    }
    
    if ((error as any)?.code) {
      console.error("🔴 [OpenAI] Error code:", (error as any).code);
    }
    
    throw new Error("Failed to process onboarding goal: " + (error as Error).message);
  }
}

export async function generateChatResponse(
  userMessage: string,
  context: {
    currentLesson?: any;
    currentModule?: any;
    userProgress?: any;
    conversationHistory: Array<{ role: string; content: string }>;
  }
): Promise<ChatResponse> {
  try {
    const systemPrompt = `You are Sage's AI tutor. You're helping a user learn through their personalized curriculum. 

Context:
- Current lesson: ${context.currentLesson ? `"${context.currentLesson.title}" - ${context.currentLesson.description}` : "None"}
- Current module: ${context.currentModule ? `"${context.currentModule.title}"` : "None"}
- User progress: ${context.userProgress ? `${context.userProgress.completed}/${context.userProgress.total} lessons completed` : "Starting"}

Your personality: Encouraging, adaptive, and wise. Match the user's communication style while being supportive. Provide contextual help related to their current lesson when appropriate.

Respond in JSON format:
{
  "message": "Your helpful response",
  "suggestions": ["Quick suggestion 1", "Quick suggestion 2"],
  "contextualHints": ["Hint related to current lesson", "Additional context"]
}`;

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...context.conversationHistory.slice(-10).map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      { role: "user", content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as ChatResponse;
  } catch (error) {
    throw new Error("Failed to generate chat response: " + (error as Error).message);
  }
}

export async function generateLessonContent(
  title: string,
  description: string,
  difficulty: string,
  context: { moduleTitle: string; pathGoal: string }
): Promise<any> {
  try {
    const prompt = `Create comprehensive lesson content for: "${title}"
Description: ${description}
Difficulty: ${difficulty}
Module: ${context.moduleTitle}
Learning Goal: ${context.pathGoal}

Respond in JSON format with this structure:
{
  "introduction": "Engaging introduction paragraph",
  "sections": [
    {
      "type": "concept|example|exercise|quiz",
      "title": "Section title",
      "content": "Section content",
      "codeExample": "code if applicable",
      "resources": [
        {
          "title": "Resource title",
          "url": "https://example.com",
          "type": "article|video|documentation",
          "summary": "Why this resource was chosen"
        }
      ]
    }
  ],
  "keyTakeaways": ["Key point 1", "Key point 2"],
  "practicalExercise": {
    "title": "Exercise title", 
    "description": "What to build/do",
    "instructions": ["Step 1", "Step 2"],
    "successCriteria": ["Criterion 1", "Criterion 2"]
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    throw new Error("Failed to generate lesson content: " + (error as Error).message);
  }
}
