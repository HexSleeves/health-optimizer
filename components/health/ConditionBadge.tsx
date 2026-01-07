import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { clsx } from 'clsx';
import { X } from 'lucide-react-native';
import { ConditionSeverity } from '@/types/health';

interface ConditionBadgeProps {
  name: string;
  severity: ConditionSeverity;
  onRemove?: () => void;
  showSeverity?: boolean;
  size?: 'sm' | 'md';
}

const severityColors: Record<ConditionSeverity, { bg: string; text: string; dot: string }> = {
  mild: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
  },
  moderate: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    dot: 'bg-yellow-500',
  },
  severe: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    dot: 'bg-orange-500',
  },
  critical: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
  },
};

export function ConditionBadge({
  name,
  severity,
  onRemove,
  showSeverity = true,
  size = 'md',
}: ConditionBadgeProps) {
  const colors = severityColors[severity];
  const isSmall = size === 'sm';

  return (
    <View
      className={clsx(
        'flex-row items-center rounded-full',
        colors.bg,
        isSmall ? 'px-2 py-1' : 'px-3 py-1.5'
      )}
    >
      {showSeverity && (
        <View
          className={clsx(
            'rounded-full mr-2',
            colors.dot,
            isSmall ? 'w-1.5 h-1.5' : 'w-2 h-2'
          )}
        />
      )}
      <Text
        className={clsx(
          'font-medium',
          colors.text,
          isSmall ? 'text-xs' : 'text-sm'
        )}
      >
        {name}
      </Text>
      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          className="ml-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={isSmall ? 12 : 14} color={severityColors[severity].text.replace('text-', '#').replace('-800', '')} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// Severity indicator component
interface SeverityIndicatorProps {
  severity: ConditionSeverity;
  showLabel?: boolean;
}

export function SeverityIndicator({ severity, showLabel = true }: SeverityIndicatorProps) {
  const colors = severityColors[severity];
  const labels: Record<ConditionSeverity, string> = {
    mild: 'Mild',
    moderate: 'Moderate',
    severe: 'Severe',
    critical: 'Critical',
  };

  return (
    <View className="flex-row items-center">
      <View className={clsx('w-3 h-3 rounded-full', colors.dot)} />
      {showLabel && (
        <Text className={clsx('ml-2 text-sm font-medium', colors.text)}>
          {labels[severity]}
        </Text>
      )}
    </View>
  );
}
