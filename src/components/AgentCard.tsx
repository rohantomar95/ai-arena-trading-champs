
import React from 'react';
import { ArrowUp, ArrowDown, Zap } from 'lucide-react';

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
  
  return (
    <div 
      className="glass-card relative overflow-hidden animate-scale-in" 
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Position indicator */}
      {position && (
        <div className={`absolute top-0 right-0 h-16 w-1 ${position === 'long' ? 'bg-arena-green' : 'bg-arena-red'}`}></div>
      )}
      
      {/* Glowing corners */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-arena-accent rounded-full opacity-75 blur-[2px]"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-arena-accent2 rounded-full opacity-75 blur-[2px]"></div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-md bg-gradient-to-br from-arena-accent/20 to-arena-accent2/20 flex items-center justify-center">
              <span className="text-3xl">{avatar}</span>
            </div>
            {position && (
              <div className={`absolute -bottom-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center
                ${position === 'long' ? 'bg-arena-green' : 'bg-arena-red'}`}>
                {position === 'long' ? 
                  <ArrowUp className="h-4 w-4 text-white" /> : 
                  <ArrowDown className="h-4 w-4 text-white" />}
              </div>
            )}
          </div>
          
          <div className="ml-3">
            <h3 className="font-bold text-lg">{name}</h3>
            <div className="text-sm text-arena-textMuted flex items-center">
              <Zap className="h-3 w-3 mr-1" />
              AI Trading Agent
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
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
      
      {/* Neon bottom border */}
      <div className="h-0.5 w-full bg-gradient-to-r from-arena-accent to-arena-accent2 opacity-70"></div>
    </div>
  );
};

export default AgentCard;
