
import { X, Plus, MessageSquare, Settings, FileText, Upload, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[];
  onClearChat: () => void;
}

export const Sidebar = ({ isOpen, onClose, messages, onClearChat }: SidebarProps) => {
  const chatSessions = [
    { id: 1, title: "Computer Science Course Guide", time: "2 hours ago" },
    { id: 2, title: "Business Analytics Requirements", time: "Yesterday" },
    { id: 3, title: "Engineering Prerequisites", time: "2 days ago" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - Now positioned absolutely when closed to not affect layout */}
      <div className={`
        fixed left-0 top-0 z-50 h-full w-80 transform border-r bg-card/95 backdrop-blur transition-transform duration-300 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header with Close Button */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">Navigation</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button 
            className="w-full justify-start gap-2 gradient-primary text-primary-foreground" 
            onClick={onClearChat}
          >
            <Plus className="h-4 w-4" />
            New Conversation
          </Button>
        </div>

        {/* Chat History */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Chats</h3>
            {chatSessions.map((session) => (
              <Button
                key={session.id}
                variant="ghost"
                className="w-full justify-start h-auto p-3 text-left"
              >
                <div className="flex items-start gap-2 w-full">
                  <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{session.title}</p>
                    <p className="text-xs text-muted-foreground">{session.time}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        {/* Tools Section */}
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Tools</h3>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <FileText className="h-4 w-4" />
            Course Catalog
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Sidebar spacer - Only takes up space when sidebar is open */}
      {isOpen && (
        <div className="w-80 flex-shrink-0 hidden lg:block" />
      )}
    </>
  );
};
