
import React, { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  balance: number;
  initialBalance: number;
  avatar: string;
  position?: 'long' | 'short' | null;
  positionSize?: number;
}

interface LeaderboardProps {
  agents: Agent[];
  isAnimating?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ agents, isAnimating = false }) => {
  // Sort by balance descending
  const sortedAgents = [...agents].sort((a, b) => b.balance - a.balance);
  
  // Calculate the maximum balance for scaling bars
  const maxBalance = Math.max(...sortedAgents.map(a => a.balance));
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const calculatePnL = (current: number, initial: number) => {
    return ((current - initial) / initial) * 100;
  };
  
  // Get color for the bar based on index
  const getBarColor = (index: number) => {
    // Top 3 get gold color
    if (index < 3) return 'bg-gradient-to-r from-yellow-600 to-yellow-500';
    // Next 3 get blue
    if (index < 6) return 'bg-gradient-to-r from-blue-900 to-blue-800';
    // Last ones get red
    return 'bg-gradient-to-r from-red-900 to-red-800';
  };

  return (
    <div className="p-4 space-y-3">
      {sortedAgents.map((agent, index) => {
        const pnl = calculatePnL(agent.balance, agent.initialBalance);
        const isProfitable = pnl >= 0;
        const barWidth = `${Math.max(5, (agent.balance / maxBalance) * 100)}%`; // Min 5% width for visibility
        
        return (
          <div 
            key={agent.id}
            className={`relative ${
              isAnimating ? 'animate-shuffle' : 'transition-all duration-1000 ease-out'
            }`}
            style={{ 
              animationDuration: '0.8s', 
              animationDelay: `${index * 0.05}s` 
            }}
          >
            <div className="flex items-center h-12">
              {/* Agent name on the left */}
              <div className="w-1/4 text-right pr-4 font-bold tracking-tight">
                {agent.name}
              </div>
              
              {/* Bar container */}
              <div className="relative flex-1 h-8">
                {/* Background bar */}
                <div className="absolute inset-0 bg-arena-card/40 rounded-md"></div>
                
                {/* Colored progress bar */}
                <div 
                  className={`absolute top-0 bottom-0 left-0 rounded-md transition-all duration-1000 ${getBarColor(index)}`}
                  style={{ 
                    width: barWidth,
                    boxShadow: index < 3 ? '0 0 15px rgba(234, 179, 8, 0.5)' : 'none'
                  }}
                ></div>
                
                {/* Balance text */}
                <div className="absolute right-2 h-full flex items-center">
                  <span className="text-lg font-bold">
                    {formatCurrency(agent.balance)}
                  </span>
                </div>
                
                {/* Avatar */}
                <div className="absolute left-2 h-full flex items-center">
                  <div className="h-6 w-6 flex items-center justify-center text-base bg-arena-bg/70 rounded-full">
                    {agent.avatar}
                  </div>
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
