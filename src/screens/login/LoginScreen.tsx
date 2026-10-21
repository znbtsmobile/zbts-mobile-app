import React, { useState } from 'react';
import { Droplet, BarChart3, ArrowRightLeft, Headphones } from 'lucide-react';
import { auth, signInWithEmailAndPassword } from '../../services/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      let msg = err.message || 'Authentication rejected';
      msg = msg.replace(/Firebase:?\s*/ig, '');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-300 justify-center p-4 lg:p-8 overflow-y-auto">
      <div className="shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-6 lg:gap-8 my-auto">
        
        {/* Banner Feature Cards Section */}
        <div className="lg:w-3/5 bg-[#F8FAFC] rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 flex flex-col justify-center border border-slate-200/60 shadow-sm relative overflow-hidden order-2 lg:order-1">
          {/* Subtle Background Decorations */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-red-200/40 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-center text-[#0B1E36] mb-6 sm:mb-8 tracking-tight leading-tight px-2">
              Zanzibar Blood Transfusion Services
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="bg-white p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
                <div className="bg-[#E3EFFF] p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-sm">
                  <Droplet className="w-6 h-6 sm:w-8 sm:h-8 text-[#1976D2] fill-[#1976D2]" />
                </div>
                <h3 className="font-bold text-[#0B1E36] text-[14px] sm:text-[15px] leading-tight mb-1">
                  Online Blood Request
                </h3>
                <p className="text-[11px] sm:text-xs font-semibold text-[#1976D2] mb-2 sm:mb-3">
                  Ombi la Damu Mtandaoni
                </p>
                <div className="w-8 h-1 bg-[#1976D2] rounded-full mb-2 sm:mb-3"></div>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed px-2">
                  Request blood units quickly and securely for patients.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
                <div className="bg-[#FFEBEB] p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-sm">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-[#D32F2F]" />
                </div>
                <h3 className="font-bold text-[#0B1E36] text-[14px] sm:text-[15px] leading-tight mb-1">
                  Real-time Inventory
                </h3>
                <p className="text-[11px] sm:text-xs font-semibold text-[#D32F2F] mb-2 sm:mb-3">
                  Akiba ya Damu Wakati Halisi
                </p>
                <div className="w-8 h-1 bg-[#D32F2F] rounded-full mb-2 sm:mb-3"></div>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed px-2">
                  View current blood stock availability across facilities.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
                <div className="bg-[#E8F5E9] p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-sm">
                  <ArrowRightLeft className="w-6 h-6 sm:w-8 sm:h-8 text-[#2E7D32]" />
                </div>
                <h3 className="font-bold text-[#0B1E36] text-[14px] sm:text-[15px] leading-tight mb-1">
                  Unit Transfer
                </h3>
                <p className="text-[11px] sm:text-xs font-semibold text-[#2E7D32] mb-2 sm:mb-3">
                  Uhamisho wa Damu
                </p>
                <div className="w-8 h-1 bg-[#2E7D32] rounded-full mb-2 sm:mb-3"></div>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed px-2">
                  Manage and track blood unit transfers efficiently.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
                <div className="bg-[#EDE7F6] p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-sm">
                  <Headphones className="w-6 h-6 sm:w-8 sm:h-8 text-[#4527A0]" />
                </div>
                <h3 className="font-bold text-[#0B1E36] text-[14px] sm:text-[15px] leading-tight mb-1">
                  Phone Call Assistance
                </h3>
                <p className="text-[11px] sm:text-xs font-semibold text-[#4527A0] mb-2 sm:mb-3">
                  Msaada kwa Simu
                </p>
                <div className="w-8 h-1 bg-[#4527A0] rounded-full mb-2 sm:mb-3"></div>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed px-2">
                  Get direct support and assistance via phone call.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="lg:w-2/5 p-4 sm:p-6 lg:p-8 flex flex-col justify-center order-1 lg:order-2">
          <div className="flex justify-center mb-4 sm:mb-6">
            <img 
              src="/app-icon.jpg" 
              alt="Zanzibar Blood Transfusion Service Emblem" 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-sm border-4 border-slate-100"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-[#0B1E36] mb-1 sm:mb-2">
            Blood Bank Zanzibar
          </h2>
          <p className="text-sm sm:text-base text-center text-[#1565C0] font-semibold mb-6 sm:mb-8">
            Sign in to your account
          </p>

          {error && (
            <div className="bg-[#F9DEDC] text-[#B71C1C] p-3 sm:p-4 rounded-xl text-xs sm:text-sm mb-4 sm:mb-6 border border-[#F2B8B5] font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#0D47A1] mb-1 sm:mb-1.5">
                Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 sm:p-3.5 bg-white border-2 border-[#1976D2]/20 rounded-xl focus:border-[#1976D2] focus:outline-none focus:ring-4 focus:ring-[#1976D2]/10 transition-all text-sm sm:text-base text-[#0B1E36] font-bold placeholder-[#1E3A8A]/40"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#0D47A1] mb-1 sm:mb-1.5">
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 sm:p-3.5 bg-white border-2 border-[#1976D2]/20 rounded-xl focus:border-[#1976D2] focus:outline-none focus:ring-4 focus:ring-[#1976D2]/10 transition-all text-sm sm:text-base text-[#0B1E36] font-bold placeholder-[#1E3A8A]/40"
                placeholder="Enter your password (min 6 chars)"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full text-white bg-[#1976D2] hover:bg-[#1565C0] font-extrabold py-3.5 sm:py-4 rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-70 mt-2 sm:mt-4 text-base sm:text-lg cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
