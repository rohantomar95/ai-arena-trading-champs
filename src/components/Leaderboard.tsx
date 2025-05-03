
import React, { useState, useEffect, useCallback } from 'react';
import { CountUp } from 'countup.js';

interface Agent {
  id: string;
  name: string;
  balance: number;
  initialBalance: number;
  avatar: string;
  position?: 'long' | 'short' | null;
  positionSize?: number;
  pnlPercent: number;
}

interface LeaderboardProps {
  agents: Agent[];
  isAnimating?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ agents, isAnimating = false }) => {
  // Sort by balance descending
  const sortedAgents = [...agents].sort((a, b) => b.balance - a.balance);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [key, setKey] = useState<number>(0);
  
  // References for balance elements
  const balanceRefs = React.useRef<{[key: string]: HTMLSpanElement | null}>({});
  const pnlRefs = React.useRef<{[key: string]: HTMLSpanElement | null}>({});
  
  // Reset animation when agents change or animation is triggered
  useEffect(() => {
    if (isAnimating) {
      setKey(prev => prev + 1);
    }
  }, [isAnimating, agents]);
  
  // Initial loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Function to animate counters
  const animateCounters = useCallback(() => {
    if (isLoading) return;
    
    sortedAgents.forEach(agent => {
      try {
        // Balance animation
        const balanceEl = balanceRefs.current[agent.id];
        if (balanceEl) {
          new CountUp(balanceEl, agent.balance, {
            duration: 1.5,
            prefix: '$',
            separator: ',',
            decimal: '.',
            decimalPlaces: 0
          }).start();
        }
        
        // PNL animation
        const pnlEl = pnlRefs.current[agent.id];
        if (pnlEl) {
          new CountUp(pnlEl, Math.abs(agent.pnlPercent), {
            duration: 1.5,
            decimalPlaces: 2,
            suffix: '%',
            prefix: agent.pnlPercent >= 0 ? '+' : '-'
          }).start();
        }
      } catch (err) {
        console.error("Animation error:", err);
      }
    });
  }, [sortedAgents, isLoading]);
  
  // Animate counters after render
  useEffect(() => {
    const timer = setTimeout(() => {
      animateCounters();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [animateCounters, key]);

  // Calculate the maximum balance for scaling bars
  const maxBalance = Math.max(...sortedAgents.map(a => a.balance));
  
  // Get color for the bar based on index and profit/loss
  const getBarColor = (index: number, pnlPercent: number) => {
    // Top 3 get special colors
    if (index === 0) return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-300';
    if (index === 1) return 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-200';
    if (index === 2) return 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500';
    
    // Others based on profit/loss
    if (pnlPercent > 0) return 'bg-gradient-to-r from-arena-green/90 via-arena-green/80 to-arena-green/60';
    if (pnlPercent < 0) return 'bg-gradient-to-r from-arena-red/90 via-arena-red/80 to-arena-red/60';
    
    // Neutral
    return 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700';
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="animate-pulse flex flex-col space-y-2">
          {[...Array(agents.length)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3" key={key}>
      <div className="flex flex-col space-y-4">
        {sortedAgents.map((agent, index) => {
          const isProfitable = agent.pnlPercent >= 0;
          const barWidth = `${Math.max(5, (agent.balance / maxBalance) * 100)}%`; // Min 5% width for visibility
          
          return (
            <div 
              key={`${agent.id}-${index}`}
              className="flex items-center h-12 group"
            >
              {/* Position rank with badge effect */}
              <div className={`w-10 flex justify-center items-center ${index < 3 ? 'scale-110' : ''}`}>
                <span className={`font-mono font-bold text-lg relative ${
                  index === 0 ? 'text-yellow-400' :
                  index === 1 ? 'text-gray-300' :
                  index === 2 ? 'text-amber-600' : 
                  'text-white/70'
                }`}>
                  {index + 1}
                </span>
              </div>
              
              {/* Agent name with avatar */}
              <div className="w-1/4 flex items-center gap-2">
                <div className={`h-8 w-8 flex items-center justify-center text-base rounded-full border ${
                  index === 0 ? 'border-yellow-400 bg-yellow-400/10' :
                  index === 1 ? 'border-gray-300 bg-gray-300/10' :
                  index === 2 ? 'border-amber-600 bg-amber-600/10' :
                  'border-white/20 bg-arena-bg/70'
                }`}>
                  {agent.avatar}
                </div>
                <span className="font-bold tracking-tight group-hover:text-arena-accent transition-colors">
                  {agent.name}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="relative flex-1 h-8">
                {/* Background bar */}
                <div className="absolute inset-0 bg-arena-card/40 rounded-md"></div>
                
                {/* Colored progress bar with gradient and animation */}
                <div 
                  className={`absolute top-0 bottom-0 left-0 rounded-md transition-all duration-700 ${getBarColor(index, agent.pnlPercent)}`}
                  style={{ 
                    width: barWidth,
                    boxShadow: index < 3 ? 
                      index === 0 ? '0 0 15px rgba(234, 179, 8, 0.6)' :
                      index === 1 ? '0 0 12px rgba(209, 213, 219, 0.4)' :
                      '0 0 10px rgba(217, 119, 6, 0.3)' 
                      : 'none'
                  }}
                ></div>
                
                {/* Balance text */}
                <div className="absolute right-2 h-full flex items-center">
                  <span 
                    className="text-base font-bold data-value tabular-nums"
                    ref={el => { 
                      if (el) balanceRefs.current[agent.id] = el;
                    }}
                  >
                    ${agent.balance.toLocaleString()}
                  </span>
                </div>
                
                {/* PnL percentage */}
                <div className="absolute left-2 h-full flex items-center">
                  <span 
                    className={`text-sm font-medium ${
                      agent.pnlPercent > 0 ? 'text-arena-green' : 
                      agent.pnlPercent < 0 ? 'text-arena-red' : 'text-white/70'
                    }`}
                    ref={el => {
                      if (el) pnlRefs.current[agent.id] = el;
                    }}
                  >
                    {agent.pnlPercent > 0 ? '+' : '-'}
                    {Math.abs(agent.pnlPercent).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
