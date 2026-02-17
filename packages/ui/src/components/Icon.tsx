import { useTheme } from 'tamagui';
import type { Icon as PhosphorIconType, IconWeight } from 'phosphor-react-native';
import { iconSizes } from '../themes/tokens';

export type { IconWeight } from 'phosphor-react-native';
export type { Icon as PhosphorIcon } from 'phosphor-react-native';

export type IconColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'muted'
  | 'inherit'
  | (string & {});

export type IconSize = keyof typeof iconSizes | number;

export interface IconProps {
  /** The Phosphor icon component to render */
  icon: PhosphorIconType;
  /** Size token or raw number. Default: 'md' (20px) */
  size?: IconSize;
  /** Semantic color or raw color string. Default: 'inherit' */
  color?: IconColor;
  /** Phosphor weight. Default: 'regular' */
  weight?: IconWeight;
  /** Flip horizontally for RTL */
  mirrored?: boolean;
  /** Test ID */
  testID?: string;
}

function resolveColor(color: string, theme: ReturnType<typeof useTheme>): string {
  const colorMap: Record<string, () => string> = {
    primary: () => theme.primary?.val as string,
    secondary: () => theme.secondary?.val as string,
    success: () => theme.success?.val as string,
    error: () => theme.error?.val as string,
    warning: () => theme.warning?.val as string,
    info: () => theme.info?.val as string,
    muted: () => (theme as any).textTertiary?.val ?? '#9CA3AF',
    inherit: () => theme.color?.val as string,
  };

  return colorMap[color]?.() ?? color;
}

export function Icon({
  icon: IconComponent,
  size = 'md',
  color = 'inherit',
  weight = 'regular',
  mirrored,
  testID,
}: IconProps) {
  const theme = useTheme();

  const resolvedSize = typeof size === 'number' ? size : (iconSizes[size] ?? 20);
  const resolvedColor = resolveColor(color, theme);

  return (
    <IconComponent
      size={resolvedSize}
      color={resolvedColor}
      weight={weight}
      {...(mirrored !== undefined && { mirrored })}
      {...(testID !== undefined && { testID })}
    />
  );
}

Icon.displayName = 'Icon';
