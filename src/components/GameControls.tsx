
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface GameControlsProps {
  onStartRound: () => void;
  onRevealCandle: () => void;
  isGameRunning: boolean;
  isRoundComplete: boolean;
  currentRound: number;
  revealedCandles: number;
  totalCandles: number;
  isLastRound: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onStartRound,
  onRevealCandle,
  isGameRunning,
  isRoundComplete,
  currentRound,
  revealedCandles,
  totalCandles,
  isLastRound
}) => {
  const [commentary, setCommentary] = useState<string>("Welcome to the AI Arena Trading Championship!");
  
  // Update commentary based on game state
  useEffect(() => {
    if (!isGameRunning && !isRoundComplete) {
      if (currentRound === 1) {
        setCommentary("Agents are ready to trade! Start Round 1 to begin the championship.");
      } else {
        setCommentary(`Round ${currentRound - 1} complete! Prepare for Round ${currentRound}.`);
      }
    } else if (isGameRunning && revealedCandles === 0) {
      setCommentary(`Round ${currentRound} has begun! AI agents are placing their trades.`);
    } else if (isGameRunning && revealedCandles > 0) {
      const remaining = totalCandles - revealedCandles;
      if (remaining > 1) {
        setCommentary(`Market is moving! ${remaining} candles remaining.`);
      } else if (remaining === 1) {
        setCommentary("Final candle approaching! Positions will close soon.");
      }
    } else if (isRoundComplete) {
      if (isLastRound) {
        setCommentary("Championship complete! Final results are in.");
      } else {
        setCommentary(`Round ${currentRound} complete! Agents are analyzing the next market cycle.`);
      }
    }
  }, [isGameRunning, isRoundComplete, currentRound, revealedCandles, totalCandles, isLastRound]);
  
  return (
    <div className="glass-card p-4 flex flex-col space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold">Game Controls</h2>
      
      {/* Commentary section */}
      <div className="p-3 border border-arena-accent/20 bg-white/5 rounded-md">
        <p className="text-sm flicker-text font-medium">{commentary}</p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-arena-textMuted">Current Round:</span>
          <span className="font-medium">{currentRound}/5</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-arena-textMuted">Candles Revealed:</span>
          <span className="font-medium">{revealedCandles}/{totalCandles}</span>
        </div>
        
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-arena-accent transition-all duration-500 ease-out"
            style={{ width: `${(revealedCandles / totalCandles) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="space-y-2">
        {!isGameRunning && !isRoundComplete && (
          <Button 
            className="w-full bg-gradient-to-r from-arena-accent to-arena-accent2 hover:opacity-90 transition-opacity"
            onClick={onStartRound}
          >
            Start Round {currentRound}
          </Button>
        )}
        
        {isGameRunning && revealedCandles < totalCandles && (
          <Button 
            className="w-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
            onClick={onRevealCandle}
          >
            Reveal Next Candle
          </Button>
        )}
        
        {isRoundComplete && !isLastRound && (
          <Button 
            className="w-full bg-gradient-to-r from-arena-accent to-arena-accent2 hover:opacity-90 transition-opacity"
            onClick={onStartRound}
          >
            Start Next Round
          </Button>
        )}
        
        {isRoundComplete && isLastRound && (
          <Button 
            className="w-full bg-gradient-to-r from-arena-accent to-arena-accent2 hover:opacity-90 transition-opacity"
          >
            Game Complete
          </Button>
        )}
      </div>
    </div>
  );
};

export default GameControls;
