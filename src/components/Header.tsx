
import { Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
  hasMessages: boolean;
}

export const Header = ({ onMenuClick, hasMessages }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="mr-3 lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-16 items-center justify-center">
            <img 
              src="/lovable-uploads/5ac39bee-b30c-43a0-8fd5-8a90089a0d24.png" 
              alt="RMIT University" 
              className="h-8 w-auto object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="font-heading text-lg font-bold text-gradient">
              RMIT Course Compass
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Your intelligent RMIT study guide
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {hasMessages && (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              New Chat
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
