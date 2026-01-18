import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormStep } from '@/types/planner';

interface StepIndicatorProps {
  currentStep: FormStep;
  steps: { key: FormStep; label: string }[];
}

export const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => {
  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  isCompleted && "step-completed",
                  isActive && "step-active glow-primary",
                  isPending && "step-pending"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span className={cn(
                "text-xs mt-2 font-medium transition-colors duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-12 h-0.5 rounded-full transition-colors duration-300 mb-6",
                isCompleted ? "bg-success" : "bg-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
};
