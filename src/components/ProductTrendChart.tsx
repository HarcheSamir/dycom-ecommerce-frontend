// src/components/ProductTrendChart.tsx

import type { FC } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import type { TrendDataPoint } from '../hooks/useWinningProducts';

interface ProductTrendChartProps {
  data?: TrendDataPoint[];
  isLoading: boolean;
  isError: boolean;
}

const CustomTooltip: FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 rounded-lg p-3 shadow-lg">
        <p className="label text-neutral-400 text-sm">{`${label}`}</p>
        <p className="intro font-bold text-gray-200">{`Intérêt : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const ProductTrendChart: FC<ProductTrendChartProps> = ({ data, isLoading, isError }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[10rem]">
        <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-neutral-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-full min-h-[10rem] bg-red-900/20 rounded-lg text-red-400">
        Erreur de chargement.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-full min-h-[10rem] text-neutral-500">
        Aucune donnée de tendance disponible.
      </div>
    );
  }

  const chartData = data.map(point => ({
    ...point,
    interest: point.value[0],
  }));

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="formattedTime" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="interest"
            name="Intérêt"
            stroke="#e5e7eb" // Brighter line color for better contrast
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, stroke: '#a78bfa', fill: '#e5e7eb' }}
          />
          
<Area type="monotone" dataKey="interest" fillOpacity={0.2} fill="url(#colorInterest)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductTrendChart;
