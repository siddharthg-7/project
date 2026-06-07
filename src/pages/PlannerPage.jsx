import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { analyzePlan, DEFAULT_FORM, saveJson } from '../utils/planner';

export default function PlannerPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_FORM);

  const handleGenerate = () => {
    const data = analyzePlan(form);
    saveJson('analysis', data);
    saveJson('plannerForm', form);
    navigate('/analysis');
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#111827,_#020617_55%)] text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:px-8">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Planning Page</p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-white md:text-4xl">Enter floors, plot size, direction and parking details</h1>
              <p className="mt-2 text-slate-300">This page collects your plot and apartment inputs before generating Vastu, budget, and parking results.</p>
            </div>
            <nav className="flex gap-3 text-sm">
              <Link className="rounded-xl border border-slate-700 px-4 py-2 text-slate-200" to="/">Login</Link>
              <Link className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950" to="/analysis">View Analysis</Link>
            </nav>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Planner form</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-300">Property type
                <select value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white">
                  <option>Independent House</option><option>Duplex House</option><option>Villa</option><option>Apartment</option><option>Flat</option>
                </select>
              </label>
              <label className="text-sm text-slate-300">Plot size (yards)
                <select value={form.plotSize} onChange={(e) => setForm({ ...form, plotSize: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white">
                  <option>30x40 yards</option><option>40x60 yards</option><option>50x80 yards</option>
                </select>
              </label>
              <label className="text-sm text-slate-300">Plot shape
                <select value={form.plotShape} onChange={(e) => setForm({ ...form, plotShape: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white">
                  <option>Rectangular</option><option>Square</option><option>Corner</option>
                </select>
              </label>
              <label className="text-sm text-slate-300">Facing direction
                <select value={form.facing} onChange={(e) => setForm({ ...form, facing: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white">
                  <option>North</option><option>South</option><option>East</option><option>West</option>
                </select>
              </label>
              <label className="text-sm text-slate-300">Number of floors
                <select value={form.floors} onChange={(e) => setForm({ ...form, floors: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white">
                  <option>1</option><option>2</option><option>3</option>
                </select>
              </label>
              <label className="text-sm text-slate-300">Number of rooms
                <select value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white">
                  <option>2</option><option>3</option><option>4</option><option>5</option>
                </select>
              </label>
              <label className="text-sm text-slate-300">House type
                <select value={form.houseType} onChange={(e) => setForm({ ...form, houseType: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white">
                  <option>1BHK</option><option>2BHK</option><option>3BHK</option><option>Duplex</option>
                </select>
              </label>
            </div>
            <div className="mt-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-cyan-100">Tip: Use East-facing plots for better sunlight and South-East kitchen placement guidance.</div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Parking & apartment details</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-200">
              <label className="block">Apartment type
                <select value={form.apartmentType} onChange={(e) => setForm({ ...form, apartmentType: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white">
                  <option>Studio</option><option>2BHK</option><option>3BHK</option>
                </select>
              </label>
              <label className="block">Car parking slots
                <input type="number" min="0" value={form.parkingCars} onChange={(e) => setForm({ ...form, parkingCars: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white" /></label>
              <label className="block">Bike parking slots
                <input type="number" min="0" value={form.parkingBikes} onChange={(e) => setForm({ ...form, parkingBikes: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white" /></label>
              <label className="block">EV charging spots
                <input type="number" min="0" value={form.parkingEv} onChange={(e) => setForm({ ...form, parkingEv: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white" /></label>
            </div>
            <button onClick={handleGenerate} className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-3 font-semibold text-slate-950">Generate smart analysis</button>
          </article>
        </section>
      </div>
    </main>
  );
}
