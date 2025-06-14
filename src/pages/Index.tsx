
import { useState } from "react";
import { Header } from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import { Sidebar } from "@/components/Sidebar";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const Index = () => {
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-rmit-light-gray/30 to-background flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        messages={messages}
        onClearChat={() => setMessages([])}
      />
      
      {/* Main Content Area - Now responsive to sidebar state */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-0' : 'ml-0'
      }`}>
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          hasMessages={messages.length > 0}
        />
        
        <main className="flex-1 relative">
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

      {/* Sidebar Toggle Button - Always visible when sidebar is closed */}
      {!sidebarOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-20 left-4 z-30 shadow-lg bg-card/95 backdrop-blur border-border hover:bg-accent"
          onClick={() => setSidebarOpen(true)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* RMIT Course Compass Branding - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-20 flex items-center gap-2 bg-card/95 backdrop-blur rounded-lg px-3 py-2 shadow-lg border">
        <div className="flex h-6 w-8 items-center justify-center">
          <img 
            src="/lovable-uploads/5ac39bee-b30c-43a0-8fd5-8a90089a0d24.png" 
            alt="RMIT University" 
            className="h-4 w-auto object-contain"
          />
        </div>
        <div className="flex flex-col">
          <h2 className="font-heading text-sm font-semibold text-gradient">
            RMIT Course Compass
          </h2>
          <p className="text-xs text-muted-foreground">
            Your AI-powered RMIT study guide
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
