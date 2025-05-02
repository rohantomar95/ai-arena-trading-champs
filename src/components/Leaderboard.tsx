import React, { useState, useEffect, useRef } from 'react';

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
  
  // On first render, initialize previous positions
  useEffect(() => {
    const positions: {[key: string]: number} = {};
    sortedAgents.forEach((agent, index) => {
      positions[agent.id] = index;
    });
    previousPositionsRef.current = positions;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Check for position changes
  useEffect(() => {
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
      previousPositionsRef.current = currentPositions;
    }
  }, [sortedAgents, isAnimating]);
  
  // Calculate the maximum balance for scaling bars
  const maxBalance = Math.max(...sortedAgents.map(a => a.balance));
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Get color for the bar based on index and profit/loss
  const getBarColor = (index: number, pnlPercent: number) => {
    // Top 3 get special colors
    if (index === 0) return 'bg-gradient-to-r from-yellow-500 to-yellow-300';
    if (index === 1) return 'bg-gradient-to-r from-gray-300 to-gray-200';
    if (index === 2) return 'bg-gradient-to-r from-amber-700 to-amber-600';
    
    // Others based on profit/loss
    if (pnlPercent > 0) return 'bg-gradient-to-r from-arena-green/80 to-arena-green/60';
    if (pnlPercent < 0) return 'bg-gradient-to-r from-arena-red/80 to-arena-red/60';
    
    // Neutral
    return 'bg-gradient-to-r from-blue-900 to-blue-800';
  };

  return (
    <div className="p-4 space-y-3">
      {sortedAgents.map((agent, index) => {
        const isProfitable = agent.pnlPercent >= 0;
        const barWidth = `${Math.max(5, (agent.balance / maxBalance) * 100)}%`; // Min 5% width for visibility
        const hasPositionChanged = positionChanges[agent.id];
        
        return (
          <div 
            key={agent.id}
            className={`relative ${
              isAnimating ? 'animate-shuffle' : 'transition-all duration-1000 ease-out'
            } ${hasPositionChanged ? 'position-changed' : ''}`}
            style={{ 
              animationDuration: '0.8s', 
              animationDelay: `${index * 0.05}s` 
            }}
          >
            <div className="flex items-center h-12">
              {/* Position rank */}
              <div className="w-8 flex justify-center items-center">
                <span className={`font-mono font-bold text-lg ${index < 3 ? 'text-yellow-400' : 'text-white/70'}`}>
                  {index + 1}
                </span>
              </div>
              
              {/* Agent name */}
              <div className="w-1/4 flex items-center gap-2">
                <div className="h-8 w-8 flex items-center justify-center text-base bg-arena-bg/70 rounded-full">
                  {agent.avatar}
                </div>
                <span className="font-bold tracking-tight">{agent.name}</span>
              </div>
              
              {/* Progress bar */}
              <div className="relative flex-1 h-6">
                {/* Background bar */}
                <div className="absolute inset-0 bg-arena-card/40 rounded-md"></div>
                
                {/* Colored progress bar */}
                <div 
                  className={`absolute top-0 bottom-0 left-0 rounded-md transition-all duration-1000 leaderboard-bar ${getBarColor(index, agent.pnlPercent)}`}
                  style={{ 
                    width: barWidth,
                    boxShadow: index < 3 ? '0 0 15px rgba(234, 179, 8, 0.5)' : 'none'
                  }}
                ></div>
                
                {/* Balance text */}
                <div className="absolute right-2 h-full flex items-center">
                  <span className="text-base font-bold data-value">
                    {formatCurrency(agent.balance)}
                  </span>
                </div>
                
                {/* PnL percentage */}
                <div className="absolute left-2 h-full flex items-center">
                  <span className={`text-xs font-medium ${
                    agent.pnlPercent > 0 ? 'text-arena-green' : 
                    agent.pnlPercent < 0 ? 'text-arena-red' : 'text-white/70'
                  }`}>
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
  );
};

export default Leaderboard;
