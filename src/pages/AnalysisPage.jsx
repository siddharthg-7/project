import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AnalysisPage() {
  const analysis = JSON.parse(localStorage.getItem('analysis') || 'null');
  const form = JSON.parse(localStorage.getItem('plannerForm') || '{}');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const roomCards = analysis?.roomDiagram || [];
  const plotLabel = `${form.plotSize || '40x60'} plot • ${form.facing || 'East'} facing • ${form.floors || '2'} floors`;

  const askAi = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, question }),
      });
      const data = await response.json();
      setAnswer(data.answer || 'I could not generate an answer right now.');
    } catch {
      setAnswer('The AI suggestion engine is unavailable right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#111827,_#020617_55%)] text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:px-8">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Analysis Page</p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-white md:text-4xl">View Vastu, budget, parking and AI suggestions</h1>
              <p className="mt-2 text-slate-300">This page presents the generated smart home analysis after you enter the planning details.</p>
            </div>
            <nav className="flex gap-3 text-sm">
              <Link className="rounded-xl border border-slate-700 px-4 py-2 text-slate-200" to="/planner">Back to Planner</Link>
              <Link className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950" to="/">Login</Link>
            </nav>
          </div>
        </header>

        {analysis ? (
          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white">Vastu details</h2>
              <div className="mt-4 space-y-3 text-slate-200">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">Compatibility score: {analysis.vastu.score}/100</div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">Main door: {analysis.vastu.mainDoor}<br />Kitchen: {analysis.vastu.kitchen}<br />Bedroom: {analysis.vastu.bedroom}</div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">Warnings: {analysis.vastu.warnings.join(' • ')}</div>
              </div>
            </article>
            <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white">Budget & parking</h2>
              <div className="mt-4 space-y-3 text-slate-200">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">Estimated total budget: ₹{analysis.budget.total.toLocaleString()}</div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">Cement: ₹{analysis.budget.cement.toLocaleString()} • Steel: ₹{analysis.budget.steel.toLocaleString()} • Parking: ₹{analysis.budget.parking.toLocaleString()}</div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">Parking suggestion: {analysis.parking.message}</div>
              </div>
            </article>
            <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur lg:col-span-2">
              <h2 className="text-2xl font-semibold text-white">Generated home diagram</h2>
              <p className="mt-2 text-slate-300">This room diagram shows every planned zone with its estimated size in square feet for your selected property type.</p>
              <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200">
                <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Room diagram</p>
                      <p className="mt-1 text-sm text-slate-300">{plotLabel}</p>
                    </div>
                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-cyan-50">Usable area: {analysis?.usableArea || 0} sq ft</div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {roomCards.map((room) => (
                      <article key={room.name} className="rounded-2xl border border-slate-700 bg-[linear-gradient(135deg,#111827,#172554)] p-4 shadow-lg shadow-cyan-500/5">
                        <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">{room.name}</p>
                        <p className="mt-3 text-3xl font-black text-white">{room.sqft} <span className="text-base font-medium text-slate-300">sq ft</span></p>
                        <p className="mt-2 text-slate-300">{room.note}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </article>
            <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur lg:col-span-2">
              <h2 className="text-2xl font-semibold text-white">AI suggestion engine</h2>
              <p className="mt-2 text-slate-300">Ask any planning question and get a fast answer based on your current inputs.</p>
              <form onSubmit={askAi} className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <label className="text-sm text-slate-300">Ask about budget, Vastu, rooms, parking, or plot planning</label>
                <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows="3" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white" placeholder="Example: How much budget is needed for this plan? Where should the kitchen go?" />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button type="submit" disabled={loading} className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70">{loading ? 'Thinking...' : 'Ask AI'}</button>
                  <span className="text-xs text-slate-400">Fast rule-based responses for live planning guidance.</span>
                </div>
              </form>
              {answer ? <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-50">{answer}</div> : null}
              <div className="mt-4 grid gap-3 md:grid-cols-2">{analysis.smart.map((item) => <div key={item} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-slate-200">{item}</div>)}</div>
            </article>
          </section>
        ) : (
          <article className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-slate-300 shadow-2xl shadow-cyan-500/10 backdrop-blur">Generate a plan from the Planning page first to see your analysis.</article>
        )}
      </div>
    </main>
  );
}
