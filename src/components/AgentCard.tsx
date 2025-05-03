
import React from 'react';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
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
    <div className="relative h-full">
      {/* Position indicator */}
      <div 
        className={`absolute top-0 left-0 h-full w-1 rounded-l-xl ${
          position === 'long' ? 'bg-arena-green' : 
          position === 'short' ? 'bg-arena-red' : 
          'bg-transparent'
        }`}
      ></div>
      
      <div className="rounded-xl border border-white/10 bg-arena-card/70 backdrop-blur-sm shadow-lg h-full flex flex-col">
        <div className="p-4 flex items-center gap-3 border-b border-white/5">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${
            position ? (position === 'long' ? 'bg-arena-green/10 border border-arena-green/30' : 'bg-arena-red/10 border border-arena-red/30') : 'bg-white/5 border border-white/10'
          }`}>
            {avatar}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white truncate">{name}</h3>
            <div className="flex items-center text-xs text-arena-textMuted">
              <Zap className="h-3 w-3 mr-1 text-arena-accent" />
              <span className="truncate">Trading Bot</span>
            </div>
          </div>
          
          {position && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium shrink-0
              ${position === 'long' ? 'bg-arena-green/10 text-arena-green' : 'bg-arena-red/10 text-arena-red'}`}>
              {position === 'long' ? 
                <div className="flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> LONG</div> : 
                <div className="flex items-center"><TrendingDown className="h-3 w-3 mr-1" /> SHORT</div>}
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-arena-textMuted">Balance:</span>
              <span className="font-mono font-semibold tabular-nums" ref={balanceRef}>
                ${balance.toLocaleString()}
              </span>
            </div>
            
            {position && (
              <div className="flex justify-between text-sm">
                <span className="text-arena-textMuted">Position Size:</span>
                <span className="font-semibold font-mono tabular-nums">${positionSize.toLocaleString()}</span>
              </div>
            )}
          </div>
          
          {pnlPercent !== 0 && (
            <div className="mt-auto pt-2">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-arena-textMuted">P&L:</span>
                <span 
                  className={`font-semibold font-mono tabular-nums ${isProfitable ? 'text-arena-green' : 'text-arena-red'}`}
                  ref={pnlRef}
                >
                  {isProfitable ? '+' : '-'}{Math.abs(pnlPercent).toFixed(2)}%
                </span>
              </div>
              
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    isProfitable ? 'bg-gradient-to-r from-arena-green/70 to-arena-green' : 'bg-gradient-to-r from-arena-red/70 to-arena-red'
                  } transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.min(Math.max(50 + pnlPercent, 5), 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
