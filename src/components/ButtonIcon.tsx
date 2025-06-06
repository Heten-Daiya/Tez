import { LucideIcon } from 'lucide-react';

interface ButtonIconProps {
  icon: LucideIcon;
  onClick: () => void;
  ariaLabel: string;
  className?: string;
  iconClassName?: string;
}

export const ButtonIcon: React.FC<ButtonIconProps> = ({
  icon: Icon,
  onClick,
  ariaLabel,
  className = 'text-gray-400 hover:text-indigo-500 transition-colors duration-200',
  iconClassName = 'h-4 w-4'
}) => (
  <button
    onClick={onClick}
    className={className}
    aria-label={ariaLabel}
  >
    <Icon className={iconClassName} />
  </button>
);