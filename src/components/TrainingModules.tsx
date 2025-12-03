import { useState } from 'react';
import { ArrowLeft, Clock, BarChart3, CheckCircle, ChevronRight, AlertTriangle, Shield, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trainingModules, TrainingModule } from '@/lib/trainingContent';
import { cn } from '@/lib/utils';

interface TrainingModulesProps {
  highlightModule?: string;
}

const TrainingModules = ({ highlightModule }: TrainingModulesProps) => {
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(
    highlightModule ? trainingModules.find((m) => m.id === highlightModule) || null : null
  );
  const [currentSection, setCurrentSection] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  if (selectedModule) {
    return (
      <ModuleContent
        module={selectedModule}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        quizAnswers={quizAnswers}
        setQuizAnswers={setQuizAnswers}
        showQuizResults={showQuizResults}
        setShowQuizResults={setShowQuizResults}
        onBack={() => {
          setSelectedModule(null);
          setCurrentSection(0);
          setQuizAnswers({});
          setShowQuizResults(false);
        }}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Security Training Modules
        </h2>
        <p className="text-muted-foreground mt-1">Learn to identify and prevent social engineering attacks</p>
      </div>

      {highlightModule && (
        <div className="cyber-card bg-warning/10 border-warning/30 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
          <div>
            <p className="font-medium text-warning">You were compromised!</p>
            <p className="text-sm text-muted-foreground">
              Complete the highlighted training module to learn how to protect yourself.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {trainingModules.map((module) => (
          <div
            key={module.id}
            onClick={() => setSelectedModule(module)}
            className={cn(
              'training-card',
              highlightModule === module.id && 'border-warning ring-2 ring-warning/30'
            )}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{module.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground mb-1">{module.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {module.duration}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded',
                      module.difficulty === 'Beginner' && 'bg-accent/20 text-accent',
                      module.difficulty === 'Intermediate' && 'bg-warning/20 text-warning',
                      module.difficulty === 'Advanced' && 'bg-destructive/20 text-destructive'
                    )}
                  >
                    {module.difficulty}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ModuleContentProps {
  module: TrainingModule;
  currentSection: number;
  setCurrentSection: (section: number) => void;
  quizAnswers: Record<number, number>;
  setQuizAnswers: (answers: Record<number, number>) => void;
  showQuizResults: boolean;
  setShowQuizResults: (show: boolean) => void;
  onBack: () => void;
}

const ModuleContent = ({
  module,
  currentSection,
  setCurrentSection,
  quizAnswers,
  setQuizAnswers,
  showQuizResults,
  setShowQuizResults,
  onBack,
}: ModuleContentProps) => {
  const sections = [
    { title: 'Overview', content: 'overview' },
    { title: 'How It Works', content: 'howItWorks' },
    { title: 'Real-World Examples', content: 'realWorldExamples' },
    { title: 'Warning Signs', content: 'warningSignals' },
    { title: 'Prevention Tips', content: 'preventionTips' },
    ...(module.content.quiz ? [{ title: 'Quiz', content: 'quiz' }] : []),
  ];

  const renderContent = () => {
    const section = sections[currentSection];
    const key = section.content as keyof typeof module.content;

    if (key === 'overview') {
      return (
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed">{module.content.overview}</p>
        </div>
      );
    }

    if (key === 'quiz' && module.content.quiz) {
      return (
        <div className="space-y-6">
          {module.content.quiz.map((q, idx) => (
            <div key={idx} className="cyber-card">
              <p className="font-medium text-foreground mb-4">
                {idx + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((option, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => {
                      if (!showQuizResults) {
                        setQuizAnswers({ ...quizAnswers, [idx]: optIdx });
                      }
                    }}
                    disabled={showQuizResults}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-all',
                      quizAnswers[idx] === optIdx
                        ? showQuizResults
                          ? optIdx === q.correct
                            ? 'bg-accent/20 border-accent text-accent'
                            : 'bg-destructive/20 border-destructive text-destructive'
                          : 'bg-primary/20 border-primary'
                        : 'bg-secondary/30 border-border hover:bg-secondary/50',
                      showQuizResults && optIdx === q.correct && 'bg-accent/20 border-accent text-accent'
                    )}
                  >
                    {option}
                    {showQuizResults && optIdx === q.correct && (
                      <CheckCircle className="inline w-4 h-4 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {!showQuizResults && Object.keys(quizAnswers).length === module.content.quiz.length && (
            <Button onClick={() => setShowQuizResults(true)} className="w-full">
              Submit Answers
            </Button>
          )}

          {showQuizResults && (
            <div className="cyber-card bg-accent/10 border-accent/30">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-accent" />
                <div>
                  <p className="font-medium text-accent">Module Complete!</p>
                  <p className="text-sm text-muted-foreground">
                    You got{' '}
                    {
                      Object.entries(quizAnswers).filter(
                        ([idx, answer]) => module.content.quiz![parseInt(idx)].correct === answer
                      ).length
                    }{' '}
                    out of {module.content.quiz!.length} correct.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    const items = module.content[key] as string[];
    return (
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 animate-slide-up"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
              {idx + 1}
            </div>
            <p className="text-muted-foreground">{item}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{module.icon}</span>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{module.title}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {module.duration}
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                {module.difficulty}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {sections.map((section, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSection(idx)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              currentSection === idx
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            )}
          >
            {section.title}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="cyber-card min-h-[400px]">{renderContent()}</div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
          disabled={currentSection === sections.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default TrainingModules;
