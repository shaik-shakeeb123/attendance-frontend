import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { 
  AlertCircle, LogOut, ShieldCheck, CheckCircle2, 
  TrendingUp, TrendingDown, BookOpen, AlertTriangle, 
  Clock, ArrowUpRight, Sparkles, RefreshCw, Calendar, Award
} from 'lucide-react';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { attendanceData } = location.state || {};
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!attendanceData) {
      navigate('/');
    }
  }, [attendanceData, navigate]);

  if (!attendanceData) return null;

  const { overall, subjects } = attendanceData;
  const isSafe = overall >= 75;
  const isWarning = overall >= 70 && overall < 75;

  // Calculate summary stats
  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const totalConducted = subjects.reduce((sum, s) => sum + s.conducted, 0);
  const totalMissed = totalConducted - totalAttended;
  
  // Custom refresh animation handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  // Safe zones classification
  const getSubjectStatus = (percentage) => {
    if (percentage >= 75) return { label: 'Safe', color: 'text-secondary bg-secondary/10 border-secondary/20', glow: 'glass-card-glow-secondary', barColor: '#10b981' };
    if (percentage >= 70) return { label: 'Warning', color: 'text-warning bg-warning/10 border-warning/20', glow: 'glass-card-glow-warning', barColor: '#f59e0b' };
    return { label: 'Unsafe', color: 'text-danger bg-danger/10 border-danger/20', glow: 'glass-card-glow-danger', barColor: '#f43f5e' };
  };

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const status = getSubjectStatus(data.percentage);
      return (
        <div className="glass-card p-3 rounded-xl border border-white/10 shadow-2xl space-y-1.5 backdrop-blur-md text-[11px] max-w-[200px]">
          <p className="font-bold text-white tracking-wider uppercase truncate">{data.name}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-extrabold text-white">{data.percentage}%</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-white/60">
            Attended: <strong className="text-white">{data.attended}</strong> / {data.conducted} classes
          </p>
        </div>
      );
    }
    return null;
  };

  // Motion variants for staggered entry (only apply where optimal)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 120, damping: 18 }
    }
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans pb-16 relative overflow-x-hidden select-none">
      {/* Decorative Background Gradients */}
      <div className="absolute top-[-300px] left-[-200px] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-200px] right-[-200px] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-50 w-full glass-card border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo Emblem */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-background" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-white">Attendance Tracker</span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/25">v1.2.0</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-text-muted font-medium tracking-wide">Academic Intelligence</p>
            </div>
          </div>

          {/* Sync status - Desktop Only */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
              <span className="text-xs text-white/80 font-medium">Synced with IMS Portal</span>
            </div>
          </div>

          {/* Compact Header Actions */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              aria-label="Refresh Data"
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 hover:text-white transition-all active:scale-95 touch-manipulation"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-danger/10 hover:bg-danger/20 border border-danger/20 rounded-xl text-xs font-bold text-danger transition-all active:scale-95 touch-manipulation shadow-lg shadow-danger/5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 space-y-6 sm:space-y-8">
        
        {/* Banner Section */}
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center pb-1 space-y-3 md:space-y-0"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">Attendance Tracker</h1>
            <p className="text-text-muted text-xs sm:text-sm mt-0.5">Real-time attendance analysis, smart target scheduling, and safety audits.</p>
          </div>
          <div className="flex items-center space-x-2 bg-white/5 border border-white/5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/80 self-stretch sm:self-auto justify-center">
            <Calendar className="w-3.5 h-3.5 text-primary mr-1 shrink-0" />
            <span>Academic Term 2026 // Sem 2</span>
          </div>
        </motion.div>

        {/* 3-Column KPI Section - Swipeable Carousel on Mobile, Grid on Desktop */}
        <div className="relative">
          {/* Scroll Indicators for mobile */}
          <div className="flex lg:hidden justify-end space-x-1.5 mb-2 text-[10px] text-text-muted font-bold tracking-wider uppercase">
            <span>Swipe for details</span>
            <span className="animate-bounce">→</span>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex lg:grid lg:grid-cols-3 gap-4 lg:gap-6 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory scroll-smooth pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 custom-scrollbar"
          >
            {/* Card 1: Attendance Circle Radial Gauge */}
            <motion.div 
              variants={itemVariants}
              className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-between relative group overflow-hidden w-[85vw] sm:w-[48vw] lg:w-auto shrink-0 snap-center"
            >
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${isSafe ? 'from-secondary/50 to-primary/50' : 'from-danger/50 to-warning/50'}`}></div>
              
              <div className="w-full flex justify-between items-center mb-4">
                <h2 className="text-[11px] sm:text-xs font-bold tracking-widest text-white/50 uppercase">Overview</h2>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                  isSafe ? 'text-secondary bg-secondary/10 border-secondary/20' : 
                  isWarning ? 'text-warning bg-warning/10 border-warning/20' : 
                  'text-danger bg-danger/10 border-danger/20'
                }`}>
                  {isSafe ? 'Safe Standing' : isWarning ? 'Warning' : 'Unsafe'}
                </span>
              </div>

              {/* Radial Gauge */}
              <div className="w-36 h-36 sm:w-40 sm:h-40 relative my-1 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.02)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke={isSafe ? 'url(#secGrad)' : 'url(#dangerGrad)'}
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * overall) / 100}
                    className="opacity-20 blur-[2px]"
                    strokeLinecap="round"
                  />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke={isSafe ? 'url(#secGrad)' : 'url(#dangerGrad)'} 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * overall) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                  <span className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tighter">{overall}%</span>
                  <span className="text-[9px] text-text-muted font-bold tracking-widest uppercase">Standing</span>
                </div>
              </div>

              <div className="w-full text-center mt-4">
                <p className="text-xs text-text-muted leading-relaxed">
                  Target is <span className="text-white font-semibold">75.00%</span>. You are{' '}
                  <span className={`font-semibold ${isSafe ? 'text-secondary' : 'text-danger'}`}>
                    {isSafe ? 'above' : 'below'}
                  </span>{' '}
                  by <span className="text-white font-extrabold">{(Math.abs(overall - 75)).toFixed(2)}%</span>.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Detailed Stats Grid */}
            <motion.div 
              variants={itemVariants}
              className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between w-[85vw] sm:w-[48vw] lg:w-auto shrink-0 snap-center"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[11px] sm:text-xs font-bold tracking-widest text-white/50 uppercase">Detailed Analytics</h2>
                <Award className="w-4 h-4 text-primary" />
              </div>

              <div className="grid grid-cols-2 gap-3 flex-grow">
                <div className="bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl flex flex-col justify-center">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <CheckCircle2 className="w-3 h-3 text-secondary shrink-0" />
                    <span className="text-[10px] text-text-muted truncate">Attended</span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl sm:text-2xl font-bold text-white">{totalAttended}</span>
                    <span className="text-[9px] text-text-muted">classes</span>
                  </div>
                </div>

                <div className="bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl flex flex-col justify-center">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <BookOpen className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-[10px] text-text-muted truncate">Conducted</span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl sm:text-2xl font-bold text-white">{totalConducted}</span>
                    <span className="text-[9px] text-text-muted">classes</span>
                  </div>
                </div>

                <div className="bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl flex flex-col justify-center">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <Clock className="w-3 h-3 text-danger shrink-0" />
                    <span className="text-[10px] text-text-muted truncate">Absences</span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl sm:text-2xl font-bold text-white">{totalMissed}</span>
                    <span className="text-[9px] text-text-muted">classes</span>
                  </div>
                </div>

                <div className="bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl flex flex-col justify-center">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <TrendingUp className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-[10px] text-text-muted truncate">Trend</span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-lg sm:text-xl font-bold text-secondary">{overall >= 75 ? '+1.4%' : '-0.8%'}</span>
                    <span className="text-[8px] text-text-muted">wk</span>
                  </div>
                </div>
              </div>

              {/* Progress target indicator */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[10px] text-text-muted font-medium">
                  <span>Core Target Completion</span>
                  <span className="text-white font-bold">{((totalAttended / (totalConducted || 1)) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${isSafe ? 'from-primary to-secondary' : 'from-danger to-warning'}`}
                    style={{ width: `${Math.min((totalAttended / (totalConducted || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: AI Smart Alerts Panel */}
            <motion.div 
              variants={itemVariants}
              className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between w-[85vw] sm:w-[48vw] lg:w-auto shrink-0 snap-center"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-[11px] sm:text-xs font-bold tracking-widest text-white/50 uppercase">Smart Alerts</h2>
                <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                  {subjects.filter(s => s.classesNeeded > 0).length} Actions
                </span>
              </div>

              <div className="space-y-2.5 max-h-[170px] sm:max-h-[190px] overflow-y-auto pr-1 custom-scrollbar flex-grow">
                {subjects.map((sub, i) => {
                  if (sub.classesNeeded === 0 && sub.safeToSkip === 0) return null;
                  const needClasses = sub.classesNeeded > 0;
                  
                  return (
                    <div 
                      key={i} 
                      className={`p-2.5 border border-transparent rounded-xl flex items-start space-x-2.5 transition-all ${
                        needClasses 
                          ? 'bg-danger/5 border-danger/10 text-danger-hover' 
                          : 'bg-secondary/5 border-secondary/10 text-secondary-hover'
                      }`}
                    >
                      <div className={`p-1 rounded-lg shrink-0 mt-0.5 ${needClasses ? 'bg-danger/10' : 'bg-secondary/10'}`}>
                        {needClasses ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                        )}
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="text-xs font-bold text-white tracking-wide truncate pr-2">{sub.name}</p>
                        {needClasses ? (
                          <p className="text-[10px] text-white/60 leading-snug">
                            Attend <strong className="text-white">{sub.classesNeeded}</strong> lectures to recover target.
                          </p>
                        ) : (
                          <p className="text-[10px] text-white/60 leading-snug">
                            You can safely skip <strong className="text-white">{sub.safeToSkip}</strong> classes.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {subjects.filter(s => s.classesNeeded > 0 || s.safeToSkip > 0).length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-1.5">
                    <ShieldCheck className="w-7 h-7 text-secondary/40" />
                    <p className="text-[10px] text-text-muted font-medium">All targets fully aligned. Safe zone active.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Row 4: Analytics Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-4 sm:p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Subject Breakdown Analysis</h2>
              <p className="text-text-muted text-[11px] sm:text-xs">Comparison of individual subject percentages against the 75% target baseline.</p>
            </div>
            {/* Chart Legend - Auto Stack on Mobile */}
            <div className="flex items-center space-x-3 text-[10px] sm:text-xs font-medium text-text-muted">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 rounded bg-primary"></div>
                <span>Percentage</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-3.5 h-0.5 bg-danger/50 border-t border-dashed border-danger"></div>
                <span>Target (75%)</span>
              </div>
            </div>
          </div>

          {/* Responsive Chart Wrapper */}
          <div className="w-full h-[200px] sm:h-[280px] pt-2 sm:pt-4 relative min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjects} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  tick={false}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.15)" 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 500 }} 
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.015)' }} 
                  content={<CustomTooltip />}
                  trigger="hover"
                />
                <ReferenceLine 
                  y={75} 
                  stroke="#f43f5e" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.2}
                  label={{ value: '75%', position: 'top', fill: '#f43f5e', fontSize: 9, fontWeight: 700 }} 
                />
                <Bar 
                  dataKey="percentage" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                >
                  {subjects.map((entry, index) => {
                    const status = getSubjectStatus(entry.percentage);
                    return (
                      <Cell key={`cell-${index}`} fill={status.barColor} className="transition-all duration-200 hover:opacity-85" />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Row 5: Detailed Subject Cards Grid */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Courses Overview</h2>
            <p className="text-text-muted text-[11px] sm:text-xs">Subject-by-subject attendance stats, records, and status reports.</p>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
          >
            {subjects.map((sub, i) => {
              const status = getSubjectStatus(sub.percentage);
              const isAbove = sub.percentage >= 75;
              
              return (
                <motion.div 
                  key={i}
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  // Disable hover transitions on mobile to avoid sticky tap styles
                  className={`glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all duration-300 border-t-2 md:hover:-translate-y-1 ${status.glow} border-t-transparent`}
                  style={{ borderTopColor: status.barColor }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-0.5 pr-2 min-w-0">
                      <h3 className="font-display font-extrabold text-sm text-white tracking-tight truncate max-w-full" title={sub.name}>
                        {sub.name}
                      </h3>
                      <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Module ID // {i + 1}</p>
                    </div>
                    {/* Status Pill */}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline mb-3">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl sm:text-3xl font-display font-black text-white tracking-tighter">{sub.percentage}%</span>
                      {isAbove ? (
                        <TrendingUp className="w-3.5 h-3.5 text-secondary shrink-0" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-danger shrink-0" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-text-muted">{sub.attended} / {sub.conducted} classes</span>
                  </div>

                  {/* Progress bar visual */}
                  <div className="space-y-1.5 mt-3">
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(sub.percentage, 100)}%`, backgroundColor: status.barColor }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[8px] text-text-muted font-bold tracking-wide">
                      <span>0%</span>
                      <span>Target 75%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Touch-Friendly Card footer action links */}
                  <div className="mt-4 pt-3 border-t border-white/[0.03] flex items-center justify-between text-[10px] text-text-muted">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {sub.conducted} total lectures
                    </span>
                    <span className="font-semibold text-white/80 hover:text-white flex items-center transition-colors">
                      Smart Audit <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
