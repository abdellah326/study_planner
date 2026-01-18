import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { DailyRoutine } from '@/types/planner';
import { ArrowLeft, Clock, Moon, Coffee, Timer, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoutineFormProps {
  routine: DailyRoutine | null;
  onRoutineChange: (routine: DailyRoutine) => void;
  onNext: () => void;
  onBack: () => void;
}

const DEFAULT_ROUTINE: DailyRoutine = {
  studyStartTime: '09:00',
  studyEndTime: '18:00',
  sleepDuration: 8,
  mealTimes: ['12:00', '19:00'],
  breakDuration: 15
};

export const RoutineForm = ({
  routine,
  onRoutineChange,
  onNext,
  onBack
}: RoutineFormProps) => {
  const [currentRoutine, setCurrentRoutine] = useState<DailyRoutine>(
    routine || DEFAULT_ROUTINE
  );

  const updateRoutine = (updates: Partial<DailyRoutine>) => {
    const updated = { ...currentRoutine, ...updates };
    setCurrentRoutine(updated);
    onRoutineChange(updated);
  };

  const addMealTime = () => {
    if (currentRoutine.mealTimes.length < 4) {
      updateRoutine({
        mealTimes: [...currentRoutine.mealTimes, '15:00']
      });
    }
  };

  const removeMealTime = (index: number) => {
    updateRoutine({
      mealTimes: currentRoutine.mealTimes.filter((_, i) => i !== index)
    });
  };

  const updateMealTime = (index: number, time: string) => {
    const newMealTimes = [...currentRoutine.mealTimes];
    newMealTimes[index] = time;
    updateRoutine({ mealTimes: newMealTimes });
  };

  // Calculate available study hours
  const startMinutes = parseInt(currentRoutine.studyStartTime.split(':')[0]) * 60 +
    parseInt(currentRoutine.studyStartTime.split(':')[1]);
  const endMinutes = parseInt(currentRoutine.studyEndTime.split(':')[0]) * 60 +
    parseInt(currentRoutine.studyEndTime.split(':')[1]);
  const totalStudyMinutes = Math.max(0, endMinutes - startMinutes);
  const mealBreakTime = currentRoutine.mealTimes.length * 30;
  const effectiveStudyHours = Math.max(0, (totalStudyMinutes - mealBreakTime) / 60).toFixed(1);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Your Daily Routine</h2>
        <p className="text-muted-foreground mt-1">
          Tell us about your typical day so we can schedule optimally
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Study Hours */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Study Hours</h3>
              <p className="text-sm text-muted-foreground">When can you study?</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                Start Time
              </label>
              <Input
                type="time"
                value={currentRoutine.studyStartTime}
                onChange={(e) => updateRoutine({ studyStartTime: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                End Time
              </label>
              <Input
                type="time"
                value={currentRoutine.studyEndTime}
                onChange={(e) => updateRoutine({ studyEndTime: e.target.value })}
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-sm text-primary">
              ≈ {effectiveStudyHours} hours of effective study time
            </span>
          </div>
        </div>

        {/* Sleep */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Moon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold">Sleep Duration</h3>
              <p className="text-sm text-muted-foreground">Hours of sleep per night</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{currentRoutine.sleepDuration}h</span>
              <span className={cn(
                "text-sm px-3 py-1 rounded-full",
                currentRoutine.sleepDuration >= 7
                  ? "bg-success/20 text-success"
                  : currentRoutine.sleepDuration >= 5
                  ? "bg-warning/20 text-warning"
                  : "bg-destructive/20 text-destructive"
              )}>
                {currentRoutine.sleepDuration >= 7 ? 'Optimal' : currentRoutine.sleepDuration >= 5 ? 'Moderate' : 'Low'}
              </span>
            </div>
            <Slider
              value={[currentRoutine.sleepDuration]}
              onValueChange={(v) => updateRoutine({ sleepDuration: v[0] })}
              min={4}
              max={10}
              step={0.5}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>4h</span>
              <span>10h</span>
            </div>
          </div>
        </div>

        {/* Meal Times */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Meal Times</h3>
                <p className="text-sm text-muted-foreground">We'll avoid scheduling during meals</p>
              </div>
            </div>
            {currentRoutine.mealTimes.length < 4 && (
              <Button variant="ghost" size="icon" onClick={addMealTime}>
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {currentRoutine.mealTimes.map((time, index) => (
              <div key={index} className="flex items-center gap-3">
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => updateMealTime(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMealTime(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Break Duration */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <Timer className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold">Break Duration</h3>
              <p className="text-sm text-muted-foreground">Rest between study sessions</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{currentRoutine.breakDuration} min</span>
            </div>
            <Slider
              value={[currentRoutine.breakDuration]}
              onValueChange={(v) => updateRoutine({ breakDuration: v[0] })}
              min={5}
              max={30}
              step={5}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 min</span>
              <span>30 min</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" size="lg" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button variant="hero" size="lg" onClick={onNext}>
          Generate My Schedule
        </Button>
      </div>
    </div>
  );
};
