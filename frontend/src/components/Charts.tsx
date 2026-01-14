import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BodyMeasurement } from '../types';

interface ChartsProps {
  measurements: BodyMeasurement[];
  targetWeight: number;
}

export const WeightChart: React.FC<{ measurements: BodyMeasurement[] }> = ({ measurements }) => {
  const data = measurements.map(m => ({
    date: new Date(m.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
    вес: m.weightKg,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(1)} кг`}
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#FFF' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="вес"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface DayData {
  date: string;
  calories: number;
  target: number;
}

export const CaloriesChart: React.FC<{ data: DayData[] }> = ({ data: chartData }) => {
  const data = chartData.slice(-14).map(d => ({
    date: new Date(d.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
    съедено: d.calories,
    норма: d.target,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => `${Math.round(value)} ккал`}
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#FFF' }}
          />
          <Legend />
          <Bar dataKey="съедено" fill="#8B5CF6" />
          <Bar dataKey="норма" fill="#D1D5DB" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
