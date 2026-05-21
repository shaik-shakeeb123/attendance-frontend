import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Loader2, Eye, EyeOff, User, Lock, Sparkles, Shield, Compass, ArrowRight } from 'lucide-react';

const Login = () => {
  const [registerNo, setRegisterNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Interaction states for focus and mouse coords
  const [focusReg, setFocusReg] = useState(false);
  const [focusPass, setFocusPass] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/attendance`, {
        registerNo,
        password
      });

      if (response.data.success) {
        navigate('/dashboard', { state: { attendanceData: response.data.data, registerNo } });
      } else {
        setError(response.data.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to IMS. Please check your credentials and network.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020204] py-12 px-4 selection:bg-primary/30"
    >
      {/* Background radial spotlights */}
      <div className="absolute top-[-20%] left-[-15%] w-[55%] h-[55%] bg-[#06b6d4]/8 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-15%] w-[55%] h-[55%] bg-[#10b981]/5 rounded-full blur-[140px] pointer-events-none"></div>
      
      {/* Dynamic Cursor Spotlight Effect */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-60 hidden lg:block"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, 0.035), transparent 80%)`
        }}
      />

      {/* Star Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="glass-panel p-8 sm:p-10 rounded-2xl w-full max-w-[430px] z-10 relative overflow-hidden group/card"
      >
        {/* Sleek top ambient borders */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/30 to-transparent transition-opacity duration-300"></div>
        <div className="absolute inset-px rounded-[15px] border border-white/[0.015] pointer-events-none"></div>

        {/* Brand Emblem */}
        <div className="text-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.05] mb-5 shadow-inner relative overflow-hidden group/emblem"
          >
            <Sparkles className="w-5.5 h-5.5 text-primary group-hover/emblem:rotate-12 transition-transform duration-300" />
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md opacity-0 group-hover/emblem:opacity-30 transition-opacity"></div>
          </motion.div>
          
          <h1 className="text-2xl font-black text-white tracking-tight font-display">MITS Attendance Tracker</h1>
          <p className="text-xs text-text-muted mt-1.5 leading-relaxed max-w-[280px] mx-auto">
            See if you can bunk tomorrow. Log in with your MITS IMS portal credentials.
          </p>
        </div>

        {/* Errors Container */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-3.5 bg-danger/10 border border-danger/20 text-danger rounded-xl text-xs flex items-start space-x-2.5">
                <Compass className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Register No Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest block">Register No</label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                focusReg ? 'text-primary' : 'text-white/20'
              }`}>
                <User size={16} className={`transition-transform duration-200 ${focusReg ? 'scale-110' : ''}`} />
              </span>
              <input
                type="text"
                value={registerNo}
                onFocus={() => setFocusReg(true)}
                onBlur={() => setFocusReg(false)}
                onChange={(e) => setRegisterNo(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-[#08090d]/60 border rounded-xl text-sm text-white placeholder-white/25 transition-all outline-none font-medium ${
                  focusReg 
                    ? 'border-primary/40 bg-[#0c0d15]/90 shadow-[0_0_15px_rgba(6,182,212,0.06)]' 
                    : 'border-white/[0.04] hover:border-white/[0.08]'
                }`}
                placeholder="e.g. 23691A0501"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest block">Password</label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                focusPass ? 'text-primary' : 'text-white/20'
              }`}>
                <Lock size={16} className={`transition-transform duration-200 ${focusPass ? 'scale-110' : ''}`} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onFocus={() => setFocusPass(true)}
                onBlur={() => setFocusPass(false)}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-11 pr-12 py-3 bg-[#08090d]/60 border rounded-xl text-sm text-white placeholder-white/25 transition-all outline-none font-medium ${
                  focusPass 
                    ? 'border-primary/40 bg-[#0c0d15]/90 shadow-[0_0_15px_rgba(6,182,212,0.06)]' 
                    : 'border-white/[0.04] hover:border-white/[0.08]'
                }`}
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/5 relative overflow-hidden group cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2.5 h-4.5 w-4.5" />
                <span>Checking IMS database...</span>
              </>
            ) : (
              <span className="flex items-center space-x-1.5 font-bold tracking-tight">
                <span>Check My Attendance</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-out"></div>
          </button>
        </form>


        
        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center space-x-2 text-[10px] text-text-muted">
          <Shield className="w-3.5 h-3.5 text-secondary shrink-0" />
          <span className="leading-relaxed">Your password is safe. We never store your credentials.</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
