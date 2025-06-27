// src/components/charts/IncomeChart.tsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Chip,
} from '@mui/material';
import { TrendingUp, BarChart as BarChartIcon, PieChart as PieChartIcon } from '@mui/icons-material';
import { useGetIncomeStats } from '../../hooks/useIncomes';
import { formatCurrency } from '../../utils/formatters';

interface IncomeChartProps {
  balanceId: number;
  height?: number;
  showTitle?: boolean;
  defaultViewType?: 'bar' | 'pie';
}

// Colors for chart segments
const COLORS = [
  '#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0',
  '#00acc1', '#d32f2f', '#689f38', '#f57c00', '#512da8'
];

export const IncomeChart: React.FC<IncomeChartProps> = ({
  balanceId,
  height = 400,
  showTitle = true,
  defaultViewType = 'bar',
}) => {
  const [viewType, setViewType] = React.useState<'bar' | 'pie'>(defaultViewType);
  
  const {
    data: incomeStats,
    isLoading,
    error,
  } = useGetIncomeStats(balanceId);

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!incomeStats?.sources) return [];
    
    return incomeStats.sources
      .map((source, index) => ({
        ...source,
        color: COLORS[index % COLORS.length],
        percentage: incomeStats.total > 0 ? (source.amount / incomeStats.total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending
  }, [incomeStats]);

  // Custom tooltip for bar chart
  const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
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
            {label}
          </Typography>
          <Typography variant="body2">
            Amount: {formatCurrency(data.amount)}
          </Typography>
          <Typography variant="body2">
            Count: {data.count} transactions
          </Typography>
          <Typography variant="body2">
            Percentage: {data.percentage.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
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
            {data.source}
          </Typography>
          <Typography variant="body2">
            {formatCurrency(data.amount)} ({data.percentage.toFixed(1)}%)
          </Typography>
          <Typography variant="body2">
            {data.count} transactions
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderPieLabel = (entry: any) => {
    if (entry.percentage < 5) return ''; // Hide label if slice is too small
    return `${entry.percentage.toFixed(0)}%`;
  };

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load income data. Please try again.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader
          avatar={<TrendingUp color="success" />}
          title="Income Breakdown"
          subheader={incomeStats ? `Total: ${formatCurrency(incomeStats.total)} from ${incomeStats.count} sources` : 'Loading...'}
          action={
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={(_, newType) => newType && setViewType(newType)}
              size="small"
            >
              <ToggleButton value="bar" aria-label="bar chart">
                <BarChartIcon />
              </ToggleButton>
              <ToggleButton value="pie" aria-label="pie chart">
                <PieChartIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          }
        />
      )}
      
      <CardContent>
        {/* Summary Statistics */}
        {incomeStats && (
          <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
            <Chip
              label={`Total: ${formatCurrency(incomeStats.total)}`}
              color="success"
              variant="outlined"
            />
            <Chip
              label={`Sources: ${incomeStats.count}`}
              color="info"
              variant="outlined"
            />
            <Chip
              label={`Average: ${formatCurrency(incomeStats.average)}`}
              color="primary"
              variant="outlined"
            />
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
              {viewType === 'bar' ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="source" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip content={<BarTooltip />} />
                  <Bar 
                    dataKey="amount" 
                    fill="#2e7d32"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderPieLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend 
                    formatter={(value, entry: any) => (
                      <span style={{ color: entry.color }}>
                        {value}: {formatCurrency(entry.payload.amount)}
                      </span>
                    )}
                  />
                </PieChart>
              )}
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
              <TrendingUp sx={{ fontSize: 48, color: 'grey.400' }} />
              <Typography color="text.secondary" textAlign="center">
                No income data available
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Add some income sources to see the breakdown
              </Typography>
            </Box>
          )}
        </Box>

        {/* Top Sources Summary */}
        {chartData.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Top Income Sources
            </Typography>
            <Stack spacing={1}>
              {chartData.slice(0, 3).map((source, index) => (
                <Box
                  key={source.source}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'grey.50',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: source.color,
                      }}
                    />
                    <Typography variant="body2">{source.source}</Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(source.amount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {source.percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};