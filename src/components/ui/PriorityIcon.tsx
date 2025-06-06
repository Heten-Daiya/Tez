import { Flame, AlertTriangle, CircleDot, Feather } from 'lucide-react';
import { TaskPriority, getPriorityColor } from '../../types';

export const PriorityIcon = ({ priority }: { priority: TaskPriority }) => {
  const iconMap = {
    [TaskPriority.Critical]: Flame,
    [TaskPriority.High]: AlertTriangle,
    [TaskPriority.Medium]: CircleDot,
    [TaskPriority.Low]: Feather
  };

  const IconComponent = iconMap[priority];
  
  return <IconComponent className={`h-4 w-4 ${getPriorityColor(priority)}`} />;
};