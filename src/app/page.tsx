'use client';

import { useState } from 'react';

const CONCERNS = [
  'Air Pollution',
  'Heat Wave',
  'UV Exposure',
  'Flooding',
  'Wildfire Smoke',
];

const SCENARIOS = [
  'Extreme Heat Waves',
  'Rising Sea Levels',
  'Worsening Air Pollution',
  'Increasing Wildfires',
  'Severe Storms'
];

const TRAJECTORIES = [
  { value: 1, label: 'Cleaner Future' },
  { value: 2, label: 'Current Path' },
  { value: 3, label: 'Extreme Reality' }
];

interface EnvironmentData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  aqi: number;
  aqiLabel: string;
  description: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'current' | 'future'>('current');

  // --- Current Conditions State ---
  const [location, setLocation] = useState('');
  const [concern, setConcern] = useState(CONCERNS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [envData, setEnvData] = useState<EnvironmentData | null>(null);
  const [explanation, setExplanation] = useState('');

  // --- Future Simulator State ---
  const [currentAge, setCurrentAge] = useState<number | ''>('');
  const [simAge, setSimAge] = useState<number | ''>('');
  const [simCity, setSimCity] = useState('');
  const [simScenario, setSimScenario] = useState(SCENARIOS[0]);
  const [simTrajectory, setSimTrajectory] = useState(2); // Default to Current Path
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState('');
  const [simStory, setSimStory] = useState('');
  const [simFutureYear, setSimFutureYear] = useState<number | null>(null);

  // --- Current Tab Handler ---
  const handleCurrentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setLoading(true);
    setError('');
    setEnvData(null);
    setExplanation('');

    try {
      const envRes = await fetch(`/api/environment?location=${encodeURIComponent(location)}`);
      if (!envRes.ok) throw new Error('Failed to fetch environment data. Please check location or API keys.');
      const envJson = await envRes.json();
      setEnvData(envJson);

      const explainRes = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, concern, environmentData: envJson }),
      });

      if (!explainRes.ok) throw new Error('Failed to generate explanation. Please check AI API key.');
      const explainJson = await explainRes.json();
      setExplanation(explainJson.explanation);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // --- Future Tab Handler ---
  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simCity.trim() || !simAge || !currentAge || simAge <= currentAge) {
      if (typeof simAge === 'number' && typeof currentAge === 'number' && simAge <= currentAge) {
        setSimError('Future Age must be greater than Current Age.');
      }
      return;
    }

    setSimLoading(true);
    setSimError('');
    setSimStory('');
    setSimFutureYear(null);

    const trajectoryLabel = TRAJECTORIES.find(t => t.value === simTrajectory)?.label;

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAge: currentAge,
          futureAge: simAge,
          city: simCity,
          scenario: simScenario,
          trajectory: trajectoryLabel,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate simulation. Please check API keys.');
      const json = await res.json();
      setSimStory(json.story);
      setSimFutureYear(json.futureYear);
    } catch (err: any) {
      setSimError(err.message || 'Something went wrong.');
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto flex flex-col items-center">
      <header className="w-full text-center mb-10 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
          What's Happening <span className="text-[var(--color-accent)]">Around Me?</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
          Understand local environmental conditions and simulate future impacts.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[var(--color-bg-input)] rounded-xl mb-8 border border-[var(--color-border)] animate-fade-in">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'current' 
              ? 'bg-[var(--color-accent)] text-white shadow-lg' 
              : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-border)]'
          }`}
        >
          Current Focus
        </button>
        <button
          onClick={() => setActiveTab('future')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'future' 
              ? 'bg-[var(--color-accent)] text-white shadow-lg' 
              : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-border)]'
          }`}
        >
          <span>🎮 Future Simulator</span>
        </button>
      </div>

      {/* --- CURRENT TAB --- */}
      {activeTab === 'current' && (
        <div className="w-full animate-fade-in">
          <div className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
            <form onSubmit={handleCurrentSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Where are you?</label>
                <input
                  type="text"
                  placeholder="e.g. New York, London..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
                  required
                />
              </div>
              
              <div className="flex-1 md:max-w-[250px]">
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Top Concern</label>
                <select
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                  className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all cursor-pointer"
                >
                  {CONCERNS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !location.trim()}
                  className="w-full md:w-auto bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? 'Checking...' : 'Explain It'}
                </button>
              </div>
            </form>
          </div>

          {error && <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8">{error}</div>}
          {loading && !envData && (
            <div className="w-full space-y-4"><div className="h-24 rounded-xl loading-shimmer"></div><div className="h-32 rounded-xl loading-shimmer"></div></div>
          )}

          {envData && explanation && (
            <div className="w-full space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl text-center">
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Temp</p>
                  <p className="text-2xl font-bold text-white">{Math.round(envData.temperature)}°C</p>
                </div>
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl text-center">
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">AQI</p>
                  <p className="text-2xl font-bold text-white">{envData.aqi}</p>
                </div>
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl text-center">
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Humidity</p>
                  <p className="text-2xl font-bold text-white">{envData.humidity}%</p>
                </div>
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl text-center">
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Wind</p>
                  <p className="text-2xl font-bold text-white">{envData.windSpeed}m/s</p>
                </div>
              </div>

              <div className="bg-[var(--color-info-bg)] border border-[var(--color-accent)]/30 p-6 md:p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-accent)]"></div>
                <div className="flex items-start gap-4">
                  <div className="bg-[var(--color-accent)] text-white p-2 rounded-lg mt-1 shrink-0">💡</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Here's the deal with {concern.toLowerCase()} today:</h3>
                    <p className="text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">{explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- FUTURE TAB --- */}
      {activeTab === 'future' && (
        <div className="w-full animate-fade-in">
          <div className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
            <form onSubmit={handleSimulateSubmit} className="flex flex-col gap-6">
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 md:max-w-[120px]">
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Current Age</label>
                  <input
                    type="number"
                    min="1" max="120"
                    placeholder="e.g. 15"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(e.target.valueAsNumber || '')}
                    className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    required
                  />
                </div>

                <div className="flex-1 md:max-w-[120px]">
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Future Age</label>
                  <input
                    type="number"
                    min="1" max="120"
                    placeholder="e.g. 45"
                    value={simAge}
                    onChange={(e) => setSimAge(e.target.valueAsNumber || '')}
                    className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    required
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Miami, Mumbai..."
                    value={simCity}
                    onChange={(e) => setSimCity(e.target.value)}
                    className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Scenario</label>
                  <select
                    value={simScenario}
                    onChange={(e) => setSimScenario(e.target.value)}
                    className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer"
                  >
                    {SCENARIOS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Slider Section */}
              <div className="pt-4 border-t border-[var(--color-border)]">
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-4">World Trajectory Twist</label>
                
                <div className="relative w-full px-2 mb-8">
                  <input 
                    type="range" 
                    min="1" max="3" step="1"
                    value={simTrajectory}
                    onChange={(e) => setSimTrajectory(parseInt(e.target.value))}
                    className="w-full h-2 bg-[var(--color-bg-input)] rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-xs font-medium text-[var(--color-text-muted)] mt-3 px-1">
                    <span className={simTrajectory === 1 ? 'text-green-400' : ''}>Cleaner Future</span>
                    <span className={simTrajectory === 2 ? 'text-yellow-400' : ''}>Current Path</span>
                    <span className={simTrajectory === 3 ? 'text-red-400' : ''}>+2°C World</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-2">
                <button
                  type="submit"
                  disabled={simLoading || !simCity.trim() || !simAge || !currentAge || simAge <= currentAge}
                  className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-10 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {simLoading ? 'Simulating...' : 'Glimpse the Future'}
                </button>
              </div>
            </form>
          </div>

          {simError && <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 text-center">{simError}</div>}
          
          {simLoading && !simStory && (
            <div className="w-full h-32 rounded-xl loading-shimmer"></div>
          )}

          {simStory && (
            <div className="bg-purple-900/10 border border-purple-500/30 p-6 md:p-8 rounded-2xl relative overflow-hidden animate-fade-in mt-6 shadow-[0_0_40px_rgba(168,85,247,0.1)]">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <div className="flex items-start gap-4">
                <div className="bg-purple-500 text-white p-2 rounded-lg shrink-0">🔮</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Life in {simFutureYear} (At Age {simAge})</h3>
                  <p className="text-purple-100/90 leading-relaxed text-lg whitespace-pre-wrap">{simStory}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </main>
  );
}
