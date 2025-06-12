
import { useState } from "react";
import { Header } from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import { Sidebar } from "@/components/Sidebar";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

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
