
import { useState, useRef, useEffect } from "react";
import { Send, Upload, Paperclip, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarContent, AvatarFallback } from "@/components/ui/avatar";

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
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    onSendMessage(userMessage);
    setInputText("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: "Thank you for your question! I'm here to help you navigate RMIT's course offerings. Based on your interests, I can recommend several programs that align with your career goals. Would you like me to start with undergraduate or postgraduate options?",
        sender: 'assistant',
        timestamp: new Date()
      };
      onSendMessage(aiResponse);
      setIsTyping(false);
    }, 1500);
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
                <p className="text-sm leading-relaxed">{message.text}</p>
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
          
          {isTyping && (
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
              />
            </div>

            <Button 
              onClick={handleSend}
              disabled={!inputText.trim() || isTyping}
              className="gradient-primary text-primary-foreground shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            RMIT Course Compass can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};
