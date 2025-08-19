import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { queryClient } from "@/lib/queryClient";
import { BookOpen, Clock, CheckCircle, ArrowRight, RefreshCw } from "lucide-react";
import type { LearningPath } from "@shared/schema";

interface CourseOverviewProps {
  pathId: string;
}

export default function CourseOverview() {
  const [, params] = useRoute("/course-overview/:pathId");
  const [, setLocation] = useLocation();
  
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

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/learning-paths/${pathId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to regenerate learning path');
      return response.json();
    },
    onSuccess: () => {
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
          <div className="w-16 h-16 bg-sage rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-white" />
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
            <Card key={module.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-sage rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-charcoal">
                        {module.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-3 ml-11">
                      {module.description}
                    </p>
                    <div className="ml-11 flex items-center gap-4 text-sm text-gray-500">
                      <span>{module.totalLessons || 0} lessons</span>
                      <span>~{Math.round((module.totalLessons || 0) * 0.5)} hours</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Button
            variant="outline"
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
            className="flex items-center gap-2"
            data-testid="button-regenerate-path"
          >
            {regenerateMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-sage border-t-transparent rounded-full animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Regenerate Path</span>
          </Button>

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
                <span>Start Learning Journey</span>
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