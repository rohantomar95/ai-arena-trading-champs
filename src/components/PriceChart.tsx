
import React, { useEffect, useRef, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { 
  LineChart, 
  Line,
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
  revealed: boolean;
}

interface PriceChartProps {
  candles: CandleData[];
  onCandleReveal?: (index: number) => void;
  isRevealing?: boolean;
  currentRound: number;
}

interface RoundHistoryEntry {
  round: number;
  candles: CandleData[];
}

const PriceChart: React.FC<PriceChartProps> = ({ 
  candles, 
  onCandleReveal,
  isRevealing = false,
  currentRound
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [roundHistory, setRoundHistory] = useState<RoundHistoryEntry[]>([]);
  
  // When round changes and candles are revealed, store them in history
  useEffect(() => {
    const revealedCount = candles.filter(c => c.revealed).length;
    if (revealedCount > 0 && revealedCount === candles.length) {
      // Round is complete, store in history
      setRoundHistory(prev => {
        // Check if this round is already in history
        const roundExists = prev.some(item => item.round === currentRound);
        if (roundExists) return prev;
        
        return [...prev, {
          round: currentRound,
          candles: [...candles]
        }];
      });
    }
  }, [candles, currentRound]);

  useEffect(() => {
    if (isRevealing && onCandleReveal) {
      const revealedCount = candles.filter(c => c.revealed).length;
      if (revealedCount < candles.length) {
        const timeout = setTimeout(() => {
          onCandleReveal(revealedCount);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [candles, isRevealing, onCandleReveal]);

  // Transform candle data for Recharts
  const chartData = useMemo(() => {
    return candles
      .filter(candle => candle.revealed)
      .map((candle, index) => ({
        name: `#${index + 1}`,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        price: candle.close,
      }));
  }, [candles]);

  // Get history chart data for a specific round
  const getHistoryChartData = (round: number) => {
    const roundData = roundHistory.find(item => item.round === round);
    if (!roundData) return [];
    
    return roundData.candles
      .filter(candle => candle.revealed)
      .map((candle, index) => ({
        name: `#${index + 1}`,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        price: candle.close,
      }));
  };

  // Calculate min and max values for scaling
  const revealedCandles = candles.filter(candle => candle.revealed);
  const prices = revealedCandles.flatMap(candle => [candle.high, candle.low]);
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const minPrice = prices.length ? Math.min(...prices) : 0;
  
  // Format tooltip
  const formatTooltip = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="relative h-[400px] w-full glass-card p-4 backdrop-blur-md animate-fade-in">
      <div className="absolute top-3 left-4 z-10">
        <div className="text-xl font-bold text-white">
          <span className="neon-text">ETH/USD</span>
        </div>
        <div className="text-sm text-arena-textMuted">
          Round {currentRound}/5
        </div>
      </div>
      
      <div className="absolute top-3 right-4 z-10 flex items-center gap-3">
        <div className="text-sm text-arena-textMuted">
          Revealed: {revealedCandles.length}/{candles.length} candles
        </div>
        
        {roundHistory.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3 py-1 text-xs font-medium rounded-full bg-arena-accent/20 text-arena-accent hover:bg-arena-accent/30 transition-colors"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        )}
      </div>
      
      <div className="pt-12 h-full">
        {revealedCandles.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <YAxis 
                domain={['auto', 'auto']}
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
                tickFormatter={formatTooltip}
              />
              <RechartsTooltip
                formatter={formatTooltip}
                contentStyle={{ 
                  backgroundColor: 'rgba(30, 30, 40, 0.9)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: 'white'
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#11E7DA"
                strokeWidth={2}
                dot={{ stroke: '#11E7DA', strokeWidth: 2, r: 4, fill: 'rgba(17, 231, 218, 0.2)' }}
                activeDot={{ stroke: '#FFFFFF', strokeWidth: 2, r: 6, fill: '#11E7DA' }}
                animationDuration={1000}
                className="accent-glow"
              />
              
              {/* Show history lines if enabled */}
              {showHistory && roundHistory
                .filter(item => item.round !== currentRound) // Don't show current round in history
                .map(item => (
                  <Line
                    key={`history-${item.round}`}
                    type="monotone"
                    data={getHistoryChartData(item.round)}
                    dataKey="price"
                    stroke={`rgba(255, 255, 255, ${0.15 + (item.round * 0.15)})`} // Increasing opacity for newer rounds
                    strokeWidth={1}
                    dot={false}
                    activeDot={false}
                    name={`Round ${item.round}`}
                  />
                ))
              }
            </LineChart>
          </ResponsiveContainer>
        ) : (
          // Display empty state with placeholders
          <div className="h-full w-full flex items-end gap-2 mt-12">
            {candles.map((_, index) => (
              <div 
                key={`candle-${index}`}
                className="flex-1 h-[80%] flex flex-col items-center justify-end px-1"
              >
                <div 
                  className="w-6 h-24 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center animate-pulse-glow"
                >
                  <span className="text-xs text-white/50 font-mono">?</span>
                </div>
                <div className="text-xs text-white/30 mt-1">#{index+1}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceChart;

// Create a custom hook to memoize chart data transformation
function useMemo<T>(factory: () => T, dependencies: React.DependencyList): T {
  const [state, setState] = useState<T>(factory);

  useEffect(() => {
    const newState = factory();
    setState(newState);
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
