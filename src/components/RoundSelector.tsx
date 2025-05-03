
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RoundSelectorProps {
  currentRound: number;
  totalRounds: number;
  selectedRound: number;
  onSelectRound: (round: number) => void;
  className?: string;
}

const RoundSelector: React.FC<RoundSelectorProps> = ({
  currentRound,
  totalRounds,
  selectedRound,
  onSelectRound,
  className
}) => {
  // Calculate which rounds to show based on current round and available history
  const availableRounds = Array.from(
    { length: Math.min(currentRound, totalRounds) }, 
    (_, i) => i + 1
  );
  
  const handlePrev = () => {
    if (selectedRound > 1) {
      onSelectRound(selectedRound - 1);
    }
  };
  
  const handleNext = () => {
    if (selectedRound < currentRound) {
      onSelectRound(selectedRound + 1);
    }
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handlePrev}
        disabled={selectedRound <= 1}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-white/10"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      <ToggleGroup 
        type="single" 
        value={selectedRound.toString()} 
        onValueChange={(value) => value && onSelectRound(parseInt(value))}
        className="bg-arena-card/50 backdrop-filter backdrop-blur-sm rounded-lg border border-white/10"
      >
        {availableRounds.map(round => (
          <ToggleGroupItem 
            key={`round-${round}`}
            value={round.toString()}
            className="px-3 py-1 data-[state=on]:bg-arena-accent/90 data-[state=on]:text-black rounded-md"
          >
            {round}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      
      <button
        onClick={handleNext}
        disabled={selectedRound >= currentRound}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-white/10"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default RoundSelector;
