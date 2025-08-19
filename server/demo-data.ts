import { storage } from "./storage";

export async function createDemoContent() {
  console.log("🎯 [Demo] Creating interactive learning demonstration...");

  try {
    // Create demo user
    const demoUser = await storage.createUser({
      username: "demo-learner",
      email: "demo@sage.learning",
      name: "Demo Learner"
    });

    // Create demo learning path
    const demoPath = await storage.createLearningPath({
      userId: demoUser.id,
      title: "Interactive Learning Showcase",
      description: "Experience Sage's rich interactive learning features",
      goal: "Master interactive learning with quizzes, exercises, and progress tracking",
      motivation: "educational",
      difficulty: "beginner",
      estimatedDuration: "30 minutes"
    });

    // Create demo module
    const demoModule = await storage.createModule({
      pathId: demoPath.id,
      title: "Interactive Features Demo",
      description: "Hands-on experience with Sage's learning tools",
      orderIndex: 0,
      isUnlocked: true,
      totalLessons: 3
    });

    // Create demo lessons with rich interactive content
    const lesson1 = await storage.createLesson({
      moduleId: demoModule.id,
      title: "Interactive Quizzes & Assessments",
      description: "Experience our quiz system with multiple question types",
      content: {
        introduction: "Welcome to Sage's interactive quiz system! This lesson demonstrates how our quizzes provide immediate feedback and help track your understanding.",
        sections: [
          {
            id: "section-1",
            title: "Understanding Quiz Types",
            type: "concept",
            content: "Our system supports multiple choice, multiple select, and true/false questions. Each provides instant feedback and detailed explanations to reinforce learning."
          },
          {
            id: "section-2",
            title: "Scoring and Progress",
            type: "example",
            content: "Quizzes track your score and completion progress. You can retake quizzes to improve your understanding and achieve better scores."
          }
        ],
        quiz: {
          title: "Quiz Features Assessment",
          questions: [
            {
              id: "q1",
              type: "multiple-choice",
              question: "What happens when you answer a quiz question incorrectly?",
              options: [
                "You get immediate feedback and explanation",
                "You must restart the entire quiz",
                "No feedback is provided",
                "The quiz ends automatically"
              ],
              correctAnswers: [0],
              explanation: "Sage provides immediate feedback and detailed explanations to help you learn from mistakes and improve understanding.",
              points: 10
            },
            {
              id: "q2",
              type: "multiple-select", 
              question: "Which question types does Sage support? (Select all that apply)",
              options: [
                "Multiple Choice",
                "Multiple Select",
                "True/False",
                "Essay Questions"
              ],
              correctAnswers: [0, 1, 2],
              explanation: "Sage currently supports multiple choice, multiple select, and true/false questions with plans for more question types.",
              points: 15
            },
            {
              id: "q3",
              type: "true-false",
              question: "You can retake quizzes to improve your score.",
              options: ["True", "False"],
              correctAnswers: [0],
              explanation: "Yes! You can retake quizzes as many times as needed to master the material and achieve your desired score.",
              points: 5
            }
          ]
        },
        practicalExercise: {
          title: "Quiz Practice Exercise",
          description: "Test the quiz system by answering different question types.",
          instructions: [
            "Complete the quiz above with all three question types",
            "Try answering incorrectly to see the feedback system",
            "Retake the quiz to improve your score",
            "Notice how your progress updates in real-time"
          ]
        },
        keyTakeaways: [
          "Quizzes provide immediate feedback and explanations",
          "Multiple question types test different aspects of knowledge",
          "Retaking quizzes helps reinforce learning",
          "Progress tracking motivates continued engagement"
        ]
      },
      orderIndex: 0,
      duration: 10
    });

    const lesson2 = await storage.createLesson({
      moduleId: demoModule.id,
      title: "Progress Tracking & Completion",
      description: "Learn how Sage tracks your learning progress",
      content: {
        introduction: "Progress tracking is at the heart of effective learning. See how Sage monitors your completion and helps you stay motivated.",
        sections: [
          {
            id: "section-1",
            title: "Section-by-Section Progress", 
            type: "concept",
            content: "Each lesson section can be marked as complete. Watch the progress bar update as you work through the content, providing clear milestones and motivation."
          },
          {
            id: "section-2",
            title: "Visual Progress Indicators",
            type: "example",
            content: "Progress bars, completion badges, and percentage indicators make it easy to see your advancement. These visual cues help maintain motivation and engagement."
          },
          {
            id: "section-3",
            title: "Completion Rewards",
            type: "exercise",
            content: "Completing sections and lessons unlocks achievements and provides a sense of accomplishment. This gamification element enhances the learning experience."
          }
        ],
        practicalExercise: {
          title: "Progress Tracking Exercise",
          description: "Experience the progress tracking system firsthand.",
          instructions: [
            "Click 'Mark as Read' for each section above",
            "Watch the lesson progress bar update",
            "Notice the completion status changes",
            "Complete this exercise to see the final progress update"
          ]
        },
        keyTakeaways: [
          "Section-by-section tracking provides clear milestones",
          "Visual indicators enhance motivation and engagement",
          "Completion rewards create a sense of accomplishment",
          "Progress tracking helps maintain learning momentum"
        ]
      },
      orderIndex: 1,
      duration: 8
    });

    const lesson3 = await storage.createLesson({
      moduleId: demoModule.id,
      title: "Hands-on Exercises & Practical Learning",
      description: "Experience interactive exercises and practical applications",
      content: {
        introduction: "Learning by doing is the most effective way to master new skills. This lesson showcases Sage's practical exercise system.",
        sections: [
          {
            id: "section-1",
            title: "Interactive Exercise Types",
            type: "concept", 
            content: "Sage offers various exercise types including coding challenges, practical projects, and step-by-step tutorials that reinforce learning through application."
          },
          {
            id: "section-2",
            title: "Real-world Applications",
            type: "example",
            content: "Exercises are designed to mirror real-world scenarios, ensuring that what you learn can be immediately applied in practical situations.",
            codeExample: "// Example: Interactive coding exercise\nfunction calculateGrowthRate(initial, final, years) {\n  return Math.pow(final / initial, 1 / years) - 1;\n}\n\n// Usage: calculateGrowthRate(1000, 1500, 3)\n// Result: 0.1447 (14.47% annual growth)"
          }
        ],
        codingChallenge: {
          title: "Growth Rate Calculator",
          description: "Create a function to calculate compound annual growth rate (CAGR).",
          difficulty: "easy",
          startingCode: "// Calculate compound annual growth rate\nfunction calculateCAGR(startValue, endValue, years) {\n  // Your code here\n  return 0;\n}",
          solution: "function calculateCAGR(startValue, endValue, years) {\n  return Math.pow(endValue / startValue, 1 / years) - 1;\n}",
          testCases: [
            {
              input: "calculateCAGR(1000, 1500, 3)",
              expectedOutput: "0.1447",
              description: "Calculate 3-year CAGR from 1000 to 1500"
            },
            {
              input: "calculateCAGR(500, 1000, 5)", 
              expectedOutput: "0.1487",
              description: "Calculate 5-year CAGR from 500 to 1000"
            }
          ],
          hints: [
            "Use Math.pow() for exponentiation",
            "CAGR formula: (End/Start)^(1/years) - 1"
          ]
        },
        practicalExercise: {
          title: "Complete Learning Experience",
          description: "Combine all interactive elements for a comprehensive learning experience.",
          instructions: [
            "Read through all content sections",
            "Try the coding challenge above", 
            "Use hints if you get stuck",
            "View the solution to compare your approach",
            "Mark all sections as complete"
          ]
        },
        keyTakeaways: [
          "Hands-on exercises reinforce theoretical knowledge",
          "Coding challenges build practical programming skills",
          "Real-world scenarios prepare you for actual applications",
          "Interactive elements make learning engaging and effective"
        ]
      },
      orderIndex: 2,
      duration: 20
    });

    console.log(`✅ [Demo] Created demo content with ${demoModule.totalLessons} interactive lessons`);
    
    return {
      user: demoUser,
      path: demoPath,
      module: demoModule,
      lessons: [lesson1, lesson2, lesson3]
    };

  } catch (error) {
    console.error("❌ [Demo] Failed to create demo content:", error);
    throw error;
  }
}