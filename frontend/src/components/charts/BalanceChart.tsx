// src/components/charts/BalanceChart.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Alert,
  Switch,
  FormControlLabel,
  Stack,
  Chip,
} from '@mui/material';
import { TrendingUp, Timeline } from '@mui/icons-material';
import { useGetBalanceGraph } from '../../hooks/useBalance';
import { formatCurrency } from '../../utils/formatters';

interface BalanceChartProps {
  balanceId: number;
  height?: number;
  showTitle?: boolean;
  showProjectedRevenue?: boolean;
}

export const BalanceChart: React.FC<BalanceChartProps> = ({
  balanceId,
  height = 400,
  showTitle = true,
  showProjectedRevenue = true,
}) => {
  const [showRevenue, setShowRevenue] = React.useState(showProjectedRevenue);
  
  const {
    data: graphData,
    isLoading,
    error,
    refetch,
  } = useGetBalanceGraph(balanceId);

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!graphData) return [];

    const { balance_graph, projected_revenue } = graphData;
    
    // Combine balance and revenue data by year
    const dataMap = new Map();
    
    // Add balance data
    balance_graph.forEach(item => {
      dataMap.set(item.year, {
        year: item.year,
        balance: item.balance,
      });
    });
    
    // Add projected revenue data
    if (showRevenue) {
      projected_revenue.forEach(item => {
        const existing = dataMap.get(item.year) || { year: item.year };
        dataMap.set(item.year, {
          ...existing,
          projectedBalance: item.projected_balance,
        });
      });
    }
    
    // Convert to array and sort by year
    return Array.from(dataMap.values()).sort((a, b) => a.year - b.year);
  }, [graphData, showRevenue]);

  // Calculate growth metrics
  const growthMetrics = React.useMemo(() => {
    if (!chartData || chartData.length < 2) return null;
    
    const firstYear = chartData[0];
    const lastYear = chartData[chartData.length - 1];
    
    const balanceGrowth = lastYear.balance - firstYear.balance;
    const balanceGrowthPercentage = firstYear.balance > 0 
      ? ((lastYear.balance - firstYear.balance) / firstYear.balance) * 100 
      : 0;
    
    const projectedGrowth = showRevenue && lastYear.projectedBalance
      ? lastYear.projectedBalance - firstYear.balance
      : 0;
    
    return {
      balanceGrowth,
      balanceGrowthPercentage,
      projectedGrowth,
      timeSpan: lastYear.year - firstYear.year,
    };
  }, [chartData, showRevenue]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            boxShadow: 2,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Year {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load chart data. Please try again.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader
          avatar={<Timeline color="primary" />}
          title="Balance Projection"
          subheader="Your financial growth over time"
          action={
            showProjectedRevenue && (
              <FormControlLabel
                control={
                  <Switch
                    checked={showRevenue}
                    onChange={(e) => setShowRevenue(e.target.checked)}
                    size="small"
                  />
                }
                label="Show Projections"
                labelPlacement="start"
              />
            )
          }
        />
      )}
      
      <CardContent>
        {/* Growth Metrics */}
        {growthMetrics && (
          <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
            <Chip
              icon={<TrendingUp />}
              label={`Growth: ${formatCurrency(growthMetrics.balanceGrowth)}`}
              color={growthMetrics.balanceGrowth >= 0 ? 'success' : 'error'}
              variant="outlined"
            />
            <Chip
              label={`${growthMetrics.balanceGrowthPercentage.toFixed(1)}% over ${growthMetrics.timeSpan} years`}
              color={growthMetrics.balanceGrowthPercentage >= 0 ? 'success' : 'error'}
              variant="outlined"
            />
            {showRevenue && growthMetrics.projectedGrowth > 0 && (
              <Chip
                label={`Projected: ${formatCurrency(growthMetrics.projectedGrowth)}`}
                color="info"
                variant="outlined"
              />
            )}
          </Stack>
        )}

        {/* Chart */}
        <Box height={height}>
          {isLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={height - 80} />
              <Skeleton variant="rectangular" height={20} />
            </Stack>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="year" 
                  type="number"
                  scale="linear"
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Current year reference line */}
                <ReferenceLine 
                  x={new Date().getFullYear()} 
                  stroke="#999" 
                  strokeDasharray="5 5"
                  label="Current Year"
                />
                
                {/* Balance line */}
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#1976d2"
                  strokeWidth={3}
                  dot={{ fill: '#1976d2', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8 }}
                  name="Balance"
                />
                
                {/* Projected revenue line */}
                {showRevenue && (
                  <Line
                    type="monotone"
                    dataKey="projectedBalance"
                    stroke="#f57c00"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#f57c00', strokeWidth: 2, r: 4 }}
                    name="Projected (8% Growth)"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
              flexDirection="column"
              gap={2}
            >
              <Timeline sx={{ fontSize: 48, color: 'grey.400' }} />
              <Typography color="text.secondary" textAlign="center">
                No data available for chart
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Add some income and expense data to see projections
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};