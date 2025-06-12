
import { useState } from "react";
import { Header } from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import { Sidebar } from "@/components/Sidebar";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, GraduationCap } from "lucide-react";

const Index = () => {
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-rmit-light-gray/30 to-background">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        messages={messages}
        onClearChat={() => setMessages([])}
      />
      
      {/* Sidebar Toggle Button - Bottom Left */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 left-6 z-30 shadow-lg bg-card/95 backdrop-blur border-border hover:bg-accent"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Course Compass Branding - Bottom Left of Main Interface */}
      <div className="fixed bottom-6 left-20 z-20 flex items-center gap-2 bg-card/95 backdrop-blur rounded-lg px-3 py-2 shadow-lg border">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/80">
          <GraduationCap className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <h2 className="font-heading text-sm font-semibold text-gradient">
            RMIT Course Compass
          </h2>
          <p className="text-xs text-muted-foreground">
            Your AI-powered study guide
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : ''}`}>
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          hasMessages={messages.length > 0}
        />
        
        <main className="relative">
          {messages.length === 0 ? (
            <WelcomeScreen onStartChat={addMessage} />
          ) : (
            <ChatInterface 
              messages={messages}
              onSendMessage={addMessage}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
