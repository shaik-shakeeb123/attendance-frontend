import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [registerNo, setRegisterNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Backend is expected to be on port 5000
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/attendance`, {
        registerNo,
        password
      });

      if (response.data.success) {
        // Pass data via React Router state
        navigate('/dashboard', { state: { attendanceData: response.data.data } });
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to IMS. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass p-8 rounded-2xl w-full max-w-md z-10 mx-4"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">MITS IMS Tracker</h1>
          <p className="text-white/60">Enter your credentials to sync attendance</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/20 border border-danger/50 text-danger rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Register No</label>
            <input
              type="text"
              value={registerNo}
              onChange={(e) => setRegisterNo(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white placeholder-white/30 transition-colors"
              placeholder="e.g. 21691A05A1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white placeholder-white/30 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Syncing securely...
              </>
            ) : (
              'Connect to IMS'
            )}
          </button>
        </form>
        
        <p className="mt-6 text-center text-xs text-white/40">
          We prioritize your privacy. Credentials are used once to fetch data and never stored.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
