
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Trophy, Medal } from 'lucide-react';

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

  return (
    <div className="p-4 space-y-3">
      {sortedAgents.map((agent, index) => {
        const pnl = calculatePnL(agent.balance, agent.initialBalance);
        const isProfitable = pnl >= 0;
        const barWidth = `${(agent.balance / maxBalance) * 95}%`; // Keep max at 95% for padding
        
        // Choose medal for top 3
        const renderRank = () => {
          if (index === 0) return <Trophy className="h-5 w-5 text-yellow-400" />;
          if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
          if (index === 2) return <Medal className="h-5 w-5 text-amber-700" />;
          return <span className="text-lg font-bold text-arena-textMuted w-6 text-center">{index + 1}</span>;
        };
        
        return (
          <div 
            key={agent.id}
            className={`relative ${
              isAnimating ? 'animate-shuffle' : 'transition-all duration-1000'
            }`}
            style={{ 
              animationDuration: '0.8s', 
              animationDelay: `${index * 0.05}s` 
            }}
          >
            {/* Background bar */}
            <div className="absolute inset-0 h-16 bg-arena-card/40 rounded-lg" />
            
            {/* Progress bar */}
            <div 
              className={`absolute top-0 bottom-0 left-0 rounded-lg transition-all duration-1000 ease-out ${
                isProfitable ? 'bg-gradient-to-r from-arena-green/20 to-arena-green/5' : 'bg-gradient-to-r from-arena-red/20 to-arena-red/5'
              }`}
              style={{ 
                width: barWidth,
                boxShadow: isProfitable ? '0 0 10px rgba(18, 209, 142, 0.3)' : '0 0 10px rgba(248, 73, 96, 0.3)'
              }}
            />
            
            {/* Content */}
            <div className="relative flex items-center h-16 px-4">
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-arena-bg mr-3">
                {renderRank()}
              </div>
              
              {/* Avatar */}
              <div className="h-10 w-10 rounded-md bg-gradient-to-br from-arena-accent/30 to-arena-accent2/30 flex items-center justify-center mr-3">
                <span className="text-2xl">{agent.avatar}</span>
              </div>
              
              {/* Agent info */}
              <div className="flex-1">
                <div className="font-medium text-white">{agent.name}</div>
                <div className="text-sm flex items-center">
                  {agent.position && (
                    <span className={`mr-2 ${agent.position === 'long' ? 'text-arena-green' : 'text-arena-red'}`}>
                      {agent.position.toUpperCase()}
                    </span>
                  )}
                  <span className={`flex items-center ${isProfitable ? 'text-arena-green' : 'text-arena-red'}`}>
                    {isProfitable ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {isProfitable ? '+' : ''}{pnl.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              {/* Balance */}
              <div className="text-right">
                <div className="font-bold text-lg">{formatCurrency(agent.balance)}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Leaderboard;
