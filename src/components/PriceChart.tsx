
import React, { useEffect, useRef } from 'react';

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

const PriceChart: React.FC<PriceChartProps> = ({ 
  candles, 
  onCandleReveal,
  isRevealing = false,
  currentRound
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

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

  // Calculate min and max values for scaling
  const revealedCandles = candles.filter(candle => candle.revealed);
  const prices = revealedCandles.flatMap(candle => [candle.high, candle.low]);
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const priceRange = maxPrice - minPrice;
  
  // Add padding to price range
  const paddedMin = minPrice - priceRange * 0.1;
  const paddedMax = maxPrice + priceRange * 0.1;
  const adjustedRange = paddedMax - paddedMin;

  // Scale function to convert price to pixel position
  const scalePrice = (price: number): number => {
    if (adjustedRange === 0) return 50; // Default middle position
    return 100 - ((price - paddedMin) / adjustedRange) * 100;
  };

  return (
    <div className="relative h-[400px] w-full glass-card p-4 backdrop-blur-md animate-fade-in">
      <div className="absolute top-3 left-4">
        <div className="text-xl font-bold text-white">
          <span className="neon-text">ETH/USD</span>
        </div>
        <div className="text-sm text-arena-textMuted">
          Round {currentRound}/5
        </div>
      </div>
      
      <div className="absolute top-3 right-4">
        <div className="text-sm text-arena-textMuted">
          Revealed: {revealedCandles.length}/{candles.length} candles
        </div>
      </div>
      
      <div ref={chartRef} className="h-full w-full flex items-end mt-12">
        {candles.map((candle, index) => {
          if (!candle.revealed) {
            return (
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
            );
          }
          
          const isGreen = candle.close >= candle.open;
          const bodyHeight = Math.abs(scalePrice(candle.close) - scalePrice(candle.open));
          const wickHeight = Math.abs(scalePrice(candle.high) - scalePrice(candle.low));
          const bodyTop = Math.min(scalePrice(candle.open), scalePrice(candle.close));
          
          return (
            <div 
              key={`candle-${index}`} 
              className="flex-1 flex flex-col items-center justify-end px-1 animate-reveal"
              style={{ height: '80%', transformOrigin: 'bottom' }}
            >
              <div className="relative h-full w-6">
                {/* Wick */}
                <div 
                  className={`absolute left-1/2 transform -translate-x-1/2 w-[1px] ${isGreen ? 'bg-arena-green' : 'bg-arena-red'}`}
                  style={{ height: `${wickHeight}%`, top: `${scalePrice(candle.high)}%` }}
                ></div>
                
                {/* Body */}
                <div 
                  className={`absolute left-1/2 transform -translate-x-1/2 w-5 ${isGreen ? 'bg-arena-green' : 'bg-arena-red'}`}
                  style={{ height: `${Math.max(bodyHeight, 1)}%`, top: `${bodyTop}%` }}
                ></div>
              </div>
              <div className="text-xs text-white/50 mt-1">#{index+1}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriceChart;
