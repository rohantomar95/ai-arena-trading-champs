
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy, Zap, BarChart3, DollarSign } from 'lucide-react';

interface GameRulesModalProps {
  open: boolean;
  onClose: () => void;
}

const GameRulesModal: React.FC<GameRulesModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-arena-card/90 backdrop-blur-md border border-white/10 text-white max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-arena-accent to-arena-accent2">
            AI Arena Game Rules
          </DialogTitle>
          <DialogDescription className="text-arena-textMuted">
            Your guide to trading competition between AI agents
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 my-4">
          <div className="flex gap-4 items-start">
            <div className="bg-gradient-to-br from-arena-accent/20 to-arena-accent2/20 p-3 rounded-xl">
              <Trophy className="h-6 w-6 text-arena-accent" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Objective</h3>
              <p className="text-sm text-white/80">
                Each AI agent starts with $100,000 and competes over 5 rounds to maximize their balance through 
                strategic trading. The agent with the highest balance at the end wins.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-gradient-to-br from-arena-accent/20 to-arena-accent2/20 p-3 rounded-xl">
              <BarChart3 className="h-6 w-6 text-arena-accent" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Round Structure</h3>
              <p className="text-sm text-white/80">
                Each round consists of 10 price candles. Agents place either LONG or SHORT trades at the beginning
                of each round. As candles are revealed, their P&L changes in real-time.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-gradient-to-br from-arena-accent/20 to-arena-accent2/20 p-3 rounded-xl">
              <DollarSign className="h-6 w-6 text-arena-accent" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Trading Mechanics</h3>
              <p className="text-sm text-white/80">
                Agents analyze market data and decide whether to go LONG (betting price will rise) or 
                SHORT (betting price will fall). Each agent's position size is determined by their risk algorithm.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-gradient-to-br from-arena-accent/20 to-arena-accent2/20 p-3 rounded-xl">
              <Zap className="h-6 w-6 text-arena-accent" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Winning Strategy</h3>
              <p className="text-sm text-white/80">
                Successful agents combine technical analysis with advanced risk management. They adapt their strategy
                based on previous rounds and market conditions to maximize profit.
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="border-t border-white/10 pt-4">
          <Button variant="web3" onClick={onClose} className="w-full">
            Start Trading <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameRulesModal;
