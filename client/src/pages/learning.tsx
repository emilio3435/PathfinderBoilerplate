import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";
import { Play, Clock, ArrowLeft, ArrowRight } from "lucide-react";

import ModuleSidebar from "@/components/learning/module-sidebar";
import LessonContent from "@/components/learning/lesson-content";
import ChatInterface from "@/components/chat/chat-interface";

export default function LearningPage() {
  const { pathId } = useParams();
  const { user, currentPath, setCurrentPath } = useApp();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // Fetch learning path data
  const { data: pathData, isLoading: pathLoading } = useQuery({
    queryKey: ["/api/learning-paths", pathId],
    enabled: !!pathId,
  });

  // Fetch current lesson data
  const { data: currentLesson, isLoading: lessonLoading } = useQuery({
    queryKey: ["/api/lessons", selectedLessonId],
    enabled: !!selectedLessonId,
  });

  // Fetch current module data
  const { data: currentModule } = useQuery({
    queryKey: ["/api/modules", selectedModuleId],
    enabled: !!selectedModuleId,
  });

  useEffect(() => {
    if (pathData && !currentPath) {
      setCurrentPath(pathData);
    }
  }, [pathData, currentPath, setCurrentPath]);

  useEffect(() => {
    // Auto-select first available lesson
    if (pathData && (pathData as any)?.modules && !selectedLessonId) {
      const firstModule = (pathData as any).modules[0];
      if (firstModule) {
        setSelectedModuleId(firstModule.id);
        const firstLesson = firstModule.lessons?.[0];
        if (firstLesson) {
          setSelectedLessonId(firstLesson.id);
        }
      }
    }
  }, [pathData, selectedLessonId]);

  if (pathLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  if (!pathData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-charcoal mb-2">Learning Path Not Found</h2>
            <p className="text-gray-600">The learning path you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Course Navigation */}
        <ModuleSidebar
          path={pathData}
          selectedLessonId={selectedLessonId}
          selectedModuleId={selectedModuleId}
          onLessonSelect={setSelectedLessonId}
          onModuleSelect={setSelectedModuleId}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Content Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-charcoal" data-testid="text-lesson-title">
                  {(currentLesson as any)?.title || "Select a lesson to begin"}
                </h1>
                <p className="text-gray-600 mt-1" data-testid="text-lesson-description">
                  {(currentLesson as any)?.description || "Choose from the modules on the left"}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {currentLesson && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600" data-testid="text-lesson-duration">
                        {(currentLesson as any).duration || 15} min
                      </span>
                    </div>
                    <Button 
                      className="bg-sage hover:bg-sage-dark text-white transition-colors duration-200"
                      data-testid="button-continue"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Continue
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Lesson Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedLessonId ? (
                <LessonContent
                  lesson={currentLesson}
                  isLoading={lessonLoading}
                  pathData={pathData}
                />
              ) : (
                <div className="p-6 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-sage-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="h-8 w-8 text-sage" />
                    </div>
                    <h3 className="text-lg font-semibold text-charcoal mb-2">
                      Ready to Start Learning?
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Select a lesson from the modules on the left to begin your learning journey.
                    </p>
                    <div className="text-sm text-gray-500">
                      Progress: {(pathData as any).progress || 0}% complete
                    </div>
                    <Progress value={(pathData as any).progress || 0} className="mt-2" />
                  </div>
                </div>
              )}
            </div>

            {/* AI Chat Tutor Panel */}
            <div className="w-96 border-l border-gray-200">
              <ChatInterface
                userId={user?.id || ""}
                pathId={(pathData as any).id}
                lessonId={selectedLessonId}
                currentLesson={currentLesson}
                currentModule={currentModule}
                userProgress={{
                  completed: (pathData as any).progress || 0,
                  total: 100
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
