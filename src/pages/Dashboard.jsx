import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Sliders, BookOpen, ChevronRight, AlertTriangle, 
  CheckCircle2, TrendingUp, TrendingDown, Info, User, 
  RefreshCw, LogOut, Compass, Plus, Minus, Zap, HelpCircle,
  Award, Clock
} from 'lucide-react';

// Premium Animated Counter Component
const AnimatedCounter = ({ value, duration = 0.5, suffix = "" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    if (isNaN(end)) {
      setCount(value);
      return;
    }
    if (end === 0) {
      setCount(0);
      return;
    }
    
    const steps = 30;
    const stepIncrement = end / steps;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(parseFloat((stepIncrement * step).toFixed(1)));
      }
    }, (duration * 1000) / steps);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span className="tabular-nums font-mono font-black">{count}{suffix}</span>;
};

// Math Helpers for Attendance Calculations
const calculateSkips = (attended, conducted) => {
  if (conducted === 0) return 0;
  const skips = Math.floor((attended / 0.75) - conducted);
  return Math.max(0, skips);
};

const calculateAttend = (attended, conducted) => {
  if (conducted === 0) return 0;
  const needed = Math.ceil(3 * conducted - 4 * attended);
  return Math.max(0, needed);
};

const getSubjectStatus = (percentage) => {
  if (percentage >= 75) {
    return { 
      label: 'Safe Zone', 
      color: 'text-secondary bg-secondary/5 border-secondary/15', 
      barColor: '#10b981',
      glow: 'premium-glow-secondary'
    };
  }
  if (percentage >= 70) {
    return { 
      label: 'Borderline', 
      color: 'text-warning bg-warning/5 border-warning/15', 
      barColor: '#f59e0b',
      glow: 'premium-glow-warning'
    };
  }
  return { 
    label: 'Shortage Alert', 
    color: 'text-danger bg-danger/5 border-danger/15', 
    barColor: '#f43f5e',
    glow: 'premium-glow-danger'
  };
};

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, calculator, subjects
  
  // Fallback data for testing/demo
  const fallbackData = {
    overall: 76.8,
    subjects: [
      { name: "DBMS", attended: 32, conducted: 40, percentage: 80 },
      { name: "Operating Systems", attended: 25, conducted: 40, percentage: 62.5 },
      { name: "Computer Networks", attended: 38, conducted: 40, percentage: 95 },
      { name: "Software Engineering", attended: 28, conducted: 40, percentage: 70 }
    ]
  };

  const attendanceData = location.state?.attendanceData || fallbackData;
  const isDemo = !location.state?.attendanceData;
  
  const { overall: initialScore, subjects } = attendanceData;

  // Simulator Data State
  const [simulatedData, setSimulatedData] = useState([]);
  const [selectedSimSubject, setSelectedSimSubject] = useState('');
  const [optimizerOutput, setOptimizerOutput] = useState(null);

  useEffect(() => {
    // Initialize simulation array
    const initialSim = subjects.map(s => ({
      ...s,
      simAttended: 0,
      simMissed: 0
    }));
    setSimulatedData(initialSim);
    if (subjects.length > 0) {
      setSelectedSimSubject(subjects[0].name);
    }
  }, [subjects]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // Simulate addition update
  const updateSimVal = (subjectName, key, amount) => {
    setSimulatedData(prev => prev.map(s => {
      if (s.name === subjectName) {
        const newVal = Math.max(0, s[key] + amount);
        return { ...s, [key]: newVal };
      }
      return s;
    }));
  };

  // Reset simulator config
  const resetSimConfig = () => {
    setSimulatedData(subjects.map(s => ({
      ...s,
      simAttended: 0,
      simMissed: 0
    })));
    setOptimizerOutput(null);
  };

  // AI Auto-Optimizer
  const runAutoOptimizer = () => {
    setSimulatedData(prev => prev.map(s => {
      const currentPercent = (s.attended / s.conducted) * 100;
      let simAtt = 0;
      let simMiss = 0;
      if (currentPercent < 75) {
        simAtt = calculateAttend(s.attended, s.conducted);
      } else {
        simMiss = calculateSkips(s.attended, s.conducted);
      }
      return {
        ...s,
        simAttended: simAtt,
        simMissed: simMiss
      };
    }));
    setOptimizerOutput("Auto-optimised. All shortage subjects set to minimum safety attendance; all compliant subjects set to max safe skip buffer.");
  };

  // Calculations for simulated cumulative
  const simTotalAttended = simulatedData.reduce((sum, s) => sum + s.attended + s.simAttended, 0);
  const simTotalConducted = simulatedData.reduce((sum, s) => sum + s.conducted + s.simAttended + s.simMissed, 0);
  const simScore = simTotalConducted > 0 ? parseFloat(((simTotalAttended / simTotalConducted) * 100).toFixed(1)) : 0;

  // Active score & subjects mapping for dynamic Header
  const currentScore = activeTab === 'calculator' ? simScore : initialScore;
  const currentSubjectsData = activeTab === 'calculator' 
    ? simulatedData.map(s => ({
        ...s,
        attended: s.attended + s.simAttended,
        conducted: s.conducted + s.simAttended + s.simMissed,
        percentage: s.conducted + s.simAttended + s.simMissed > 0 
          ? parseFloat((((s.attended + s.simAttended) / (s.conducted + s.simAttended + s.simMissed)) * 100).toFixed(1))
          : 0
      }))
    : subjects;

  // Calculations for cumulative bunk advice
  const getBunkAdvice = (subs) => {
    let totalSafeSkips = 0;
    let totalClassesNeeded = 0;
    let criticalSubjects = [];
    
    subs.forEach(s => {
      const pct = (s.attended / (s.conducted || 1)) * 100;
      if (pct >= 75) {
        totalSafeSkips += calculateSkips(s.attended, s.conducted);
      } else {
        totalClassesNeeded += calculateAttend(s.attended, s.conducted);
        criticalSubjects.push(s.name);
      }
    });

    return { totalSafeSkips, totalClassesNeeded, criticalSubjects };
  };

  const adviceData = getBunkAdvice(currentSubjectsData);

  // Dynamic Conversational Insight Feed generator
  const generateConversationalInsights = () => {
    const list = [];
    const sorted = [...subjects].sort((a, b) => a.percentage - b.percentage);
    
    // Danger subjects
    const danger = sorted.filter(s => s.percentage < 75);
    danger.forEach(s => {
      const needed = calculateAttend(s.attended, s.conducted);
      list.push({
        id: `danger-${s.name}`,
        type: 'danger',
        message: `${s.name} is in shortage warning (${s.percentage}%). You must attend the next ${needed} classes to clear it.`,
        action: `Attend ${needed} classes`
      });
    });

    // Borderline subjects
    const borderline = sorted.filter(s => s.percentage >= 75 && s.percentage < 80);
    borderline.forEach(s => {
      const skips = calculateSkips(s.attended, s.conducted);
      list.push({
        id: `warning-${s.name}`,
        type: 'warning',
        message: `${s.name} is safe but borderline (${s.percentage}%). You can only skip ${skips} class${skips === 1 ? '' : 'es'} before dropping.`,
        action: `Skip max ${skips} class${skips === 1 ? '' : 'es'}`
      });
    });

    // Safest subjects
    const safe = sorted.filter(s => s.percentage >= 85);
    if (safe.length > 0) {
      const safest = safe[safe.length - 1];
      const skips = calculateSkips(safest.attended, safest.conducted);
      if (skips > 0) {
        list.push({
          id: `safe-${safest.name}`,
          type: 'success',
          message: `Your ${safest.name} attendance is highly secure (${safest.percentage}%). You can skip tomorrow's lecture safely.`,
          action: `${skips} skips left`
        });
      }
    }

    // Default stable message
    if (danger.length === 0) {
      list.push({
        id: 'stable-all',
        type: 'success',
        message: "Amazing! Every single subject is currently above the 75% safety line. Keep this streak going!",
        action: "All safe"
      });
    }

    return list;
  };

  const insightsFeed = generateConversationalInsights();


  // Tab configurations
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Sparkles size={14} /> },
    { id: 'calculator', label: 'Bunk Calculator', icon: <Sliders size={14} /> },
    { id: 'subjects', label: 'My Subjects', icon: <BookOpen size={14} /> }
  ];

  const activeSimSubjectData = simulatedData.find(s => s.name === selectedSimSubject) || null;

  return (
    <div className="min-h-screen bg-[#020204] text-text font-sans pb-28 md:pb-16 relative overflow-x-hidden selection:bg-primary/20">
      
      {/* Background Ambient Spotlight Glows */}
      <div className="absolute top-[-30%] left-[-10%] w-[55%] h-[55%] bg-[#06b6d4]/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-[#10b981]/3 rounded-full blur-[140px] pointer-events-none"></div>
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full bg-[#020204]/60 border-b border-white/[0.03] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/10">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-extrabold text-sm sm:text-base tracking-tight text-white">Attendance Tracker</span>
                {isDemo && (
                  <span className="text-[8px] font-bold tracking-widest text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-1.5 py-0.5 rounded uppercase">DEMO</span>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex bg-white/[0.015] border border-white/[0.04] p-1 rounded-xl">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold relative transition-all flex items-center space-x-2 cursor-pointer"
                  style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}
                >
                  {tab.icon}
                  <span className="relative z-10">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabDesktop"
                      className="absolute inset-0 bg-white/[0.03] border border-white/[0.05] rounded-lg shadow-inner"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              className="p-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] rounded-xl text-white/70 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Refresh academic data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-1.5 px-3 py-2 bg-danger/10 hover:bg-danger/15 border border-danger/15 rounded-xl text-xs font-bold text-danger transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8 space-y-6">
        
        {/* ================================================== */}
        {/* TOP HERO SECTION                                   */}
        {/* ================================================== */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-6 sm:p-8 rounded-2xl relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[220px]"
        >
          {/* Subtle light leaks */}
          <div className="absolute top-[-50%] left-[-20%] w-[60%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06),transparent_60%)] pointer-events-none"></div>
          <div className="absolute bottom-[-50%] right-[-20%] w-[60%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_60%)] pointer-events-none"></div>
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono mb-1.5">
            {activeTab === 'calculator' ? 'Simulated Standing' : 'Attendance'}
          </span>
          
          <div className="flex items-baseline space-x-1 mb-2">
            <span className="text-6xl sm:text-7xl font-display font-black text-white tracking-tighter text-glow-primary">
              <AnimatedCounter value={currentScore} suffix="%" />
            </span>
          </div>

          {/* Actionable Student Advice */}
          <div className="max-w-[540px] mx-auto mt-2">
            {(() => {
              const isSafe = currentScore >= 75;
              if (isSafe) {
                if (adviceData.totalSafeSkips > 0) {
                  if (adviceData.criticalSubjects.length > 0) {
                    return (
                      <p className="text-sm sm:text-base text-warning font-medium tracking-tight leading-relaxed">
                        You can bunk <strong className="text-white text-glow-warning font-extrabold">{adviceData.totalSafeSkips} classes</strong> in total, but caution: <strong className="text-white">{adviceData.criticalSubjects.join(', ')}</strong> {adviceData.criticalSubjects.length === 1 ? 'is' : 'are'} below 75%.
                      </p>
                    );
                  }
                  return (
                    <p className="text-sm sm:text-base text-secondary font-medium tracking-tight leading-relaxed">
                      You can safely skip <strong className="text-white text-glow-secondary font-extrabold">{adviceData.totalSafeSkips} classes</strong> in total across your subjects.
                    </p>
                  );
                } else {
                  return (
                    <p className="text-sm sm:text-base text-white/90 font-medium tracking-tight leading-relaxed">
                      You're exactly at the 75% margin. Attend the next few lectures to build a safe bunk buffer.
                    </p>
                  );
                }
              } else {
                return (
                  <p className="text-sm sm:text-base text-danger font-medium tracking-tight leading-relaxed">
                    Shortage warning! You must attend the next <strong className="text-white text-glow-danger font-extrabold">{adviceData.totalClassesNeeded} classes</strong> in total to get back to 75%.
                  </p>
                );
              }
            })()}
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-1.5 mt-6 pt-5 border-t border-white/[0.03] w-full max-w-[450px] text-[10px] font-mono text-text-muted uppercase tracking-wider">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span>Safe subjects: <strong className="text-white">{currentSubjectsData.filter(s => s.percentage >= 75).length}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
              <span>Alert subjects: <strong className="text-white">{currentSubjectsData.filter(s => s.percentage < 75).length}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span>Total Classes: <strong className="text-white">{currentSubjectsData.reduce((sum, s) => sum + s.conducted, 0)}</strong></span>
            </div>
          </div>
        </motion.div>

        {/* Tab content area */}
        <AnimatePresence mode="wait">
          
          {/* ================================================== */}
          {/* TAB 1: OVERVIEW                                    */}
          {/* ================================================== */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-2xl mx-auto w-full"
            >
              {/* Detailed Analytics Section */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="premium-card p-6 rounded-2xl relative overflow-hidden"
              >
                {/* Subtle spotlight highlight inside the card */}
                <div className="absolute top-[-50%] right-[-30%] w-[80%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.04),transparent_60%)] pointer-events-none"></div>
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h3 className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono">Detailed Analytics</h3>
                  <div className="p-1.5 bg-primary/10 border border-primary/20 rounded-lg text-primary">
                    <Award className="w-4 h-4" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                  {/* Attended Card */}
                  <div className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-xl flex flex-col justify-between min-h-[90px]">
                    <div className="flex items-center space-x-1.5 text-text-muted text-[9px] font-bold uppercase tracking-wider">
                      <CheckCircle2 size={12} className="text-secondary" />
                      <span>Attended</span>
                    </div>
                    <div className="flex items-baseline space-x-1 mt-3">
                      <span className="text-3xl font-display font-black text-white tracking-tighter">
                        {currentSubjectsData.reduce((sum, s) => sum + s.attended, 0)}
                      </span>
                      <span className="text-[9px] text-text-muted font-mono font-bold uppercase tracking-wider">classes</span>
                    </div>
                  </div>

                  {/* Conducted Card */}
                  <div className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-xl flex flex-col justify-between min-h-[90px]">
                    <div className="flex items-center space-x-1.5 text-text-muted text-[9px] font-bold uppercase tracking-wider">
                      <BookOpen size={12} className="text-primary" />
                      <span>Conducted</span>
                    </div>
                    <div className="flex items-baseline space-x-1 mt-3">
                      <span className="text-3xl font-display font-black text-white tracking-tighter">
                        {currentSubjectsData.reduce((sum, s) => sum + s.conducted, 0)}
                      </span>
                      <span className="text-[9px] text-text-muted font-mono font-bold uppercase tracking-wider">classes</span>
                    </div>
                  </div>

                  {/* Absences Card */}
                  <div className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-xl flex flex-col justify-between min-h-[90px]">
                    <div className="flex items-center space-x-1.5 text-text-muted text-[9px] font-bold uppercase tracking-wider">
                      <Clock size={12} className="text-danger" />
                      <span>Absences</span>
                    </div>
                    <div className="flex items-baseline space-x-1 mt-3">
                      <span className="text-3xl font-display font-black text-white tracking-tighter">
                        {currentSubjectsData.reduce((sum, s) => sum + s.conducted - s.attended, 0)}
                      </span>
                      <span className="text-[9px] text-text-muted font-mono font-bold uppercase tracking-wider">classes</span>
                    </div>
                  </div>

                  {/* Trend Card */}
                  <div className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-xl flex flex-col justify-between min-h-[90px]">
                    <div className="flex items-center space-x-1.5 text-text-muted text-[9px] font-bold uppercase tracking-wider">
                      <TrendingUp size={12} className="text-primary" />
                      <span>Trend</span>
                    </div>
                    <div className="flex items-baseline space-x-1 mt-3">
                      <span className={`text-3xl font-display font-black tracking-tighter ${
                        currentScore >= 75 ? 'text-secondary text-glow-secondary' : 'text-danger text-glow-danger'
                      }`}>
                        {currentScore >= 75 ? '+1.4%' : '-0.8%'}
                      </span>
                      <span className="text-[9px] text-text-muted font-mono font-bold uppercase tracking-wider">wk</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="space-y-2.5 pt-4 border-t border-white/[0.03] relative z-10">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">
                    <span>Core Target Completion</span>
                    <span className="text-white font-extrabold text-sm">{currentScore}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/[0.04] rounded-full overflow-hidden p-[1.5px] border border-white/[0.02]">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                      style={{ width: `${Math.min(currentScore, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono">Attendance Insights Feed</h3>
                
                <div className="space-y-3">
                {insightsFeed.map((item, index) => {
                  let cardGlow = 'border-white/[0.03]';
                  let iconColor = 'text-primary';
                  let statusIcon = <Info size={16} />;
                  
                  if (item.type === 'danger') {
                    cardGlow = 'border-danger/10 bg-danger/[0.01] hover:border-danger/20';
                    iconColor = 'text-danger';
                    statusIcon = <AlertTriangle size={16} />;
                  } else if (item.type === 'warning') {
                    cardGlow = 'border-warning/10 bg-warning/[0.01] hover:border-warning/20';
                    iconColor = 'text-warning';
                    statusIcon = <AlertTriangle size={16} />;
                  } else if (item.type === 'success') {
                    cardGlow = 'border-secondary/10 bg-secondary/[0.01] hover:border-secondary/20';
                    iconColor = 'text-secondary';
                    statusIcon = <CheckCircle2 size={16} />;
                  }

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`premium-card p-4 flex items-start space-x-3.5 border transition-all ${cardGlow}`}
                    >
                      <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                        {statusIcon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs leading-relaxed text-white/95 font-medium">{item.message}</p>
                        <div className="flex items-center space-x-2 text-[9px] font-mono font-bold text-text-muted uppercase">
                          <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{item.action}</span>
                          <span>•</span>
                          <span>Actionable today</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              </div>
            </motion.div>
          )}

          {/* ================================================== */}
          {/* TAB 2: BUNK CALCULATOR                             */}
          {/* ================================================== */}
          {activeTab === 'calculator' && (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              {/* Left Selector Panel */}
              <div className="md:col-span-4 premium-card p-4 space-y-3 h-fit">
                <div className="flex justify-between items-center px-1 mb-1">
                  <h3 className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono">Select Subject</h3>
                  <button 
                    onClick={runAutoOptimizer}
                    className="text-[9px] font-bold tracking-tight text-primary hover:text-white flex items-center transition-colors cursor-pointer"
                    title="Optimize attendance automatically"
                  >
                    <Zap size={11} className="mr-0.5 text-secondary" /> Auto-Planner
                  </button>
                </div>
                
                <div className="space-y-1.5">
                  {simulatedData.map((sub) => {
                    const isSelected = selectedSimSubject === sub.name;
                    const simAtt = sub.attended + sub.simAttended;
                    const simCond = sub.conducted + sub.simAttended + sub.simMissed;
                    const simPercent = simCond > 0 ? parseFloat(((simAtt / simCond) * 100).toFixed(1)) : 0;
                    
                    const isModified = sub.simAttended > 0 || sub.simMissed > 0;
                    const isSimSafe = simPercent >= 75;

                    return (
                      <button
                        key={sub.name}
                        onClick={() => setSelectedSimSubject(sub.name)}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex justify-between items-center cursor-pointer ${
                          isSelected 
                            ? 'bg-white/[0.03] border-white/10 shadow-lg' 
                            : 'bg-transparent border-transparent hover:bg-white/[0.015]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-white truncate">{sub.name}</p>
                          <p className="text-[9px] text-text-muted font-mono mt-0.5 font-bold">
                            Current: {sub.percentage}%
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center space-x-1.5 text-right">
                          {isModified ? (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                              isSimSafe ? 'bg-secondary/5 border-secondary/15 text-secondary' : 'bg-danger/5 border-danger/15 text-danger'
                            }`}>
                              {simPercent}%
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-text-muted">No change</span>
                          )}
                          <ChevronRight size={13} className={isSelected ? 'text-white/60' : 'text-white/20'} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Calculator Panel */}
              <div className="md:col-span-8 space-y-4">
                {activeSimSubjectData ? (
                  <div className="premium-card p-6 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-white/[0.04]">
                      <div>
                        <h4 className="font-display font-extrabold text-base text-white tracking-tight">{activeSimSubjectData.name}</h4>
                        <p className="text-[9px] text-text-muted font-mono uppercase mt-0.5">Bunk Calculator Workspace</p>
                      </div>
                      
                      <button
                        onClick={resetSimConfig}
                        className="px-3 py-1.5 bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] text-[10px] font-bold font-mono text-white rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                      >
                        Reset Simulator
                      </button>
                    </div>

                    {/* Comparison Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Current actual */}
                      <div className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-text-muted font-mono font-bold uppercase tracking-wider block">Current</span>
                          <p className="text-3xl font-display font-black text-white/50 tracking-tighter mt-1">{activeSimSubjectData.percentage}%</p>
                          <span className="text-[10px] font-mono text-text-muted block mt-1">
                            {activeSimSubjectData.attended} / {activeSimSubjectData.conducted} classes
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full border text-[8.5px] font-bold uppercase tracking-wider shrink-0 ${
                          activeSimSubjectData.percentage >= 75 ? 'text-secondary bg-secondary/5 border-secondary/15' : 'text-danger bg-danger/5 border-danger/15'
                        }`}>
                          {activeSimSubjectData.percentage >= 75 ? 'Safe' : 'Shortage'}
                        </span>
                      </div>

                      {/* Forecasted simulation */}
                      {(() => {
                        const simAtt = activeSimSubjectData.attended + activeSimSubjectData.simAttended;
                        const simCond = activeSimSubjectData.conducted + activeSimSubjectData.simAttended + activeSimSubjectData.simMissed;
                        const simPercent = simCond > 0 ? parseFloat(((simAtt / simCond) * 100).toFixed(1)) : 0;
                        const isSimSafe = simPercent >= 75;

                        return (
                          <div className="p-4 bg-primary/[0.015] border border-primary/10 rounded-xl flex items-center justify-between relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.03),transparent)] pointer-events-none"></div>
                            <div className="relative z-10">
                              <span className="text-[9px] text-primary font-mono font-bold uppercase tracking-wider block">Simulated Forecast</span>
                              <p className="text-3xl font-display font-black text-white tracking-tighter mt-1 text-glow-primary">
                                <AnimatedCounter value={simPercent} suffix="%" />
                              </p>
                              <span className="text-[10px] font-mono text-text-muted block mt-1">
                                {simAtt} / {simCond} lectures (+{activeSimSubjectData.simAttended} / +{activeSimSubjectData.simMissed})
                              </span>
                            </div>
                            <span className={`relative z-10 px-2 py-0.5 rounded-full border text-[8.5px] font-bold uppercase tracking-wider shrink-0 ${
                              isSimSafe ? 'text-secondary bg-secondary/10 border-secondary/20' : 'text-danger bg-danger/10 border-danger/20'
                            }`}>
                              {isSimSafe ? 'Safe' : 'Shortage'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Interactive Increments */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/[0.03]">
                      {/* Attendance incremental */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-white/90 flex items-center">
                            <CheckCircle2 size={13} className="text-secondary mr-1.5" /> Classes to Attend
                          </span>
                          <span className="font-mono text-secondary font-bold">+{activeSimSubjectData.simAttended} lectures</span>
                        </div>
                        <div className="flex items-center space-x-3.5 bg-white/[0.01] border border-white/[0.04] p-1.5 rounded-xl">
                          <button
                            onClick={() => updateSimVal(activeSimSubjectData.name, 'simAttended', -1)}
                            className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-center text-white transition-colors cursor-pointer"
                          >
                            <Minus size={14} />
                          </button>
                          <div className="flex-1 text-center font-mono font-black text-white text-lg">
                            {activeSimSubjectData.simAttended}
                          </div>
                          <button
                            onClick={() => updateSimVal(activeSimSubjectData.name, 'simAttended', 1)}
                            className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-center text-white transition-colors cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Absences incremental */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-white/90 flex items-center">
                            <AlertTriangle size={13} className="text-danger mr-1.5" /> Classes to Skip (Bunks)
                          </span>
                          <span className="font-mono text-danger font-bold">+{activeSimSubjectData.simMissed} absences</span>
                        </div>
                        <div className="flex items-center space-x-3.5 bg-white/[0.01] border border-white/[0.04] p-1.5 rounded-xl">
                          <button
                            onClick={() => updateSimVal(activeSimSubjectData.name, 'simMissed', -1)}
                            className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-center text-white transition-colors cursor-pointer"
                          >
                            <Minus size={14} />
                          </button>
                          <div className="flex-1 text-center font-mono font-black text-white text-lg">
                            {activeSimSubjectData.simMissed}
                          </div>
                          <button
                            onClick={() => updateSimVal(activeSimSubjectData.name, 'simMissed', 1)}
                            className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-center text-white transition-colors cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Simulation Verbal Verdict */}
                    <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl flex items-start space-x-2.5">
                      <Info size={15} className="text-primary mt-0.5 shrink-0" />
                      {(() => {
                        const simAtt = activeSimSubjectData.attended + activeSimSubjectData.simAttended;
                        const simCond = activeSimSubjectData.conducted + activeSimSubjectData.simAttended + activeSimSubjectData.simMissed;
                        const simPercent = simCond > 0 ? parseFloat(((simAtt / simCond) * 100).toFixed(1)) : 0;
                        
                        let message = "";
                        if (simPercent >= 75) {
                          const buffer = calculateSkips(simAtt, simCond);
                          message = `Safe Standing forecast. Under these rules, you will have a surplus buffer of ${buffer} bunk class${buffer === 1 ? '' : 'es'} in ${activeSimSubjectData.name}.`;
                        } else {
                          const needed = calculateAttend(simAtt, simCond);
                          message = `Shortage zone forecast. You will need to attend the next ${needed} consecutive lectures in ${activeSimSubjectData.name} to rebuild safety standing.`;
                        }

                        return (
                          <p className="text-xs text-text-muted leading-relaxed font-mono">
                            {message}
                          </p>
                        );
                      })()}
                    </div>

                    {optimizerOutput && (
                      <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-xl text-[11px] text-secondary font-mono">
                        {optimizerOutput}
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="premium-card p-12 text-center flex flex-col items-center justify-center space-y-2">
                    <Sliders size={32} className="text-text-muted opacity-30 animate-pulse" />
                    <p className="text-xs text-text-muted font-medium">Select a subject on the left to simulate options.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ================================================== */}
          {/* TAB 3: MY SUBJECTS                                 */}
          {/* ================================================== */}
          {activeTab === 'subjects' && (
            <motion.div
              key="subjects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono">Enrolled Subjects</h3>
                  <p className="text-text-muted text-[11px] sm:text-xs">Direct subject counts and actionable skip/attend limits</p>
                </div>
                <span className="text-[10px] font-bold text-text-muted uppercase font-mono">{subjects.length} Subjects</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.map((sub, index) => {
                  const status = getSubjectStatus(sub.percentage);
                  const isAbove = sub.percentage >= 75;
                  const skips = calculateSkips(sub.attended, sub.conducted);
                  const needed = calculateAttend(sub.attended, sub.conducted);

                  return (
                    <motion.div
                      key={sub.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      whileHover={{ y: -2 }}
                      className={`premium-card p-5 relative overflow-hidden transition-all duration-300 ${status.glow}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="min-w-0">
                          <h4 className="font-display font-bold text-sm text-white tracking-tight truncate pr-2">{sub.name}</h4>
                          <span className="text-[8px] font-bold tracking-widest text-text-muted uppercase font-mono">Current Status</span>
                        </div>
                        <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline mb-4">
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-2xl font-display font-black text-white tracking-tighter text-glow-primary">
                            <AnimatedCounter value={sub.percentage} suffix="%" />
                          </span>
                          {isAbove ? (
                            <TrendingUp className="w-3.5 h-3.5 text-secondary" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-danger" />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-text-muted font-mono">{sub.attended} / {sub.conducted} lectures</span>
                      </div>

                      {/* Visual clean progress bar */}
                      <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden mb-4">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(sub.percentage, 100)}%`, backgroundColor: status.barColor }}
                        ></div>
                      </div>

                      {/* Simple actionable advice label */}
                      <div className="flex items-center text-[10px] text-text-muted font-mono pt-3.5 border-t border-white/[0.03]">
                        {isAbove ? (
                          <p>
                            You can skip next <strong className="text-secondary">{skips}</strong> class{skips === 1 ? '' : 'es'} safely.
                          </p>
                        ) : (
                          <p>
                            You must attend next <strong className="text-danger font-bold">{needed}</strong> class{needed === 1 ? '' : 'es'} consecutively.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Floating Bottom Nav (Mobile/Small screens) */}
      <div className="md:hidden fixed bottom-4 inset-x-4 bg-[#07080c]/80 border border-white/[0.05] backdrop-blur-2xl z-50 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] py-3 px-5 flex justify-around items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center space-y-1 relative text-[10px] font-bold focus:outline-none transition-colors shrink-0 cursor-pointer"
              style={{ color: isActive ? '#06b6d4' : 'rgba(255,255,255,0.4)' }}
            >
              {tab.icon}
              <span className="tracking-wide">{tab.label.split(' ')[0]}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute -top-2.5 w-8 h-[1.5px] bg-[#06b6d4] rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default Dashboard;
