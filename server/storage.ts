import { 
  type User, type InsertUser,
  type LearningPath, type InsertLearningPath,
  type Module, type InsertModule,
  type Lesson, type InsertLesson,
  type Project, type InsertProject,
  type Achievement, type InsertAchievement,
  type ChatMessage, type InsertChatMessage,
  type Skill, type InsertSkill
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Learning Paths
  getLearningPath(id: string): Promise<LearningPath | undefined>;
  getUserLearningPaths(userId: string): Promise<LearningPath[]>;
  createLearningPath(path: InsertLearningPath): Promise<LearningPath>;
  updateLearningPath(id: string, updates: Partial<LearningPath>): Promise<LearningPath | undefined>;

  // Modules
  getModule(id: string): Promise<Module | undefined>;
  getPathModules(pathId: string): Promise<Module[]>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: string, updates: Partial<Module>): Promise<Module | undefined>;

  // Lessons
  getLesson(id: string): Promise<Lesson | undefined>;
  getModuleLessons(moduleId: string): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson | undefined>;

  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getUserProjects(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;

  // Achievements
  getAchievement(id: string): Promise<Achievement | undefined>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;

  // Chat Messages
  getChatMessage(id: string): Promise<ChatMessage | undefined>;
  getUserChatMessages(userId: string, pathId?: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Skills
  getSkill(id: string): Promise<Skill | undefined>;
  getUserSkills(userId: string): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: string, updates: Partial<Skill>): Promise<Skill | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private learningPaths: Map<string, LearningPath> = new Map();
  private modules: Map<string, Module> = new Map();
  private lessons: Map<string, Lesson> = new Map();
  private projects: Map<string, Project> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private chatMessages: Map<string, ChatMessage> = new Map();
  private skills: Map<string, Skill> = new Map();

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      avatar: insertUser.avatar || null,
      totalPoints: 0,
      streakDays: 0,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Learning Paths
  async getLearningPath(id: string): Promise<LearningPath | undefined> {
    return this.learningPaths.get(id);
  }

  async getUserLearningPaths(userId: string): Promise<LearningPath[]> {
    return Array.from(this.learningPaths.values()).filter(path => path.userId === userId);
  }

  async createLearningPath(insertPath: InsertLearningPath): Promise<LearningPath> {
    const id = randomUUID();
    const path: LearningPath = { 
      ...insertPath, 
      id,
      estimatedDuration: insertPath.estimatedDuration || null,
      progress: 0,
      isActive: true,
      createdAt: new Date()
    };
    this.learningPaths.set(id, path);
    return path;
  }

  async updateLearningPath(id: string, updates: Partial<LearningPath>): Promise<LearningPath | undefined> {
    const path = this.learningPaths.get(id);
    if (!path) return undefined;
    const updatedPath = { ...path, ...updates };
    this.learningPaths.set(id, updatedPath);
    return updatedPath;
  }

  // Modules
  async getModule(id: string): Promise<Module | undefined> {
    return this.modules.get(id);
  }

  async getPathModules(pathId: string): Promise<Module[]> {
    return Array.from(this.modules.values())
      .filter(module => module.pathId === pathId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createModule(insertModule: InsertModule): Promise<Module> {
    const id = randomUUID();
    const module: Module = { 
      ...insertModule, 
      id,
      description: insertModule.description || null,
      isCompleted: false,
      isUnlocked: insertModule.orderIndex === 0,
      totalLessons: 0,
      completedLessons: 0
    };
    this.modules.set(id, module);
    return module;
  }

  async updateModule(id: string, updates: Partial<Module>): Promise<Module | undefined> {
    const module = this.modules.get(id);
    if (!module) return undefined;
    const updatedModule = { ...module, ...updates };
    this.modules.set(id, updatedModule);
    return updatedModule;
  }

  // Lessons
  async getLesson(id: string): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async getModuleLessons(moduleId: string): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(lesson => lesson.moduleId === moduleId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = randomUUID();
    const lesson: Lesson = { 
      ...insertLesson, 
      id,
      duration: insertLesson.duration || null,
      description: insertLesson.description || null,
      resources: insertLesson.resources || null,
      isCompleted: false
    };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson | undefined> {
    const lesson = this.lessons.get(id);
    if (!lesson) return undefined;
    const updatedLesson = { ...lesson, ...updates };
    this.lessons.set(id, updatedLesson);
    return updatedLesson;
  }

  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.userId === userId);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = { 
      ...insertProject, 
      id,
      imageUrl: insertProject.imageUrl || null,
      githubUrl: insertProject.githubUrl || null,
      liveUrl: insertProject.liveUrl || null,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date()
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  // Achievements
  async getAchievement(id: string): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(achievement => achievement.userId === userId);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = randomUUID();
    const achievement: Achievement = { 
      ...insertAchievement, 
      id,
      earnedAt: new Date()
    };
    this.achievements.set(id, achievement);
    return achievement;
  }

  // Chat Messages
  async getChatMessage(id: string): Promise<ChatMessage | undefined> {
    return this.chatMessages.get(id);
  }

  async getUserChatMessages(userId: string, pathId?: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId && (!pathId || message.pathId === pathId))
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id,
      pathId: insertMessage.pathId || null,
      lessonId: insertMessage.lessonId || null,
      context: insertMessage.context || null,
      createdAt: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Skills
  async getSkill(id: string): Promise<Skill | undefined> {
    return this.skills.get(id);
  }

  async getUserSkills(userId: string): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(skill => skill.userId === userId);
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = randomUUID();
    const skill: Skill = { 
      ...insertSkill, 
      id,
      icon: insertSkill.icon || null,
      progress: insertSkill.progress || 0
    };
    this.skills.set(id, skill);
    return skill;
  }

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill | undefined> {
    const skill = this.skills.get(id);
    if (!skill) return undefined;
    const updatedSkill = { ...skill, ...updates };
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }
}

export const storage = new MemStorage();
