import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Disclaimer from './components/Disclaimer';
import LandingPage from './pages/LandingPage';
import AnalyzePage from './pages/AnalyzePage';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing'); // 'landing' | 'analyze' | 'results'
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleStartScan = () => {
    setActiveTab('analyze');
  };

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setActiveTab('results');
  };

  const handleResetScan = () => {
    setActiveTab('analyze');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage onStartScan={handleStartScan} />
        )}

        {activeTab === 'analyze' && (
          <AnalyzePage onAnalysisComplete={handleAnalysisComplete} />
        )}

        {activeTab === 'results' && (
          <ResultsPage 
            analysisResult={analysisResult} 
            onResetScan={handleResetScan} 
          />
        )}
      </main>

      {/* Ethical AI & Cosmetic Disclaimer Footer */}
      <Disclaimer />
    </div>
  );
}
