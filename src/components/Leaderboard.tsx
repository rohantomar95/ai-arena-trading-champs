
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CountUp } from 'countup.js';
import { ArrowUp, ArrowDown, CircleUser } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Agent {
  id: string;
  name: string;
  balance: number;
  initialBalance: number;
  avatar: string;
  position?: 'long' | 'short' | null;
  positionSize?: number;
  pnlPercent: number;
  entryPrice?: number;
  isUser?: boolean;
}

interface LeaderboardProps {
  agents: Agent[];
  isAnimating?: boolean;
}

// Updated Agent color palette - using distinct solid colors for each agent
const agentColors = [
  '#9b75f8', // User agent (purple)
  '#8580f9', // 1st place (lighter purple)
  '#7a8bf9', // 2nd place (blue-purple)
  '#67a6f0', // 3rd place (blue)
  '#67c7e1', // 4th place (light blue)
  '#33C3F0', // 5th place (sky blue)
];

// Badge styles for position ranks
const positionBadgeStyles = [
  'bg-[#9b75f8] ring-2 ring-[#9b75f8]/50 shadow-lg shadow-[#9b75f8]/20', // 1st
  'bg-[#8580f9] ring-2 ring-[#8580f9]/50', // 2nd
  'bg-[#7a8bf9] ring-2 ring-[#7a8bf9]/50', // 3rd
  'bg-white/10 ring-1 ring-white/20', // Others
];

const Leaderboard: React.FC<LeaderboardProps> = ({ agents, isAnimating = false }) => {
  // Show only top 5 agents like in the screenshot
  const sortedAgents = React.useMemo(() => {
    // First find the user agent
    const userAgent = agents.find(agent => agent.isUser);
    
    // Sort the rest by balance
    const sorted = [...agents]
      .filter(agent => !agent.isUser)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, userAgent ? 4 : 5); // Take top 4 non-user agents if user exists, otherwise 5
    
    // Put user agent first, then the others
    return userAgent 
      ? [userAgent, ...sorted]
      : sorted;
  }, [agents]);
  
  // Store previous sorted order to compare for position changes
  const prevSortedAgentsRef = useRef<Agent[]>([]);
  
  // Store previous balance values for continuity in animations
  const prevBalancesRef = useRef<{[key: string]: number}>({});
  const prevPnlRef = useRef<{[key: string]: number}>({});
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [key, setKey] = useState<number>(0);
  
  // References for balance elements
  const balanceRefs = React.useRef<{[key: string]: HTMLSpanElement | null}>({});
  const pnlRefs = React.useRef<{[key: string]: HTMLSpanElement | null}>({});
  
  // Map to track position changes for animation
  const [positionChanged, setPositionChanged] = useState<{[key: string]: boolean}>({});
  
  // Effect to detect position changes
  useEffect(() => {
    if (prevSortedAgentsRef.current.length > 0) {
      const newPositions: {[key: string]: boolean} = {};
      
      // Map old positions by agent ID
      const oldPositions = new Map<string, number>();
      prevSortedAgentsRef.current.forEach((agent, idx) => {
        oldPositions.set(agent.id, idx);
      });
      
      // Compare with new positions
      sortedAgents.forEach((agent, idx) => {
        const oldIdx = oldPositions.get(agent.id);
        if (oldIdx !== undefined && oldIdx !== idx) {
          newPositions[agent.id] = true;
        }
      });
      
      if (Object.keys(newPositions).length > 0) {
        setPositionChanged(newPositions);
        
        // Clear position changed flags after animation completes
        setTimeout(() => {
          setPositionChanged({});
        }, 1500); // Animation duration
      }
    }
    
    // Update ref with current agents for next comparison
    prevSortedAgentsRef.current = [...sortedAgents];
    
    // Store current balances for next animation
    sortedAgents.forEach(agent => {
      prevBalancesRef.current[agent.id] = agent.balance;
      prevPnlRef.current[agent.id] = agent.pnlPercent;
    });
  }, [sortedAgents]);
  
  // Reset animation when agents change or animation is triggered
  useEffect(() => {
    if (isAnimating) {
      setKey(prev => prev + 1);
    }
  }, [isAnimating, agents]);
  
  // Initial loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Function to animate counters
  const animateCounters = useCallback(() => {
    if (isLoading) return;
    
    sortedAgents.forEach(agent => {
      try {
        // Get previous values or use current as fallback
        const prevBalance = prevBalancesRef.current[agent.id] !== undefined 
          ? prevBalancesRef.current[agent.id] 
          : agent.balance;
          
        const prevPnl = prevPnlRef.current[agent.id] !== undefined 
          ? prevPnlRef.current[agent.id] 
          : agent.pnlPercent;
        
        // Balance animation - start from previous value
        const balanceEl = balanceRefs.current[agent.id];
        if (balanceEl) {
          new CountUp(balanceEl, agent.balance, {
            startVal: prevBalance,
            duration: 1.5,
            prefix: '$',
            separator: ',',
            decimal: '.',
            decimalPlaces: 0
          }).start();
        }
        
        // PNL animation - start from previous value
        const pnlEl = pnlRefs.current[agent.id];
        if (pnlEl) {
          new CountUp(pnlEl, Math.abs(agent.pnlPercent), {
            startVal: Math.abs(prevPnl),
            duration: 1.5,
            decimalPlaces: 2,
            suffix: '%',
            prefix: agent.pnlPercent >= 0 ? '+' : '-'
          }).start();
        }
      } catch (err) {
        console.error("Animation error:", err);
      }
    });
  }, [sortedAgents, isLoading]);
  
  // Animate counters after render
  useEffect(() => {
    const timer = setTimeout(() => {
      animateCounters();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [animateCounters, key]);

  // Calculate the maximum balance for scaling bars
  const maxBalance = Math.max(...sortedAgents.map(a => a.balance));
  
  // Get color for the agent - now using solid colors from the palette
  const getAgentColor = (agent: Agent, index: number): string => {
    if (agent.isUser) return agentColors[0];
    return agentColors[index + 1] || agentColors[5];
  };
  
  // Get position badge style
  const getPositionBadgeStyle = (index: number): string => {
    return index < 3 ? positionBadgeStyles[index] : positionBadgeStyles[3];
  };

  // Improved position tag with better spacing
  const getPositionTag = (position: 'long' | 'short' | null | undefined, size?: number, entryPrice?: number) => {
    if (!position) return null;
    
    return (
      <div className="flex items-center gap-2.5">
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
          position === 'long' ? 'bg-arena-green/20 text-arena-green' : 'bg-arena-red/20 text-arena-red'
        }`}>
          {position === 'long' ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )}
          <span className="tracking-tight">{position.toUpperCase()}</span>
        </div>
        
        {size && (
          <div className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded">
            ${size.toLocaleString()}
          </div>
        )}
        
        {entryPrice && (
          <div className="text-xs text-white/70">
            @ ${entryPrice.toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="animate-pulse flex flex-col space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4" key={key}>
      <div className="flex flex-col space-y-5">
        {sortedAgents.map((agent, index) => {
          const isProfitable = agent.pnlPercent >= 0;
          const barWidth = `${Math.max(5, (agent.balance / maxBalance) * 100)}%`; // Min 5% width for visibility
          const agentColor = getAgentColor(agent, index);
          const hasPositionChanged = positionChanged[agent.id];
          
          return (
            <div 
              key={`${agent.id}-${index}`}
              className={cn(
                "flex items-center h-24 rounded-xl p-0.5 transition-all duration-500",
                hasPositionChanged ? "position-changed" : "transition-transform duration-500",
                agent.isUser ? `shadow-lg shadow-[${agentColor}]/10` : "hover:bg-white/5"
              )}
              style={{
                background: agent.isUser ? `linear-gradient(to right, ${agentColor}50, ${agentColor}30)` : 'transparent'
              }}
            >
              <div className="w-full h-full bg-arena-bg/95 rounded-lg flex items-center px-1">
                {/* Position rank with badge effect */}
                <div className="w-12 flex justify-center items-center">
                  <div className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full text-base font-bold",
                    getPositionBadgeStyle(index)
                  )}>
                    {index + 1}
                  </div>
                </div>
                
                {/* Agent name with avatar */}
                <div className="w-[150px] flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center text-lg rounded-full shadow-sm"
                    style={{ backgroundColor: agentColor }}>
                    {agent.isUser ? <CircleUser className="h-5 w-5 text-white" /> : agent.avatar}
                  </div>
                  <div className="flex flex-col">
                    <div className={cn(
                      "font-bold text-lg tracking-tight truncate transition-colors flex items-center gap-1.5",
                      agent.isUser ? "text-white" : "text-white/90"
                    )}>
                      <span className="truncate max-w-[100px]">{agent.name}</span>
                    </div>
                    {agent.isUser && (
                      <span className="text-sm" style={{ color: `${agentColor}80` }}>Your Agent</span>
                    )}
                  </div>
                </div>
                
                {/* Position tag */}
                <div className="w-[220px] flex items-center">
                  {getPositionTag(agent.position, agent.positionSize, agent.entryPrice)}
                </div>
                
                {/* Progress bar - using our specific solid colors */}
                <div className="relative flex-1 h-16 flex items-center">
                  <Progress 
                    className="h-10 bg-white/5" 
                    value={(agent.balance / maxBalance) * 100}
                    indicatorClassName="transition-all duration-1000 ease-out"
                    style={{
                      backgroundColor: agentColor
                    }}
                  />
                  
                  {/* Balance text */}
                  <div className="absolute right-3 h-full flex items-center">
                    <span 
                      className="text-lg font-bold data-value tabular-nums"
                      ref={el => { 
                        if (el) balanceRefs.current[agent.id] = el;
                      }}
                    >
                      ${agent.balance.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* PnL percentage */}
                  <div className="absolute left-3 h-full flex items-center">
                    <span 
                      className={`text-base font-medium ${
                        agent.pnlPercent > 0 ? 'text-arena-green' : 
                        agent.pnlPercent < 0 ? 'text-arena-red' : 'text-white/70'
                      }`}
                      ref={el => {
                        if (el) pnlRefs.current[agent.id] = el;
                      }}
                    >
                      {agent.pnlPercent > 0 ? '+' : '-'}
                      {Math.abs(agent.pnlPercent).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
