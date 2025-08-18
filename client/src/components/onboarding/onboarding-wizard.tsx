import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { 
  ArrowRight, 
  ArrowLeft,
  Clock,
  Target,
  Brain,
  BookOpen,
  Zap,
  CheckCircle
} from "lucide-react";
import { processOnboardingGoal, createLearningPath, createUser } from "@/lib/api";

interface OnboardingData {
  goal: string;
  currentLevel: string;
  timeCommitment: string;
  weeklyHours: string;
  specificOutcomes: string;
  industry: string;
  preferredDuration: string;
  motivation: string;
}

// Learning styles will be inferred from user behavior during first few modules

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    goal: "",
    currentLevel: "",
    timeCommitment: "",
    weeklyHours: "",
    specificOutcomes: "",
    industry: "",
    preferredDuration: "",
    motivation: "",
  });

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, setUser, setCurrentPath } = useApp();

  const onboardingMutation = useMutation({
    mutationFn: async () => {
      // Enhanced prompt with all user preferences
      const enhancedGoal = `
Goal: ${data.goal}

User Context:
- Current Level: ${data.currentLevel}
- Time Commitment: ${data.weeklyHours} hours per week
- Preferred Duration: ${data.preferredDuration}
- Learning Style: Will be inferred from behavior during first modules
- Industry/Context: ${data.industry}
- Motivation: ${data.motivation}
- Specific Outcomes: ${data.specificOutcomes}

Please create a learning path that considers all these factors for maximum personalization.
      `.trim();

      return processOnboardingGoal({ goal: enhancedGoal });
    },
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

        // Create learning path with user preferences
        const pathData = {
          userId: currentUser!.id,
          goal: data.goal,
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
        description: "Failed to process your preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  // Learning styles will be inferred from user behavior

  const canProceed = (step: number) => {
    switch (step) {
      case 0: return data.goal.trim().length > 0;
      case 1: return data.currentLevel && data.motivation;
      case 2: return data.weeklyHours && data.preferredDuration;
      case 3: return true; // Final details - optional fields
      default: return true;
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    onboardingMutation.mutate();
  };

  const steps = [
    {
      title: "What's Your Goal?",
      icon: Target,
      component: (
        <div className="space-y-4">
          <Label className="text-lg font-medium">What do you want to achieve?</Label>
          <Textarea
            placeholder="e.g., Learn web development to build my own startup, Master machine learning for a career transition, Understand data analysis for my current job..."
            value={data.goal}
            onChange={(e) => updateData({ goal: e.target.value })}
            className="min-h-24 text-base"
            data-testid="input-goal"
          />
          <p className="text-sm text-gray-600">
            Be specific about your end goal - this helps us tailor your learning path.
          </p>
        </div>
      )
    },
    {
      title: "Your Background",
      icon: Brain,
      component: (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">What's your current level?</Label>
            <Select value={data.currentLevel} onValueChange={(value) => updateData({ currentLevel: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="complete-beginner">Complete beginner - never touched this topic</SelectItem>
                <SelectItem value="some-exposure">Some exposure - heard about it, maybe tried basics</SelectItem>
                <SelectItem value="intermediate">Intermediate - have some experience, want to go deeper</SelectItem>
                <SelectItem value="advanced">Advanced - strong foundation, want specialized knowledge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base font-medium">What's driving your learning?</Label>
            <Select value={data.motivation} onValueChange={(value) => updateData({ motivation: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose your primary motivation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="career">Career advancement or change</SelectItem>
                <SelectItem value="personal">Personal interest and growth</SelectItem>
                <SelectItem value="project">Specific project I want to build</SelectItem>
                <SelectItem value="corporate">Required for current job</SelectItem>
                <SelectItem value="entrepreneurship">Starting my own business</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "Time & Pace",
      icon: Clock,
      component: (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">How much time can you dedicate weekly?</Label>
            <Select value={data.weeklyHours} onValueChange={(value) => updateData({ weeklyHours: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose your weekly commitment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2">1-2 hours (slow and steady)</SelectItem>
                <SelectItem value="3-5">3-5 hours (moderate pace)</SelectItem>
                <SelectItem value="6-10">6-10 hours (intensive)</SelectItem>
                <SelectItem value="10+">10+ hours (bootcamp style)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base font-medium">How long do you want your learning path to be?</Label>
            <Select value={data.preferredDuration} onValueChange={(value) => updateData({ preferredDuration: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose your preferred timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2-4 weeks">2-4 weeks (crash course)</SelectItem>
                <SelectItem value="1-2 months">1-2 months (focused sprint)</SelectItem>
                <SelectItem value="3-4 months">3-4 months (comprehensive)</SelectItem>
                <SelectItem value="6+ months">6+ months (thorough mastery)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "Final Details",
      icon: Zap,
      component: (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Industry or context (optional)</Label>
            <Input
              placeholder="e.g., Healthcare, Finance, E-commerce, Startups..."
              value={data.industry}
              onChange={(e) => updateData({ industry: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-base font-medium">Specific outcomes you want (optional)</Label>
            <Textarea
              placeholder="e.g., Build a portfolio website, Analyze company data, Create a mobile app, Get certified..."
              value={data.specificOutcomes}
              onChange={(e) => updateData({ specificOutcomes: e.target.value })}
              className="mt-2"
            />
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-light to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sage rounded-xl flex items-center justify-center mx-auto mb-4">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">
            {currentStepData.title}
          </h1>
          <p className="text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-sage rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {currentStepData.component}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={onboardingMutation.isPending}
              className="bg-sage hover:bg-sage-dark text-white flex items-center space-x-2"
              data-testid="button-create-path"
            >
              {onboardingMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <span>Create My Learning Path</span>
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed(currentStep)}
              className="bg-sage hover:bg-sage-dark text-white flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}