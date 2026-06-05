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
      <main className="min-h-screen bg-gradient-to-br from-[#0B1026] via-[#171C58] to-[#2A1D67] text-white flex items-center justify-center">
        <div className="text-center bg-slate-900 border border-slate-700 rounded-3xl p-10 shadow-2xl">

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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-10">
          <h1
            className="
  text-5xl 
  md:text-6xl
  font-black
  tracking-tight
  bg-gradient-to-r
  from-cyan-300
  via-blue-400
  to-purple-400
  bg-clip-text
  text-transparent
  "
          >
            PlacePrep AI
          </h1>

          <p
            className="
  mt-4
  text-lg
  md:text-xl
  text-slate-300
  font-medium
  "
          >
            Master Aptitude, Reasoning & Technical Interviews
          </p>

          <p
            className="
  mt-2
  text-sm
  tracking-widest
  uppercase
  text-slate-400
  "
          >
            Learn • Practice • Get Placed
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <div className="bg-black/20 px-4 py-2 rounded-xl">
              📚 125+ Questions
            </div>

            <div className="bg-black/20 px-4 py-2 rounded-xl">
              ⏱ 90 Sec Timer
            </div>

            <div className="bg-black/20 px-4 py-2 rounded-xl">
              🎯 Placement Ready
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <div className="flex gap-4 justify-center mb-8">

  <button
    className="
    px-6
    py-3
    rounded-2xl
    bg-gradient-to-r
    from-purple-500
    to-pink-500
    font-bold
    shadow-lg
    hover:scale-105
    transition-all
    "
  >
    🤖 AI Questions
  </button>

  <a
    href="/dashboard"
    className="
    px-6
    py-3
    rounded-2xl
    bg-white/10
    backdrop-blur-xl
    border border-white/20
    font-bold
    hover:bg-white/20
    transition-all
    "
  >
    📊 Dashboard
  </a>

</div>

          
            <div className="grid md:grid-cols-3 gap-5 mb-8">

  <div
    className="
    bg-white/5
    backdrop-blur-xl
    border border-white/10
    rounded-3xl
    p-6
    text-center
    "
  >
    <p className="text-slate-400">
      Score
    </p>

    <h2 className="text-5xl font-black text-green-400 mt-2">
      {score}
    </h2>
  </div>

  <div
    className="
    bg-white/5
    backdrop-blur-xl
    border border-white/10
    rounded-3xl
    p-6
    text-center
    "
  >
    <p className="text-slate-400">
      Question
    </p>

    <h2 className="text-5xl font-black text-cyan-400 mt-2">
      {currentQuestion + 1}
    </h2>
  </div>

  <div
    className="
    bg-white/5
    backdrop-blur-xl
    border border-white/10
    rounded-3xl
    p-6
    text-center
    "
  >
    <p className="text-slate-400">
      Timer
    </p>

    <h2 className="text-5xl font-black text-red-400 mt-2">
      {timeLeft}s
    </h2>
  </div>

</div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
              style={{
                width: `${(currentQuestion / questions.length) * 100}%`,
              }}
            />
          </div>

          <p className="text-cyan-400 mt-2 font-semibold">
            📈 Progress: {Math.round(
              (currentQuestion / questions.length) * 100
            )}% ({currentQuestion}/{questions.length})
          </p>
        </div>
        <p className="text-red-400 text-xl font-bold mb-6">
          ⏱ Time Left: {timeLeft}s
        </p>
<div className="flex flex-wrap gap-2 justify-center mb-8">

  {questions.slice(0, 25).map((_, index) => (
    <div
      key={index}
      className={`
      w-10
      h-10
      rounded-full
      flex
      items-center
      justify-center
      font-bold
      ${
        index < currentQuestion
          ? "bg-green-500"
          : index === currentQuestion
          ? "bg-cyan-500"
          : "bg-white/10"
      }
      `}
    >
      {index + 1}
    </div>
  ))}

</div>
        <div className="bg-white/10
backdrop-blur-xl
border
border-white/10
rounded-[32px]
p-10
shadow-[0_20px_60px_rgba(0,0,0,0.4)]">

          <h2
  style={{
    fontSize: "38px",
    fontWeight: 800,
    lineHeight: "1.5",
    marginBottom: "40px",
    background:
      "linear-gradient(90deg,#ffffff,#cbd5e1)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  }}
>
  {question.question}
</h2>

          <div className="grid gap-4">
            {question.options.map((option: string) => (
              <button
                key={option}
                onClick={() => setSelected(option)}
                className={`
w-full
p-5
rounded-2xl
border
text-left
font-semibold
transition-all
duration-300
${
  selected === option
    ? "border-cyan-400 bg-cyan-500/20 shadow-[0_0_25px_rgba(34,211,238,0.5)] scale-[1.02]"
    : "border-slate-700 bg-slate-800/40 hover:border-cyan-500 hover:bg-slate-800"
}
`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>

                  {selected === option && (
                    <div className="w-8 h-8 rounded-full bg-cyan-400 text-black flex items-center justify-center font-bold">
                      ✓
                    </div>
                  )}
                </div>
              </button>
            ))}

          </div>

          <button
            onClick={checkAnswer}
            className="
  mt-8
  w-full
  py-5
  rounded-2xl
  font-bold
  text-lg
  bg-gradient-to-r
  from-cyan-500
  via-blue-500
  to-purple-600
  shadow-[0_0_35px_rgba(59,130,246,0.45)]
  hover:scale-[1.02]
  hover:shadow-[0_0_50px_rgba(59,130,246,0.7)]
  transition-all
  duration-300
  "
          >
            🚀 Submit Answer
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