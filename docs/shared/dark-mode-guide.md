# Guia de Implementação: Dark Mode — A-hub Mobile

> Documento de referência para implementar dark mode em qualquer módulo do app.
> Baseado nos padrões comprovados do Dashboard, Wallet e Profile.

---

## 1. Problema & Causa Raiz

Os tokens Tamagui (`$color`, `$colorSecondary`, `$colorTertiary`) **NÃO resolvem corretamente** em dark mode neste app. Os componentes `<Text>` e `<Heading>` de `@ahub/ui` usam esses tokens como default:

```tsx
// packages/ui/src/components/Text.tsx
export const Text = styled(TamaguiText, {
  color: '$color',          // ← NÃO muda em dark mode
  variants: {
    color: {
      primary:   { color: '$color' },
      secondary: { color: '$colorSecondary' },
      tertiary:  { color: '$colorTertiary' },
    },
  },
});
```

**Resultado:** textos ficam pretos (`#1F2937`) mesmo com background escuro.

**Solução adotada no projeto inteiro:** bypass dos tokens Tamagui com `style={{ color: ... }}` explícito usando hooks de tema por módulo.

---

## 2. Arquitetura do Sistema de Temas

### 2.1 Hierarquia

```
ThemeProvider (global)
  ├── useThemeContext()          → { theme: 'light'|'dark', toggleTheme, setThemeMode }
  │
  ├── useDashboardTheme()       → 74 tokens (tela principal, feed, FAB, stories)
  ├── useWalletTheme()          → 98 tokens (pontos, scanner, glass panels)
  ├── useProfileTheme()         → 44 tokens (perfil, badges, rankings)
  └── useModuleTheme()          → ??? tokens (SEU NOVO MÓDULO)
```

### 2.2 ThemeProvider — Como funciona

**Arquivo:** `apps/mobile/src/providers/ThemeProvider.tsx`

```tsx
// Suporta 3 modos: 'light' | 'dark' | 'system'
// Persiste escolha no SecureStore
// Ciclo do toggle: system → light → dark → system

interface ThemeContextValue {
  theme: 'light' | 'dark';              // Tema computado (resultado final)
  themeMode: 'light' | 'dark' | 'system'; // Preferência do usuário
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// Integração com Tamagui no _layout.tsx:
<ThemeProvider>
  <TamaguiProvider config={config} defaultTheme={theme}>
    <Theme name={theme}>{children}</Theme>
  </TamaguiProvider>
</ThemeProvider>

// StatusBar automática:
<StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
```

---

## 3. Paleta de Cores — Referência Completa

### 3.1 Cores Base (compartilhadas entre módulos)

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `screenBg` | `#0D0520` | `#FAFAFA` ou `#FFFFFF` | Background da tela |
| `textPrimary` | `#FFFFFF` | `#1F2937` | Títulos, nomes, labels |
| `textSecondary` | `rgba(255,255,255,0.6)` | `#6B7280` | Subtítulos, descrições |
| `textTertiary` | `rgba(255,255,255,0.4)` | `#9CA3AF` | Texto muted, hints |
| `accent` | `#22D3EE` (cyan) | `#8B5CF6` (purple) | Botões, links, indicadores |
| `accentBg` | `rgba(34,211,238,0.10)` | `rgba(139,92,246,0.08)` | Background de destaque |
| `borderColor` | `rgba(255,255,255,0.08)` | `#E5E7EB` | Bordas gerais |
| `cardBg` | `rgba(255,255,255,0.10)` | `undefined` ou `rgba(...)` | Cards e superfícies |
| `cardBorder` | `rgba(255,255,255,0.08)` | `transparent` | Borda de cards |
| `iconColor` | `rgba(255,255,255,0.7)` | `#6B7280` | Ícones decorativos |

### 3.2 Cores de Superfície

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `surfaceBg` | `#252542` | `#FFFFFF` | Inputs, panels sólidos |
| `modalBg` / `sheetBg` | `#1A0A2E` | `#FFFFFF` | Bottom sheets e modais |
| `overlayBg` | `rgba(13,5,32,0.92)` | `rgba(0,0,0,0.5)` | Fundo atrás de modais |
| `glassBg` | `rgba(255,255,255,0.07)` | `#FFFFFF` | Glass panels (BlurView) |
| `glassBorder` | `rgba(34,211,238,0.15)` | `rgba(139,92,246,0.12)` | Borda de glass |

### 3.3 Cores Interativas

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `pressedBg` | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.04)` | Estado pressed |
| `headerButtonBg` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.06)` | Botões no header |
| `inputBg` | `rgba(255,255,255,0.07)` | `transparent` | Background de inputs |
| `inputBorder` | `rgba(255,255,255,0.12)` | `#E5E7EB` | Borda de inputs |
| `inputText` | `#FFFFFF` | `#1F2937` | Texto dentro de inputs |
| `inputPlaceholder` | `rgba(255,255,255,0.3)` | `#9CA3AF` | Placeholder de inputs |

### 3.4 Cores Semânticas

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `success` | `#4ADE80` | `#22C55E` | Mensagens de sucesso |
| `successBg` | `rgba(74,222,128,0.12)` | `rgba(34,197,94,0.10)` | Background sucesso |
| `error` | `#F87171` | `#EF4444` | Erros |
| `errorBg` | `rgba(248,113,113,0.12)` | `rgba(248,113,113,0.08)` | Background erro |
| `warning` | `#FDE68A` | `#F59E0B` | Avisos |

### 3.5 Shadows — Light Only

```tsx
// Dark mode: SEM sombras (profundidade via bordas e opacidade)
// Light mode: Sombras normais para elevação
cardShadow: isDark
  ? {}
  : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
```

### 3.6 Gradientes

```tsx
gradientColors: isDark
  ? (['#1E0A3C', '#0D0520'] as const)
  : (['#F5F3FF', '#FAFAFA'] as const),
```

---

## 4. Passo a Passo — Implementar Dark Mode em Novo Módulo

### Passo 1: Criar o hook `useModuleTheme.ts`

**Arquivo:** `apps/mobile/src/features/{modulo}/hooks/use{Modulo}Theme.ts`

```tsx
import { useThemeContext } from '@/providers/ThemeProvider';

export function useEventsTheme() {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  return {
    isDark,

    // ──── Screen ────
    screenBg: isDark ? '#0D0520' : '#FAFAFA',

    // ──── Text ────
    textPrimary: isDark ? '#FFFFFF' : '#1F2937',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    textTertiary: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',

    // ──── Accent ────
    accent: isDark ? '#22D3EE' : '#8B5CF6',
    accentBg: isDark ? 'rgba(34,211,238,0.10)' : 'rgba(139,92,246,0.08)',

    // ──── Cards ────
    cardBg: isDark ? 'rgba(255,255,255,0.10)' : undefined as string | undefined,
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : undefined as string | undefined,

    // ──── Borders ────
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',

    // ──── Icons ────
    iconColor: isDark ? 'rgba(255,255,255,0.7)' : '#6B7280',

    // ──── Inputs ────
    inputBg: isDark ? 'rgba(255,255,255,0.07)' : 'transparent',
    inputBorder: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
    inputText: isDark ? '#FFFFFF' : '#1F2937',
    inputPlaceholder: isDark ? 'rgba(255,255,255,0.3)' : '#9CA3AF',

    // ──── Sheets/Modals ────
    sheetBg: isDark ? '#1A0A2E' : '#FFFFFF',
    overlayBg: isDark ? 'rgba(13,5,32,0.92)' : 'rgba(0,0,0,0.5)',

    // ──── Interactive ────
    pressedBg: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',

    // ──── Shadows ────
    cardShadow: isDark ? {} : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },

    // ──── Módulo-específico (adicione aqui) ────
    // ex: eventCardHighlight, ticketBg, etc.
  };
}

export type EventsTheme = ReturnType<typeof useEventsTheme>;
```

**Regra de ouro:** copie os tokens base da tabela acima e adicione tokens específicos do módulo conforme necessário.

### Passo 2: Aplicar na tela principal (screen)

```tsx
import { useEventsTheme } from '@/features/events/hooks/useEventsTheme';

export default function EventsScreen() {
  const et = useEventsTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: et.screenBg }} edges={['top']}>
      <ScrollView style={{ backgroundColor: et.screenBg }}>
        {/* conteúdo */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Passo 3: Aplicar em CADA `<Text>` e `<Heading>`

**REGRA OBRIGATÓRIA:** Todo `<Text>` e `<Heading>` DEVE ter `style={{ color: ... }}` explícito.

```tsx
// ❌ ERRADO — texto ficará preto no dark mode
<Text weight="semibold" size="lg">Título do Evento</Text>
<Text color="secondary">Descrição</Text>

// ✅ CORRETO — cores explícitas via hook
<Text weight="semibold" size="lg" style={{ color: et.textPrimary }}>
  Título do Evento
</Text>
<Text color="secondary" style={{ color: et.textSecondary }}>
  Descrição
</Text>
<Heading level={3} style={{ color: et.textPrimary }}>
  Seção
</Heading>
```

**Hierarquia de texto:**

| Nível | Hook token | Quando usar |
|-------|-----------|-------------|
| Primary | `et.textPrimary` | Títulos, nomes, labels de form, valores numéricos |
| Secondary | `et.textSecondary` | Subtítulos, descrições, datas, helpers |
| Tertiary | `et.textTertiary` | Texto muted, hints, @usernames, badges locked |
| Accent | `et.accent` | Links, valores destacados, CTAs em texto |

### Passo 4: Aplicar em Cards e superfícies

```tsx
// ──── Card com Tamagui <Card> ────
<Card
  variant="flat"
  {...(et.cardBg ? {
    backgroundColor: et.cardBg,
    borderWidth: 1,
    borderColor: et.cardBorder,
    shadowOpacity: 0,           // Remove sombra no dark
  } : {})}
>
  <Text style={{ color: et.textPrimary }}>Card title</Text>
</Card>

// ──── Card com React Native <View> ────
<View style={[
  styles.card,
  {
    backgroundColor: et.cardBg ?? '#FFFFFF',
    borderColor: et.cardBorder ?? 'transparent',
    ...et.cardShadow,
  }
]}>
  <Text style={{ color: et.textPrimary }}>Card title</Text>
</View>
```

### Passo 5: Aplicar em Modais e Bottom Sheets

```tsx
<Modal visible={visible} transparent animationType="slide">
  {/* Overlay escuro */}
  <Pressable
    style={[styles.overlay, { backgroundColor: et.overlayBg }]}
    onPress={onClose}
  >
    {/* Sheet container */}
    <Pressable
      style={[styles.sheet, { backgroundColor: et.sheetBg }]}
      onPress={(e) => e.stopPropagation()}
    >
      {/* Handle bar */}
      <View style={[styles.handle, {
        backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'
      }]} />

      <Heading level={4} style={{ color: et.textPrimary }}>
        Título do Modal
      </Heading>
      <Text style={{ color: et.textSecondary }}>
        Subtítulo
      </Text>
    </Pressable>
  </Pressable>
</Modal>
```

### Passo 6: Aplicar em Inputs customizados

O `<Input>` de `@ahub/ui` já usa `useTheme()` do Tamagui para cores, mas para inputs customizados:

```tsx
// Input com TextInput nativo
<TextInput
  style={{
    color: et.inputText,
    backgroundColor: et.inputBg,
    borderColor: et.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  }}
  placeholderTextColor={et.inputPlaceholder}
  placeholder="Digite aqui..."
/>
```

### Passo 7: Ícones

```tsx
import { Calendar } from '@ahub/ui/src/icons';

// Ícone genérico — usa iconColor
<Icon icon={Calendar} size="md" color={et.iconColor} />

// Ícone de destaque — usa accent
<Icon icon={Calendar} size="md" color={et.accent} />

// Ícone Phosphor direto
<Calendar size={24} color={et.iconColor} weight="regular" />
```

### Passo 8: Separadores e bordas

```tsx
// Linha separadora
<View style={{
  height: 1,
  backgroundColor: et.borderColor,
  marginVertical: 12,
}} />

// Borda inferior em header
<View style={{
  borderBottomWidth: 1,
  borderBottomColor: et.borderColor,
  paddingBottom: 12,
}}>
```

### Passo 9: Empty states

```tsx
<YStack alignItems="center" paddingVertical="$8" gap="$3">
  <Icon icon={Calendar} size={48} color="muted" weight="duotone" />
  <Text weight="semibold" size="lg" style={{ color: et.textPrimary }}>
    Nenhum evento disponível
  </Text>
  <Text color="secondary" size="sm" align="center"
    style={{ color: et.textSecondary, maxWidth: 260 }}>
    Novos eventos aparecerão aqui.
  </Text>
</YStack>
```

### Passo 10: RefreshControl

```tsx
<FlatList
  refreshControl={
    <RefreshControl
      refreshing={isRefetching}
      onRefresh={refetch}
      tintColor={et.accent}                    // iOS spinner
      colors={[et.accent]}                     // Android spinner
      progressBackgroundColor={et.sheetBg}     // Android bg
    />
  }
/>
```

### Passo 11: Skeletons (se necessário)

```tsx
const skeletonBg = isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB';
const shimmerColors = isDark
  ? ['transparent', 'rgba(255,255,255,0.08)', 'transparent'] as const
  : ['transparent', 'rgba(255,255,255,0.5)', 'transparent'] as const;
```

---

## 5. Checklist de Verificação por Módulo

Após implementar, verificar **ambos os modos**:

### Dark Mode
- [ ] Background da tela é `#0D0520` (deep purple)
- [ ] Todos os títulos são **brancos** (`#FFFFFF`)
- [ ] Todos os subtítulos são **cinza claro** (`rgba(255,255,255,0.6)`)
- [ ] Texto muted é **cinza médio** (`rgba(255,255,255,0.4)`)
- [ ] Cards têm background semi-transparente com borda sutil
- [ ] Cards **NÃO têm sombra** no dark mode
- [ ] Accent color é **cyan** (`#22D3EE`)
- [ ] Ícones são visíveis (brancos com opacidade)
- [ ] Inputs têm texto branco e placeholder cinza
- [ ] Modais têm fundo `#1A0A2E` com overlay denso
- [ ] Status bar é `light` (ícones brancos)
- [ ] Nenhum texto preto/invisível em qualquer estado

### Light Mode
- [ ] Background da tela é `#FAFAFA` ou `#FFFFFF`
- [ ] Todos os títulos são **escuros** (`#1F2937`)
- [ ] Cards têm sombra neumórfica
- [ ] Accent color é **purple** (`#8B5CF6`)
- [ ] Status bar é `dark` (ícones pretos)
- [ ] Nenhuma regressão visual

---

## 6. Módulos Pendentes de Dark Mode

| Módulo | Hook | Status |
|--------|------|--------|
| Dashboard | `useDashboardTheme` | Implementado |
| Wallet/Points | `useWalletTheme` | Implementado |
| Profile | `useProfileTheme` | Implementado |
| Messages | Tokens diretos | Implementado |
| Card (carteirinha) | — | Parcial (tokens globais) |
| **Events** | — | **Pendente** |
| **Store** | — | **Pendente** |
| **Subscriptions** | — | **Pendente** |
| **Bookings/Spaces** | — | **Pendente** |
| **Notifications** | — | **Pendente** |

---

## 7. Referência Rápida — Copiar e Colar

### Template mínimo do hook

```tsx
import { useThemeContext } from '@/providers/ThemeProvider';

export function use{Modulo}Theme() {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  return {
    isDark,
    screenBg:       isDark ? '#0D0520' : '#FAFAFA',
    textPrimary:    isDark ? '#FFFFFF' : '#1F2937',
    textSecondary:  isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    textTertiary:   isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',
    accent:         isDark ? '#22D3EE' : '#8B5CF6',
    accentBg:       isDark ? 'rgba(34,211,238,0.10)' : 'rgba(139,92,246,0.08)',
    cardBg:         isDark ? 'rgba(255,255,255,0.10)' : undefined as string | undefined,
    cardBorder:     isDark ? 'rgba(255,255,255,0.08)' : undefined as string | undefined,
    borderColor:    isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
    iconColor:      isDark ? 'rgba(255,255,255,0.7)' : '#6B7280',
    sheetBg:        isDark ? '#1A0A2E' : '#FFFFFF',
    overlayBg:      isDark ? 'rgba(13,5,32,0.92)' : 'rgba(0,0,0,0.5)',
    inputBg:        isDark ? 'rgba(255,255,255,0.07)' : 'transparent',
    inputBorder:    isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
    inputText:      isDark ? '#FFFFFF' : '#1F2937',
    inputPlaceholder: isDark ? 'rgba(255,255,255,0.3)' : '#9CA3AF',
    pressedBg:      isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
    cardShadow:     isDark ? {} : {
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    },
  };
}

export type {Modulo}Theme = ReturnType<typeof use{Modulo}Theme>;
```

### Padrão de uso no componente

```tsx
import { use{Modulo}Theme } from '../hooks/use{Modulo}Theme';

export function MeuComponente() {
  const t = use{Modulo}Theme();

  return (
    <View style={{ backgroundColor: t.screenBg }}>
      <Heading level={3} style={{ color: t.textPrimary }}>Título</Heading>
      <Text style={{ color: t.textSecondary }}>Subtítulo</Text>
      <Icon icon={Star} color={t.iconColor} />
    </View>
  );
}
```

---

## 8. Anti-Patterns — O que NÃO fazer

```tsx
// ❌ Confiar nos tokens Tamagui para cor de texto
<Text color="primary">Título</Text>          // NÃO funciona no dark
<Text color="secondary">Subtítulo</Text>     // NÃO funciona no dark

// ❌ Hardcodar cores
<Text style={{ color: '#1F2937' }}>Título</Text>  // Quebrará no dark

// ❌ Usar useColorScheme() direto (bypassa ThemeProvider)
const scheme = useColorScheme();  // NÃO respeita toggle manual

// ❌ Usar GlassCard de @ahub/ui (deprecated, usa useColorScheme)
<GlassCard>...</GlassCard>  // Usar GlassPanel ou CardGlassView

// ❌ Esquecer de remover sombras no dark mode
<View style={styles.cardWithShadow}>  // Sombra fica estranha no dark

// ✅ CORRETO — sempre via hook do módulo
const t = useModuleTheme();
<Text style={{ color: t.textPrimary }}>Título</Text>
<View style={{ ...t.cardShadow }}>  // Sombra condicional
```

---

## 9. Glassmorphism (Avançado)

Para módulos que precisam de efeitos glass (blur):

```tsx
// iOS: BlurView real
import { BlurView } from 'expo-blur';

// Android: Fallback para cor sólida
import { Platform } from 'react-native';

function GlassPanel({ children }) {
  const t = useModuleTheme();

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={t.isDark ? 18 : 40}
        tint={t.isDark ? 'dark' : 'light'}
        style={[styles.glass, { borderColor: t.glassBorder }]}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[
      styles.glass,
      {
        backgroundColor: t.isDark ? 'rgba(255,255,255,0.07)' : '#FFFFFF',
        borderColor: t.glassBorder,
      }
    ]}>
      {children}
    </View>
  );
}
```

---

## 10. Arquivos de Referência

| Arquivo | O que contém |
|---------|-------------|
| `apps/mobile/src/providers/ThemeProvider.tsx` | Context global, persistência, toggle |
| `apps/mobile/src/features/dashboard/hooks/useDashboardTheme.ts` | Hook referência (74 tokens) |
| `apps/mobile/src/features/wallet/hooks/useWalletTheme.ts` | Hook mais completo (98 tokens) |
| `apps/mobile/src/features/profile/hooks/useProfileTheme.ts` | Hook médio (44 tokens) |
| `packages/ui/src/components/Text.tsx` | Componente Text/Heading (tokens que NÃO funcionam) |
| `packages/ui/src/components/Input.tsx` | Input com `useTheme()` do Tamagui |
| `packages/ui/src/themes/tokens.ts` | Design tokens base (cores, espaços, fontes) |
| `packages/ui/src/themes/dark.ts` | Tema dark do Tamagui |
| `packages/ui/src/themes/light.ts` | Tema light do Tamagui |
