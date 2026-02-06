import { styled, GetProps, XStack, View, Text } from 'tamagui';

const BadgeFrame = styled(XStack, {
  name: 'Badge',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$full',
  paddingHorizontal: '$1.5',
  paddingVertical: '$0.5',
  gap: '$0.5',

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
      },
      secondary: {
        backgroundColor: '$secondary',
      },
      success: {
        backgroundColor: '$success',
      },
      warning: {
        backgroundColor: '$warning',
      },
      error: {
        backgroundColor: '$error',
      },
      info: {
        backgroundColor: '$info',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$primary',
      },
      ghost: {
        backgroundColor: '$backgroundHover',
      },
    },
    size: {
      sm: {
        paddingHorizontal: '$1',
        paddingVertical: 2,
        minHeight: 20,
      },
      md: {
        paddingHorizontal: '$1.5',
        paddingVertical: '$0.5',
        minHeight: 24,
      },
      lg: {
        paddingHorizontal: '$2',
        paddingVertical: '$0.5',
        minHeight: 28,
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

const BadgeText = styled(Text, {
  name: 'BadgeText',
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
      success: {
        color: '#166534',
      },
      warning: {
        color: '#854D0E',
      },
      error: {
        color: '#991B1B',
      },
      info: {
        color: '#1E40AF',
      },
      outline: {
        color: '$primary',
      },
      ghost: {
        color: '$color',
      },
    },
    size: {
      sm: {
        fontSize: 10,
        lineHeight: 12,
      },
      md: {
        fontSize: '$xs',
        lineHeight: 14,
      },
      lg: {
        fontSize: '$sm',
        lineHeight: 16,
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

type BadgeFrameProps = GetProps<typeof BadgeFrame>;

export interface BadgeProps extends BadgeFrameProps {
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  ...props
}: BadgeProps) {
  return (
    <BadgeFrame variant={variant} size={size} {...props}>
      {leftIcon}
      <BadgeText variant={variant} size={size}>
        {children}
      </BadgeText>
      {rightIcon}
    </BadgeFrame>
  );
}

// Dot Badge for notifications
const DotBadge = styled(View, {
  name: 'DotBadge',
  borderRadius: '$full',

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
      },
      error: {
        backgroundColor: '$error',
      },
      success: {
        backgroundColor: '$success',
      },
    },
    size: {
      sm: {
        width: 6,
        height: 6,
      },
      md: {
        width: 8,
        height: 8,
      },
      lg: {
        width: 10,
        height: 10,
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export type BadgeDotProps = GetProps<typeof DotBadge>;

Badge.Dot = DotBadge;
