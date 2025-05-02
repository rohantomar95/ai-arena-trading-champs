
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
    <div className="glass-card animate-fade-in">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold">Leaderboard</h2>
      </div>
      
      <div className="p-2">
        {sortedAgents.map((agent, index) => {
          const pnl = calculatePnL(agent.balance, agent.initialBalance);
          const isProfitable = pnl >= 0;
          
          return (
            <div 
              key={agent.id}
              className={`p-3 border-b border-white/5 flex items-center gap-3 ${
                isAnimating ? 'animate-shuffle' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-lg font-bold text-arena-textMuted w-6">
                {index + 1}
              </div>
              
              <div className="h-8 w-8 rounded-md bg-arena-card flex items-center justify-center">
                <span className="text-lg">{agent.avatar}</span>
              </div>
              
              <div className="flex-1">
                <div className="font-medium">{agent.name}</div>
                <div className="text-sm text-arena-textMuted">
                  {agent.position && (
                    <span className={`${agent.position === 'long' ? 'text-arena-green' : 'text-arena-red'}`}>
                      {agent.position.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium">{formatCurrency(agent.balance)}</div>
                <div className={`text-sm flex items-center justify-end ${isProfitable ? 'text-arena-green' : 'text-arena-red'}`}>
                  {isProfitable ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {isProfitable ? '+' : ''}{pnl.toFixed(2)}%
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
