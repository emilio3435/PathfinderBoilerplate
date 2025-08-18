import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Badge component implementation
const Badge = ({ children, variant = "default", className = "" }: { 
  children: React.ReactNode; 
  variant?: "default" | "secondary" | "destructive" | "success"; 
  className?: string;
}) => {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800", 
    destructive: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800"
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Brain,
  Target,
  Lightbulb
} from "lucide-react";

interface AdaptiveInsightsProps {
  insights: {
    currentLevel: "struggling" | "comfortable" | "advanced" | "mastery";
    confidence: number;
    recommendations?: {
      recommendedActions: string[];
      nextLessonModifications: string[];
      chatSuggestions: string[];
    };
  };
}

const levelConfig = {
  struggling: {
    color: "destructive",
    icon: TrendingDown,
    label: "Needs Support",
    description: "Taking extra time to grasp concepts"
  },
  comfortable: {
    color: "secondary",
    icon: Minus,
    label: "On Track",
    description: "Learning at a good pace"
  },
  advanced: {
    color: "default",
    icon: TrendingUp,
    label: "Accelerated",
    description: "Grasping concepts quickly"
  },
  mastery: {
    color: "success",
    icon: Brain,
    label: "Mastering",
    description: "Demonstrating deep understanding"
  }
} as const;

export default function AdaptiveInsights({ insights }: AdaptiveInsightsProps) {
  const config = levelConfig[insights.currentLevel];
  const Icon = config.icon;

  if (!insights || insights.confidence < 0.3) {
    return null; // Don't show if confidence is too low
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Brain className="h-4 w-4 text-blue-600" />
          <span>Learning Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">{config.label}</span>
          </div>
          <Badge variant={config.color as any} className="text-xs">
            {Math.round(insights.confidence * 100)}% confidence
          </Badge>
        </div>

        <p className="text-xs text-gray-600">{config.description}</p>

        {/* Recommendations */}
        {insights.recommendations && (
          <div className="space-y-3">
            {insights.recommendations.recommendedActions.length > 0 && (
              <div>
                <div className="flex items-center space-x-1 mb-2">
                  <Target className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">Recommendations</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {insights.recommendations.recommendedActions.slice(0, 2).map((action, index) => (
                    <li key={index} className="flex items-start space-x-1">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insights.recommendations.chatSuggestions.length > 0 && (
              <div>
                <div className="flex items-center space-x-1 mb-2">
                  <Lightbulb className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs font-medium text-gray-700">Try asking</span>
                </div>
                <div className="space-y-1">
                  {insights.recommendations.chatSuggestions.slice(0, 2).map((suggestion, index) => (
                    <button
                      key={index}
                      className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition-colors duration-200 text-left w-full"
                      onClick={() => {
                        // This will be handled by the parent component
                        const event = new CustomEvent('adaptiveSuggestionClick', { 
                          detail: { suggestion } 
                        });
                        window.dispatchEvent(event);
                      }}
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}