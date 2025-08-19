import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  RefreshCw,
  ArrowRight 
} from "lucide-react";

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'multiple-select' | 'true-false';
  question: string;
  options: string[];
  correctAnswers: number[]; // indices of correct options
  explanation: string;
  points: number;
}

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  title: string;
  onComplete: (score: number, totalPoints: number) => void;
}

export default function InteractiveQuiz({ questions, title, onComplete }: InteractiveQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number[] }>({});
  const [showResults, setShowResults] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerChange = (questionId: string, answerIndex: number, isSelected: boolean) => {
    const currentAnswers = answers[questionId] || [];
    
    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') {
      // Single selection
      setAnswers({
        ...answers,
        [questionId]: isSelected ? [answerIndex] : []
      });
    } else {
      // Multiple selection
      if (isSelected) {
        setAnswers({
          ...answers,
          [questionId]: [...currentAnswers, answerIndex]
        });
      } else {
        setAnswers({
          ...answers,
          [questionId]: currentAnswers.filter(index => index !== answerIndex)
        });
      }
    }
  };

  const isQuestionAnswered = (questionId: string) => {
    return answers[questionId] && answers[questionId].length > 0;
  };

  const isAnswerCorrect = (questionId: string) => {
    const userAnswers = answers[questionId] || [];
    const question = questions.find(q => q.id === questionId);
    if (!question) return false;
    
    return JSON.stringify(userAnswers.sort()) === JSON.stringify(question.correctAnswers.sort());
  };

  const calculateScore = () => {
    let score = 0;
    let totalPoints = 0;
    
    questions.forEach(question => {
      totalPoints += question.points;
      if (isAnswerCorrect(question.id)) {
        score += question.points;
      }
    });
    
    return { score, totalPoints };
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowResults(false);
    } else {
      // Quiz completed
      const { score, totalPoints } = calculateScore();
      setIsCompleted(true);
      onComplete(score, totalPoints);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowResults(false);
    }
  };

  const handleShowResults = () => {
    setShowResults(true);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setIsCompleted(false);
  };

  if (isCompleted) {
    const { score, totalPoints } = calculateScore();
    const percentage = Math.round((score / totalPoints) * 100);
    
    return (
      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-charcoal mb-2">Quiz Complete!</h3>
          <p className="text-gray-600 mb-4">Great job finishing the {title}</p>
          
          <div className="bg-white rounded-lg p-4 mb-6">
            <div className="text-3xl font-bold text-blue-600 mb-1">{percentage}%</div>
            <div className="text-gray-600">Score: {score} / {totalPoints} points</div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={restartQuiz}
              className="flex items-center space-x-2"
              data-testid="button-restart-quiz"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retake Quiz</span>
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-continue-lesson"
            >
              <span>Continue Learning</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-purple-200 bg-purple-50">
      <CardContent className="p-6">
        {/* Quiz Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-charcoal">{title}</h3>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-charcoal mb-4" data-testid="quiz-question">
            {currentQuestion.question}
          </h4>

          {currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false' ? (
            <RadioGroup 
              value={answers[currentQuestion.id]?.[0]?.toString() || ""} 
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value), true)}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                  {showResults && (
                    <div className="ml-2">
                      {currentQuestion.correctAnswers.includes(index) ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : answers[currentQuestion.id]?.includes(index) ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`option-${index}`}
                    checked={answers[currentQuestion.id]?.includes(index) || false}
                    onCheckedChange={(checked) => handleAnswerChange(currentQuestion.id, index, !!checked)}
                  />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                  {showResults && (
                    <div className="ml-2">
                      {currentQuestion.correctAnswers.includes(index) ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : answers[currentQuestion.id]?.includes(index) ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results and Explanation */}
        {showResults && (
          <div className={`p-4 rounded-lg mb-6 ${
            isAnswerCorrect(currentQuestion.id) ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {isAnswerCorrect(currentQuestion.id) ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                isAnswerCorrect(currentQuestion.id) ? 'text-green-800' : 'text-red-800'
              }`}>
                {isAnswerCorrect(currentQuestion.id) ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <p className="text-gray-700 text-sm">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            data-testid="button-previous-question"
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            {!showResults ? (
              <Button 
                onClick={handleShowResults}
                disabled={!isQuestionAnswered(currentQuestion.id)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                data-testid="button-check-answer"
              >
                Check Answer
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                data-testid="button-next-question"
              >
                {currentQuestionIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}