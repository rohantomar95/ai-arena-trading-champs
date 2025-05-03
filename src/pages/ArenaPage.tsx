
import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
import AgentCard from '@/components/AgentCard';
import PriceChart from '@/components/PriceChart';
import Leaderboard from '@/components/Leaderboard';
import TradeHistoryTable from '@/components/TradeHistoryTable';
import GameRulesModal from '@/components/GameRulesModal';
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
import { Play, RotateCcw, BookOpen } from 'lucide-react';
import { Web3Card, Web3CardHeader, Web3CardTitle, Web3CardContent } from '@/components/ui/web3-card';

const ArenaPage = () => {
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [candles, setCandles] = useState<CandleData[]>(initialCandles);
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [isRoundComplete, setIsRoundComplete] = useState<boolean>(false);
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>([]);
  const [isLeaderboardAnimating, setIsLeaderboardAnimating] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  
  // Function to start a new round
  const startRound = () => {
    // Generate new candles for this round
    const newCandles = generateCandlesForRound(currentRound);
    setCandles(newCandles);
    
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
      
      toast({
        title: `Round ${currentRound} Started`,
        description: "AI agents have placed their trades. Market is moving...",
      });
    }, 1000);
  };
  
  // Function to reset the game
  const resetGame = () => {
    setCurrentRound(1);
    setAgents(initialAgents);
    setCandles(initialCandles);
    setIsGameRunning(false);
    setIsRoundComplete(false);
    setTradeLogs([]);
    
    toast({
      title: "Game Reset",
      description: "All progress has been reset",
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
            
          toast({
            title: "Championship Complete!",
            description: `${winner.name} is the champion of the AI Arena!`,
          });
        } else {
          // Prepare for next round
          setCurrentRound(prev => prev + 1);
          
          toast({
            title: `Round ${currentRound} Complete`,
            description: "All positions have been closed. Start next round when ready.",
          });
        }
      }, 1000);
    }
  };
  
  // Handle candle reveal from PriceChart when auto-revealing
  const handleCandleReveal = () => {
    revealNextCandle();
  };

  // Game state helper functions
  const isGameOver = isRoundComplete && currentRound === 5;
  const canStartNewRound = !isGameRunning && (currentRound === 1 || isRoundComplete) && !isGameOver;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-arena-bg to-black overflow-x-hidden">
      <NavBar />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Control Panel - Simplified */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <div className="flex space-x-3">
              <Button 
                variant="gradient" 
                size="lg"
                onClick={startRound}
                disabled={!canStartNewRound}
              >
                <Play className="mr-2 h-5 w-5" />
                {currentRound === 1 ? 'Start Game' : 'Next Round'}
              </Button>
              
              <Button 
                variant="web3" 
                size="lg"
                onClick={resetGame}
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Reset
              </Button>
              
              <Button 
                variant="web3" 
                size="lg"
                onClick={() => setIsRulesModalOpen(true)}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Game Rules
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-arena-textMuted">Round:</span>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-arena-accent to-arena-accent2">
                {currentRound}<span className="text-white/50">/5</span>
              </span>
            </div>
          </div>
          
          {/* Chart Section */}
          <Web3Card className="overflow-hidden">
            <PriceChart 
              candles={candles}
              onCandleReveal={handleCandleReveal}
              isRevealing={isGameRunning}
              currentRound={currentRound}
            />
          </Web3Card>
          
          {/* Agent Positions Section - Single row layout */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">Agent Positions</h2>
              <div className="px-3 py-1 rounded-full bg-white/5 text-sm text-arena-textMuted">
                Live Trading
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 h-[160px]">
              {agents.map((agent, index) => (
                <AgentCard 
                  key={agent.id}
                  name={agent.name}
                  balance={agent.balance}
                  position={agent.position}
                  positionSize={agent.positionSize}
                  avatar={agent.avatar}
                  index={index}
                  pnlPercent={agent.pnlPercent}
                />
              ))}
            </div>
          </div>
          
          {/* Leaderboard Section */}
          <Web3Card variant="gradient" className="mb-5">
            <Web3CardHeader>
              <Web3CardTitle>Live Leaderboard</Web3CardTitle>
              <div className="ml-auto px-3 py-1 rounded-full bg-arena-card/50 text-xs text-arena-textMuted">
                Updated in Real-time
              </div>
            </Web3CardHeader>
            <Web3CardContent className="p-0">
              <Leaderboard agents={agents} isAnimating={isLeaderboardAnimating} />
            </Web3CardContent>
          </Web3Card>
          
          {/* Trade History Section */}
          <Web3Card className="mb-5">
            <Web3CardHeader>
              <Web3CardTitle>Trade History</Web3CardTitle>
            </Web3CardHeader>
            <Web3CardContent className="p-0">
              <TradeHistoryTable agents={agents} logs={tradeLogs} />
            </Web3CardContent>
          </Web3Card>
        </div>
      </div>
      
      {/* Game Rules Modal */}
      <GameRulesModal open={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} />
    </div>
  );
};

export default ArenaPage;
