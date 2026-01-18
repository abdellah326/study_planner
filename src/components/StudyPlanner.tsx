import { useState, useEffect } from 'react';
import { Hero } from './Hero';
import { StepIndicator } from './StepIndicator';
import { SubjectsForm } from './SubjectsForm';
import { ExamDateForm } from './ExamDateForm';
import { RoutineForm } from './RoutineForm';
import { ScheduleView } from './ScheduleView';
import { Subject, DailyRoutine, WeeklySchedule, FormStep } from '@/types/planner';
import { generateSchedule } from '@/lib/scheduler';
import {
  saveSubjects,
  loadSubjects,
  saveRoutine,
  loadRoutine,
  saveSchedule,
  loadSchedule
} from '@/lib/storage';
import { BookOpen } from 'lucide-react';
import { Button } from './ui/button';

const STEPS: { key: FormStep; label: string }[] = [
  { key: 'subjects', label: 'Subjects' },
  { key: 'exam', label: 'Exam Dates' },
  { key: 'routine', label: 'Routine' },
  { key: 'schedule', label: 'Schedule' }
];

export const StudyPlanner = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [currentStep, setCurrentStep] = useState<FormStep>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [routine, setRoutine] = useState<DailyRoutine | null>(null);
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);

  // Load saved data on mount
  useEffect(() => {
    const savedSubjects = loadSubjects();
    const savedRoutine = loadRoutine();
    const savedSchedule = loadSchedule();

    if (savedSubjects.length > 0) setSubjects(savedSubjects);
    if (savedRoutine) setRoutine(savedRoutine);
    if (savedSchedule) {
      setSchedule(savedSchedule);
      // If we have a saved schedule, go directly to it
      const allHaveExamDates = savedSubjects.every(s => s.examDate);
      if (savedSubjects.length > 0 && allHaveExamDates && savedRoutine) {
        setShowLanding(false);
        setCurrentStep('schedule');
      }
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (subjects.length > 0) saveSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    if (routine) saveRoutine(routine);
  }, [routine]);

  useEffect(() => {
    if (schedule) saveSchedule(schedule);
  }, [schedule]);

  const handleStartPlanning = () => {
    setShowLanding(false);
  };

  // Check if all subjects have exam dates
  const allSubjectsHaveExamDates = subjects.every(s => s.examDate);

  const handleGenerateSchedule = () => {
    if (subjects.length > 0 && allSubjectsHaveExamDates && routine) {
      const newSchedule = generateSchedule(subjects, routine);
      setSchedule(newSchedule);
      setCurrentStep('schedule');
    }
  };

  const goToStep = (step: FormStep) => {
    setCurrentStep(step);
  };

  if (showLanding) {
    return <Hero onStartPlanning={handleStartPlanning} />;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">StudySync</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowLanding(true);
              setCurrentStep('subjects');
            }}
          >
            Back to Home
          </Button>
        </header>

        {/* Step Indicator (hide on schedule view) */}
        {currentStep !== 'schedule' && (
          <StepIndicator currentStep={currentStep} steps={STEPS} />
        )}

        {/* Form Steps */}
        <div className="animate-fade-in-up">
          {currentStep === 'subjects' && (
            <SubjectsForm
              subjects={subjects}
              onSubjectsChange={setSubjects}
              onNext={() => goToStep('exam')}
            />
          )}

          {currentStep === 'exam' && (
            <ExamDateForm
              subjects={subjects}
              onSubjectsChange={setSubjects}
              onNext={() => goToStep('routine')}
              onBack={() => goToStep('subjects')}
            />
          )}

          {currentStep === 'routine' && (
            <RoutineForm
              routine={routine}
              onRoutineChange={setRoutine}
              onNext={handleGenerateSchedule}
              onBack={() => goToStep('exam')}
            />
          )}

          {currentStep === 'schedule' && schedule && (
            <ScheduleView
              schedule={schedule}
              subjects={subjects}
              onBack={() => goToStep('routine')}
              onRegenerate={handleGenerateSchedule}
            />
          )}
        </div>
      </div>
    </div>
  );
};
