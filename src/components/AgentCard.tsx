
import React from 'react';
import { ArrowUp, ArrowDown, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { CountUp } from 'countup.js';

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
  const balanceRef = React.useRef<HTMLSpanElement | null>(null);
  const pnlRef = React.useRef<HTMLSpanElement | null>(null);
  
  React.useEffect(() => {
    if (balanceRef.current) {
      const countUp = new CountUp(balanceRef.current, balance, {
        duration: 1.5,
        separator: ',',
        decimal: '.',
        prefix: '$',
        decimalPlaces: 0
      });
      countUp.start();
    }
    
    if (pnlRef.current && pnlPercent !== 0) {
      const pnlCountUp = new CountUp(pnlRef.current, Math.abs(pnlPercent), {
        duration: 1.5,
        separator: ',',
        decimal: '.',
        decimalPlaces: 2,
        suffix: '%',
        prefix: pnlPercent > 0 ? '+' : '-'
      });
      pnlCountUp.start();
    }
  }, [balance, pnlPercent]);

  const isProfitable = pnlPercent > 0;
  
  return (
    <div 
      className="cyber-frame relative overflow-hidden animate-scale-in glass-neo" 
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Position indicator */}
      {position && (
        <div className={`absolute top-0 right-0 h-16 w-1 ${position === 'long' ? 'bg-arena-green' : 'bg-arena-red'}`}></div>
      )}
      
      {/* Glowing corners with animation */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-arena-accent rounded-full opacity-75 blur-[2px] animate-pulse-glow"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-arena-accent2 rounded-full opacity-75 blur-[2px] animate-pulse-glow"></div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-md bg-gradient-to-br from-arena-accent/20 to-arena-accent2/20 flex items-center justify-center border border-white/5 shadow-lg">
              <span className="text-3xl accent-glow">{avatar}</span>
            </div>
            {position && (
              <div className={`absolute -bottom-2 -right-2 h-7 w-7 rounded-full flex items-center justify-center shadow-lg
                ${position === 'long' ? 'bg-arena-green' : 'bg-arena-red'}`}>
                {position === 'long' ? 
                  <TrendingUp className="h-4 w-4 text-white" /> : 
                  <TrendingDown className="h-4 w-4 text-white" />}
              </div>
            )}
          </div>
          
          <div className="ml-3">
            <h3 className="font-bold text-lg">{name}</h3>
            <div className="text-sm text-arena-textMuted flex items-center">
              <Zap className="h-3 w-3 mr-1" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-arena-accent to-arena-accent2">AI Trading Agent</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-arena-textMuted">Balance:</span>
            <span className="font-mono font-medium tabular-nums" ref={balanceRef}>
              ${balance.toLocaleString()}
            </span>
          </div>
          
          {position && (
            <div className="flex justify-between text-sm">
              <span className="text-arena-textMuted">Position Size:</span>
              <span className="font-medium font-mono tabular-nums">${positionSize.toLocaleString()}</span>
            </div>
          )}
          
          {pnlPercent !== 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-arena-textMuted">P&L:</span>
              <span 
                className={`font-medium font-mono tabular-nums ${isProfitable ? 'text-arena-green' : 'text-arena-red'}`}
                ref={pnlRef}
              >
                {isProfitable ? '+' : '-'}{Math.abs(pnlPercent).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full ${isProfitable ? 'bg-gradient-to-r from-arena-green to-arena-green/70' : 'bg-gradient-to-r from-arena-red to-arena-red/70'} transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min(Math.max(50 + pnlPercent, 5), 100)}%` }}
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
