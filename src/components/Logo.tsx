import React from 'react';
import { motion } from 'motion/react';

export const Logo: React.FC<{ className?: string; size?: number }> = ({ className, size = 40 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Outer rotating ring - The "Shaastra" (Knowledge/Cycle) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-2 border-dashed border-amber-500/30 rounded-full"
      />
      
      {/* Inner pulsing glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-2 bg-amber-400/20 rounded-full blur-xl"
      />

      {/* The Core Symbol: A stylized combination of a scroll and a rising line */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10 text-amber-600"
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        {/* The "Shaastra" Scroll Base */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
          d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        />
        
        {/* The "Finance" Rising Sparkle/Chart */}
        <motion.path
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
          d="M12 8l2 2-2 2-2-2 2-2z"
          fill="currentColor"
          className="text-amber-500"
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          d="M9 14l3-3 3 3"
        />
      </svg>
      
      {/* Floating particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
          className="absolute w-1 h-1 bg-amber-400 rounded-full"
          style={{
            top: `${20 + i * 20}%`,
            left: `${70 + i * 5}%`,
          }}
        />
      ))}
    </div>
  );
};
