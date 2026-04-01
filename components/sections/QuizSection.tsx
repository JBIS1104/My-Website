"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { getRandomQuestions, getVerdict, type QuizQuestion } from "@/data/quiz";
import { Confetti } from "@/components/ui/Confetti";

export function QuizSection() {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => getRandomQuestions(10));
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const handleAnswer = useCallback(
    (index: number) => {
      if (selected !== null) return;
      setSelected(index);
      const isCorrect = index === questions[currentQ].correctIndex;
      if (isCorrect) setScore((s) => s + 1);

      setTimeout(() => {
        if (currentQ < questions.length - 1) {
          setCurrentQ((q) => q + 1);
          setSelected(null);
          setShowResult(false);
        } else {
          setFinished(true);
        }
        setShowResult(false);
      }, 1200);

      setShowResult(true);
    },
    [selected, currentQ]
  );

  const reset = () => {
    setStarted(false);
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setFinished(false);
  };

  const verdict = getVerdict(score, questions.length);
  const q = questions[currentQ];

  return (
    <SectionWrapper id="quiz">
      <FadeInOnScroll>
        <SectionHeading subtitle="Think you know me? Test yourself.">
          Quiz
        </SectionHeading>
      </FadeInOnScroll>

      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {!started && !finished && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="p-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                <p className="text-6xl mb-6">🧠</p>
                <h3 className="text-2xl font-bold text-[var(--color-text)] mb-4">
                  How Well Do You Know Junbyung?
                </h3>
                <p className="text-[var(--color-text-muted)] mb-8">
                  10 questions about my projects, experience, and background.
                  Read through the portfolio first for the best score!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStarted(true)}
                  className="px-8 py-3.5 rounded-full font-semibold text-[#0c0a09]
                             bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]
                             transition-colors shadow-lg shadow-[var(--color-accent-glow)]"
                >
                  Start Quiz
                </motion.button>
              </div>
            </motion.div>
          )}

          {started && !finished && (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-xs font-mono text-[var(--color-text-muted)] mb-2">
                  <span>Question {currentQ + 1} / {questions.length}</span>
                  <span>Score: {score}</span>
                </div>
                <div className="h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--color-accent)] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-8">
                  {q.question}
                </h3>

                <div className="space-y-3">
                  {q.options.map((option, i) => {
                    const isCorrect = i === q.correctIndex;
                    const isSelected = i === selected;
                    let borderClass = "border-[var(--color-border)] hover:border-[var(--color-accent)]";
                    if (showResult && isCorrect) borderClass = "border-green-500 bg-green-500/10";
                    if (showResult && isSelected && !isCorrect) borderClass = "border-red-400 bg-red-400/10";

                    return (
                      <motion.button
                        key={i}
                        whileHover={selected === null ? { x: 4 } : {}}
                        onClick={() => handleAnswer(i)}
                        disabled={selected !== null}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-300
                                   text-[var(--color-text)] ${borderClass}
                                   ${selected === null ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <span className="font-mono text-sm text-[var(--color-accent-text)] mr-3">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {option}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {finished && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="text-center"
            >
              <Confetti active={score >= 9} />
              <div className="p-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                <motion.p
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {score >= 7 ? "🎉" : score >= 4 ? "👏" : "📖"}
                </motion.p>
                <p className="text-5xl font-bold text-[var(--color-accent)] mb-2">
                  {score} / {questions.length}
                </p>
                <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                  {verdict.title}
                </h3>
                <p className="text-[var(--color-text-muted)] mb-8">
                  {verdict.message}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={reset}
                  className="px-8 py-3.5 rounded-full font-semibold text-[#0c0a09]
                             bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]
                             transition-colors shadow-lg shadow-[var(--color-accent-glow)]"
                >
                  Try Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
}
