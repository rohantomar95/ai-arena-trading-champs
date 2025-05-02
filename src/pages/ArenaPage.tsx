
import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import AgentCard from '@/components/AgentCard';
import PriceChart from '@/components/PriceChart';
import Leaderboard from '@/components/Leaderboard';
import TradeLogs from '@/components/TradeLogs';
import GameControls from '@/components/GameControls';
import { toast } from '@/hooks/use-toast';
import { 
  initialAgents, 
  initialCandles, 
  generateCandlesForRound,
  generateInitialTrades,
  updateAgentsWithTrades,
  calculatePnL,
  closePositions,
  Agent,
  CandleData,
  TradeLog
} from '@/lib/gameData';

const ArenaPage = () => {
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [candles, setCandles] = useState<CandleData[]>(initialCandles);
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [isRoundComplete, setIsRoundComplete] = useState<boolean>(false);
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>([]);
  const [isLeaderboardAnimating, setIsLeaderboardAnimating] = useState<boolean>(false);
  
  // Function to start a new round
  const startRound = () => {
    // Generate new candles for this round
    const newCandles = generateCandlesForRound(currentRound);
    setCandles(newCandles);
    
    // Generate initial trades for all agents
    const initialTrades = generateInitialTrades(
      agents, 
      currentRound, 
      newCandles[0].open
    );
    
    // Update agents with their new positions
    const updatedAgents = updateAgentsWithTrades(agents, initialTrades);
    
    // Add trades to logs
    setTradeLogs(prev => [...initialTrades, ...prev]);
    
    // Update state
    setAgents(updatedAgents);
    setIsGameRunning(true);
    setIsRoundComplete(false);
    
    toast({
      title: `Round ${currentRound} Started`,
      description: "AI agents have placed their trades. Click 'Reveal Next Candle' to see the results.",
    });
  };
  
  // Function to reveal the next candle
  const revealNextCandle = () => {
    const revealedCount = candles.filter(c => c.revealed).length;
    
    if (revealedCount >= candles.length) {
      return; // All candles already revealed
    }
    
    // Update the candles array to mark the next one as revealed
    const updatedCandles = [...candles];
    updatedCandles[revealedCount].revealed = true;
    setCandles(updatedCandles);
    
    // Calculate new P&L based on the newly revealed candle
    const previousCandle = revealedCount > 0 ? updatedCandles[revealedCount - 1] : null;
    const currentCandle = updatedCandles[revealedCount];
    
    if (previousCandle) {
      const updatedAgents = calculatePnL(agents, currentCandle, previousCandle);
      setAgents(updatedAgents);
      
      // Animate leaderboard to show changes
      setIsLeaderboardAnimating(true);
      setTimeout(() => setIsLeaderboardAnimating(false), 1000);
    }
    
    // Check if this was the last candle
    if (revealedCount === candles.length - 1) {
      // This was the last candle, round is complete
      setTimeout(() => {
        setIsRoundComplete(true);
        setIsGameRunning(false);
        
        // Close all positions for agents
        const agentsWithClosedPositions = closePositions(agents);
        setAgents(agentsWithClosedPositions);
        
        // Generate close position logs
        const closePositionLogs = agentsWithClosedPositions.map(agent => ({
          id: `close-${agent.id}-round${currentRound}`,
          agentId: agent.id,
          agentName: agent.name,
          action: 'close' as 'close',
          amount: agent.positionSize,
          timestamp: Date.now(),
          price: currentCandle.close,
          round: currentRound
        }));
        
        // Add close position logs to trade logs
        setTradeLogs(prev => [...closePositionLogs, ...prev]);
        
        // If this was the last round, end the game
        if (currentRound === 5) {
          toast({
            title: "Championship Complete!",
            description: "The AI Arena Trading Championship has ended.",
          });
        } else {
          // Prepare for next round
          setCurrentRound(prev => prev + 1);
          toast({
            title: `Round ${currentRound} Complete`,
            description: "All positions have been closed. Click 'Start Next Round' to continue.",
          });
        }
      }, 1000);
    }
  };
  
  // Handle candle reveal from PriceChart when auto-revealing
  const handleCandleReveal = (index: number) => {
    revealNextCandle();
  };
  
  return (
    <div className="min-h-screen bg-arena-bg overflow-x-hidden">
      <NavBar />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 gap-6">
          {/* 1. Price Chart at the top */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <PriceChart 
                candles={candles}
                onCandleReveal={handleCandleReveal}
                isRevealing={isGameRunning}
                currentRound={currentRound}
              />
            </div>
            
            <div>
              <GameControls 
                onStartRound={startRound}
                onRevealCandle={revealNextCandle}
                isGameRunning={isGameRunning}
                isRoundComplete={isRoundComplete}
                currentRound={currentRound}
                revealedCandles={candles.filter(c => c.revealed).length}
                totalCandles={candles.length}
                isLastRound={currentRound === 5}
              />
            </div>
          </div>
          
          {/* 2. Leaderboard below the chart */}
          <div className="glass-card">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold neon-text">Live Leaderboard</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-arena-textMuted">Round:</span>
                <span className="px-3 py-1 bg-arena-card rounded-full text-arena-accent font-medium">{currentRound}/5</span>
              </div>
            </div>
            <Leaderboard agents={agents} isAnimating={isLeaderboardAnimating} />
          </div>
          
          {/* 3. Agents in a single row */}
          <div className="glass-card p-4">
            <h2 className="text-xl font-bold mb-3 neon-text">AI Agents</h2>
            <div className="flex overflow-x-auto pb-4 gap-4 snap-x">
              {agents.map((agent, index) => (
                <div key={agent.id} className="min-w-[280px] snap-center">
                  <AgentCard 
                    name={agent.name}
                    balance={agent.balance}
                    position={agent.position}
                    positionSize={agent.positionSize}
                    avatar={agent.avatar}
                    index={index}
                    pnlPercent={agent.pnlPercent}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* 4. Trade logs at the bottom */}
          <div className="glass-card">
            <h2 className="text-xl font-bold p-4 border-b border-white/10 neon-text">Trade History</h2>
            <div className="h-[400px]">
              <TradeLogs logs={tradeLogs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArenaPage;
