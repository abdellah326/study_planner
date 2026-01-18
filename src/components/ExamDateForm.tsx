import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, differenceInDays } from 'date-fns';
import { CalendarIcon, AlertTriangle, Clock, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Subject } from '@/types/planner';

interface ExamDateFormProps {
  subjects: Subject[];
  onSubjectsChange: (subjects: Subject[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const getUrgencyInfo = (daysRemaining: number) => {
  if (daysRemaining <= 3) {
    return {
      level: 'critical',
      message: 'Critical! Very limited time',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10 border-destructive/30'
    };
  }
  if (daysRemaining <= 7) {
    return {
      level: 'high',
      message: 'High urgency',
      color: 'text-warning',
      bgColor: 'bg-warning/10 border-warning/30'
    };
  }
  if (daysRemaining <= 14) {
    return {
      level: 'medium',
      message: 'Medium urgency',
      color: 'text-primary',
      bgColor: 'bg-primary/10 border-primary/30'
    };
  }
  return {
    level: 'low',
    message: 'Plenty of time',
    color: 'text-success',
    bgColor: 'bg-success/10 border-success/30'
  };
};

export const ExamDateForm = ({
  subjects,
  onSubjectsChange,
  onNext,
  onBack
}: ExamDateFormProps) => {
  const updateSubjectExamDate = (subjectId: string, date: Date) => {
    onSubjectsChange(
      subjects.map(s => (s.id === subjectId ? { ...s, examDate: date } : s))
    );
  };

  const getDaysRemaining = (examDate: Date | undefined): number => {
    if (!examDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(0, differenceInDays(examDate, today));
  };

  const allSubjectsHaveExamDate = subjects.every(s => s.examDate);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Set Exam Dates for Each Subject</h2>
        <p className="text-muted-foreground mt-1">
          Each subject has its own exam date for precise urgency calculation
        </p>
      </div>

      <div className="space-y-4">
        {subjects.map((subject, index) => {
          const daysRemaining = getDaysRemaining(subject.examDate);
          const urgency = subject.examDate ? getUrgencyInfo(daysRemaining) : null;

          return (
            <div
              key={subject.id}
              className={cn(
                "glass-card p-5 animate-fade-in-up",
                `subject-color-${subject.colorIndex + 1}`
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Subject Name */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{subject.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Difficulty: {subject.difficulty}/5
                  </p>
                </div>

                {/* Date Picker */}
                <div className="flex items-center gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[200px] justify-start text-left font-normal",
                          !subject.examDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {subject.examDate
                          ? format(subject.examDate, "MMM d, yyyy")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="end">
                      <Calendar
                        mode="single"
                        selected={subject.examDate}
                        onSelect={(date) => date && updateSubjectExamDate(subject.id, date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Days Remaining & Urgency */}
                {subject.examDate && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-bold text-lg">{daysRemaining}</span>
                      <span className="text-xs text-muted-foreground">days</span>
                    </div>
                    
                    {urgency && (
                      <div className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium",
                        urgency.bgColor
                      )}>
                        <AlertTriangle className={cn("w-3 h-3", urgency.color)} />
                        <span className={urgency.color}>{urgency.level}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" size="lg" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          variant="hero"
          size="lg"
          onClick={onNext}
          disabled={!allSubjectsHaveExamDate}
        >
          Continue to Daily Routine
        </Button>
      </div>
    </div>
  );
};
