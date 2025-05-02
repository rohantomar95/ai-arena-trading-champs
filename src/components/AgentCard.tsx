
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface AgentCardProps {
  name: string;
  balance: number;
  position?: 'long' | 'short' | null;
  positionSize?: number;
  avatar: string;
  index: number;
  pnlPercent?: number;
}

const AgentCard: React.FC<AgentCardProps> = ({ 
  name, 
  balance, 
  position, 
  positionSize = 0,
  avatar,
  index,
  pnlPercent = 0
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const isProfitable = pnlPercent > 0;
  const avatarBg = `bg-gradient-to-br ${index % 2 === 0 ? 'from-arena-accent/30 to-arena-accent2/30' : 'from-arena-accent2/30 to-arena-accent/30'}`;
  
  return (
    <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="flex items-center mb-4">
        <div className={`h-12 w-12 rounded-md ${avatarBg} flex items-center justify-center mr-3`}>
          <span className="text-2xl">{avatar}</span>
        </div>
        <div>
          <h3 className="font-bold text-lg">{name}</h3>
          <div className="text-sm text-arena-textMuted">AI Trading Agent</div>
        </div>
        <div className="ml-auto">
          {position && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium 
              ${position === 'long' ? 'bg-arena-green/20 text-arena-green' : 'bg-arena-red/20 text-arena-red'}`}>
              {position.toUpperCase()}
              {position === 'long' ? 
                <ArrowUp className="inline ml-1 h-4 w-4" /> : 
                <ArrowDown className="inline ml-1 h-4 w-4" />}
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-arena-textMuted">Balance:</span>
          <span className="font-medium">{formatCurrency(balance)}</span>
        </div>
        
        {position && (
          <div className="flex justify-between text-sm">
            <span className="text-arena-textMuted">Position Size:</span>
            <span className="font-medium">{formatCurrency(positionSize)}</span>
          </div>
        )}
        
        {pnlPercent !== 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-arena-textMuted">P&L:</span>
            <span className={`font-medium ${isProfitable ? 'text-arena-green' : 'text-arena-red'}`}>
              {isProfitable ? '+' : ''}{pnlPercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full ${isProfitable ? 'bg-arena-green' : 'bg-arena-red'} transition-all duration-1000 ease-out`}
            style={{ width: `${Math.min(Math.max(50 + pnlPercent, 0), 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
