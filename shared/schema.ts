import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  totalPoints: integer("total_points").default(0),
  streakDays: integer("streak_days").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const learningPaths = pgTable("learning_paths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  goal: text("goal").notNull(),
  motivation: text("motivation").notNull(), // career, hobby, corporate, etc.
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  estimatedDuration: text("estimated_duration"),
  progress: integer("progress").default(0), // percentage
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pathId: varchar("path_id").notNull().references(() => learningPaths.id),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  isCompleted: boolean("is_completed").default(false),
  isUnlocked: boolean("is_unlocked").default(false),
  totalLessons: integer("total_lessons").default(0),
  completedLessons: integer("completed_lessons").default(0),
});

export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").notNull().references(() => modules.id),
  title: text("title").notNull(),
  description: text("description"),
  content: jsonb("content").notNull(), // rich content structure
  orderIndex: integer("order_index").notNull(),
  duration: integer("duration"), // in minutes
  isCompleted: boolean("is_completed").default(false),
  resources: jsonb("resources"), // curated resources with citations
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  technologies: jsonb("technologies").notNull(), // array of tech tags
  imageUrl: text("image_url"),
  githubUrl: text("github_url"),
  liveUrl: text("live_url"),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  points: integer("points").notNull(),
  category: text("category").notNull(), // completion, streak, skill, etc.
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  pathId: varchar("path_id").references(() => learningPaths.id),
  lessonId: varchar("lesson_id").references(() => lessons.id),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  context: jsonb("context"), // current lesson context, user progress, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  level: text("level").notNull(), // beginner, intermediate, advanced
  progress: integer("progress").default(0), // percentage
  icon: text("icon"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({
  id: true,
  createdAt: true,
});

export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  earnedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;

export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
