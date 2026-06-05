export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-bold">PlacePrep AI</h1>
          <p className="mt-4 text-xl text-zinc-400">
            Beginner → Pro 
          </p>
          <button className="mt-8 rounded-2xl bg-white px-8 py-4 text-black font-semibold">
            Start Daily Challenge
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-zinc-400">Level</h3>
            <p className="mt-2 text-3xl font-bold">12</p>
          </div>

          <div className="rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-zinc-400">XP</h3>
            <p className="mt-2 text-3xl font-bold">1240</p>
          </div>

          <div className="rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-zinc-400">Accuracy</h3>
            <p className="mt-2 text-3xl font-bold">84%</p>
          </div>

          <div className="rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-zinc-400">Streak</h3>
            <p className="mt-2 text-3xl font-bold">18 Days</p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-zinc-800 p-8">
          <p className="mb-2 text-sm text-green-400">Question 1 / 10</p>
          <h2 className="mb-6 text-2xl font-semibold">
            A train travels 240 km in 4 hours. What is its average speed?
          </h2>

          <div className="grid gap-4">
            {["A. 40 km/h","B. 50 km/h","C. 60 km/h","D. 80 km/h"].map((o)=>(
              <button
                key={o}
                className="rounded-2xl border border-zinc-700 p-4 text-left hover:border-white"
              >
                {o}
              </button>
            ))}
          </div>

          <button className="mt-6 rounded-2xl bg-white px-6 py-3 font-semibold text-black">
            Submit Answer
          </button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-xl font-bold">Weak Areas</h3>
            <ul className="mt-4 space-y-2 text-zinc-400">
              <li>Probability</li>
              <li>Time & Work</li>
              <li>Permutation & Combination</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-xl font-bold">Roadmap</h3>
            <ul className="mt-4 space-y-2 text-zinc-400">
              <li>June → Foundation</li>
              <li>July-Aug → Placement Aptitude</li>
              <li>Sep-Oct → Product Companies</li>
              <li>Nov-Dec → Google Level</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
