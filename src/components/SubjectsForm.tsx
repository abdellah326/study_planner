import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Subject } from '@/types/planner';
import { Plus, Trash2, GripVertical, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStudyTips } from '@/lib/scheduler';

interface SubjectsFormProps {
  subjects: Subject[];
  onSubjectsChange: (subjects: Subject[]) => void;
  onNext: () => void;
}

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const SAMPLE_SUBJECTS: Subject[] = [
  { id: '1', name: 'Mathematics', difficulty: 4, notes: 'Focus on calculus', colorIndex: 0, examDate: undefined },
  { id: '2', name: 'Physics', difficulty: 5, notes: 'Quantum mechanics chapter', colorIndex: 1, examDate: undefined },
  { id: '3', name: 'History', difficulty: 2, notes: 'Review timeline', colorIndex: 2, examDate: undefined },
  { id: '4', name: 'English Literature', difficulty: 3, notes: '', colorIndex: 3, examDate: undefined },
];

export const SubjectsForm = ({ subjects, onSubjectsChange, onNext }: SubjectsFormProps) => {
  const [showTips, setShowTips] = useState<string | null>(null);

  const addSubject = () => {
    const newSubject: Subject = {
      id: generateId(),
      name: '',
      difficulty: 3,
      notes: '',
      colorIndex: subjects.length % 8
    };
    onSubjectsChange([...subjects, newSubject]);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    onSubjectsChange(
      subjects.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const removeSubject = (id: string) => {
    onSubjectsChange(subjects.filter(s => s.id !== id));
  };

  const loadSampleData = () => {
    onSubjectsChange(SAMPLE_SUBJECTS);
  };

  const canProceed = subjects.length > 0 && subjects.every(s => s.name.trim());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Add Your Subjects</h2>
          <p className="text-muted-foreground mt-1">
            List the subjects you need to study and rate their difficulty
          </p>
        </div>
        <Button variant="glass" size="sm" onClick={loadSampleData}>
          Load Sample Data
        </Button>
      </div>

      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <div
            key={subject.id}
            className="glass-card p-4 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex gap-4">
              <div className="flex items-center text-muted-foreground cursor-move">
                <GripVertical className="w-5 h-5" />
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Subject Name */}
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                    Subject Name
                  </label>
                  <Input
                    value={subject.name}
                    onChange={(e) => updateSubject(subject.id, { name: e.target.value })}
                    placeholder="e.g., Mathematics"
                    className={cn(
                      "border-l-4",
                      `subject-color-${subject.colorIndex + 1}`
                    )}
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                    Difficulty (1-5)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => updateSubject(subject.id, { difficulty: level })}
                        className={cn(
                          "w-10 h-10 rounded-lg font-semibold transition-all duration-200",
                          subject.difficulty === level
                            ? level <= 2
                              ? "bg-success text-success-foreground"
                              : level <= 3
                              ? "bg-warning text-warning-foreground"
                              : "bg-destructive text-destructive-foreground"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                    Notes (Optional)
                  </label>
                  <Input
                    value={subject.notes || ''}
                    onChange={(e) => updateSubject(subject.id, { notes: e.target.value })}
                    placeholder="Any specific topics..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowTips(showTips === subject.id ? null : subject.id)}
                  className="text-primary"
                >
                  <Lightbulb className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSubject(subject.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Study Tips */}
            {showTips === subject.id && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Study Tips for Difficulty {subject.difficulty}
                </p>
                <ul className="space-y-1">
                  {getStudyTips(subject.difficulty).map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addSubject}
        className="w-full border-dashed border-2"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Subject
      </Button>

      <div className="flex justify-end pt-4">
        <Button
          variant="hero"
          size="lg"
          onClick={onNext}
          disabled={!canProceed}
        >
          Continue to Exam Date
        </Button>
      </div>
    </div>
  );
};
