import { WeeklySchedule, Subject } from '@/types/planner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, Target, TrendingUp, RefreshCw, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

interface ScheduleViewProps {
  schedule: WeeklySchedule;
  subjects: Subject[];
  onBack: () => void;
  onRegenerate: () => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ScheduleView = ({
  schedule,
  subjects,
  onBack,
  onRegenerate
}: ScheduleViewProps) => {
  const getSubjectColor = (colorIndex: number) => 
    colorIndex >= 0 ? `subject-color-${colorIndex + 1}` : '';

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const badges = {
      high: 'priority-high',
      medium: 'priority-medium',
      low: 'priority-low'
    };
    return badges[priority];
  };

  // Group blocks by day
  const blocksByDay = DAYS.map((_, dayIndex) =>
    schedule.blocks.filter(block => block.day === dayIndex)
  );

  // Get subject stats with exam info
  const subjectStats = subjects.map(subject => {
    const breakdown = schedule.stats.subjectBreakdown.find(b => b.subjectId === subject.id);
    const totalStudyMinutes = schedule.blocks
      .filter(b => !b.isBreak)
      .reduce((sum, b) => sum + b.duration, 0);
    
    return {
      ...subject,
      totalMinutes: breakdown?.totalMinutes || 0,
      daysUntilExam: breakdown?.daysUntilExam || 0,
      percentage: breakdown && totalStudyMinutes > 0
        ? Math.round((breakdown.totalMinutes / totalStudyMinutes) * 100)
        : 0
    };
  }).sort((a, b) => a.daysUntilExam - b.daysUntilExam); // Sort by exam date (earliest first)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Your Optimized Schedule</h2>
          <p className="text-muted-foreground mt-1">
            Week of {format(schedule.weekStart, 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Edit Plan
          </Button>
          <Button variant="glass" onClick={onRegenerate}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock className="w-5 h-5 text-primary" />}
          label="Total Study Hours"
          value={`${schedule.stats.totalStudyHours}h`}
          sublabel="this week"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5 text-accent" />}
          label="Earliest Exam"
          value={schedule.stats.earliestExamDays.toString()}
          sublabel="days away"
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-warning" />}
          label="Subjects"
          value={subjects.length.toString()}
          sublabel="to cover"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-success" />}
          label="Daily Average"
          value={`${(schedule.stats.totalStudyHours / 7).toFixed(1)}h`}
          sublabel="per day"
        />
      </div>

      {/* Subject Breakdown with Exam Dates */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Time Allocation by Subject</h3>
        <div className="space-y-3">
          {subjectStats.map((subject) => (
            <div key={subject.id} className="flex items-center gap-4">
              <div className={cn(
                "w-3 h-3 rounded-full",
                getSubjectColor(subject.colorIndex).replace('bg-', 'bg-').replace('/20', '')
              )} style={{
                backgroundColor: `hsl(var(--${['cyan', 'purple', 'emerald', 'amber', 'rose', 'blue', 'pink', 'teal'][subject.colorIndex]}-500, 1))`
              }} />
              <span className="flex-1 text-sm font-medium">{subject.name}</span>
              <span className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground">
                {subject.daysUntilExam} days
              </span>
              <span className="text-sm text-muted-foreground w-12 text-right">
                {Math.round(subject.totalMinutes / 60 * 10) / 10}h
              </span>
              <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${subject.percentage}%`,
                    backgroundColor: `hsl(var(--primary))`
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right">
                {subject.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Calendar Grid with Exact Times */}
      <div className="glass-card p-6 overflow-x-auto">
        <h3 className="font-semibold mb-4">Weekly Schedule (Exact Times)</h3>
        
        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-7 gap-3 min-w-[900px]">
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="space-y-2">
              <div className="text-center py-2 rounded-lg bg-secondary">
                <div className="font-semibold">{SHORT_DAYS[dayIndex]}</div>
                <div className="text-xs text-muted-foreground">
                  {format(addDays(schedule.weekStart, dayIndex), 'MMM d')}
                </div>
              </div>
              
              <div className="space-y-1.5 min-h-[400px]">
                {blocksByDay[dayIndex].map((block) => (
                  <ScheduleBlock
                    key={block.id}
                    block={block}
                    colorClass={getSubjectColor(block.colorIndex)}
                    priorityClass={getPriorityBadge(block.priority)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {DAYS.map((day, dayIndex) => (
            blocksByDay[dayIndex].length > 0 && (
              <div key={day}>
                <div className="font-semibold mb-2 flex items-center gap-2">
                  {day}
                  <span className="text-xs text-muted-foreground">
                    {format(addDays(schedule.weekStart, dayIndex), 'MMM d')}
                  </span>
                </div>
                <div className="space-y-2">
                  {blocksByDay[dayIndex].map((block) => (
                    <ScheduleBlock
                      key={block.id}
                      block={block}
                      colorClass={getSubjectColor(block.colorIndex)}
                      priorityClass={getPriorityBadge(block.priority)}
                    />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Algorithm Explanation */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-3">How Your Schedule Was Optimized</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>
              <strong className="text-foreground">Per-Subject Urgency:</strong> Each subject's urgency is calculated individually based on its own exam date, not a global date.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>
              <strong className="text-foreground">Weight Formula:</strong> Weight = Difficulty × Urgency. Subjects with higher weights get more study time and earlier slots.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>
              <strong className="text-foreground">Exact Time Slots:</strong> Every session has precise start and end times (e.g., 09:00 - 10:30) with automatic breaks inserted.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>
              <strong className="text-foreground">Peak Energy Scheduling:</strong> Harder and more urgent subjects are scheduled earlier in the day when mental energy is highest.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  sublabel
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
}) => (
  <div className="glass-card p-4">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-muted-foreground">{sublabel}</div>
  </div>
);

const ScheduleBlock = ({
  block,
  colorClass,
  priorityClass
}: {
  block: {
    subjectName: string;
    startTime: string;
    endTime: string;
    duration: number;
    priority: string;
    isBreak?: boolean;
  };
  colorClass: string;
  priorityClass: string;
}) => {
  if (block.isBreak) {
    return (
      <div className="p-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Coffee className="w-3 h-3" />
          <span>{block.startTime} - {block.endTime}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02]",
      colorClass
    )}>
      <div className="font-medium text-sm truncate">{block.subjectName}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs font-mono opacity-80">
          {block.startTime} - {block.endTime}
        </span>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold", priorityClass)}>
          {block.priority}
        </span>
      </div>
    </div>
  );
};
