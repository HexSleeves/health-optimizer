import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { clsx } from 'clsx';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  default: {
    container: 'bg-primary-500 active:bg-primary-600',
    text: 'text-white',
  },
  destructive: {
    container: 'bg-destructive active:bg-red-600',
    text: 'text-white',
  },
  outline: {
    container: 'border border-border bg-transparent active:bg-muted',
    text: 'text-foreground',
  },
  secondary: {
    container: 'bg-secondary-100 active:bg-secondary-200',
    text: 'text-secondary-900',
  },
  ghost: {
    container: 'bg-transparent active:bg-muted',
    text: 'text-foreground',
  },
  link: {
    container: 'bg-transparent',
    text: 'text-primary-500 underline',
  },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  default: {
    container: 'h-12 px-6 py-3',
    text: 'text-base',
  },
  sm: {
    container: 'h-9 px-4 py-2',
    text: 'text-sm',
  },
  lg: {
    container: 'h-14 px-8 py-4',
    text: 'text-lg',
  },
  icon: {
    container: 'h-10 w-10 p-2',
    text: 'text-base',
  },
};

export function Button({
  variant = 'default',
  size = 'default',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <TouchableOpacity
      className={clsx(
        'flex-row items-center justify-center rounded-xl',
        variantStyle.container,
        sizeStyle.container,
        isDisabled && 'opacity-50',
        className
      )}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'default' || variant === 'destructive' ? '#ffffff' : '#22c55e'}
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          {typeof children === 'string' ? (
            <Text
              className={clsx(
                'font-semibold',
                variantStyle.text,
                sizeStyle.text
              )}
            >
              {children}
            </Text>
          ) : (
            children
          )}
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}
