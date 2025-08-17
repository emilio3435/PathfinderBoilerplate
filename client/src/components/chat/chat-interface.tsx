import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  User, 
  Send, 
  Lightbulb,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { sendChatMessage } from "@/lib/api";

interface ChatInterfaceProps {
  userId: string;
  pathId?: string;
  lessonId?: string | null;
  currentLesson?: any;
  currentModule?: any;
  userProgress?: any;
}

export default function ChatInterface({
  userId,
  pathId,
  lessonId,
  currentLesson,
  currentModule,
  userProgress
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch chat history
  const { data: chatHistory } = useQuery({
    queryKey: ["/api/chat/user", userId, pathId],
    enabled: !!userId,
  });

  useEffect(() => {
    if (chatHistory) {
      setMessages(chatHistory);
    }
  }, [chatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const chatMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (response) => {
      const aiMessage = {
        id: response.messageId,
        role: "assistant",
        content: response.message,
        context: {
          suggestions: response.suggestions,
          contextualHints: response.contextualHints
        },
        createdAt: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !userId) return;

    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      createdAt: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to AI
    chatMutation.mutate({
      message,
      userId,
      pathId,
      lessonId: lessonId || undefined,
      context: {
        currentLesson,
        currentModule,
        userProgress
      }
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal">AI Tutor</h3>
            <p className="text-sm text-gray-600">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-sage opacity-50" />
            <p className="text-gray-500 mb-2">Welcome to your AI tutor!</p>
            <p className="text-sm text-gray-400">
              Ask me anything about your current lesson or learning path.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex space-x-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-sage rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            
            <div className={`flex-1 ${msg.role === 'user' ? 'max-w-xs' : ''}`}>
              <div className={`rounded-lg p-3 ${
                msg.role === 'user' 
                  ? 'bg-sage text-white ml-8' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm" data-testid={`message-${msg.id}`}>
                  {msg.content}
                </p>
              </div>
              <p className={`text-xs text-gray-500 mt-1 ${
                msg.role === 'user' ? 'text-right' : ''
              }`}>
                {formatTime(msg.createdAt)}
              </p>

              {/* AI Suggestions */}
              {msg.role === 'assistant' && msg.context?.suggestions && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.context.suggestions.map((suggestion: string, index: number) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-sage hover:text-sage-dark bg-sage-light hover:bg-sage-light/80"
                      onClick={() => handleSuggestionClick(suggestion)}
                      data-testid={`suggestion-${msg.id}-${index}`}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}

              {/* Contextual Hints */}
              {msg.role === 'assistant' && msg.context?.contextualHints && (
                <Card className="mt-3 bg-blue-50 border-blue-200">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Quick Tips</span>
                    </div>
                    {msg.context.contextualHints.map((hint: string, index: number) => (
                      <p key={index} className="text-sm text-blue-700" data-testid={`hint-${msg.id}-${index}`}>
                        {hint}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Show lesson context hint */}
        {currentLesson && messages.length === 0 && (
          <Card className="bg-blue-50 border border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Current Context</span>
              </div>
              <p className="text-sm text-blue-700" data-testid="text-lesson-context">
                You're currently learning about "{currentLesson.title}". 
                I can help explain concepts, provide examples, or answer questions!
              </p>
            </CardContent>
          </Card>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            type="text"
            placeholder="Ask me anything about this lesson..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={chatMutation.isPending}
            className="flex-1 border-gray-300 focus:border-sage"
            data-testid="input-chat-message"
          />
          <Button
            type="submit"
            disabled={chatMutation.isPending || !message.trim()}
            className="bg-sage hover:bg-sage-dark text-white transition-colors duration-200"
            data-testid="button-send-message"
          >
            {chatMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        <div className="flex items-center justify-between mt-2">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-sage bg-gray-100 px-2 py-1 rounded"
              onClick={() => handleSuggestionClick("💡 Explain this differently")}
              data-testid="button-explain-differently"
            >
              💡 Explain this differently
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-sage bg-gray-100 px-2 py-1 rounded"
              onClick={() => handleSuggestionClick("🔗 Show related concepts")}
              data-testid="button-show-related"
            >
              🔗 Show related concepts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
