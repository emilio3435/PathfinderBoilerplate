import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Code, 
  Play, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Lightbulb,
  Eye,
  EyeOff 
} from "lucide-react";

interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

interface CodingChallengeProps {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  startingCode: string;
  solution: string;
  testCases: TestCase[];
  hints?: string[];
  onComplete?: (code: string, timeTaken: number) => void;
}

export default function CodingChallenge({ 
  title, 
  description, 
  difficulty, 
  startingCode, 
  solution, 
  testCases, 
  hints = [],
  onComplete 
}: CodingChallengeProps) {
  const [code, setCode] = useState(startingCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; output: string; expected: string }[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [startTime] = useState(Date.now());

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'green';
      case 'medium': return 'yellow';
      case 'hard': return 'red';
      default: return 'gray';
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    setTestResults([]);

    // Simulate code execution (in a real app, this would send to a code execution service)
    setTimeout(() => {
      const results = testCases.map(testCase => {
        // Simulate test execution - in reality this would run the code with the input
        const mockOutput = "Simulated output"; // This would be the actual code execution result
        const passed = mockOutput === testCase.expectedOutput || Math.random() > 0.5; // Random for demo
        
        return {
          passed,
          output: mockOutput,
          expected: testCase.expectedOutput
        };
      });

      setTestResults(results);
      setIsRunning(false);

      // Check if all tests passed
      const allPassed = results.every(result => result.passed);
      if (allPassed && onComplete) {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        onComplete(code, timeTaken);
      }
    }, 2000);
  };

  const resetCode = () => {
    setCode(startingCode);
    setOutput("");
    setTestResults([]);
  };

  const viewSolution = () => {
    setShowSolution(true);
    setCode(solution);
  };

  const allTestsPassed = testResults.length > 0 && testResults.every(result => result.passed);

  return (
    <Card className="border border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        {/* Challenge Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-charcoal">{title}</h3>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="secondary" 
                  className={`bg-${getDifficultyColor(difficulty)}-100 text-${getDifficultyColor(difficulty)}-700`}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Coding Challenge
                </Badge>
              </div>
            </div>
          </div>
          
          {allTestsPassed && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Completed!</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed" data-testid="text-challenge-description">
            {description}
          </p>
        </div>

        {/* Code Editor */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Your Code:</label>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowHints(!showHints)}
                className="flex items-center space-x-2"
                data-testid="button-toggle-hints"
              >
                <Lightbulb className="h-4 w-4" />
                <span>{showHints ? 'Hide' : 'Show'} Hints</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetCode}
                className="flex items-center space-x-2"
                data-testid="button-reset-code"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </Button>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="min-h-[200px] bg-transparent border-none text-green-400 font-mono resize-none focus:ring-0"
              placeholder="Write your code here..."
              data-testid="textarea-code-editor"
            />
          </div>
        </div>

        {/* Hints */}
        {showHints && hints.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Hints</span>
            </div>
            <ul className="space-y-1">
              {hints.map((hint, index) => (
                <li key={index} className="text-sm text-yellow-700" data-testid={`text-hint-${index}`}>
                  • {hint}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Test Cases */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Test Cases:</h4>
          <div className="space-y-2">
            {testCases.map((testCase, index) => (
              <div key={index} className="p-3 bg-white rounded border border-gray-200">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">Test {index + 1}</span>
                  {testResults[index] && (
                    testResults[index].passed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )
                  )}
                </div>
                <div className="text-sm text-gray-700">
                  <div><strong>Input:</strong> <code className="bg-gray-100 px-1 rounded">{testCase.input}</code></div>
                  <div><strong>Expected:</strong> <code className="bg-gray-100 px-1 rounded">{testCase.expectedOutput}</code></div>
                  {testResults[index] && !testResults[index].passed && (
                    <div className="text-red-600">
                      <strong>Got:</strong> <code className="bg-red-100 px-1 rounded">{testResults[index].output}</code>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline"
            onClick={viewSolution}
            className="flex items-center space-x-2"
            data-testid="button-view-solution"
          >
            {showSolution ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showSolution ? 'Hide' : 'View'} Solution</span>
          </Button>

          <Button 
            onClick={runCode}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
            data-testid="button-run-code"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Run Tests</span>
              </>
            )}
          </Button>
        </div>

        {/* Solution Display */}
        {showSolution && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Solution</span>
            </div>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
              <code data-testid="text-solution-code">{solution}</code>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}