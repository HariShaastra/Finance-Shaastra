import React from 'react';
import { BookOpen, Shield, Info, HelpCircle, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const Guide = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-16 pb-20"
    >
      <header className="text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex p-6 bg-amber-100 text-amber-600 rounded-[2.5rem] mb-6 shadow-inner"
        >
          <BookOpen className="w-12 h-12" />
        </motion.div>
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2 text-amber-600 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Knowledge Base</span>
          </div>
          <h2 className="text-5xl font-black text-stone-900 tracking-tight">The Shaastra Guide</h2>
          <p className="text-stone-500 text-xl font-medium max-w-2xl mx-auto">Mastering personal finance through awareness and discipline.</p>
        </div>
      </header>

      <motion.section 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-12 rounded-[3rem] border border-stone-200 shadow-xl space-y-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        
        <div className="flex items-center space-x-5 relative z-10">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-[1.5rem]">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-black text-stone-900 tracking-tight">How to use this app?</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-8">
            <div className="flex items-start space-x-5 group">
              <div className="w-10 h-10 bg-stone-900 text-white rounded-[1rem] flex items-center justify-center flex-shrink-0 font-black text-lg shadow-lg group-hover:bg-amber-600 transition-colors">1</div>
              <div>
                <h4 className="text-lg font-black text-stone-900 mb-1">Log Everything</h4>
                <p className="text-stone-500 font-medium leading-relaxed">Every coffee, every bill, every investment. Discipline starts with data.</p>
              </div>
            </div>
            <div className="flex items-start space-x-5 group">
              <div className="w-10 h-10 bg-stone-900 text-white rounded-[1rem] flex items-center justify-center flex-shrink-0 font-black text-lg shadow-lg group-hover:bg-amber-600 transition-colors">2</div>
              <div>
                <h4 className="text-lg font-black text-stone-900 mb-1">Categorize Wisely</h4>
                <p className="text-stone-500 font-medium leading-relaxed">Use 'Needs' for essentials, 'Wants' for lifestyle, and 'Growth' for savings/investments.</p>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="flex items-start space-x-5 group">
              <div className="w-10 h-10 bg-stone-900 text-white rounded-[1rem] flex items-center justify-center flex-shrink-0 font-black text-lg shadow-lg group-hover:bg-amber-600 transition-colors">3</div>
              <div>
                <h4 className="text-lg font-black text-stone-900 mb-1">Reflect Regularly</h4>
                <p className="text-stone-500 font-medium leading-relaxed">Use the Reflections tab daily. Awareness of your emotions during spending is key.</p>
              </div>
            </div>
            <div className="flex items-start space-x-5 group">
              <div className="w-10 h-10 bg-stone-900 text-white rounded-[1rem] flex items-center justify-center flex-shrink-0 font-black text-lg shadow-lg group-hover:bg-amber-600 transition-colors">4</div>
              <div>
                <h4 className="text-lg font-black text-stone-900 mb-1">Watch the Scorecard</h4>
                <p className="text-stone-500 font-medium leading-relaxed">Your score reflects your behavior. Aim for 80+ for a healthy financial life.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-stone-900 text-white p-12 rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/20 transition-colors" />
          <div className="flex items-center space-x-5 relative z-10">
            <div className="p-4 bg-white/10 rounded-[1.5rem] backdrop-blur-md">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-3xl font-black tracking-tight">No AI Policy</h3>
          </div>
          <p className="text-stone-400 leading-relaxed font-medium relative z-10">
            Finance Shaastra is built on <span className="text-white font-black">pure logic and rules</span>. We do not use Artificial Intelligence to analyze your data or provide advice. 
            We believe that financial wisdom comes from your own human reflection and the raw numbers of your life, not from a black-box algorithm.
          </p>
          <div className="flex items-center space-x-3 text-amber-400 text-sm font-black uppercase tracking-widest relative z-10">
            <CheckCircle className="w-5 h-5" />
            <span>100% Rule-Based Systems</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-amber-50 p-12 rounded-[3rem] border border-amber-100 space-y-8 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="flex items-center space-x-5 text-amber-900 relative z-10">
            <div className="p-4 bg-amber-100 rounded-[1.5rem]">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-black tracking-tight">Disclaimer</h3>
          </div>
          <p className="text-amber-800/80 leading-relaxed font-medium relative z-10">
            This application is for educational and tracking purposes only. The "Scorecard" and "Insights" are based on general financial heuristics and do not constitute professional financial advice. Always consult with a certified financial advisor for serious financial decisions.
          </p>
          <div className="pt-4 border-t border-amber-200/50 relative z-10">
            <p className="text-xs text-amber-700 font-black uppercase tracking-widest">
              Your data is stored securely in your private Firebase instance.
            </p>
          </div>
        </motion.div>
      </section>

      <footer className="text-center pt-16 border-t border-stone-200">
        <div className="flex items-center justify-center space-x-3 text-stone-400 mb-3">
          <Info className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Finance Shaastra v1.0</span>
        </div>
        <p className="text-stone-400 text-sm font-medium">Built for financial awareness and discipline.</p>
      </footer>
    </motion.div>
  );
};
