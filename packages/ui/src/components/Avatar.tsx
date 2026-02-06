import { styled, GetProps, View, Text } from 'tamagui';
import { Image as RNImage } from 'react-native';

const AvatarFrame = styled(View, {
  name: 'Avatar',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$full',
  backgroundColor: '$primary',
  overflow: 'hidden',

  variants: {
    size: {
      xs: {
        width: 24,
        height: 24,
      },
      sm: {
        width: 32,
        height: 32,
      },
      md: {
        width: 40,
        height: 40,
      },
      lg: {
        width: 56,
        height: 56,
      },
      xl: {
        width: 80,
        height: 80,
      },
      '2xl': {
        width: 120,
        height: 120,
      },
    },
    variant: {
      circle: {
        borderRadius: '$full',
      },
      rounded: {
        borderRadius: '$lg',
      },
      square: {
        borderRadius: '$sm',
      },
    },
    bordered: {
      true: {
        borderWidth: 2,
        borderColor: '$surface',
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    variant: 'circle',
  },
});

const AvatarImage = styled(RNImage, {
  name: 'AvatarImage',
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
});

const AvatarFallback = styled(View, {
  name: 'AvatarFallback',
  width: '100%',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$primary',
});

const AvatarText = styled(Text, {
  name: 'AvatarText',
  fontFamily: '$body',
  fontWeight: '$semibold',
  color: '#FFFFFF',
  textTransform: 'uppercase',

  variants: {
    size: {
      xs: {
        fontSize: 10,
      },
      sm: {
        fontSize: '$xs',
      },
      md: {
        fontSize: '$sm',
      },
      lg: {
        fontSize: '$lg',
      },
      xl: {
        fontSize: '$xl',
      },
      '2xl': {
        fontSize: '$2xl',
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

const StatusIndicator = styled(View, {
  name: 'StatusIndicator',
  position: 'absolute',
  bottom: 0,
  right: 0,
  borderRadius: '$full',
  borderWidth: 2,
  borderColor: '$surface',

  variants: {
    status: {
      online: {
        backgroundColor: '$success',
      },
      offline: {
        backgroundColor: '$colorTertiary',
      },
      busy: {
        backgroundColor: '$error',
      },
      away: {
        backgroundColor: '$warning',
      },
    },
    size: {
      xs: {
        width: 6,
        height: 6,
      },
      sm: {
        width: 8,
        height: 8,
      },
      md: {
        width: 10,
        height: 10,
      },
      lg: {
        width: 14,
        height: 14,
      },
      xl: {
        width: 18,
        height: 18,
      },
      '2xl': {
        width: 24,
        height: 24,
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    status: 'online',
  },
});

type AvatarFrameProps = GetProps<typeof AvatarFrame>;

export interface AvatarProps extends AvatarFrameProps {
  src?: string | null | undefined;
  alt?: string | undefined;
  name?: string | undefined;
  status?: 'online' | 'offline' | 'busy' | 'away';
  showStatus?: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return (parts[0] ?? '').slice(0, 2);
  }
  const first = parts[0] ?? '';
  const last = parts[parts.length - 1] ?? '';
  return `${first[0] ?? ''}${last[0] ?? ''}`;
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  variant = 'circle',
  status,
  showStatus,
  bordered,
  ...props
}: AvatarProps) {
  const initials = name ? getInitials(name) : '?';

  return (
    <AvatarFrame
      size={size}
      variant={variant}
      bordered={bordered}
      {...props}
    >
      {src ? (
        <AvatarImage source={{ uri: src }} alt={alt || name} />
      ) : (
        <AvatarFallback>
          <AvatarText size={size}>{initials}</AvatarText>
        </AvatarFallback>
      )}
      {showStatus && status && (
        <StatusIndicator status={status} size={size} />
      )}
    </AvatarFrame>
  );
}
