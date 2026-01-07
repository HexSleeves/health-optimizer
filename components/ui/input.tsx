import React, { forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  TextInputProps,
} from 'react-native';
import { clsx } from 'clsx';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerClassName,
      className,
      editable = true,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <View className={clsx('mb-4', containerClassName)}>
        {label && (
          <Text className="text-sm font-medium text-foreground mb-2">
            {label}
          </Text>
        )}
        <View
          className={clsx(
            'flex-row items-center rounded-xl border bg-white px-4',
            hasError ? 'border-destructive' : 'border-border',
            !editable && 'bg-muted'
          )}
        >
          {leftIcon && <View className="mr-3">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className={clsx(
              'flex-1 h-12 text-base text-foreground',
              className
            )}
            placeholderTextColor="#94a3b8"
            editable={editable}
            {...props}
          />
          {rightIcon && <View className="ml-3">{rightIcon}</View>}
        </View>
        {hasError && (
          <Text className="text-sm text-destructive mt-1">{error}</Text>
        )}
        {helperText && !hasError && (
          <Text className="text-sm text-muted-foreground mt-1">{helperText}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
