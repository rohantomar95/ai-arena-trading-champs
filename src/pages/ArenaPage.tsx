
import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
import PriceChart from '@/components/PriceChart';
import Leaderboard from '@/components/Leaderboard';
import TradeHistoryTable from '@/components/TradeHistoryTable';
import GameRulesModal from '@/components/GameRulesModal';
import RoundSelector from '@/components/RoundSelector';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils"; // Add this import for the cn utility
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
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [candles, setCandles] = useState<CandleData[]>(initialCandles);
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [isRoundComplete, setIsRoundComplete] = useState<boolean>(false);
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>([]);
  const [isLeaderboardAnimating, setIsLeaderboardAnimating] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [roundHistoryCandles, setRoundHistoryCandles] = useState<Record<number, CandleData[]>>({
    1: initialCandles
  });
  
  // Function to start a new round
  const startRound = () => {
    // Generate new candles for this round
    const newCandles = generateCandlesForRound(currentRound);
    setCandles(newCandles);
    
    // Store these candles in history for this round
    setRoundHistoryCandles(prev => ({
      ...prev,
      [currentRound]: newCandles
    }));
    
    // Update the selected round to the current round
    setSelectedRound(currentRound);
    
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
    setSelectedRound(1);
    setAgents(initialAgents);
    setCandles(initialCandles);
    setIsGameRunning(false);
    setIsRoundComplete(false);
    setTradeLogs([]);
    setRoundHistoryCandles({
      1: initialCandles
    });
    
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
    
    // Update in the history as well
    setRoundHistoryCandles(prev => ({
      ...prev,
      [currentRound]: updatedCandles
    }));
    
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
          amount: agent.positionSize || 0,
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

  // Handle round selection change
  const handleRoundSelect = (round: number) => {
    setSelectedRound(round);
  };

  // Get the candles for the selected round
  const selectedCandles = roundHistoryCandles[selectedRound] || candles;
  
  // Game state helper functions
  const isGameOver = isRoundComplete && currentRound === 5;
  const canStartNewRound = !isGameRunning && (currentRound === 1 || isRoundComplete) && !isGameOver;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-arena-bg to-black/90 overflow-x-hidden">
      <NavBar />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col gap-5">
          {/* Control Bar with Round Indicator and Action Buttons */}
          <Web3Card variant="glass" className="p-4 flex items-center justify-between">
            <div className="flex space-x-3">
              <Button 
                variant="gradient" 
                size="lg"
                onClick={startRound}
                disabled={!canStartNewRound}
                className="relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-arena-accent/20 to-arena-accent2/20 group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
                <Play className="h-5 w-5 mr-2" />
                Start Round {currentRound}
              </Button>
              
              <Button 
                variant="web3" 
                size="lg"
                onClick={resetGame}
                className="bg-white/5 hover:bg-white/10"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
              
              <Button 
                variant="web3" 
                size="lg"
                onClick={() => setIsRulesModalOpen(true)}
                className="bg-white/5 hover:bg-white/10"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Rules
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <div className="text-sm text-arena-textMuted">Championship Progress</div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-3 h-8 rounded-sm transition-all", 
                        i < currentRound 
                          ? "bg-gradient-to-t from-arena-accent to-arena-accent2 shadow-glow" 
                          : "bg-white/10"
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-arena-accent to-arena-accent2">
                  {currentRound}<span className="text-white/30">/5</span>
                </div>
              </div>
            </div>
          </Web3Card>
          
          {/* Chart Section */}
          <Web3Card className="overflow-hidden backdrop-blur-md border border-white/5">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center">
                <div className="w-1.5 h-8 bg-gradient-to-b from-arena-accent to-arena-accent2 rounded-full mr-3"></div>
                <h3 className="text-xl font-medium text-white/90">ETH/USD Price Chart</h3>
                {selectedRound !== currentRound && (
                  <span className="ml-3 px-2.5 py-0.5 text-xs bg-arena-accent/10 text-arena-accent/90 rounded-full border border-arena-accent/20">
                    Viewing Round {selectedRound}
                  </span>
                )}
              </div>
              <RoundSelector 
                currentRound={currentRound}
                totalRounds={5}
                selectedRound={selectedRound}
                onSelectRound={handleRoundSelect}
              />
            </div>
            <PriceChart 
              candles={selectedCandles}
              onCandleReveal={handleCandleReveal}
              isRevealing={isGameRunning && selectedRound === currentRound}
              currentRound={selectedRound}
            />
          </Web3Card>
          
          {/* Leaderboard Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Web3Card variant="glass" className="md:col-span-2">
              <Web3CardHeader className="border-b border-white/5">
                <div className="w-1 h-6 bg-gradient-to-b from-arena-accent to-arena-accent2 rounded-full mr-3"></div>
                <Web3CardTitle>Live Leaderboard</Web3CardTitle>
                <div className="ml-auto px-3 py-1 rounded-full bg-arena-card/30 text-xs text-arena-textMuted backdrop-blur-md">
                  Updated in Real-time
                </div>
              </Web3CardHeader>
              <Web3CardContent className="p-0">
                <Leaderboard agents={agents} isAnimating={isLeaderboardAnimating} />
              </Web3CardContent>
            </Web3Card>
          
            {/* Trade History Section */}
            <Web3Card variant="glass" className="md:col-span-1">
              <Web3CardHeader className="border-b border-white/5">
                <div className="w-1 h-6 bg-gradient-to-b from-arena-accent to-arena-accent2 rounded-full mr-3"></div>
                <Web3CardTitle>Trade History</Web3CardTitle>
              </Web3CardHeader>
              <Web3CardContent className="p-0 max-h-[400px] overflow-auto">
                <TradeHistoryTable agents={agents} logs={tradeLogs} />
              </Web3CardContent>
            </Web3Card>
          </div>
        </div>
      </div>
      
      {/* Game Rules Modal */}
      <GameRulesModal open={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} />
    </div>
  );
};

export default ArenaPage;
