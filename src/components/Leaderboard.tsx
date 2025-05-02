import React, { useState, useEffect, useRef } from 'react';
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
  
  // Track previous positions to detect changes
  const previousPositionsRef = useRef<{[key: string]: number}>({});
  const [positionChanges, setPositionChanges] = useState<{[key: string]: boolean}>({});
  const [prevSortedAgents, setPrevSortedAgents] = useState<Agent[]>([]);

  // References for number animations
  const balanceRefs = useRef<{[key: string]: HTMLSpanElement | null}>({});
  const balanceCounters = useRef<{[key: string]: CountUp | null}>({});
  const pnlRefs = useRef<{[key: string]: HTMLSpanElement | null}>({});
  const pnlCounters = useRef<{[key: string]: CountUp | null}>({});
  
  // On first render, initialize previous positions
  useEffect(() => {
    const positions: {[key: string]: number} = {};
    sortedAgents.forEach((agent, index) => {
      positions[agent.id] = index;
    });
    previousPositionsRef.current = positions;
    setPrevSortedAgents(sortedAgents);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Check for position changes
  useEffect(() => {
    // Only update when the component is not already animating
    if (isAnimating) {
      const changes: {[key: string]: boolean} = {};
      const currentPositions: {[key: string]: number} = {};
      
      // Record current positions
      sortedAgents.forEach((agent, index) => {
        currentPositions[agent.id] = index;
        
        // Check if position changed
        if (previousPositionsRef.current[agent.id] !== undefined && 
            previousPositionsRef.current[agent.id] !== index) {
          changes[agent.id] = true;
        }
      });
      
      // Update position changes and previous positions
      setPositionChanges(changes);
      setPrevSortedAgents([...sortedAgents]);
      previousPositionsRef.current = currentPositions;
    }
  }, [sortedAgents, isAnimating]);
  
  // Initialize and update counters for balance animations - safely
  useEffect(() => {
    // Clean up existing counters to prevent memory leaks
    const currentBalanceCounters = balanceCounters.current;
    const currentPnlCounters = pnlCounters.current;
    
    // Setup new counters only after the component is fully mounted
    const setupCounters = () => {
      sortedAgents.forEach(agent => {
        const balanceElement = balanceRefs.current[agent.id];
        const pnlElement = pnlRefs.current[agent.id];
        
        if (balanceElement) {
          try {
            if (currentBalanceCounters[agent.id]) {
              currentBalanceCounters[agent.id]?.update(agent.balance);
            } else {
              currentBalanceCounters[agent.id] = new CountUp(balanceElement, agent.balance, {
                duration: 1.5,
                prefix: '$',
                separator: ',',
                decimal: '.',
                decimalPlaces: 0
              });
              currentBalanceCounters[agent.id]?.start();
            }
          } catch (err) {
            console.warn('Could not animate balance counter:', err);
          }
        }
        
        if (pnlElement) {
          try {
            if (currentPnlCounters[agent.id]) {
              currentPnlCounters[agent.id]?.update(agent.pnlPercent);
            } else {
              currentPnlCounters[agent.id] = new CountUp(pnlElement, agent.pnlPercent, {
                duration: 1.5,
                decimalPlaces: 2,
                suffix: '%',
                prefix: agent.pnlPercent >= 0 ? '+' : ''
              });
              currentPnlCounters[agent.id]?.start();
            }
          } catch (err) {
            console.warn('Could not animate PnL counter:', err);
          }
        }
      });
    };
    
    // Use a small delay to ensure DOM is ready
    const timerId = setTimeout(setupCounters, 50);
    
    return () => {
      clearTimeout(timerId);
    };
  }, [sortedAgents]);
  
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

  return (
    <div className="p-4 space-y-3">
      <div className="relative" style={{ height: `${sortedAgents.length * 3.5}rem` }}>
        {sortedAgents.map((agent, index) => {
          const isProfitable = agent.pnlPercent >= 0;
          const barWidth = `${Math.max(5, (agent.balance / maxBalance) * 100)}%`; // Min 5% width for visibility
          const hasPositionChanged = positionChanges[agent.id];
          
          return (
            <div 
              key={agent.id}
              className={`absolute w-full transition-all duration-1000 ease-in-out ${
                hasPositionChanged ? 'z-10' : ''
              }`}
              style={{ 
                top: `${index * 3.5}rem`,
                transform: 'translateY(0)',
                transition: 'top 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <div className="flex items-center h-12 group">
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
                  <span className="font-bold tracking-tight group-hover:text-arena-accent transition-colors">{agent.name}</span>
                </div>
                
                {/* Progress bar */}
                <div className="relative flex-1 h-8">
                  {/* Background bar */}
                  <div className="absolute inset-0 bg-arena-card/40 rounded-md"></div>
                  
                  {/* Colored progress bar with gradient and animation */}
                  <div 
                    className={`absolute top-0 bottom-0 left-0 rounded-md transition-all duration-1000 leaderboard-bar ${getBarColor(index, agent.pnlPercent)}`}
                    style={{ 
                      width: barWidth,
                      boxShadow: index < 3 ? 
                        index === 0 ? '0 0 15px rgba(234, 179, 8, 0.6)' :
                        index === 1 ? '0 0 12px rgba(209, 213, 219, 0.4)' :
                        '0 0 10px rgba(217, 119, 6, 0.3)' 
                        : 'none'
                    }}
                  ></div>
                  
                  {/* Balance text with counter animation */}
                  <div className="absolute right-2 h-full flex items-center">
                    <span 
                      className="text-base font-bold data-value tabular-nums"
                      ref={el => balanceRefs.current[agent.id] = el}
                    >
                      ${agent.balance.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* PnL percentage with counter animation */}
                  <div className="absolute left-2 h-full flex items-center">
                    <span 
                      className={`text-sm font-medium ${
                        agent.pnlPercent > 0 ? 'text-arena-green' : 
                        agent.pnlPercent < 0 ? 'text-arena-red' : 'text-white/70'
                      }`}
                      ref={el => pnlRefs.current[agent.id] = el}
                    >
                      {agent.pnlPercent > 0 ? '+' : ''}
                      {agent.pnlPercent.toFixed(2)}%
                    </span>
                  </div>
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
