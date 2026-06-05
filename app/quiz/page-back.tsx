"use client";

import { useEffect, useState } from "react";
import { placementQuestions } from "../data/placementQuestions";
import Link from "next/link";

export default function QuizPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);

useEffect(() => {
  const shuffled = [...placementQuestions].sort(
    () => Math.random() - 0.5
  );

  console.log("Total Questions:", placementQuestions.length);
  console.log("Loaded Questions:", shuffled.slice(0, 25).length);

  setQuestions(shuffled.slice(0, 25));
}, []);
useEffect(() => {
  if (timeLeft === 0) {
    nextQuestion();
    return;
  }

  const timer = setTimeout(() => {
    setTimeLeft(timeLeft - 1);
  }, 1000);

  return () => clearTimeout(timer);
}, [timeLeft]);

  if (questions.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1>Loading Questions...</h1>
      </main>
    );
  }

  const question = questions[currentQuestion];

  const checkAnswer = () => {
    if (!selected) {
      setMessage("⚠️ Select an option first");
      return;
    }

    if (selected === question.answer) {
      setScore(score + 1);
      setMessage("✅ Correct Answer");
      setShowNext(true);
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts === 1) {
      setMessage(`💡 Hint 1: ${question.hint1}`);
    } else if (newAttempts === 2) {
      setMessage(`💡 Hint 2: ${question.hint2}`);
    } else {
      setMessage(
        `❌ Correct Answer: ${question.answer}. ${question.explanation}`
      );
      setShowNext(true);
    }
  };

  const nextQuestion = () => {
    setCurrentQuestion(currentQuestion + 1);
    setSelected("");
    setAttempts(0);
    setMessage("");
    setShowNext(false);
    setTimeLeft(90);
  };
if (currentQuestion >= questions.length) {
  if (!sessionStorage.getItem("quizSaved")) {

  const totalAttempts =
    Number(localStorage.getItem("totalAttempts")) || 0;

  localStorage.setItem(
    "totalAttempts",
    (totalAttempts + 1).toString()
  );

  const totalScore =
    Number(localStorage.getItem("totalScore")) || 0;

  localStorage.setItem(
    "totalScore",
    (totalScore + score).toString()
  );

  sessionStorage.setItem("quizSaved", "true");
}

  const percentage = Math.round(
    (score / questions.length) * 100
  );
  const bestScore =
  Number(localStorage.getItem("bestScore")) || 0;

if (score > bestScore) {
  localStorage.setItem(
    "bestScore",
    score.toString()
  );
}

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">

        <h1 className="text-5xl font-bold mb-4">
          Quiz Completed 🎉
        </h1>

        <h2 className="text-3xl mb-4">
          Score: {score} / {questions.length}
        </h2>
        <h2 className="text-xl mb-4 text-yellow-400">
  🏆 Best Score: {
    Math.max(
      score,
      Number(localStorage.getItem("bestScore")) || 0
    )
  }
</h2>

        <h2 className="text-2xl mb-6 text-blue-400">
          Percentage: {percentage}%
        </h2>

        <p className="text-xl mb-6">
          {percentage >= 80
            ? "🔥 Placement Ready"
            : percentage >= 60
            ? "👍 Good Performance"
            : "📚 Need More Practice"}
        </p>

        <button
          onClick={() => {
  sessionStorage.removeItem("quizSaved");
  window.location.reload();
}}
          className="bg-blue-600 px-6 py-3 rounded-xl"
        >
          Restart Quiz
        </button>

      </div>
    </main>
  );
}
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-2">
          Daily Placement Quiz
        </h1>
        <button
  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg mb-6"
>
  🤖 AI Questions (Coming Soon)
</button>
<a
  href="/dashboard"
  className="ml-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
>
  📊 Dashboard
</a>
{/* Progress Bar */}
<div
  style={{
    width: "100%",
    height: "20px",
    backgroundColor: "#333",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "10px",
  }}
>
  <div
    style={{
      width: `${(currentQuestion / questions.length) * 100}%`,
      height: "100%",
      backgroundColor: "limegreen",
      transition: "width 0.3s ease",
    }}
  />
</div>

<p className="text-green-400 mb-4">
  Progress: {Math.round((currentQuestion / questions.length) * 100)}%
  {" "}({currentQuestion}/{questions.length})
</p>
        <p className="text-red-400 mb-6">
          Time Left: {timeLeft}s
        </p>

        <div className="border border-zinc-700 rounded-3xl p-8">

          <h2 className="text-3xl mb-8">
            {question.question}
          </h2>

          <div className="grid gap-4">

            {question.options.map((option: string) => (
              <button
                key={option}
                onClick={() => setSelected(option)}
                className={`border p-4 rounded-xl transition ${
                  selected === option
                    ? "border-blue-500 bg-blue-500/20"
                    : "border-zinc-700"
                }`}
              >
                {option}
              </button>
            ))}

          </div>

          <button
            onClick={checkAnswer}
            className="mt-6 bg-white text-black px-6 py-3 rounded-xl font-semibold"
          >
            Submit Answer
          </button>

          {message && (
            <div className="mt-6 border border-zinc-700 p-4 rounded-xl">
              {message}
            </div>
          )}

          {showNext && (
            <button
              onClick={nextQuestion}
              className="mt-6 bg-blue-600 px-6 py-3 rounded-xl"
            >
              {currentQuestion === questions.length - 1
                ? "Finish Quiz"
                : "Next Question"}
            </button>
          )}

        </div>
      </div>
    </main>
  );
}