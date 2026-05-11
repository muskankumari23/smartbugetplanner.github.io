import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password);
      navigate('/');
    } catch (error) {
      alert('Signup failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[30%] h-[30%] bg-green-100/50 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-emerald-100/50 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl shadow-emerald-500/10 w-full max-w-md border border-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black gradient-text mb-2">Create Account</h1>
          <p className="text-gray-400 font-medium">Start your smart budgeting today</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              className="w-full bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/20 active:scale-[0.98] transition-all">
            Join Now
          </button>
        </form>
        
        <div className="mt-8 text-center pt-6 border-t border-gray-50">
          <p className="text-sm text-gray-500 font-medium">
            Already a member? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
