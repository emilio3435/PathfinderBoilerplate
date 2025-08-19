import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { 
  Route, 
  Brain, 
  TrendingUp, 
  GraduationCap, 
  ArrowRight,
  Compass,
  Zap
} from "lucide-react";

import ChatGPT_Image_Aug_18__2025__09_24_06_PM from "@assets/ChatGPT Image Aug 18, 2025, 09_24_06 PM.png";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-light to-white">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <img 
              src={ChatGPT_Image_Aug_18__2025__09_24_06_PM} 
              alt="Sage Logo" 
              className="w-full h-full object-contain"
            />
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
              Ready to start your personalized learning journey?
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Our enhanced onboarding takes just 2 minutes to create a learning path perfectly tailored to your goals, timeline, and preferred learning style.
            </p>
            <Button
              onClick={() => setLocation('/onboarding')}
              className="w-full bg-sage hover:bg-sage-dark text-white px-8 py-4 rounded-xl transition-colors duration-200 font-medium text-lg flex items-center justify-center space-x-3"
              data-testid="button-start-onboarding"
            >
              <Zap className="h-6 w-6" />
              <span>Create My Learning Path</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
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
