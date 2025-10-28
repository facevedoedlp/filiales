import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Card from '../common/Card';

export const ChartAcciones = ({ data = [] }) => {
  return (
    <Card title="Acciones por mes" description="Cantidad de acciones realizadas">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="mes" stroke="#475569" tick={{ fontSize: 12 }} />
            <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ fill: 'rgba(244, 63, 94, 0.1)' }} />
            <Bar dataKey="total" fill="#c41230" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ChartAcciones;
