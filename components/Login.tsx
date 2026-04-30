
import React from 'react';
import { auth } from '../services/firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const Login: React.FC = () => {
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 transition-all">
        <div className="text-center space-y-4">
          <div className="inline-flex bg-indigo-600 p-4 rounded-3xl text-white font-bold text-3xl shadow-xl shadow-indigo-500/20 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            F
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
            Finanza
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm max-w-xs mx-auto animate-in fade-in duration-700 delay-200">
            Controle financeiro residencial com inteligência e elegância.
          </p>
        </div>

        <div className="pt-8 space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-indigo-500/30 transition-all active:scale-95 shadow-sm group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            Entrar com Google
          </button>
        </div>

        <div className="pt-8 flex items-center justify-between opacity-30">
          <div className="h-px bg-slate-300 dark:bg-slate-700 flex-1"></div>
          <span className="text-[10px] font-black uppercase px-4 text-slate-400">Security By Firebase</span>
          <div className="h-px bg-slate-300 dark:bg-slate-700 flex-1"></div>
        </div>
      </div>
      <div className="fixed bottom-8 text-slate-400 text-[10px] font-bold tracking-widest uppercase opacity-50">
        &copy; 2026 Finanza Ecosystem
      </div>
    </div>
  );
};

export default Login;
