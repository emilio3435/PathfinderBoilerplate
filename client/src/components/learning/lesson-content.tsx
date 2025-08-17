import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Info, 
  Code, 
  HandHeart,
  HelpCircle,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  CheckCircle
} from "lucide-react";

interface LessonContentProps {
  lesson: any;
  isLoading: boolean;
  pathData: any;
}

export default function LessonContent({ lesson, isLoading, pathData }: LessonContentProps) {
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Select a lesson to view content</p>
      </div>
    );
  }

  const content = lesson.content || {};
  const sections = content.sections || [];

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'concept': return Info;
      case 'example': return Code;
      case 'exercise': return HandHeart;
      case 'quiz': return HelpCircle;
      default: return Info;
    }
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'concept': return 'blue';
      case 'example': return 'green';
      case 'exercise': return 'purple';
      case 'quiz': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      {/* Lesson Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Lesson Progress</span>
          <span className="text-sm text-gray-600">In Progress</span>
        </div>
        <Progress value={lesson.isCompleted ? 100 : 25} className="mb-2" />
      </div>

      {/* Introduction */}
      {content.introduction && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Introduction</h3>
            <p className="text-gray-700 leading-relaxed" data-testid="text-lesson-intro">
              {content.introduction}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lesson Sections */}
      <div className="space-y-6">
        {sections.map((section: any, index: number) => {
          const Icon = getSectionIcon(section.type);
          const color = getSectionColor(section.type);
          
          return (
            <Card key={index} className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 text-${color}-600`} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-charcoal">
                      {section.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {section.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 mb-4" data-testid={`text-section-${index}`}>
                    {section.content}
                  </p>
                  
                  {/* Code Example */}
                  {section.codeExample && (
                    <div className="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm">
                        <code data-testid={`code-section-${index}`}>
                          {section.codeExample}
                        </code>
                      </pre>
                    </div>
                  )}
                  
                  {/* Resources */}
                  {section.resources && section.resources.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Resources:</h4>
                      <div className="space-y-2">
                        {section.resources.map((resource: any, resourceIndex: number) => (
                          <div key={resourceIndex} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                            <div>
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sage hover:text-sage-dark font-medium text-sm"
                                data-testid={`link-resource-${index}-${resourceIndex}`}
                              >
                                {resource.title}
                              </a>
                              <p className="text-xs text-gray-600">{resource.summary}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Practical Exercise */}
        {content.practicalExercise && (
          <Card className="bg-gradient-to-r from-sage-light to-green-100 border border-sage">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center">
                  <HandHeart className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal">
                  {content.practicalExercise.title}
                </h3>
              </div>
              <p className="text-gray-700 mb-4" data-testid="text-exercise-description">
                {content.practicalExercise.description}
              </p>
              
              {content.practicalExercise.instructions && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-gray-700">
                    {content.practicalExercise.instructions.map((instruction: string, index: number) => (
                      <li key={index} data-testid={`text-instruction-${index}`}>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              
              <Button 
                className="bg-sage hover:bg-sage-dark text-white transition-colors duration-200 font-medium"
                data-testid="button-start-exercise"
              >
                <HandHeart className="h-4 w-4 mr-2" />
                Start Exercise
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Key Takeaways */}
        {content.keyTakeaways && content.keyTakeaways.length > 0 && (
          <Card className="bg-blue-50 border border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal">Key Takeaways</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                {content.keyTakeaways.map((takeaway: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span data-testid={`text-takeaway-${index}`}>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <Button 
          variant="ghost" 
          className="flex items-center space-x-2 text-gray-600 hover:text-sage transition-colors duration-200"
          data-testid="button-previous"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous Lesson</span>
        </Button>
        <Button 
          className="bg-sage hover:bg-sage-dark text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
          data-testid="button-next"
        >
          <span>Next Lesson</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
