import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { 
  Route, 
  Brain, 
  TrendingUp, 
  GraduationCap, 
  ArrowRight,
  Compass
} from "lucide-react";
import { processOnboardingGoal, createLearningPath, createUser } from "@/lib/api";

export default function LandingPage() {
  const [goal, setGoal] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, setUser, setCurrentPath } = useApp();

  const onboardingMutation = useMutation({
    mutationFn: processOnboardingGoal,
    onSuccess: async (response) => {
      try {
        // Create user if not exists
        let currentUser = user;
        if (!currentUser) {
          currentUser = await createUser({
            name: "New Learner",
            email: `learner${Date.now()}@sage.ai`,
            username: `learner${Date.now()}`
          });
          setUser(currentUser);
        }

        // Create learning path
        const pathData = {
          userId: currentUser.id,
          ...response.learningPath,
          modules: response.learningPath.modules
        };

        const newPath = await createLearningPath(pathData);
        setCurrentPath(newPath);

        toast({
          title: "Learning Path Created!",
          description: `Your personalized ${response.learningPath.title} journey is ready.`,
        });

        setLocation(`/learning/${newPath.id}`);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create your learning path. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process your goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      toast({
        title: "Goal Required",
        description: "Please enter what you want to achieve.",
        variant: "destructive",
      });
      return;
    }

    onboardingMutation.mutate({ goal });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-light to-white">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-sage rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Compass className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
            Welcome to Sage
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your AI-powered learning companion that creates personalized paths tailored to your goals, timeline, and learning style
          </p>
        </div>

        <Card className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <CardContent className="p-0">
            <h2 className="text-2xl font-semibold text-charcoal mb-6">
              What do you want to achieve?
            </h2>
            <form onSubmit={handleSubmit} className="relative">
              <Input
                type="text"
                placeholder="e.g., Learn web development, Master data analysis, Get promoted to manager..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-sage focus:outline-none text-lg pr-20"
                disabled={onboardingMutation.isPending}
                data-testid="input-goal"
              />
              <Button
                type="submit"
                disabled={onboardingMutation.isPending || !goal.trim()}
                className="absolute right-2 top-2 bg-sage hover:bg-sage-dark text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                data-testid="button-start"
              >
                {onboardingMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="h-5 w-5" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-charcoal mb-2">AI-Powered Curation</h3>
              <p className="text-gray-600 text-sm">
                Smart resource selection based on your goals and learning style
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Progress Tracking</h3>
              <p className="text-gray-600 text-sm">
                Visual portfolio of your achievements and completed projects
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Verifiable Results</h3>
              <p className="text-gray-600 text-sm">
                Practical assessments and portfolio-ready projects
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
