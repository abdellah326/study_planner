import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Clock, Sparkles, ChevronRight } from 'lucide-react';

interface HeroProps {
  onStartPlanning: () => void;
}

export const Hero = ({ onStartPlanning }: HeroProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold">StudySync</span>
        </div>
        <Button variant="glass" size="sm" onClick={onStartPlanning}>
          Get Started
        </Button>
      </nav>

      {/* Hero Content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Smart AI-Powered Planning</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up">
            Study Smarter,
            <br />
            <span className="gradient-text">Not Harder</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Generate an optimized study schedule based on your subjects, difficulty levels, and exam dates. 
            Let our intelligent algorithm maximize your learning efficiency.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button variant="hero" size="xl" onClick={onStartPlanning}>
              Start Planning
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="xl">
              Watch Demo
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <FeatureCard
              icon={<Calendar className="w-6 h-6 text-primary" />}
              title="Smart Scheduling"
              description="Automatically prioritizes difficult subjects when you're most alert"
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6 text-accent" />}
              title="Time Optimization"
              description="Balanced breaks and study sessions for maximum retention"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-success" />}
              title="Adaptive Planning"
              description="Adjusts based on exam urgency and subject difficulty"
            />
          </div>
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => (
  <div className="glass-card p-6 text-left hover:scale-105 transition-transform duration-300">
    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);
