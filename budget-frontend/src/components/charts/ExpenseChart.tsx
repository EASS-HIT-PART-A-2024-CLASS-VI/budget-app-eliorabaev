// src/components/charts/ExpenseChart.tsx
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
  LinearProgress,
} from '@mui/material';
import { TrendingDown, BarChart as BarChartIcon, PieChart as PieChartIcon } from '@mui/icons-material';
import { useGetExpenseStats, useGetTopCategories } from '../../hooks/useExpenses';
import { formatCurrency } from '../../utils/formatters';

interface ExpenseChartProps {
  balanceId: number;
  height?: number;
  showTitle?: boolean;
  defaultViewType?: 'bar' | 'pie';
  showBudgetProgress?: boolean;
}

// Colors for chart segments (warmer colors for expenses)
const COLORS = [
  '#d32f2f', '#f57c00', '#7b1fa2', '#c62828', '#ef5350',
  '#ff8a65', '#ab47bc', '#8e24aa', '#e91e63', '#ad1457'
];

export const ExpenseChart: React.FC<ExpenseChartProps> = ({
  balanceId,
  height = 400,
  showTitle = true,
  defaultViewType = 'pie',
  showBudgetProgress = false,
}) => {
  const [viewType, setViewType] = React.useState<'bar' | 'pie'>(defaultViewType);
  
  const {
    data: expenseStats,
    isLoading,
    error,
  } = useGetExpenseStats(balanceId);

  const {
    data: topCategories,
    isLoading: topCategoriesLoading,
  } = useGetTopCategories(balanceId, 10); // Get top 10 categories

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!expenseStats?.categories) return [];
    
    return expenseStats.categories
      .map((category, index) => ({
        ...category,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending
  }, [expenseStats]);

  // Calculate spending insights
  const spendingInsights = React.useMemo(() => {
    if (!chartData.length) return null;
    
    const topCategory = chartData[0];
    const totalCategories = chartData.length;
    const top3Spending = chartData.slice(0, 3).reduce((sum, cat) => sum + cat.amount, 0);
    const top3Percentage = expenseStats ? (top3Spending / expenseStats.total) * 100 : 0;
    
    return {
      topCategory,
      totalCategories,
      top3Percentage,
      diversification: totalCategories > 5 ? 'High' : totalCategories > 2 ? 'Medium' : 'Low',
    };
  }, [chartData, expenseStats]);

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
            {data.category}
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
    if (entry.percentage < 3) return ''; // Hide label if slice is too small
    return `${entry.percentage.toFixed(0)}%`;
  };

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load expense data. Please try again.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader
          avatar={<TrendingDown color="error" />}
          title="Expense Breakdown"
          subheader={expenseStats ? `Total: ${formatCurrency(expenseStats.total)} across ${expenseStats.count} categories` : 'Loading...'}
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
        {expenseStats && (
          <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
            <Chip
              label={`Total: ${formatCurrency(expenseStats.total)}`}
              color="error"
              variant="outlined"
            />
            <Chip
              label={`Categories: ${expenseStats.count}`}
              color="info"
              variant="outlined"
            />
            <Chip
              label={`Average: ${formatCurrency(expenseStats.average)}`}
              color="warning"
              variant="outlined"
            />
            {spendingInsights && (
              <Chip
                label={`Diversification: ${spendingInsights.diversification}`}
                color={spendingInsights.diversification === 'High' ? 'success' : 
                       spendingInsights.diversification === 'Medium' ? 'warning' : 'error'}
                variant="outlined"
              />
            )}
          </Stack>
        )}

        {/* Spending Insights */}
        {spendingInsights && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Your top spending category is <strong>{spendingInsights.topCategory.category}</strong> at{' '}
              {formatCurrency(spendingInsights.topCategory.amount)} ({spendingInsights.topCategory.percentage.toFixed(1)}%).
              Your top 3 categories account for {spendingInsights.top3Percentage.toFixed(1)}% of total spending.
            </Typography>
          </Alert>
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
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
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
                    fill="#d32f2f"
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
              <TrendingDown sx={{ fontSize: 48, color: 'grey.400' }} />
              <Typography color="text.secondary" textAlign="center">
                No expense data available
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Add some expenses to see the breakdown
              </Typography>
            </Box>
          )}
        </Box>

        {/* Top Categories Summary with Progress Bars */}
        {chartData.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Top Spending Categories
            </Typography>
            <Stack spacing={2}>
              {chartData.slice(0, 5).map((category, index) => (
                <Box key={category.category}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: category.color,
                        }}
                      />
                      <Typography variant="body2">{category.category}</Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(category.amount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {category.percentage.toFixed(1)}% • {category.count} transactions
                      </Typography>
                    </Box>
                  </Box>
                  {showBudgetProgress && (
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(category.percentage, 100)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: category.color,
                        },
                      }}
                    />
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};