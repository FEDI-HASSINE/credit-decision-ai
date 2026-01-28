import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type RiskChartProps = {
  riskScore: number;
  breakdown?: {
    category: string;
    score: number;
  }[];
};

export default function RiskChart({ riskScore, breakdown }: RiskChartProps) {
  const getColorForScore = (score: number) => {
    if (score < 0.3) return '#10B981'; // green
    if (score < 0.6) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const defaultBreakdown = [
    { category: 'Income Stability', score: riskScore * 0.8 },
    { category: 'Debt Ratio', score: riskScore * 1.1 },
    { category: 'Employment', score: riskScore * 0.9 },
    { category: 'Credit History', score: riskScore * 1.05 },
    { category: 'Behavioral', score: riskScore * 0.95 }
  ];

  const data = breakdown || defaultBreakdown;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg text-gray-900 mb-4">Risk Breakdown</h3>
      
      {/* Overall Risk Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Risk Score</span>
          <span className="text-2xl" style={{ color: getColorForScore(riskScore) }}>
            {(riskScore * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all"
            style={{
              width: `${riskScore * 100}%`,
              backgroundColor: getColorForScore(riskScore)
            }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis type="number" domain={[0, 1]} tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
          <YAxis type="category" dataKey="category" width={120} />
          <Tooltip 
            formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
            contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColorForScore(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
