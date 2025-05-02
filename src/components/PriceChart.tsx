
import React, { useEffect, useRef, useState } from 'react';
import { 
  LineChart, 
  Line,
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Bar
} from 'recharts';
import { ChevronDown, TrendingUp, History, CandlestickChart } from 'lucide-react';

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

// Custom candle component
const CustomCandle = (props: any) => {
  const { x, y, width, height, open, close } = props;
  const isGreen = close > open;
  
  const candleColor = isGreen ? "#11E7DA" : "#ea384c";
  const wickColor = isGreen ? "#11E7DA" : "#ea384c";
  
  return (
    <g>
      {/* Wick (the thin vertical line) */}
      <line 
        x1={x + width / 2} 
        y1={y} 
        x2={x + width / 2} 
        y2={y + height} 
        stroke={wickColor} 
        strokeWidth={1} 
      />
      
      {/* Body (the thicker rectangle) */}
      <rect 
        x={x + width / 4} 
        y={isGreen ? y + height / 2 : y} 
        width={width / 2} 
        height={height / 2} 
        fill={candleColor} 
        opacity={0.9}
      />
    </g>
  );
};

const PriceChart: React.FC<PriceChartProps> = ({ 
  candles, 
  onCandleReveal,
  isRevealing = false,
  currentRound
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [chartType, setChartType] = useState<'line' | 'candle'>('candle');
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
  const chartData = React.useMemo(() => {
    return candles
      .filter(candle => candle.revealed)
      .map((candle, index) => ({
        name: `#${index + 1}`,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        price: candle.close,
        volume: candle.volume,
        color: candle.close > candle.open ? "#11E7DA" : "#ea384c",
        gain: candle.close > candle.open ? candle.close - candle.open : 0,
        loss: candle.close <= candle.open ? candle.open - candle.close : 0,
      }));
  }, [candles]);

  // Calculate trendline data
  const trendlineData = React.useMemo(() => {
    if (chartData.length < 2) return [];
    
    const prices = chartData.map(d => d.close);
    const xValues = Array.from({ length: prices.length }, (_, i) => i);
    
    // Calculate trendline using least-squares method
    const n = prices.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = prices.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((a, b, i) => a + b * prices[i], 0);
    const sumXX = xValues.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return chartData.map((_, i) => intercept + slope * i);
  }, [chartData]);

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
        volume: candle.volume,
        color: candle.close > candle.open ? "#11E7DA" : "#ea384c",
      }));
  };

  // Calculate min and max values for scaling
  const revealedCandles = candles.filter(candle => candle.revealed);
  const prices = revealedCandles.flatMap(candle => [candle.high, candle.low]);
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const minPrice = prices.length ? Math.min(...prices) : 0;
  
  // Format tooltip
  const formatPrice = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const priceChange = data.close - data.open;
      const percentChange = (priceChange / data.open) * 100;
      const isPositive = priceChange >= 0;
      
      return (
        <div className="bg-arena-card/90 backdrop-blur-md p-3 border border-white/10 rounded-md shadow-xl">
          <p className="text-arena-textMuted font-medium">{label}</p>
          <div className="space-y-1 mt-1">
            <p className="flex justify-between text-sm">
              <span className="text-arena-textMuted mr-3">Open:</span>
              <span className="font-mono">${data.open.toFixed(2)}</span>
            </p>
            <p className="flex justify-between text-sm">
              <span className="text-arena-textMuted mr-3">High:</span>
              <span className="font-mono">${data.high.toFixed(2)}</span>
            </p>
            <p className="flex justify-between text-sm">
              <span className="text-arena-textMuted mr-3">Low:</span>
              <span className="font-mono">${data.low.toFixed(2)}</span>
            </p>
            <p className="flex justify-between text-sm">
              <span className="text-arena-textMuted mr-3">Close:</span>
              <span className="font-mono">${data.close.toFixed(2)}</span>
            </p>
            <div className="border-t border-white/10 my-1 pt-1"></div>
            <p className="flex justify-between text-sm">
              <span className="text-arena-textMuted mr-3">Change:</span>
              <span className={`font-mono ${isPositive ? 'text-arena-green' : 'text-arena-red'}`}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative h-[400px] w-full glass-card p-4 backdrop-blur-md animate-fade-in">
      <div className="absolute top-3 left-4 z-10">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-white">
            <span className="neon-text">ETH/USD</span>
          </div>
          <div className="px-2 py-0.5 bg-arena-accent/20 text-arena-accent text-xs font-medium rounded-full">
            Round {currentRound}/5
          </div>
        </div>
        <div className="text-sm text-arena-textMuted mt-1">
          {revealedCandles.length > 0 && 
            `${formatPrice(revealedCandles[revealedCandles.length-1].close)}`}
        </div>
      </div>
      
      <div className="absolute top-3 right-4 z-10 flex items-center gap-3">
        <div className="text-sm text-arena-textMuted">
          <span className="inline-block w-2 h-2 rounded-full bg-arena-accent animate-pulse mr-1"></span>
          Revealed: {revealedCandles.length}/{candles.length}
        </div>
        
        <div className="flex items-center rounded-lg overflow-hidden border border-white/10 text-xs">
          <button
            onClick={() => setChartType('line')}
            className={`px-2 py-1 flex items-center ${chartType === 'line' 
              ? 'bg-arena-accent text-black font-medium' 
              : 'bg-arena-card hover:bg-white/5'}`}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Line
          </button>
          <button
            onClick={() => setChartType('candle')}
            className={`px-2 py-1 flex items-center ${chartType === 'candle' 
              ? 'bg-arena-accent text-black font-medium' 
              : 'bg-arena-card hover:bg-white/5'}`}
          >
            <CandlestickChart className="h-3 w-3 mr-1" />
            Candle
          </button>
        </div>
        
        {roundHistory.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-2 py-1 text-xs font-medium rounded-lg flex items-center
              ${showHistory 
                ? 'bg-arena-accent/50 text-white' 
                : 'bg-arena-accent/20 text-arena-accent hover:bg-arena-accent/30'} 
              transition-colors`}
          >
            <History className="h-3 w-3 mr-1" />
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        )}
      </div>
      
      <div className="pt-16 h-full">
        {revealedCandles.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#11E7DA" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#11E7DA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  tickFormatter={formatPrice}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#11E7DA"
                  strokeWidth={0}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
                
                {/* Main price line */}
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
                
                {/* Trendline */}
                {trendlineData.length > 0 && (
                  <Line
                    data={chartData.map((point, i) => ({
                      ...point,
                      trendline: trendlineData[i]
                    }))}
                    type="monotone"
                    dataKey="trendline"
                    stroke="#9b87f5"
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    dot={false}
                    activeDot={false}
                  />
                )}
                
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
              </ComposedChart>
            ) : (
              <ComposedChart 
                data={chartData} 
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
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
                  tickFormatter={formatPrice}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                
                {/* Volume bars */}
                <Bar 
                  dataKey="volume" 
                  barSize={20} 
                  fill="rgba(255,255,255,0.1)" 
                  yAxisId="volume" 
                  shape={<CustomCandle />}
                />
                
                {/* Candlesticks using custom shape */}
                <Bar 
                  dataKey={d => Math.abs(d.high - d.low)} 
                  fill="transparent"
                  stroke={(d) => d.close >= d.open ? "#11E7DA" : "#ea384c"}
                  shape={<CustomCandle />}
                />
                
                {/* Line connecting price points */}
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#9b87f5"
                  strokeWidth={1.5}
                  dot={{ stroke: '#9b87f5', strokeWidth: 1, r: 2, fill: 'rgba(155, 135, 245, 0.2)' }}
                  activeDot={false}
                />
                
                {/* Trendline */}
                {trendlineData.length > 0 && (
                  <Line
                    data={chartData.map((point, i) => ({
                      ...point,
                      trendline: trendlineData[i]
                    }))}
                    type="monotone"
                    dataKey="trendline"
                    stroke="#9b87f5"
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    dot={false}
                    activeDot={false}
                  />
                )}
                
                {/* Show history data if enabled */}
                {showHistory && roundHistory
                  .filter(item => item.round !== currentRound)
                  .map(item => (
                    <Line
                      key={`history-${item.round}`}
                      type="monotone"
                      data={getHistoryChartData(item.round)}
                      dataKey="price"
                      stroke={`rgba(255, 255, 255, ${0.15 + (item.round * 0.15)})`}
                      strokeWidth={1}
                      dot={false}
                      activeDot={false}
                      name={`Round ${item.round}`}
                    />
                  ))
                }
              </ComposedChart>
            )}
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
