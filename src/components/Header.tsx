
import { Menu, GraduationCap, MessageSquare } from "lucide-react";
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-heading text-lg font-bold text-gradient">
              AI Course Assistant
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Your intelligent study guide
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
