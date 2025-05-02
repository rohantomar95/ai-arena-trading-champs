
import React, { useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface TradeLog {
  id: string;
  agentId: string;
  agentName: string;
  action: 'long' | 'short' | 'close';
  amount: number;
  timestamp: number;
  price: number;
  round: number;
}

interface TradeLogsProps {
  logs: TradeLog[];
}

const TradeLogs: React.FC<TradeLogsProps> = ({ logs }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
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
  
  const getActionClassName = (action: string) => {
    if (action === 'long') return 'bg-arena-green/20 text-arena-green px-2 py-0.5 rounded text-xs font-medium';
    if (action === 'short') return 'bg-arena-red/20 text-arena-red px-2 py-0.5 rounded text-xs font-medium';
    return 'bg-white/10 text-white px-2 py-0.5 rounded text-xs font-medium';
  };
  
  return (
    <div className="h-full overflow-hidden">
      <div className="overflow-y-auto h-full">
        <div className="grid gap-4 p-4">
          {/* Display each round as a separate section */}
          {Object.entries(logsByRound)
            .sort((a, b) => Number(b[0]) - Number(a[0])) // Sort rounds in descending order (latest first)
            .map(([round, roundLogs]) => (
              <div key={round} className="glass-card animate-fade-in overflow-hidden">
                <div className="p-3 border-b border-white/10 bg-arena-card/80">
                  <h3 className="font-bold text-lg">Round {round}</h3>
                </div>
                
                <div className="p-2">
                  {roundLogs.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="text-white">Agent</TableHead>
                          <TableHead className="text-white">Action</TableHead>
                          <TableHead className="text-white text-right">Amount</TableHead>
                          <TableHead className="text-white text-right">Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roundLogs.map((log) => (
                          <TableRow 
                            key={log.id} 
                            className="border-white/5 hover:bg-arena-bg/50 animate-scale-in"
                            style={{ animationDuration: '0.3s' }}
                          >
                            <TableCell className="font-medium">{log.agentName}</TableCell>
                            <TableCell>
                              <span className={getActionClassName(log.action)}>
                                {log.action.toUpperCase()}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {formatCurrency(log.amount)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              ${log.price.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-arena-textMuted">
                      No trades in Round {round} yet
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TradeLogs;
