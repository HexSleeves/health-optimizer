import React from 'react';
import { View, ViewProps } from 'react-native';
import { clsx } from 'clsx';

interface ProgressProps extends ViewProps {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const colorStyles = {
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  destructive: 'bg-destructive',
};

export function Progress({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <View
      className={clsx(
        'w-full rounded-full bg-muted overflow-hidden',
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <View
        className={clsx('h-full rounded-full', colorStyles[color])}
        style={{ width: `${percentage}%` }}
      />
    </View>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = '#22c55e',
  trackColor = '#e2e8f0',
  children,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <View className="absolute items-center justify-center">
        {children}
      </View>
      {/* SVG would go here - for React Native, use react-native-svg */}
      {/* For now, using a simple View-based representation */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: trackColor,
        }}
        className="absolute"
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
          transform: [{ rotate: `${(percentage / 100) * 360}deg` }],
        }}
        className="absolute"
      />
    </View>
  );
}
