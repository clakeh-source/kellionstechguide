import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Lightbulb,
  Zap,
  Trophy,
  Brain,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { ccnaDomains, sampleQuestions, type CCNAQuestion } from "@/data/ccnaData";
import { useCCNAProgress } from "@/hooks/useCCNAProgress";
import { cn } from "@/lib/utils";

interface WeakAreasPracticeProps {
  onComplete?: (score: number, total: number) => void;
  onBack?: () => void;
}

export function WeakAreasPractice({ onComplete, onBack }: WeakAreasPracticeProps) {
  const { quizAttempts, overallStats, recordQuizAttempt } = useCCNAProgress();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answersHistory, setAnswersHistory] = useState<{ correct: boolean; question: CCNAQuestion }[]>([]);

  // Calculate weak areas from quiz history (domains with <70% avg score)
  const weakAreaDomains = useMemo(() => {
    const domainScores: Record<string, { total: number; count: number }> = {};
    
    quizAttempts.forEach(attempt => {
      if (attempt.domain_id) {
        if (!domainScores[attempt.domain_id]) {
          domainScores[attempt.domain_id] = { total: 0, count: 0 };
        }
        domainScores[attempt.domain_id].total += (attempt.score / attempt.total_questions) * 100;
        domainScores[attempt.domain_id].count++;
      }
    });
    
    const weakDomains = Object.entries(domainScores)
      .filter(([_, data]) => (data.total / data.count) < 70)
      .map(([id]) => id);
    
    // If no weak areas from history, use areas with lowest scores or default to all
    if (weakDomains.length === 0) {
      const sortedByScore = Object.entries(domainScores)
        .sort(([, a], [, b]) => (a.total / a.count) - (b.total / b.count))
        .slice(0, 2)
        .map(([id]) => id);
      
      if (sortedByScore.length > 0) return sortedByScore;
      
      // Default to first 2 domains if no history
      return ccnaDomains.slice(0, 2).map(d => d.id);
    }
    
    return weakDomains;
  }, [quizAttempts]);

  // Generate questions from weak areas
  const weakAreaQuestions = useMemo(() => {
    // Get all questions that relate to weak domains
    const domainQuestions = sampleQuestions.filter(q => {
      const topic = ccnaDomains
        .flatMap(d => d.topics.map(t => ({ ...t, domainId: d.id })))
        .find(t => t.id === q.topic);
      return topic && weakAreaDomains.includes(topic.domainId);
    });

    // If we don't have enough questions, add more from sample questions
    let questions = [...domainQuestions];
    if (questions.length < 10) {
      const additionalQuestions = sampleQuestions
        .filter(q => !domainQuestions.find(dq => dq.id === q.id))
        .slice(0, 10 - questions.length);
      questions = [...questions, ...additionalQuestions];
    }

    // Shuffle questions
    return questions.sort(() => Math.random() - 0.5).slice(0, 10);
  }, [weakAreaDomains]);

  const currentQuestion = weakAreaQuestions[currentQuestionIndex];
  const isMultiSelect = currentQuestion?.type === 'multiple-select';

  const handleSelect = (index: number) => {
    if (submitted) return;
    
    if (isMultiSelect) {
      setSelectedAnswers(prev => 
        prev.includes(index) 
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setSelectedAnswers([index]);
    }
  };

  const handleSubmit = () => {
    if (!currentQuestion) return;
    
    setSubmitted(true);
    const isCorrect = 
      selectedAnswers.length === currentQuestion.correctAnswers.length &&
      selectedAnswers.every(a => currentQuestion.correctAnswers.includes(a));
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setAnswersHistory(prev => [...prev, { correct: isCorrect, question: currentQuestion }]);
  };

  const handleNext = () => {
    if (currentQuestionIndex < weakAreaQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]);
      setSubmitted(false);
    } else {
      setQuizComplete(true);
      onComplete?.(score, weakAreaQuestions.length);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setSubmitted(false);
    setScore(0);
    setQuizComplete(false);
    setAnswersHistory([]);
  };

  const isCorrect = submitted && currentQuestion &&
    selectedAnswers.length === currentQuestion.correctAnswers.length &&
    selectedAnswers.every(a => currentQuestion.correctAnswers.includes(a));

  // Get weak area domain names
  const weakAreaNames = weakAreaDomains.map(id => 
    ccnaDomains.find(d => d.id === id)?.name || id
  );

  if (weakAreaQuestions.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <Trophy className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Weak Areas Detected!</h2>
          <p className="text-muted-foreground mb-4">
            Great job! You&apos;re performing well across all domains. Keep practicing to maintain your skills.
          </p>
          <Button onClick={onBack}>Return to Dashboard</Button>
        </CardContent>
      </Card>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / weakAreaQuestions.length) * 100);
    const passed = percentage >= 70;
    
    return (
      <Card className="overflow-hidden">
        <CardHeader className={cn(
          "text-center",
          passed ? "bg-green-500/10" : "bg-amber-500/10"
        )}>
          <div className="mx-auto mb-4">
            {passed ? (
              <Trophy className="h-16 w-16 text-green-500" />
            ) : (
              <TrendingUp className="h-16 w-16 text-amber-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? "Improvement Detected!" : "Keep Practicing!"}
          </CardTitle>
          <CardDescription>
            You scored {score}/{weakAreaQuestions.length} ({percentage}%)
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{score}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </Card>
            <Card className="p-4 text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{weakAreaQuestions.length - score}</p>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </Card>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Topics Covered:</h3>
            <div className="flex flex-wrap gap-2">
              {weakAreaNames.map((name, i) => (
                <Badge key={i} variant="outline">{name}</Badge>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRetry} className="flex-1 gap-2">
              <RotateCcw className="h-4 w-4" />
              Practice Again
            </Button>
            <Button onClick={onBack} className="flex-1 gap-2">
              <ArrowRight className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold">Weak Areas Practice</h3>
              <p className="text-sm text-muted-foreground">
                Focused practice on topics where you need improvement
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {weakAreaNames.map((name, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                <Target className="h-3 w-3 mr-1" />
                {name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Question {currentQuestionIndex + 1} of {weakAreaQuestions.length}
        </span>
        <span className="font-medium">
          Score: {score}/{currentQuestionIndex + (submitted ? 1 : 0)}
        </span>
      </div>
      <Progress 
        value={((currentQuestionIndex + (submitted ? 1 : 0)) / weakAreaQuestions.length) * 100} 
        className="h-2"
      />
      
      {/* Question Card */}
      {currentQuestion && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={
                    currentQuestion.difficulty === 'easy' ? 'outline' :
                    currentQuestion.difficulty === 'medium' ? 'secondary' : 'destructive'
                  } className="text-xs">
                    {currentQuestion.difficulty}
                  </Badge>
                  {isMultiSelect && (
                    <Badge variant="outline" className="text-xs">
                      Select {currentQuestion.correctAnswers.length}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base font-medium leading-relaxed">
                  {currentQuestion.question}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers.includes(index);
              const isCorrectAnswer = currentQuestion.correctAnswers.includes(index);
              
              return (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  disabled={submitted}
                  className={cn(
                    "w-full p-3 rounded-lg border text-left transition-all flex items-start gap-3",
                    isSelected && !submitted && "border-primary bg-primary/5",
                    !isSelected && !submitted && "border-border hover:border-primary/50 hover:bg-muted/50",
                    submitted && isCorrectAnswer && "border-green-500 bg-green-500/10",
                    submitted && isSelected && !isCorrectAnswer && "border-red-500 bg-red-500/10",
                    submitted && "cursor-default"
                  )}
                >
                  <span className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium",
                    isSelected && !submitted && "border-primary bg-primary text-primary-foreground",
                    submitted && isCorrectAnswer && "border-green-500 bg-green-500 text-white",
                    submitted && isSelected && !isCorrectAnswer && "border-red-500 bg-red-500 text-white"
                  )}>
                    {submitted ? (
                      isCorrectAnswer ? <CheckCircle2 className="h-4 w-4" /> : 
                      isSelected ? <XCircle className="h-4 w-4" /> : 
                      String.fromCharCode(65 + index)
                    ) : String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-sm">{option}</span>
                </button>
              );
            })}
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {!submitted ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={selectedAnswers.length === 0}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-2">
                  {currentQuestionIndex < weakAreaQuestions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Finish Quiz
                      <Trophy className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {/* Explanation */}
            {submitted && (
              <div className={cn(
                "mt-4 p-4 rounded-lg border",
                isCorrect ? "bg-green-500/10 border-green-500/30" : "bg-amber-500/10 border-amber-500/30"
              )}>
                <div className="flex items-start gap-3">
                  <Lightbulb className={cn(
                    "h-5 w-5 mt-0.5",
                    isCorrect ? "text-green-500" : "text-amber-500"
                  )} />
                  <div>
                    <p className="font-medium text-sm mb-1">
                      {isCorrect ? "Correct!" : "Explanation"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentQuestion.explanation}
                    </p>
                    {currentQuestion.examTip && (
                      <p className="text-sm text-primary mt-2 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span className="font-medium">Exam Tip:</span> {currentQuestion.examTip}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
