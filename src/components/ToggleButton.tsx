import React from 'react';

interface ToggleButtonProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  enabledIcon: React.ComponentType;
  disabledIcon: React.ComponentType;
  label: string;
  darkMode: boolean;
  accentColor?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  enabled,
  setEnabled,
  enabledIcon: EnabledIcon,
  disabledIcon: DisabledIcon,
  label,
  darkMode,
  accentColor = 'bg-indigo-600'
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-2">
      {enabled ? 
        <EnabledIcon className="h-5 w-5" /> : 
        <DisabledIcon className="h-5 w-5" />}
      <span>{label}</span>
    </div>
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        enabled ? accentColor : 'bg-gray-200'
      }`}
    >
      <span
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  </div>
);