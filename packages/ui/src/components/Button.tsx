import { styled, GetProps, XStack, View, Text } from 'tamagui';
import { forwardRef } from 'react';

const ButtonFrame = styled(XStack, {
  name: 'Button',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$1',
  borderRadius: '$full',
  paddingHorizontal: '$3',
  paddingVertical: '$1.5',
  minHeight: 44,
  pressStyle: {
    scale: 0.97,
    opacity: 0.9,
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
        hoverStyle: {
          backgroundColor: '$primaryHover',
        },
        pressStyle: {
          backgroundColor: '$primaryPress',
        },
      },
      secondary: {
        backgroundColor: '$secondary',
        hoverStyle: {
          backgroundColor: '$secondaryHover',
        },
        pressStyle: {
          backgroundColor: '$secondaryPress',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '$primary',
        hoverStyle: {
          backgroundColor: '$primary',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        hoverStyle: {
          backgroundColor: '$backgroundHover',
        },
        pressStyle: {
          backgroundColor: '$backgroundPress',
        },
      },
      danger: {
        backgroundColor: '$error',
        hoverStyle: {
          opacity: 0.9,
        },
      },
    },
    size: {
      sm: {
        minHeight: 36,
        paddingHorizontal: '$2',
        paddingVertical: '$1',
      },
      md: {
        minHeight: 44,
        paddingHorizontal: '$3',
        paddingVertical: '$1.5',
      },
      lg: {
        minHeight: 52,
        paddingHorizontal: '$4',
        paddingVertical: '$2',
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

const ButtonText = styled(Text, {
  name: 'ButtonText',
  fontFamily: '$body',
  fontWeight: '$semibold',
  textAlign: 'center',

  variants: {
    variant: {
      primary: {
        color: '#FFFFFF',
      },
      secondary: {
        color: '#FFFFFF',
      },
      outline: {
        color: '$primary',
      },
      ghost: {
        color: '$primary',
      },
      danger: {
        color: '#7F1D1D',
      },
    },
    size: {
      sm: {
        fontSize: '$sm',
      },
      md: {
        fontSize: '$base',
      },
      lg: {
        fontSize: '$lg',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

type ButtonFrameProps = GetProps<typeof ButtonFrame>;

export interface ButtonProps extends ButtonFrameProps {
  children: React.ReactNode;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Button = forwardRef<any, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading,
      disabled,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <ButtonFrame
        ref={ref}
        variant={variant}
        size={size}
        disabled={isDisabled}
        pointerEvents={isDisabled ? 'none' : 'auto'}
        {...props}
      >
        {leftIcon && !loading && leftIcon}
        {loading && (
          <View
            width={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
            height={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
            borderRadius="$full"
            borderWidth={2}
            borderColor="$surface"
            borderTopColor="transparent"
            opacity={0.7}
          />
        )}
        <ButtonText variant={variant} size={size}>
          {children}
        </ButtonText>
        {rightIcon && !loading && rightIcon}
      </ButtonFrame>
    );
  }
);

Button.displayName = 'Button';
