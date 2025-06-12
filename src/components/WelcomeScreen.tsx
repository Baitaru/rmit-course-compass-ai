
import { GraduationCap, BookOpen, Users, Target, Upload, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WelcomeScreenProps {
  onStartChat: (message: any) => void;
}

export const WelcomeScreen = ({ onStartChat }: WelcomeScreenProps) => {
  const quickActions = [
    {
      title: "Find My Perfect Course",
      description: "Get personalized course recommendations based on your interests and career goals",
      icon: Target,
      action: () => onStartChat({
        id: Date.now(),
        text: "I want help finding the perfect course for my career goals. Can you guide me through RMIT's offerings?",
        sender: "user",
        timestamp: new Date()
      })
    },
    {
      title: "Course Prerequisites",
      description: "Check entry requirements and prerequisites for specific programs",
      icon: BookOpen,
      action: () => onStartChat({
        id: Date.now(),
        text: "What are the prerequisites and entry requirements for courses I'm interested in?",
        sender: "user",
        timestamp: new Date()
      })
    },
    {
      title: "Career Pathways",
      description: "Explore career opportunities and industry connections",
      icon: Users,
      action: () => onStartChat({
        id: Date.now(),
        text: "Can you show me the career pathways and industry connections for different RMIT programs?",
        sender: "user",
        timestamp: new Date()
      })
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Welcome Header */}
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <GraduationCap className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gradient">
            🎓 Welcome to RMIT Course Compass!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            I'm your course advisor, here to make sure you feel confident and well-informed as you shape your study journey.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group border-2 hover:border-primary/20"
              onClick={action.action}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                  <action.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg">{action.title}</h3>
                <p className="text-muted-foreground text-sm">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <div className="text-left space-y-4">
            <h2 className="text-2xl font-heading font-bold">What I can help you with:</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Course recommendations based on your interests
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Entry requirements and prerequisites
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Career pathways and industry connections
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Study planning and academic guidance
              </li>
            </ul>
          </div>
          <div className="text-left space-y-4">
            <h2 className="text-2xl font-heading font-bold">Available AI Models:</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Anthropic Claude 3 Haiku</li>
              <li>• Anthropic Claude 3.5 Sonnet</li>
              <li>• Anthropic Claude 3.7 Sonnet</li>
              <li>• Amazon Nova Pro</li>
              <li>• Meta Llama 4 Maverick 17B</li>
            </ul>
          </div>
        </div>

        {/* Start Chat */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <Button size="lg" className="gradient-primary text-primary-foreground gap-2 px-8">
            <MessageSquare className="h-5 w-5" />
            Start Conversation
          </Button>
          <Button variant="outline" size="lg" className="gap-2 px-8">
            <Upload className="h-5 w-5" />
            Upload Documents
          </Button>
        </div>
      </div>
    </div>
  );
};
