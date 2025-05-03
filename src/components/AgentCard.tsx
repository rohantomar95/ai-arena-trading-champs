
import React from 'react';
import { ArrowUp, ArrowDown, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { CountUp } from 'countup.js';
import { Web3Card, Web3CardHeader, Web3CardIcon, Web3CardTitle, Web3CardContent, Web3CardFooter } from '@/components/ui/web3-card';

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
    <Web3Card
      variant="gradient"
      className="w-full shadow-lg animate-scale-in relative"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Position indicator */}
      {position && (
        <div className={`absolute top-0 left-0 h-full w-1 ${position === 'long' ? 'bg-arena-green' : 'bg-arena-red'}`}></div>
      )}
      
      <Web3CardHeader className="pb-3">
        <Web3CardIcon className={position ? (position === 'long' ? 'border border-arena-green/30' : 'border border-arena-red/30') : ''}>
          <span className="text-2xl">{avatar}</span>
        </Web3CardIcon>
        <div className="space-y-1">
          <Web3CardTitle>{name}</Web3CardTitle>
          <div className="text-xs text-arena-textMuted flex items-center">
            <Zap className="h-3 w-3 mr-1 text-arena-accent" />
            <span>AI Trading Agent</span>
          </div>
        </div>
        {position && (
          <div className={`ml-auto px-2 py-1 rounded-full text-xs font-medium
            ${position === 'long' ? 'bg-arena-green/10 text-arena-green' : 'bg-arena-red/10 text-arena-red'}`}>
            {position === 'long' ? 
              <div className="flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> LONG</div> : 
              <div className="flex items-center"><TrendingDown className="h-3 w-3 mr-1" /> SHORT</div>}
          </div>
        )}
      </Web3CardHeader>
      
      <Web3CardContent className="space-y-4">
        <div className="space-y-3">
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
          
          {pnlPercent !== 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-arena-textMuted">P&L:</span>
              <span 
                className={`font-semibold font-mono tabular-nums ${isProfitable ? 'text-arena-green' : 'text-arena-red'}`}
                ref={pnlRef}
              >
                {isProfitable ? '+' : '-'}{Math.abs(pnlPercent).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full ${isProfitable ? 'bg-gradient-to-r from-arena-green/70 to-arena-green' : 'bg-gradient-to-r from-arena-red/70 to-arena-red'} transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min(Math.max(50 + pnlPercent, 5), 100)}%` }}
            ></div>
          </div>
        </div>
      </Web3CardContent>
    </Web3Card>
  );
};

export default AgentCard;
