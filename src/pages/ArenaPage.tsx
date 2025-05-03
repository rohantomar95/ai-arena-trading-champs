
import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import AgentCard from '@/components/AgentCard';
import PriceChart from '@/components/PriceChart';
import Leaderboard from '@/components/Leaderboard';
import TradeLogs from '@/components/TradeLogs';
import { Button } from '@/components/ui/button';
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
  const [commentary, setCommentary] = useState<string>('Welcome to the AI Arena Trading Championship!');
  
  // Function to display game commentary
  const showCommentary = (message: string) => {
    setCommentary(message);
  };
  
  // Function to start a new round
  const startRound = () => {
    // Generate new candles for this round
    const newCandles = generateCandlesForRound(currentRound);
    setCandles(newCandles);
    
    // Show round start commentary
    showCommentary(`Round ${currentRound} is starting! AI agents are analyzing the markets...`);
    
    // Small delay before generating trades for dramatic effect
    setTimeout(() => {
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
      
      // Update commentary
      showCommentary(`All agents have placed their trades! Price discovery is beginning...`);
      
      toast({
        title: `Round ${currentRound} Started`,
        description: "AI agents have placed their trades. Click 'Reveal Next Candle' to see the results.",
      });
    }, 1500);
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
    
    // Show candle reveal commentary
    showCommentary(`Candle #${revealedCount + 1} revealed! Price moved to $${currentCandle.close.toFixed(2)}`);
    
    if (previousCandle) {
      const updatedAgents = calculatePnL(agents, currentCandle, previousCandle);
      setAgents(updatedAgents);
      
      // Find agents with significant P&L changes for commentary
      const bigWinner = updatedAgents.reduce((prev, current) => 
        (prev.pnlPercent > current.pnlPercent) ? prev : current);
        
      const bigLoser = updatedAgents.reduce((prev, current) => 
        (prev.pnlPercent < current.pnlPercent) ? prev : current);
      
      // Add commentary about notable agents if there are significant changes
      if (Math.abs(bigWinner.pnlPercent) > 5) {
        setTimeout(() => {
          showCommentary(`${bigWinner.name} is ${bigWinner.pnlPercent > 0 ? 'surging' : 'struggling'} with a ${bigWinner.pnlPercent.toFixed(2)}% P&L!`);
        }, 1500);
      }
      
      // Animate leaderboard to show changes - with debounce
      if (!isLeaderboardAnimating) {
        setIsLeaderboardAnimating(true);
        setTimeout(() => setIsLeaderboardAnimating(false), 1200);
      }
    }
    
    // Check if this was the last candle
    if (revealedCount === candles.length - 1) {
      // This was the last candle, round is complete
      setTimeout(() => {
        showCommentary(`Round ${currentRound} complete! All positions are being settled...`);
        
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
          const winner = agentsWithClosedPositions.reduce((prev, current) => 
            prev.balance > current.balance ? prev : current);
            
          setTimeout(() => {
            showCommentary(`Championship complete! ${winner.name} is the winner with $${winner.balance.toLocaleString()}!`);
          }, 1500);
          
          toast({
            title: "Championship Complete!",
            description: `${winner.name} is the champion of the AI Arena!`,
          });
        } else {
          // Prepare for next round
          setCurrentRound(prev => prev + 1);
          
          const leader = agentsWithClosedPositions.reduce((prev, current) => 
            prev.balance > current.balance ? prev : current);
            
          setTimeout(() => {
            showCommentary(`${leader.name} is leading after round ${currentRound}! Prepare for round ${currentRound + 1}...`);
          }, 1500);
          
          toast({
            title: `Round ${currentRound} Complete`,
            description: "All positions have been closed. Click 'Start Next Round' to continue.",
          });
        }
      }, 1000);
    }
  };
  
  // Handle candle reveal from PriceChart when auto-revealing
  const handleCandleReveal = () => {
    revealNextCandle();
  };

  // Render the game controls based on current state
  const renderGameControls = () => {
    if (!isGameRunning && !isRoundComplete) {
      return (
        <Button 
          className="bg-gradient-to-r from-arena-accent to-arena-accent2 hover:opacity-90 transition-opacity"
          onClick={startRound}
        >
          Start Round {currentRound}
        </Button>
      );
    }
    
    if (isGameRunning && candles.filter(c => c.revealed).length < candles.length) {
      return (
        <Button 
          className="bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
          onClick={revealNextCandle}
        >
          Reveal Next Candle
        </Button>
      );
    }
    
    if (isRoundComplete && currentRound < 5) {
      return (
        <Button 
          className="bg-gradient-to-r from-arena-accent to-arena-accent2 hover:opacity-90 transition-opacity"
          onClick={startRound}
        >
          Start Next Round
        </Button>
      );
    }
    
    if (isRoundComplete && currentRound === 5) {
      return (
        <Button 
          className="bg-gradient-to-r from-arena-accent to-arena-accent2 hover:opacity-90 transition-opacity"
          disabled
        >
          Game Complete
        </Button>
      );
    }
    
    return null;
  };
  
  return (
    <div className="min-h-screen bg-arena-bg overflow-x-hidden">
      <NavBar />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 gap-6">
          {/* 1. Announcements and Game Controls at the top */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold neon-text">AI Arena Championship</h2>
              <div className="flex items-center gap-2 bg-arena-card/80 px-4 py-2 rounded-full">
                <span className="text-arena-textMuted">Round:</span>
                <span className="text-lg font-bold text-arena-accent">{currentRound}/5</span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 bg-arena-card/30 rounded-lg p-4">
                <p className="text-lg text-center font-medium">{commentary}</p>
              </div>
              
              <div className="md:w-1/4 flex justify-center">
                {renderGameControls()}
              </div>
            </div>
          </div>
          
          {/* 2. Price Chart */}
          <div className="glass-card p-4">
            <PriceChart 
              candles={candles}
              onCandleReveal={handleCandleReveal}
              isRevealing={isGameRunning}
              currentRound={currentRound}
            />
          </div>
          
          {/* 3. Agent Positions Summary */}
          <div className="glass-card p-4">
            <h2 className="text-xl font-bold mb-4 neon-text">Current Positions</h2>
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
          
          {/* 4. Leaderboard */}
          <div className="glass-card">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold neon-text">Live Leaderboard</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-arena-card rounded-full text-white/70 font-medium">
                  Updated in Real-time
                </span>
              </div>
            </div>
            <Leaderboard agents={agents} isAnimating={isLeaderboardAnimating} />
          </div>
          
          {/* 5. Trade History in table format */}
          <div className="glass-card">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xl font-bold neon-text">Trade History</h2>
            </div>
            <TradeHistoryTable agents={agents} logs={tradeLogs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArenaPage;
