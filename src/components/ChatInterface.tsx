import { useState, useRef, useEffect } from "react";
import { Send, Upload, Paperclip, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarContent, AvatarFallback } from "@/components/ui/avatar";
import { ModelSelector } from "@/components/ModelSelector";
import { useLLM, type LLMModels, availableModels } from "@/hooks/useLLM";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: Message) => void;
}

export const ChatInterface = ({ messages, onSendMessage }: ChatInterfaceProps) => {
  const [inputText, setInputText] = useState("");
  const [selectedModel, setSelectedModel] = useState<keyof LLMModels>('amazon-nova-pro');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, isLoading } = useLLM();
  const { searchKnowledge } = useKnowledgeBase();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    onSendMessage(userMessage);
    setInputText("");

    try {
      console.log('Searching knowledge base...');
      const context = searchKnowledge(inputText);
      console.log('Context found:', context ? `${context.substring(0, 100)}...` : 'None');
      
      console.log('Sending message to LLM...');
      const response = await sendMessage(inputText, selectedModel, context);
      console.log('Response from LLM:', response);
      
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: response || "I'm sorry, I couldn't find any relevant information for your query. Could you please try rephrasing it? I can help with questions about RMIT's courses, campus life, and student services.",
        sender: 'assistant',
        timestamp: new Date()
      };
      
      onSendMessage(aiResponse);
    } catch (error) {
      console.error("Error in handleSend:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI model. Please try again.",
        variant: "destructive"
      });
      
      const errorResponse: Message = {
        id: Date.now() + 1,
        text: "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment.",
        sender: 'assistant',
        timestamp: new Date()
      };
      
      onSendMessage(errorResponse);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Model Selector Header */}
      <div className="border-b bg-background/95 backdrop-blur p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/5ac39bee-b30c-43a0-8fd5-8a90089a0d24.png" 
              alt="RMIT University" 
              className="h-6 w-auto object-contain"
            />
            <h2 className="text-sm font-medium text-muted-foreground">RMIT Course Compass</h2>
          </div>
          <ModelSelector 
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'assistant' && (
                <Avatar className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80">
                  <AvatarContent>
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </AvatarContent>
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              
              <Card className={`max-w-[80%] p-4 ${
                message.sender === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-2 ${
                  message.sender === 'user' 
                    ? 'text-primary-foreground/70' 
                    : 'text-muted-foreground'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </Card>

              {message.sender === 'user' && (
                <Avatar className="w-8 h-8 bg-secondary">
                  <AvatarContent>
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </AvatarContent>
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80">
                <AvatarContent>
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </AvatarContent>
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <Card className="bg-card p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-background/95 backdrop-blur p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              multiple
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleFileUpload}
              className="shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <div className="flex-1 relative">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about RMIT courses, requirements, or career pathways..."
                className="pr-12 min-h-[2.5rem] resize-none"
                disabled={isLoading}
              />
            </div>

            <Button 
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="gradient-primary text-primary-foreground shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            RMIT Course Compass powered by {availableModels[selectedModel]}. Information based on RMIT University official sources.
          </p>
        </div>
      </div>
    </div>
  );
};
