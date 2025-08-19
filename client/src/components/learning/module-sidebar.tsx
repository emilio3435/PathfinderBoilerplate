import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Circle, 
  Lock, 
  Trophy,
  Code,
  BookOpen,
  Target
} from "lucide-react";

import ChatGPT_Image_Aug_18__2025__09_24_06_PM from "@assets/ChatGPT Image Aug 18, 2025, 09_24_06 PM.png";

interface ModuleSidebarProps {
  path: any;
  selectedLessonId: string | null;
  selectedModuleId: string | null;
  onLessonSelect: (lessonId: string) => void;
  onModuleSelect: (moduleId: string) => void;
}

export default function ModuleSidebar({
  path,
  selectedLessonId,
  selectedModuleId,
  onLessonSelect,
  onModuleSelect
}: ModuleSidebarProps) {
  
  const getModuleIcon = (index: number) => {
    const icons = [Code, BookOpen, Target, Trophy];
    const Icon = icons[index % icons.length];
    return Icon;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Course Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img 
              src={ChatGPT_Image_Aug_18__2025__09_24_06_PM} 
              alt="Sage Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="font-semibold text-charcoal" data-testid="text-path-title">
              {path.title}
            </h2>
            <p className="text-sm text-gray-600" data-testid="text-path-info">
              {path.estimatedDuration} • {path.difficulty}
            </p>
          </div>
        </div>
        <Progress value={path.progress || 0} className="mb-2" />
        <p className="text-sm text-gray-600">
          <span data-testid="text-progress-completed">{path.progress || 0}%</span> completed
        </p>
      </div>

      {/* Module List */}
      <div className="flex-1 overflow-y-auto p-4">
        {path.modules && path.modules.length > 0 ? (
          path.modules.map((module: any, index: number) => {
            const Icon = getModuleIcon(index);
            const isSelected = module.id === selectedModuleId;
            const isCompleted = module.isCompleted;
            const isUnlocked = module.isUnlocked || index === 0;

            return (
              <div key={module.id} className="mb-4">
                <div
                  className={`rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-sage text-white"
                      : isCompleted
                      ? "bg-green-50 border border-green-200"
                      : isUnlocked
                      ? "bg-gray-50 border border-gray-200 hover:bg-sage-light"
                      : "bg-gray-50 opacity-75"
                  }`}
                  onClick={() => {
                    if (isUnlocked) {
                      onModuleSelect(module.id);
                      // Auto-select first lesson
                      if (module.lessons?.[0]) {
                        onLessonSelect(module.lessons[0].id);
                      }
                    }
                  }}
                  data-testid={`module-${module.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {module.title}
                      </span>
                    </div>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : !isUnlocked ? (
                      <Lock className="h-4 w-4 text-gray-400" />
                    ) : (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected ? "bg-white" : "bg-sage"
                      }`}>
                        <span className={`text-xs font-bold ${
                          isSelected ? "text-sage" : "text-white"
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`text-xs mb-2 ${
                    isSelected ? "text-sage-light" : "text-gray-600"
                  }`}>
                    {module.totalLessons || module.lessons?.length || 0} lessons
                    {module.completedLessons ? ` • ${module.completedLessons} completed` : ''}
                  </div>
                  {module.completedLessons && module.totalLessons && (
                    <Progress 
                      value={(module.completedLessons / module.totalLessons) * 100} 
                      className="h-1"
                    />
                  )}
                </div>

                {/* Show lessons if module is selected */}
                {isSelected && module.lessons && (
                  <div className="ml-4 mt-2 space-y-2">
                    {module.lessons.map((lesson: any, lessonIndex: number) => (
                      <div
                        key={lesson.id}
                        className={`p-2 rounded cursor-pointer text-sm transition-colors duration-200 ${
                          lesson.id === selectedLessonId
                            ? "bg-sage text-white"
                            : lesson.isCompleted
                            ? "bg-green-50 text-green-800"
                            : "bg-gray-50 hover:bg-sage-light"
                        }`}
                        onClick={() => onLessonSelect(lesson.id)}
                        data-testid={`lesson-${lesson.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{lesson.title}</span>
                          <div className="flex items-center space-x-1">
                            {lesson.duration && (
                              <span className="text-xs opacity-75">
                                {lesson.duration}m
                              </span>
                            )}
                            {lesson.isCompleted ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <Circle className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No modules available</p>
          </div>
        )}

        {/* Achievement Section */}
        {path.progress > 0 && (
          <Card className="mt-6 bg-gradient-to-r from-golden to-yellow-400">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="h-5 w-5 text-white" />
                <span className="text-white font-medium">Keep Going!</span>
              </div>
              <p className="text-white text-sm">
                You're making great progress on your learning journey!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
