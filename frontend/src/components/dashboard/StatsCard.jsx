import { Card } from '../common/Card';
import { formatNumber } from '../../utils/formatters';

export const StatsCard = ({ title, value, description, icon }) => {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(value)}</p>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {icon && <div className="rounded-full bg-red-50 p-3 text-red-600">{icon}</div>}
      </div>
    </Card>
  );
};

export default StatsCard;
