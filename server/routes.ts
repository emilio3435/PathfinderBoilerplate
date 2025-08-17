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
    try {
      const { goal, conversationHistory = [] } = req.body;
      if (!goal) {
        return res.status(400).json({ message: "Goal is required" });
      }

      const response = await processOnboardingGoal(goal, conversationHistory);
      res.json(response);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to process onboarding goal", 
        error: (error as Error).message 
      });
    }
  });

  app.post("/api/learning-paths", async (req, res) => {
    try {
      const pathData = insertLearningPathSchema.parse(req.body);
      const path = await storage.createLearningPath(pathData);
      
      // Create modules and lessons from AI-generated structure
      if (req.body.modules) {
        for (const moduleData of req.body.modules) {
          const module = await storage.createModule({
            pathId: path.id,
            title: moduleData.title,
            description: moduleData.description,
            orderIndex: moduleData.orderIndex,
            totalLessons: moduleData.lessons?.length || 0
          });

          if (moduleData.lessons) {
            for (const lessonData of moduleData.lessons) {
              await storage.createLesson({
                moduleId: module.id,
                title: lessonData.title,
                description: lessonData.description,
                orderIndex: lessonData.orderIndex,
                duration: lessonData.duration,
                content: {}, // Will be generated when accessed
                resources: []
              });
            }
          }
        }
      }

      res.json(path);
    } catch (error) {
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
    try {
      const path = await storage.getLearningPath(req.params.id);
      if (!path) {
        return res.status(404).json({ message: "Learning path not found" });
      }

      const modules = await storage.getPathModules(path.id);
      const pathWithModules = { ...path, modules };
      
      res.json(pathWithModules);
    } catch (error) {
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

      // Save user message
      await storage.createChatMessage({
        userId,
        pathId,
        lessonId,
        role: "user",
        content: message,
        context
      });

      // Get conversation history
      const conversationHistory = await storage.getUserChatMessages(userId, pathId);
      const formattedHistory = conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate AI response
      const aiResponse = await generateChatResponse(message, {
        currentLesson: context?.currentLesson,
        currentModule: context?.currentModule,
        userProgress: context?.userProgress,
        conversationHistory: formattedHistory
      });

      // Save AI response
      const aiMessage = await storage.createChatMessage({
        userId,
        pathId,
        lessonId,
        role: "assistant",
        content: aiResponse.message,
        context: {
          suggestions: aiResponse.suggestions,
          contextualHints: aiResponse.contextualHints
        }
      });

      res.json({
        message: aiResponse.message,
        suggestions: aiResponse.suggestions,
        contextualHints: aiResponse.contextualHints,
        messageId: aiMessage.id
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

  const httpServer = createServer(app);
  return httpServer;
}
