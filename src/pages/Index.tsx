
import { useState } from "react";
import { Header } from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import { Sidebar } from "@/components/Sidebar";
import { WelcomeScreen } from "@/components/WelcomeScreen";

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
