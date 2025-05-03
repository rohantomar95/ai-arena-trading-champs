
import React, { useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Agent, TradeLog } from '@/lib/gameData';

interface TradeHistoryTableProps {
  agents: Agent[];
  logs: TradeLog[];
}

const TradeHistoryTable: React.FC<TradeHistoryTableProps> = ({ agents, logs }) => {
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
    if (action === 'long') return 'bg-arena-green/20 text-arena-green px-2 py-0.5 rounded-full text-xs font-medium';
    if (action === 'short') return 'bg-arena-red/20 text-arena-red px-2 py-0.5 rounded-full text-xs font-medium';
    return 'bg-white/10 text-white px-2 py-0.5 rounded-full text-xs font-medium';
  };
  
  // Get agent's trade for a specific round
  const getAgentTradeForRound = (agentId: string, roundLogs: TradeLog[]) => {
    return roundLogs.find(log => log.agentId === agentId);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 bg-arena-card/50">
            <TableHead className="text-white font-bold text-center">Round</TableHead>
            {agents.map(agent => (
              <TableHead key={agent.id} className="text-white font-bold">{agent.name}</TableHead>
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
                {agents.map(agent => {
                  const trade = getAgentTradeForRound(agent.id, roundLogs);
                  
                  return (
                    <TableCell key={agent.id} className="py-3">
                      {trade ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center">
                            <span className={getActionClassName(trade.action)}>
                              {trade.action.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 mt-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-arena-textMuted">Amount:</span>
                              <span className="font-medium tabular-nums">{formatCurrency(trade.amount)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-arena-textMuted">Price:</span>
                              <span className="font-mono font-medium">${trade.price.toFixed(2)}</span>
                            </div>
                          </div>
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
