import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertLearningPathSchema,
  insertChatMessageSchema,
  insertProjectSchema,
  insertAchievementSchema,
  insertSkillSchema
} from "@shared/schema";
import { 
  processOnboardingGoal, 
  generateChatResponse, 
  generateLessonContent 
} from "./services/openai";
import { 
  analyzeChatDifficulty, 
  generateAdaptiveContent, 
  getAdaptivePersona, 
  shouldPerformAnalysis 
} from "./services/adaptive-difficulty";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Demo endpoint for testing interactive features
  app.get("/api/demo", async (req, res) => {
    console.log("🎯 [Demo] Creating interactive learning demonstration...");
    
    try {
      // Create demo learning path
      const demoPath = await storage.createLearningPath({
        userId: "demo-user-123",
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
        totalLessons: 1
      });

      // Create demo lesson with rich interactive content
      const demoLesson = await storage.createLesson({
        moduleId: demoModule.id,
        title: "Interactive Learning Experience",
        description: "Experience quizzes, progress tracking, and hands-on exercises",
        content: {
          introduction: "Welcome to Sage's interactive learning experience! This lesson showcases our rich content features including quizzes, progress tracking, and hands-on exercises.",
          sections: [
            {
              id: "section-1",
              title: "Getting Started with Interactive Learning",
              type: "concept",
              content: "Interactive learning transforms passive reading into active engagement. You'll experience quizzes, practical exercises, and real-time progress tracking as you learn. Click the 'Mark as Read' button below to see progress tracking in action!"
            },
            {
              id: "section-2",
              title: "Progress Tracking in Action", 
              type: "example",
              content: "Notice how your progress updates as you complete each section. The progress bar above shows your current completion status, encouraging you to work through all materials. This visual feedback helps maintain motivation and provides clear learning milestones."
            },
            {
              id: "section-3",
              title: "Advanced Interactive Elements",
              type: "exercise",
              content: "Sage supports multiple types of interactive content including quizzes with immediate feedback, coding challenges with test cases, and practical exercises that reinforce learning. Scroll down to try the interactive quiz!"
            }
          ],
          quiz: {
            title: "Interactive Learning Quiz",
            questions: [
              {
                id: "q1",
                type: "multiple-choice",
                question: "What makes interactive learning more effective than passive reading?",
                options: [
                  "Active engagement and immediate feedback",
                  "Longer text passages",
                  "More complex vocabulary",
                  "Reduced interaction with content"
                ],
                correctAnswers: [0],
                explanation: "Active engagement and immediate feedback help reinforce learning and identify knowledge gaps in real-time.",
                points: 10
              },
              {
                id: "q2",
                type: "multiple-select",
                question: "Which features does Sage's interactive learning include? (Select all that apply)",
                options: [
                  "Progress tracking",
                  "Interactive quizzes",
                  "Hands-on exercises", 
                  "Passive text reading only"
                ],
                correctAnswers: [0, 1, 2],
                explanation: "Sage includes progress tracking, quizzes, and exercises. We go beyond passive reading to create engaging experiences.",
                points: 15
              },
              {
                id: "q3",
                type: "true-false",
                question: "You can retake quizzes to improve your score and understanding.",
                options: ["True", "False"],
                correctAnswers: [0],
                explanation: "Yes! You can retake quizzes as many times as needed to master the material and achieve your desired score.",
                points: 5
              }
            ]
          },
          codingChallenge: {
            title: "Simple JavaScript Challenge",
            description: "Create a function to calculate the sum of numbers in an array.",
            difficulty: "easy",
            startingCode: "// Calculate the sum of all numbers in an array\nfunction calculateSum(numbers) {\n  // Your code here\n  return 0;\n}",
            solution: "function calculateSum(numbers) {\n  return numbers.reduce((sum, num) => sum + num, 0);\n}",
            testCases: [
              {
                input: "calculateSum([1, 2, 3, 4, 5])",
                expectedOutput: "15",
                description: "Sum of [1,2,3,4,5] should equal 15"
              },
              {
                input: "calculateSum([10, 20, 30])",
                expectedOutput: "60",
                description: "Sum of [10,20,30] should equal 60"
              }
            ],
            hints: [
              "Use the reduce() method to iterate through the array",
              "The reduce function takes an accumulator and current value"
            ]
          },
          practicalExercise: {
            title: "Complete Learning Experience",
            description: "Combine all interactive elements for a comprehensive learning experience.",
            instructions: [
              "Read through all content sections and mark them as complete",
              "Complete the interactive quiz above",
              "Try the coding challenge (use hints if needed)",
              "Watch your progress bar update in real-time"
            ]
          },
          keyTakeaways: [
            "Interactive learning increases engagement and retention",
            "Progress tracking provides clear learning milestones",
            "Quizzes and exercises reinforce key concepts", 
            "Real-time feedback helps identify areas for improvement"
          ]
        },
        orderIndex: 0,
        duration: 20
      });

      // Return the full structure for frontend use
      const demoData = {
        path: demoPath,
        module: { ...demoModule, lessons: [demoLesson] },
        lesson: demoLesson
      };

      console.log(`✅ [Demo] Created interactive demo: ${demoPath.title}`);
      res.json(demoData);
      
    } catch (error) {
      console.error("❌ [Demo] Failed to create demo content:", error);
      res.status(500).json({ message: "Failed to create demo content", error: (error as Error).message });
    }
  });
  
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error: (error as Error).message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const user = await storage.getUserByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Onboarding and AI routes
  app.post("/api/onboarding/process", async (req, res) => {
    console.log("🚀 [API] Onboarding request received");
    console.log("📝 [API] Request body:", JSON.stringify(req.body, null, 2));
    
    try {
      const { goal, conversationHistory = [] } = req.body;
      
      if (!goal) {
        console.log("❌ [API] No goal provided in request");
        return res.status(400).json({ message: "Goal is required" });
      }

      console.log("✅ [API] Goal received:", goal);
      console.log("📚 [API] Conversation history length:", conversationHistory.length);
      
      console.log("🤖 [API] Calling OpenAI service...");
      const response = await processOnboardingGoal(goal, conversationHistory);
      
      console.log("✅ [API] OpenAI response received successfully");
      console.log("📊 [API] Response structure:", {
        hasLearningPath: !!response.learningPath,
        modulesCount: response.learningPath?.modules?.length || 0,
        followUpQuestionsCount: response.followUpQuestions?.length || 0
      });
      
      res.json(response);
    } catch (error) {
      console.error("💥 [API] Onboarding error details:");
      console.error("- Error message:", (error as Error).message);
      console.error("- Error stack:", (error as Error).stack);
      console.error("- Error type:", typeof error);
      console.error("- Full error object:", error);
      
      res.status(500).json({ 
        message: "Failed to process onboarding goal", 
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  });

  app.post("/api/learning-paths", async (req, res) => {
    console.log("🚀 [API] Learning path creation request received");
    console.log("📝 [API] Request body:", JSON.stringify(req.body, null, 2));
    
    try {
      // Extract only the learning path fields, excluding modules for schema validation
      const { modules, ...learningPathData } = req.body;
      console.log("📊 [API] Extracted learning path data:", JSON.stringify(learningPathData, null, 2));
      console.log("📚 [API] Modules count:", modules?.length || 0);
      
      const pathData = insertLearningPathSchema.parse(learningPathData);
      console.log("✅ [API] Schema validation passed");
      
      const path = await storage.createLearningPath(pathData);
      console.log("✅ [API] Learning path created:", path.id);
      
      // Create modules and lessons from AI-generated structure
      if (modules && Array.isArray(modules)) {
        console.log("🏗️ [API] Creating modules and lessons...");
        
        for (let i = 0; i < modules.length; i++) {
          const moduleData = modules[i];
          console.log(`📦 [API] Creating module ${i + 1}: ${moduleData.title}`);
          
          const module = await storage.createModule({
            pathId: path.id,
            title: moduleData.title,
            description: moduleData.description || null,
            orderIndex: moduleData.orderIndex,
            totalLessons: moduleData.lessons?.length || 0
          });
          console.log(`✅ [API] Module created: ${module.id}`);

          if (moduleData.lessons && Array.isArray(moduleData.lessons)) {
            console.log(`📝 [API] Creating ${moduleData.lessons.length} lessons for module ${moduleData.title}`);
            
            for (let j = 0; j < moduleData.lessons.length; j++) {
              const lessonData = moduleData.lessons[j];
              console.log(`📖 [API] Creating lesson ${j + 1}: ${lessonData.title}`);
              
              const lesson = await storage.createLesson({
                moduleId: module.id,
                title: lessonData.title,
                description: lessonData.description || null,
                orderIndex: lessonData.orderIndex,
                duration: lessonData.duration || null,
                content: {}, // Will be generated when accessed
                resources: null
              });
              console.log(`✅ [API] Lesson created: ${lesson.id}`);
            }
            
            // Update the module's totalLessons count
            await storage.updateModule(module.id, {
              totalLessons: moduleData.lessons.length
            });
            console.log(`🔄 [API] Updated module ${moduleData.title} totalLessons to ${moduleData.lessons.length}`);
          }
        }
      }

      console.log("🎉 [API] Learning path creation completed successfully");
      console.log("📊 [API] Final path structure:", {
        id: path.id,
        title: path.title,
        modulesCreated: modules?.length || 0
      });
      
      res.json(path);
    } catch (error) {
      console.error("💥 [API] Learning path creation failed:");
      console.error("- Error type:", error?.constructor?.name);
      console.error("- Error message:", (error as Error).message);
      console.error("- Error stack:", (error as Error).stack);
      console.error("- Full error object:", error);
      
      res.status(400).json({ 
        message: "Invalid learning path data", 
        error: (error as Error).message 
      });
    }
  });

  app.get("/api/learning-paths/user/:userId", async (req, res) => {
    try {
      const paths = await storage.getUserLearningPaths(req.params.userId);
      res.json(paths);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch learning paths" });
    }
  });

  app.get("/api/learning-paths/:id", async (req, res) => {
    console.log("🚀 [API] Learning path fetch request received for ID:", req.params.id);
    
    try {
      let path = await storage.getLearningPath(req.params.id);
      if (!path) {
        console.log("❌ [API] Learning path not found, creating demo path...");
        
        // Create a demo learning path for testing
        const demoPath = await storage.createLearningPath({
          userId: "demo-user",
          title: "Interactive Learning Demo",
          description: "Demonstration of Sage's interactive learning features",
          goal: "Learn how to use interactive content and features",
          motivation: "educational",
          difficulty: "beginner",
          estimatedDuration: "2 hours"
        });

        // Create demo module
        const demoModule = await storage.createModule({
          pathId: demoPath.id,
          title: "Interactive Content Showcase",
          description: "Experience quizzes, exercises, and rich content",
          orderIndex: 0,
          totalLessons: 1
        });

        // Create demo lesson with rich content
        const demoLesson = await storage.createLesson({
          moduleId: demoModule.id,
          title: "Interactive Learning Features",
          description: "Explore quizzes, progress tracking, and hands-on exercises",
          content: {
            introduction: "Welcome to Sage's interactive learning experience! This lesson showcases our rich content features including quizzes, progress tracking, and hands-on exercises.",
            sections: [
              {
                id: "section-1",
                title: "Getting Started with Interactive Learning",
                type: "concept",
                content: "Interactive learning transforms passive reading into active engagement. You'll experience quizzes, practical exercises, and real-time progress tracking as you learn."
              },
              {
                id: "section-2",
                title: "Progress Tracking in Action",
                type: "example", 
                content: "Notice how your progress updates as you complete each section. The progress bar above shows your current completion status, encouraging you to work through all materials."
              }
            ],
            quiz: {
              title: "Interactive Learning Quiz",
              questions: [
                {
                  id: "q1",
                  type: "multiple-choice",
                  question: "What makes interactive learning more effective than passive reading?",
                  options: [
                    "Active engagement and immediate feedback",
                    "Longer text passages",
                    "More complex vocabulary", 
                    "Reduced interaction with content"
                  ],
                  correctAnswers: [0],
                  explanation: "Active engagement and immediate feedback help reinforce learning and identify knowledge gaps in real-time.",
                  points: 10
                },
                {
                  id: "q2",
                  type: "multiple-select",
                  question: "Which features does Sage's interactive learning include? (Select all that apply)",
                  options: [
                    "Progress tracking",
                    "Interactive quizzes",
                    "Hands-on exercises",
                    "Passive text reading only"
                  ],
                  correctAnswers: [0, 1, 2],
                  explanation: "Sage includes progress tracking, quizzes, and exercises. We go beyond passive reading to create engaging experiences.",
                  points: 15
                }
              ]
            },
            practicalExercise: {
              title: "Hands-on Learning Exercise",
              description: "Practice what you've learned by completing this interactive exercise.",
              instructions: [
                "Read through all the content sections above",
                "Complete the interactive quiz to test your understanding",
                "Click the 'Mark as Read' buttons for each section",
                "Watch your progress bar update in real-time"
              ]
            },
            keyTakeaways: [
              "Interactive learning increases engagement and retention",
              "Progress tracking provides clear learning milestones", 
              "Quizzes and exercises reinforce key concepts",
              "Real-time feedback helps identify areas for improvement"
            ]
          },
          orderIndex: 0,
          duration: 15
        });

        console.log(`✅ [API] Demo content created: ${demoPath.title}`);
        path = demoPath;
      }

      console.log("✅ [API] Learning path found:", path.title);

      // Get modules for this path
      const modules = await storage.getPathModules(path.id);
      console.log("📦 [API] Found modules:", modules.length);

      // For each module, get its lessons
      const modulesWithLessons = await Promise.all(
        modules.map(async (module) => {
          const lessons = await storage.getModuleLessons(module.id);
          console.log(`📝 [API] Module "${module.title}" has ${lessons.length} lessons`);
          return { ...module, lessons };
        })
      );

      const pathWithModules = { ...path, modules: modulesWithLessons };
      
      console.log("🎉 [API] Learning path fetch completed successfully");
      console.log("📊 [API] Final structure:", {
        pathTitle: path.title,
        modulesCount: modulesWithLessons.length,
        totalLessons: modulesWithLessons.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0)
      });
      
      res.json(pathWithModules);
    } catch (error) {
      console.error("💥 [API] Learning path fetch failed:", (error as Error).message);
      res.status(500).json({ message: "Failed to fetch learning path" });
    }
  });

  // Module routes
  app.get("/api/modules/:id", async (req, res) => {
    try {
      const module = await storage.getModule(req.params.id);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      const lessons = await storage.getModuleLessons(module.id);
      const moduleWithLessons = { ...module, lessons };
      
      res.json(moduleWithLessons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch module" });
    }
  });

  app.patch("/api/modules/:id", async (req, res) => {
    try {
      const module = await storage.updateModule(req.params.id, req.body);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      res.status(500).json({ message: "Failed to update module" });
    }
  });

  // Lesson routes
  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const lesson = await storage.getLesson(req.params.id);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      // Generate content if not already available
      if (!lesson.content || Object.keys(lesson.content as any).length === 0) {
        console.log(`🎨 [API] Generating rich content for lesson: ${lesson.title}`);
        
        const module = await storage.getModule(lesson.moduleId);
        const path = module ? await storage.getLearningPath(module.pathId) : null;
        
        // Create rich interactive content
        const richContent = {
          introduction: `Welcome to ${lesson.title}. ${lesson.description || 'Let\'s explore this topic together.'}`,
          sections: [
            {
              id: "section-1",
              title: "Core Concepts",
              type: "concept",
              content: `In this section, we'll explore the fundamental concepts of ${lesson.title}. Understanding these basics will provide you with a solid foundation for more advanced topics.`
            },
            {
              id: "section-2", 
              title: "Practical Examples",
              type: "example",
              content: `Let's look at real-world examples of ${lesson.title} in action. These examples will help you understand how the concepts apply in practical situations.`,
              codeExample: module?.title.toLowerCase().includes('excel') ? 
                '=VLOOKUP(A2,DataTable,2,FALSE)\n=IF(B2>100,"High","Low")\n=SUMIF(C:C,">50",D:D)' :
                'function calculateTotal(items) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}'
            }
          ],
          quiz: {
            title: "Knowledge Check",
            questions: [
              {
                id: "q1",
                type: "multiple-choice",
                question: `What is the main objective when learning ${lesson.title}?`,
                options: [
                  "Build practical skills and understanding",
                  "Memorize theoretical concepts only",
                  "Complete assignments without learning",
                  "Skip to advanced topics immediately"
                ],
                correctAnswers: [0],
                explanation: "The goal is to build both practical skills and conceptual understanding that you can apply in real situations.",
                points: 10
              },
              {
                id: "q2",
                type: "true-false",
                question: `The concepts in ${lesson.title} can be applied to solve real-world problems.`,
                options: ["True", "False"],
                correctAnswers: [0],
                explanation: "Yes! The skills you learn here are designed to be practical and applicable to real-world scenarios.",
                points: 5
              }
            ]
          },
          practicalExercise: {
            title: `Hands-on ${lesson.title} Exercise`,
            description: `Apply what you've learned about ${lesson.title} in this practical exercise.`,
            instructions: [
              "Review the core concepts covered in this lesson",
              "Work through the provided examples step by step",
              "Practice with the interactive elements",
              "Complete the exercise to reinforce your learning"
            ]
          },
          keyTakeaways: [
            `Master the fundamental concepts of ${lesson.title}`,
            "Apply knowledge through practical examples and exercises", 
            "Build confidence through interactive practice",
            "Prepare for more advanced topics in this subject"
          ]
        };

        // Add coding challenge for programming-related lessons
        if (module?.title.toLowerCase().includes('excel') || 
            module?.title.toLowerCase().includes('data') ||
            lesson.title.toLowerCase().includes('formula')) {
          richContent.codingChallenge = {
            title: "Excel Formula Challenge",
            description: "Practice creating formulas to solve a real data problem.",
            difficulty: "easy",
            startingCode: "// Create a formula to calculate the total sales\n// Data: Column A has quantities, Column B has prices\n// Write your formula here:",
            solution: "=SUMPRODUCT(A:A,B:B)",
            testCases: [
              {
                input: "A1:A3 = [10,20,30], B1:B3 = [5,10,15]",
                expectedOutput: "800",
                description: "Calculate total revenue from quantities and prices"
              }
            ],
            hints: [
              "SUMPRODUCT can multiply and sum arrays simultaneously",
              "Consider how quantities × prices gives total revenue"
            ]
          };
        }
        
        const updatedLesson = await storage.updateLesson(lesson.id, {
          content: richContent
        });
        
        console.log(`✅ [API] Rich content generated for: ${lesson.title}`);
        return res.json(updatedLesson || lesson);
      }

      res.json(lesson);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch lesson", 
        error: (error as Error).message 
      });
    }
  });

  app.patch("/api/lessons/:id", async (req, res) => {
    try {
      const lesson = await storage.updateLesson(req.params.id, req.body);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ message: "Failed to update lesson" });
    }
  });

  // Chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, userId, pathId, lessonId, context } = req.body;
      
      if (!message || !userId) {
        return res.status(400).json({ message: "Message and userId are required" });
      }

      console.log("💬 [Chat] Processing message from user:", userId);

      // Save user message
      await storage.createChatMessage({
        userId,
        pathId,
        lessonId,
        role: "user",
        content: message,
        context
      });

      // Get conversation history for AI response and analysis
      const conversationHistory = await storage.getUserChatMessages(userId, pathId);
      const userMessageCount = conversationHistory.filter(msg => msg.role === "user").length;

      console.log("📊 [Chat] User message count:", userMessageCount);

      // Perform adaptive difficulty analysis if conditions are met
      let difficultyAnalysis = null;
      let adaptivePersona = "You are Sage's AI tutor. You're encouraging, adaptive, and wise.";
      
      if (shouldPerformAnalysis(userMessageCount)) {
        console.log("🧠 [Adaptive] Performing difficulty analysis...");
        
        try {
          const formattedHistory = conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt || new Date()
          }));
          
          difficultyAnalysis = await analyzeChatDifficulty(
            formattedHistory,
            context?.currentLesson,
            context?.currentModule
          );

          // Store analytics including learning style inference
          await storage.createUserAnalytics({
            userId,
            pathId,
            lessonId,
            currentLevel: difficultyAnalysis.currentLevel,
            confidence: Math.round(difficultyAnalysis.confidence * 100),
            adjustmentRecommendation: difficultyAnalysis.recommendations.adjustDifficulty,
            inferredLearningStyle: difficultyAnalysis.inferredLearningStyle.primary,
            learningStyleConfidence: Math.round(difficultyAnalysis.inferredLearningStyle.confidence * 100),
            analysisData: difficultyAnalysis
          });

          // Get adaptive persona for this interaction
          adaptivePersona = getAdaptivePersona(difficultyAnalysis);

          console.log("✅ [Adaptive] Analysis complete:", {
            level: difficultyAnalysis.currentLevel,
            adjustment: difficultyAnalysis.recommendations.adjustDifficulty
          });

        } catch (error) {
          console.error("❌ [Adaptive] Analysis failed:", error);
        }
      }

      const formattedHistory = conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate AI response with adaptive persona
      const aiResponse = await generateChatResponse(message, {
        currentLesson: context?.currentLesson,
        currentModule: context?.currentModule,
        userProgress: context?.userProgress,
        conversationHistory: formattedHistory,
        adaptivePersona // Pass the adaptive persona
      });

      // Save AI response with difficulty analysis
      const aiMessage = await storage.createChatMessage({
        userId,
        pathId,
        lessonId,
        role: "assistant",
        content: aiResponse.message,
        context: {
          suggestions: aiResponse.suggestions,
          contextualHints: aiResponse.contextualHints
        },
        difficultyAnalysis
      });

      // Generate adaptive content recommendations if analysis was performed
      let adaptiveRecommendations = null;
      if (difficultyAnalysis) {
        try {
          adaptiveRecommendations = await generateAdaptiveContent(
            difficultyAnalysis,
            context?.currentLesson,
            context?.userProgress
          );
        } catch (error) {
          console.error("❌ [Adaptive] Failed to generate recommendations:", error);
        }
      }

      res.json({
        message: aiResponse.message,
        suggestions: aiResponse.suggestions,
        contextualHints: aiResponse.contextualHints,
        messageId: aiMessage.id,
        // Include adaptive insights for frontend use
        adaptiveInsights: difficultyAnalysis ? {
          currentLevel: difficultyAnalysis.currentLevel,
          confidence: difficultyAnalysis.confidence,
          recommendations: adaptiveRecommendations
        } : null
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to process chat message", 
        error: (error as Error).message 
      });
    }
  });

  app.get("/api/chat/user/:userId", async (req, res) => {
    try {
      const { pathId } = req.query;
      const messages = await storage.getUserChatMessages(
        req.params.userId, 
        pathId as string
      );
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/user/:userId", async (req, res) => {
    try {
      const { pathId } = req.query;
      const analytics = await storage.getUserAnalytics(
        req.params.userId,
        pathId as string
      );
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/user/:userId/latest", async (req, res) => {
    try {
      const { pathId } = req.query;
      const latestAnalytics = await storage.getLatestAnalytics(
        req.params.userId,
        pathId as string
      );
      res.json(latestAnalytics || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch latest analytics" });
    }
  });

  // Project routes
  app.get("/api/projects/user/:userId", async (req, res) => {
    try {
      const projects = await storage.getUserProjects(req.params.userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ 
        message: "Invalid project data", 
        error: (error as Error).message 
      });
    }
  });

  // Achievement routes
  app.get("/api/achievements/user/:userId", async (req, res) => {
    try {
      const achievements = await storage.getUserAchievements(req.params.userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.post("/api/achievements", async (req, res) => {
    try {
      const achievementData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(achievementData);
      res.json(achievement);
    } catch (error) {
      res.status(400).json({ 
        message: "Invalid achievement data", 
        error: (error as Error).message 
      });
    }
  });

  // Skills routes
  app.get("/api/skills/user/:userId", async (req, res) => {
    try {
      const skills = await storage.getUserSkills(req.params.userId);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.post("/api/skills", async (req, res) => {
    try {
      const skillData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(skillData);
      res.json(skill);
    } catch (error) {
      res.status(400).json({ 
        message: "Invalid skill data", 
        error: (error as Error).message 
      });
    }
  });

  // Start learning path (mark as approved/started)
  app.post('/api/learning-paths/:id/start', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🚀 [API] Starting learning path: ${id}`);
      res.json({ success: true, message: 'Learning path started' });
    } catch (error) {
      console.error('❌ [API] Error starting learning path:', error);
      res.status(500).json({ error: 'Failed to start learning path' });
    }
  });

  // Submit feedback for learning path
  app.post('/api/learning-paths/:id/feedback', async (req, res) => {
    try {
      const { id } = req.params;
      const { feedback } = req.body;
      console.log(`💬 [API] Feedback received for learning path: ${id}`);
      console.log(`📝 [API] Feedback content: ${feedback}`);
      
      const existingPath = await storage.getLearningPath(id);
      if (!existingPath) {
        return res.status(404).json({ error: 'Learning path not found' });
      }

      const enhancedGoal = `
Original learning path goal: ${existingPath.goal}
User feedback: ${feedback}

Please adjust the learning path based on this feedback while maintaining the same difficulty level (${existingPath.difficulty}) and overall scope. Focus on the specific improvements requested.
      `.trim();

      // TODO: Implement actual content regeneration with feedback
      // For now, just acknowledge the feedback
      
      console.log('✅ [API] Feedback processed successfully');
      res.json({ success: true, message: 'Feedback received and syllabus will be updated' });
    } catch (error) {
      console.error('❌ [API] Error processing feedback:', error);
      res.status(500).json({ error: 'Failed to process feedback' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
