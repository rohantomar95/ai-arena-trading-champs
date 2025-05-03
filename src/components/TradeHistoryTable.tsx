import React, { useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { TradeLog } from '@/lib/gameData';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Updated Agent interface to include isUser property
interface Agent {
  id: string;
  name: string;
  avatar: string;
  balance: number;
  initialBalance: number;
  position: 'long' | 'short' | null;
  positionSize: number;
  pnlPercent: number;
  isUser?: boolean; // Added isUser property
}

interface TradeHistoryTableProps {
  agents: Agent[];
  logs: TradeLog[];
}

// Agent color gradients - same as in Leaderboard for consistency
const agentHeaderGradients = [
  'from-[#11E7DA] to-[#9B87F5]', // User agent (teal to purple)
  'from-[#FFD700] to-[#FFA500]', // 1st place (gold)
  'from-[#C0C0C0] to-[#A9A9A9]', // 2nd place (silver)
  'from-[#CD7F32] to-[#A0522D]', // 3rd place (bronze)
  'from-[#4158D0] to-[#C850C0]', // purple to pink (4th)
  'from-[#0093E9] to-[#80D0C7]', // blue to teal (5th)
];

const TradeHistoryTable: React.FC<TradeHistoryTableProps> = ({ agents, logs }) => {
  // Show only top 5 agents like in the screenshot
  const topAgents = useMemo(() => {
    // First find the user agent
    const userAgent = agents.find(agent => agent.isUser);
    
    // Sort the rest by balance
    const sortedAgents = [...agents]
      .filter(agent => !agent.isUser)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, userAgent ? 4 : 5); // Take top 4 non-user agents if user exists, otherwise 5
    
    // Put user agent first, then the others
    return userAgent 
      ? [userAgent, ...sortedAgents]
      : sortedAgents;
  }, [agents]);
  
  // Group logs by round
  const logsByRound = useMemo(() => {
    const grouped: { [key: number]: TradeLog[] } = {};
    
    // Initialize all 5 rounds with empty arrays
    for (let i = 1; i <= 5; i++) {
      grouped[i] = [];
    }
    
    // Fill with actual logs
    logs.forEach(log => {
      if (grouped[log.round]) {
        grouped[log.round].push(log);
      }
    });
    
    return grouped;
  }, [logs]);
  
  // Format currency values
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Get the appropriate style class for each action type
  const getActionClassName = (action: string) => {
    if (action === 'long') return 'bg-arena-green/20 text-arena-green px-2.5 py-1 rounded-full text-xs font-medium';
    if (action === 'short') return 'bg-arena-red/20 text-arena-red px-2.5 py-1 rounded-full text-xs font-medium';
    return 'bg-white/10 text-white px-2.5 py-1 rounded-full text-xs font-medium';
  };
  
  // Get trades for a specific agent and round
  const getAgentTradesForRound = (agentId: string, roundLogs: TradeLog[]) => {
    return roundLogs.filter(log => log.agentId === agentId);
  };
  
  // Get agent's color gradient based on position or special status
  const getAgentHeaderGradient = (agent: Agent, index: number) => {
    if (agent.isUser) return agentHeaderGradients[0]; // User agent
    
    // Otherwise use the position in the sorted array (top 5)
    return agentHeaderGradients[index] || agentHeaderGradients[5];
  };

  // Calculate PnL for a closed trade
  const calculatePnL = (openTrade: TradeLog | undefined, closeTrade: TradeLog | undefined) => {
    if (!openTrade || !closeTrade) return null;
    
    const openAmount = openTrade.amount;
    const openPrice = openTrade.price;
    const closePrice = closeTrade.price;
    
    // PnL calculation depends on position type
    const isProfitable = openTrade.action === 'long' 
      ? closePrice > openPrice 
      : closePrice < openPrice;
    
    const pnlValue = openTrade.action === 'long'
      ? openAmount * ((closePrice - openPrice) / openPrice)
      : openAmount * ((openPrice - closePrice) / openPrice);
    
    return {
      value: pnlValue,
      isProfitable
    };
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 bg-arena-card/80">
            <TableHead 
              className="text-white font-bold text-center bg-gradient-to-r from-arena-accent/30 to-arena-accent2/30 rounded-l-lg"
            >
              <div className="flex justify-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-arena-accent to-arena-accent2 font-bold">
                  Round
                </span>
              </div>
            </TableHead>
            
            {topAgents.map((agent, index) => (
              <TableHead 
                key={agent.id} 
                className={cn(
                  "text-white font-bold",
                  index === topAgents.length - 1 ? "rounded-r-lg" : ""
                )}
              >
                <div className={cn(
                  "px-3 py-2 rounded-md bg-gradient-to-r bg-opacity-20",
                  `bg-gradient-to-r ${getAgentHeaderGradient(agent, index)}/20`
                )}>
                  <div className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 flex items-center">
                    <span className="truncate max-w-[100px]">{agent.name}</span>
                    {agent.isUser && 
                      <Badge className="ml-1.5 bg-white/20 hover:bg-white/30 text-white text-xs">
                        YOU
                      </Badge>
                    }
                  </div>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(logsByRound)
            .sort(([a], [b]) => Number(a) - Number(b)) // Sort rounds in ascending order
            .map(([round, roundLogs]) => (
              <TableRow key={round} className="border-white/5 hover:bg-white/5">
                <TableCell className="font-bold text-center bg-gradient-to-r from-arena-accent/10 to-arena-accent2/10">
                  <div className="bg-clip-text text-transparent bg-gradient-to-r from-arena-accent to-arena-accent2">
                    Round {round}
                  </div>
                </TableCell>
                {topAgents.map((agent, index) => {
                  const trades = getAgentTradesForRound(agent.id, roundLogs);
                  const openTrade = trades.find(t => t.action === 'long' || t.action === 'short');
                  const closeTrade = trades.find(t => t.action === 'close');
                  
                  // Calculate PnL if there are both open and close trades
                  const pnl = calculatePnL(openTrade, closeTrade);
                  
                  const cellClass = cn(
                    "py-3",
                    agent.isUser ? "bg-gradient-to-r from-arena-accent/5 to-arena-accent2/5" : ""
                  );
                  
                  return (
                    <TableCell key={agent.id} className={cellClass}>
                      {trades.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {openTrade && (
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center">
                                <span className={getActionClassName(openTrade.action)}>
                                  {openTrade.action.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs mt-1">
                                <span className="text-arena-textMuted">Amount:</span>
                                <span className="font-medium tabular-nums">{formatCurrency(openTrade.amount)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-arena-textMuted">Price:</span>
                                <span className="font-mono font-medium">${openTrade.price.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                          
                          {closeTrade && (
                            <div className="flex flex-col gap-1.5 pt-2 mt-2 border-t border-white/5">
                              <div className="flex items-center">
                                <span className="bg-white/10 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                                  CLOSED
                                </span>
                              </div>
                              <div className="flex justify-between text-xs mt-1">
                                <span className="text-arena-textMuted">Amount:</span>
                                <span className="font-medium tabular-nums">{formatCurrency(closeTrade.amount)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-arena-textMuted">Price:</span>
                                <span className="font-mono font-medium">${closeTrade.price.toFixed(2)}</span>
                              </div>
                              
                              {/* Display PnL for closed trades */}
                              {pnl && (
                                <div className="flex justify-between text-xs mt-1">
                                  <span className="text-arena-textMuted">PnL:</span>
                                  <span className={`font-medium ${pnl.isProfitable ? 'text-arena-green' : 'text-arena-red'}`}>
                                    {pnl.isProfitable ? '+' : '-'}{formatCurrency(Math.abs(pnl.value))}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-arena-textMuted text-xs text-center italic">No trade</div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TradeHistoryTable;
