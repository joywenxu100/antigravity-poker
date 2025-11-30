import React, { useState, useMemo } from 'react';
import { PokerEngine, VILLAIN_TYPES } from './lib/pokerEngine';
import { Shield, Sword, Target, TrendingUp, Settings, User, Activity, AlertTriangle } from 'lucide-react';

const engine = new PokerEngine();

function App() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [gameConfig, setGameConfig] = useState({
    sb: 1,
    bb: 2,
    straddle: 4,
    ante: 1,
    players: 8,
    stackDepth: 250 // Default to deep stack as requested
  });

  const [villainStats, setVillainStats] = useState({
    hands: 100,
    vpip: 25,
    winRate: 5,
    showdown: 25
  });

  const villainType = useMemo(() => engine.classifyVillain(villainStats), [villainStats]);
  const advice = useMemo(() => engine.getExploitativeAdvice(villainType, 'BTN', gameConfig.stackDepth), [villainType, gameConfig]);
  const potInfo = useMemo(() => {
    engine.updateStructure(gameConfig);
    return engine.calculatePotInfo(gameConfig.stackDepth);
  }, [gameConfig]);

  return (
    <div className="min-h-screen text-white p-4 md:p-8">
      <header className="mb-8 flex items-center justify-between container">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
              Antigravity Poker
            </h1>
            <p className="text-xs text-slate-400">Deep Stack Exploitative Engine</p>
          </div>
        </div>
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'analysis' ? 'bg-white/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            Analysis
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'training' ? 'bg-white/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            Training Drill
          </button>
        </nav>
      </header>

      <main className="container grid-layout">
        {/* Left Panel: Configuration */}
        <div className="space-y-6">
          <section className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4 text-cyan-400">
              <Settings className="w-5 h-5" />
              <h2 className="font-semibold">Game Structure</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Small Blind</label>
                <input
                  type="number"
                  value={gameConfig.sb}
                  onChange={(e) => setGameConfig({ ...gameConfig, sb: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Big Blind</label>
                <input
                  type="number"
                  value={gameConfig.bb}
                  onChange={(e) => setGameConfig({ ...gameConfig, bb: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Straddle (2x BB)</label>
                <input
                  type="number"
                  value={gameConfig.straddle}
                  onChange={(e) => setGameConfig({ ...gameConfig, straddle: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Ante (Per Player)</label>
                <input
                  type="number"
                  value={gameConfig.ante}
                  onChange={(e) => setGameConfig({ ...gameConfig, ante: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div className="col-span-2">
                <label className="label text-yellow-400 font-bold">Hero Stack (BB)</label>
                <input
                  type="number"
                  value={gameConfig.stackDepth}
                  onChange={(e) => setGameConfig({ ...gameConfig, stackDepth: Number(e.target.value) })}
                  className="input-field border-yellow-500/50 bg-yellow-900/10"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Dead Money</span>
                <span className="font-mono text-cyan-300">{potInfo.deadMoney}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Effective Depth (Straddles)</span>
                <span className={`font-mono font-bold ${potInfo.effectiveStackStraddles >= 150 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {potInfo.effectiveStackStraddles.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">SPR (Preflop)</span>
                <span className="font-mono text-purple-300">{potInfo.spr.toFixed(1)}</span>
              </div>
            </div>
          </section>

          <section className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-4 text-purple-400">
              <User className="w-5 h-5" />
              <h2 className="font-semibold">Villain Profiler</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label flex justify-between">
                  <span>Hands (Sample Size)</span>
                  <span className="text-slate-400">{villainStats.hands}</span>
                </label>
                <input
                  type="range" min="0" max="1000"
                  value={villainStats.hands}
                  onChange={(e) => setVillainStats({ ...villainStats, hands: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="label flex justify-between">
                  <span>VPIP (%)</span>
                  <span className="text-slate-400">{villainStats.vpip}%</span>
                </label>
                <input
                  type="range" min="0" max="100"
                  value={villainStats.vpip}
                  onChange={(e) => setVillainStats({ ...villainStats, vpip: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="label flex justify-between">
                  <span>Win Rate (bb/100)</span>
                  <span className="text-slate-400">{villainStats.winRate}</span>
                </label>
                <input
                  type="range" min="-50" max="50"
                  value={villainStats.winRate}
                  onChange={(e) => setVillainStats({ ...villainStats, winRate: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="label flex justify-between">
                  <span>Showdown (WTSD%)</span>
                  <span className="text-slate-400">{villainStats.showdown}%</span>
                </label>
                <input
                  type="range" min="0" max="100"
                  value={villainStats.showdown}
                  onChange={(e) => setVillainStats({ ...villainStats, showdown: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Panel: Strategy */}
        <div className="space-y-6">
          <section className="glass-panel p-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-pink-400" />
                <h2 className="text-xl font-bold">Strategy Analysis</h2>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-mono">
                {villainType}
              </div>
            </div>

            <div className="grid gap-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Structure Adjustment
                </h3>
                <p className="text-slate-200 leading-relaxed">
                  {advice.structureNote}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <h3 className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
                    <Sword className="w-4 h-4" /> Preflop Plan
                  </h3>
                  <p className="text-sm text-slate-300">{advice.preflop}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Postflop Plan
                  </h3>
                  <p className="text-sm text-slate-300">{advice.postflop}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-green-900/10 border border-green-500/20">
                <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> General Exploit
                </h3>
                <p className="text-slate-200">{advice.general}</p>
              </div>
            </div>
          </section>

          {activeTab === 'training' && (
            <section className="glass-panel p-6 animate-fade-in border-cyan-500/30 shadow-cyan-500/10">
              <h2 className="text-lg font-bold mb-4">Quick Drill: Spot Analysis</h2>
              <div className="space-y-4">
                <div className="p-4 bg-black/40 rounded-lg font-mono text-sm">
                  <p className="text-slate-400">Hero (BTN) holds <span className="text-red-400">Ah Kh</span></p>
                  <p className="text-slate-400">Villain ({villainType}) is in Straddle.</p>
                  <p className="text-slate-400">Folds to Hero.</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button className="btn-primary bg-red-500 hover:bg-red-600">Fold</button>
                  <button className="btn-primary bg-yellow-500 hover:bg-yellow-600">Call</button>
                  <button className="btn-primary">Raise 3.5x</button>
                </div>
                <p className="text-xs text-center text-slate-500">
                  *Training scenarios are dynamically generated based on the selected Villain profile.*
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
