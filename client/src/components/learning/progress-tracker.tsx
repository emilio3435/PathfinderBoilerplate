import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  Target, 
  Award,
  TrendingUp
} from "lucide-react";

interface ProgressSection {
  id: string;
  title: string;
  type: 'reading' | 'video' | 'quiz' | 'exercise' | 'challenge';
  completed: boolean;
  score?: number;
  timeSpent?: number;
}

interface ProgressTrackerProps {
  sections: ProgressSection[];
  overallProgress: number;
  lessonTitle: string;
  estimatedTime?: number;
  onSectionClick?: (sectionId: string) => void;
}

export default function ProgressTracker({ 
  sections, 
  overallProgress, 
  lessonTitle, 
  estimatedTime,
  onSectionClick 
}: ProgressTrackerProps) {
  const completedCount = sections.filter(s => s.completed).length;
  const totalSections = sections.length;
  
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'reading': return CheckCircle;
      case 'video': return Clock;
      case 'quiz': return Target;
      case 'exercise': return Award;
      case 'challenge': return TrendingUp;
      default: return CheckCircle;
    }
  };

  const getSectionColor = (type: string, completed: boolean) => {
    if (completed) return 'green';
    switch (type) {
      case 'reading': return 'blue';
      case 'video': return 'purple';
      case 'quiz': return 'yellow';
      case 'exercise': return 'orange';
      case 'challenge': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Card className="border border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-charcoal">{lessonTitle} Progress</h3>
            <p className="text-sm text-gray-600">
              {completedCount} of {totalSections} sections completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{overallProgress}%</div>
            {estimatedTime && (
              <div className="text-xs text-gray-500">{estimatedTime} min remaining</div>
            )}
          </div>
        </div>

        {/* Overall Progress Bar */}
        <Progress value={overallProgress} className="mb-6" />

        {/* Section List */}
        <div className="space-y-3">
          {sections.map((section, index) => {
            const Icon = getSectionIcon(section.type);
            const color = getSectionColor(section.type, section.completed);
            
            return (
              <div
                key={section.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-200 ${
                  section.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:border-blue-300 cursor-pointer'
                }`}
                onClick={() => onSectionClick?.(section.id)}
                data-testid={`progress-section-${index}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    section.completed 
                      ? 'bg-green-100' 
                      : `bg-${color}-100`
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      section.completed 
                        ? 'text-green-600' 
                        : `text-${color}-600`
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium text-charcoal">{section.title}</div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          section.completed 
                            ? 'bg-green-100 text-green-700' 
                            : `bg-${color}-100 text-${color}-700`
                        }`}
                      >
                        {section.type}
                      </Badge>
                      {section.timeSpent && (
                        <span className="text-xs text-gray-500">
                          {section.timeSpent}m
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {section.score !== undefined && (
                    <div className="text-sm font-medium text-blue-600">
                      {section.score}%
                    </div>
                  )}
                  {section.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Badge */}
        {overallProgress === 100 && (
          <div className="mt-6 p-4 bg-green-100 border border-green-200 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-2 text-green-800">
              <Award className="h-5 w-5" />
              <span className="font-medium">Lesson Complete!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Great job finishing all sections. Ready for the next lesson?
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}