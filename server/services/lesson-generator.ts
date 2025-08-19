import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate rich lesson content with interactive elements
export async function generateLessonContent(
  lessonTitle: string,
  lessonDescription: string,
  moduleContext: string,
  difficulty: string
) {
  const prompt = `Create comprehensive lesson content for: "${lessonTitle}"

Description: ${lessonDescription}
Module Context: ${moduleContext}
Difficulty Level: ${difficulty}

Generate a detailed lesson structure with:
1. Introduction section
2. 3-4 main content sections with clear explanations
3. At least one interactive element (quiz, coding challenge, or video)
4. Practical exercise with step-by-step instructions
5. Key takeaways (3-5 points)
6. Resources for further learning

For interactive elements, choose the most appropriate type:
- Quiz: For concept reinforcement (include 3-5 questions with explanations)
- Coding Challenge: For programming topics (include starter code, test cases, hints)
- Video: For complex concepts (include description, key points, transcript outline)

Respond with JSON in this format:
{
  "introduction": "Engaging introduction paragraph",
  "sections": [
    {
      "id": "section-1",
      "title": "Section Title",
      "type": "concept|example|exercise|quiz",
      "content": "Detailed content",
      "codeExample": "code here (if applicable)",
      "resources": [
        {
          "title": "Resource Title",
          "url": "https://example.com",
          "summary": "Brief description"
        }
      ]
    }
  ],
  "practicalExercise": {
    "title": "Exercise Title",
    "description": "What students will build/do",
    "instructions": ["Step 1", "Step 2", "Step 3"]
  },
  "quiz": {
    "title": "Knowledge Check",
    "questions": [
      {
        "id": "q1",
        "type": "multiple-choice",
        "question": "Question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswers": [0],
        "explanation": "Why this is correct",
        "points": 10
      }
    ]
  },
  "video": {
    "id": "video-1",
    "title": "Video Title",
    "url": "https://example.com/video",
    "duration": "10:30",
    "description": "What the video covers",
    "keyPoints": ["Point 1", "Point 2", "Point 3"],
    "transcript": "Sample transcript content..."
  },
  "codingChallenge": {
    "title": "Challenge Title",
    "description": "Problem description",
    "difficulty": "easy|medium|hard",
    "startingCode": "// Starting code template",
    "solution": "// Complete solution",
    "testCases": [
      {
        "input": "test input",
        "expectedOutput": "expected result",
        "description": "Test case description"
      }
    ],
    "hints": ["Hint 1", "Hint 2"]
  },
  "keyTakeaways": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert instructional designer. Create engaging, interactive lesson content that promotes active learning. Always include practical, hands-on elements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = JSON.parse(response.choices[0].message.content);
    
    // Ensure we have at least one interactive element
    if (!content.quiz && !content.codingChallenge && !content.video) {
      // Add a simple quiz if no interactive elements
      content.quiz = {
        title: "Quick Knowledge Check",
        questions: [
          {
            id: "q1",
            type: "multiple-choice",
            question: `What is the main concept covered in this lesson about ${lessonTitle}?`,
            options: [
              "The fundamental principles and core concepts",
              "Advanced theoretical frameworks only", 
              "Unrelated background information",
              "Historical context without practical application"
            ],
            correctAnswers: [0],
            explanation: "This lesson focuses on the fundamental principles and practical application of the core concepts.",
            points: 10
          }
        ]
      };
    }

    return content;

  } catch (error) {
    console.error("Error generating lesson content:", error);
    
    // Return basic fallback structure
    return {
      introduction: `Welcome to this lesson on ${lessonTitle}. ${lessonDescription}`,
      sections: [
        {
          id: "section-1",
          title: "Getting Started",
          type: "concept",
          content: `Let's begin our exploration of ${lessonTitle}. This lesson will cover the essential concepts and practical applications you need to know.`,
          resources: []
        }
      ],
      practicalExercise: {
        title: "Practice Exercise",
        description: `Apply what you've learned about ${lessonTitle}`,
        instructions: [
          "Review the main concepts covered",
          "Practice with the provided examples", 
          "Complete the hands-on exercise"
        ]
      },
      keyTakeaways: [
        `Understanding the core concepts of ${lessonTitle}`,
        "Practical application of the learned principles",
        "Building foundational knowledge for advanced topics"
      ]
    };
  }
}

// Generate specific content types
export async function generateQuizQuestions(topic: string, difficulty: string, count: number = 5) {
  const prompt = `Create ${count} quiz questions about "${topic}" at ${difficulty} level.

Include a mix of question types:
- Multiple choice (single answer)
- Multiple select (multiple correct answers)
- True/False

Each question should have:
- Clear, specific question text
- 4 options for multiple choice, 2 for true/false
- Detailed explanation of the correct answer
- Point value (5-15 points based on difficulty)

Respond with JSON array of questions.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system", 
          content: "You are an expert educator creating assessment questions. Focus on practical understanding and application."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return { questions: [] };
  }
}

export async function generateCodingChallenge(topic: string, difficulty: string, language: string = "javascript") {
  const prompt = `Create a coding challenge for "${topic}" at ${difficulty} level in ${language}.

The challenge should include:
- Clear problem description
- Starter code template
- Complete solution
- 3-5 test cases with inputs and expected outputs
- 2-3 helpful hints
- Appropriate difficulty rating

Focus on practical, real-world problems that reinforce the learning objectives.

Respond with JSON object containing all components.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert programming instructor. Create engaging coding challenges that build practical skills."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating coding challenge:", error);
    return null;
  }
}