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
      const path = await storage.getLearningPath(req.params.id);
      if (!path) {
        console.log("❌ [API] Learning path not found");
        return res.status(404).json({ message: "Learning path not found" });
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
        const module = await storage.getModule(lesson.moduleId);
        const path = module ? await storage.getLearningPath(module.pathId) : null;
        
        if (module && path) {
          const generatedContent = await generateLessonContent(
            lesson.title,
            lesson.description || "",
            path.difficulty,
            { moduleTitle: module.title, pathGoal: path.goal }
          );
          
          const updatedLesson = await storage.updateLesson(lesson.id, {
            content: generatedContent
          });
          
          return res.json(updatedLesson);
        }
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
          difficultyAnalysis = await analyzeChatDifficulty(
            conversationHistory,
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

  // Regenerate learning path
  app.post('/api/learning-paths/:id/regenerate', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🔄 [API] Regenerating learning path: ${id}`);
      
      const existingPath = await storage.getLearningPath(id);
      if (!existingPath) {
        return res.status(404).json({ error: 'Learning path not found' });
      }

      const enhancedGoal = `
Regenerate learning path based on original goal: ${existingPath.goal}
Please create a new variation with different modules and fresh perspective.
Maintain the same difficulty level (${existingPath.difficulty}) and overall scope.
      `.trim();

      const result = await contentGenerationService.processLearningGoal(enhancedGoal);
      
      console.log('🎉 [API] Learning path regeneration completed successfully');
      res.json({ success: true, message: 'Learning path regenerated' });
    } catch (error) {
      console.error('❌ [API] Error regenerating learning path:', error);
      res.status(500).json({ error: 'Failed to regenerate learning path' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
