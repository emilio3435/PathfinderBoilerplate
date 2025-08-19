import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { queryClient } from "@/lib/queryClient";
import { BookOpen, Clock, CheckCircle, ArrowRight, RefreshCw, Play, FileText, Users, Dumbbell, ChevronDown, ChevronRight } from "lucide-react";
import type { LearningPath } from "@shared/schema";

import ChatGPT_Image_Aug_18__2025__09_24_06_PM from "@assets/ChatGPT Image Aug 18, 2025, 09_24_06 PM.png";

// Component for individual module cards with expandable lesson details
function ModuleCard({ module, moduleNumber }: { module: any; moduleNumber: number }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: moduleWithLessons } = useQuery({
    queryKey: ['/api/modules', module.id],
    enabled: isOpen
  });

  const lessons = (moduleWithLessons as any)?.lessons || [];

  // Generate content type breakdown for lessons
  const getContentTypes = (lesson: any) => {
    const types = [
      { icon: Play, label: 'Video', color: 'text-red-500' },
      { icon: FileText, label: 'Reading', color: 'text-blue-500' },
      { icon: Dumbbell, label: 'Practice', color: 'text-green-500' },
      { icon: Users, label: 'Discussion', color: 'text-purple-500' }
    ];
    
    // For now, randomly assign 2-3 content types per lesson for demonstration
    // In a real implementation, this would come from the lesson content structure
    const shuffled = types.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-sage rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {moduleNumber}
              </div>
              <h3 className="text-lg font-semibold text-charcoal">
                {module.title}
              </h3>
            </div>
            <p className="text-gray-600 mb-3 ml-11">
              {module.description}
            </p>
            <div className="ml-11 flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span>{module.totalLessons || 0} lessons</span>
              <span>~{Math.round((module.totalLessons || 0) * 0.5)} hours</span>
            </div>
            
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="ml-11 p-0 h-auto text-sage hover:text-sage-dark">
                  {isOpen ? (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Hide lesson details
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Show lesson details
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="ml-11 mt-4 space-y-3">
                {lessons.length > 0 ? (
                  lessons.map((lesson: any, lessonIndex: number) => {
                    const contentTypes = getContentTypes(lesson);
                    return (
                      <div key={lesson.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-sage-light">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-charcoal">
                            {lessonIndex + 1}. {lesson.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {lesson.duration || 30} min
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {lesson.description}
                        </p>
                        
                        {/* Content Type Indicators */}
                        <div className="flex flex-wrap gap-2">
                          {contentTypes.map((type, typeIndex) => {
                            const Icon = type.icon;
                            return (
                              <div key={typeIndex} className="flex items-center gap-1 text-xs bg-white rounded-full px-2 py-1 border">
                                <Icon className={`h-3 w-3 ${type.color}`} />
                                <span className="text-gray-600">{type.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Click to load lesson details...
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CourseOverviewProps {
  pathId: string;
}

export default function CourseOverview() {
  const [, params] = useRoute("/course-overview/:pathId");
  const [, setLocation] = useLocation();
  const [feedbackText, setFeedbackText] = useState("");
  
  const pathId = params?.pathId;

  const { data: learningPath, isLoading, error } = useQuery({
    queryKey: ['/api/learning-paths', pathId],
    enabled: !!pathId
  });

  const startLearningMutation = useMutation({
    mutationFn: async () => {
      // Mark the learning path as approved/started
      const response = await fetch(`/api/learning-paths/${pathId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to start learning path');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/learning-paths'] });
      setLocation(`/learning/${pathId}`);
    }
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ feedback }: { feedback: string }) => {
      const response = await fetch(`/api/learning-paths/${pathId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      return response.json();
    },
    onSuccess: () => {
      setFeedbackText("");
      queryClient.invalidateQueries({ queryKey: ['/api/learning-paths', pathId] });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-light to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized learning path...</p>
        </div>
      </div>
    );
  }

  if (error || !learningPath) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-light to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading learning path</p>
          <Button onClick={() => setLocation('/')} data-testid="button-back-home">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const modules = (learningPath as any)?.modules || [];
  const totalLessons = modules.reduce((sum: number, module: any) => sum + (module.totalLessons || 0), 0);
  const estimatedHours = Math.round(totalLessons * 0.5); // Estimate 30 min per lesson

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-light to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <img 
              src={ChatGPT_Image_Aug_18__2025__09_24_06_PM} 
              alt="Sage Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">
            Your Learning Path Overview
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Review your personalized curriculum below. This learning path has been tailored specifically to your goals and experience level.
          </p>
        </div>

        {/* Course Details Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-charcoal">
              {(learningPath as any)?.title || 'Learning Path'}
            </CardTitle>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{modules.length} modules</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>{totalLessons} lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>~{estimatedHours} hours</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {(learningPath as any)?.description || 'No description available'}
            </p>
            <div className="mt-4">
              <Badge variant="secondary" className="bg-sage-light text-sage-dark">
                {(learningPath as any)?.difficulty || 'Beginner'} Level
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Modules Overview */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-semibold text-charcoal">Course Modules</h2>
          {modules.map((module: any, index: number) => (
            <ModuleCard key={module.id} module={module} moduleNumber={index + 1} />
          ))}
        </div>

        <Separator className="my-8" />

        {/* Feedback Section */}
        <Card className="mb-8 bg-sage-light/20 border-sage-light">
          <CardContent className="p-6">
            <h3 className="font-semibold text-charcoal mb-3">How does this syllabus look?</h3>
            <p className="text-gray-600 text-sm mb-4">
              If you'd like any changes to the modules, lessons, or focus areas, let us know what you'd like to adjust.
            </p>
            
            <div className="space-y-4">
              <textarea
                placeholder="Example: Add more hands-on practice exercises, focus more on advanced techniques, include specific breed considerations..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 text-sm focus:ring-2 focus:ring-sage focus:border-transparent"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                data-testid="textarea-syllabus-feedback"
              />
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => submitFeedbackMutation.mutate({ feedback: feedbackText })}
                  disabled={submitFeedbackMutation.isPending || !feedbackText.trim()}
                  className="flex-1"
                  data-testid="button-submit-feedback"
                >
                  {submitFeedbackMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating syllabus...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Request Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <Button
            onClick={() => startLearningMutation.mutate()}
            disabled={startLearningMutation.isPending}
            className="bg-sage hover:bg-sage-dark text-white flex items-center gap-2 px-8"
            data-testid="button-start-learning"
          >
            {startLearningMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Looks good, start learning!</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Your learning path adapts as you progress. The AI tutor will adjust content difficulty based on your understanding and preferred learning style.
          </p>
        </div>
      </div>
    </div>
  );
}