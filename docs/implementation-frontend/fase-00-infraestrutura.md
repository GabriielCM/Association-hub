# Fase 0: Infraestrutura (Fundação)

**Complexidade:** Alta
**Duração estimada:** 2-3 semanas
**Dependências:** Nenhuma

## Objetivo

Estabelecer a base técnica que todas as fases consumirão:
- Fluxos de autenticação (Login, Register, JWT refresh)
- Design System component library
- API client com error handling
- WebSocket connection layer

---

## Arquivos para Ler Antes de Implementar

### Documentação
```
docs/shared/design-system.md
docs/shared/authentication.md
docs/api/endpoints-reference.md
```

### Tipos e Validação
```
packages/shared/src/types/index.ts
packages/shared/src/validation/index.ts
```

### Backend (DTOs de referência)
```
apps/api/src/modules/auth/dto/
apps/api/src/modules/auth/auth.controller.ts
```

---

## Arquivos para Criar

### Mobile (React Native + Expo)

#### Configuração do Projeto
```
apps/mobile/
├── app.json
├── babel.config.js
├── metro.config.js
├── tsconfig.json
├── App.tsx
```

#### Estrutura de Rotas (Expo Router)
```
apps/mobile/app/
├── _layout.tsx                    # Root layout com providers
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
└── (tabs)/
    ├── _layout.tsx                # Tab navigator
    ├── index.tsx                  # Dashboard
    ├── carteirinha.tsx
    ├── eventos.tsx
    ├── loja.tsx
    └── perfil.tsx
```

#### Services
```
apps/mobile/src/services/
├── api/
│   ├── client.ts                  # Axios com interceptors
│   ├── auth.api.ts
│   └── types.ts
├── storage/
│   ├── mmkv.ts
│   └── secure-store.ts
└── websocket/
    ├── socket.ts                  # Socket.io client
    └── events.ts
```

#### Providers
```
apps/mobile/src/providers/
├── AuthProvider.tsx
├── QueryProvider.tsx
├── ThemeProvider.tsx
└── WebSocketProvider.tsx
```

#### Hooks
```
apps/mobile/src/hooks/
├── useAuth.ts
├── useUser.ts
└── useBiometrics.ts
```

#### Stores (Zustand)
```
apps/mobile/src/stores/
├── auth.store.ts
├── user.store.ts
└── notification.store.ts
```

#### Componentes Base
```
apps/mobile/src/components/
├── common/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Loading.tsx
│   ├── Toast.tsx
│   └── Modal.tsx
└── auth/
    ├── LoginForm.tsx
    ├── RegisterForm.tsx
    └── BiometricPrompt.tsx
```

---

### Web (Next.js)

#### Configuração do Projeto
```
apps/web/
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── postcss.config.js
```

#### Estrutura de Rotas (App Router)
```
apps/web/app/
├── layout.tsx
├── page.tsx
├── (auth)/
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
├── (admin)/
│   ├── layout.tsx                 # Sidebar layout
│   └── dashboard/page.tsx
└── display/
    └── [eventId]/page.tsx
```

#### Lib
```
apps/web/src/lib/
├── api/
│   ├── client.ts
│   └── auth.api.ts
├── hooks/
│   └── useAuth.ts
└── providers/
    ├── AuthProvider.tsx
    ├── QueryProvider.tsx
    └── ThemeProvider.tsx
```

---

### UI Package (Tamagui - Cross-platform)

#### Configuração
```
packages/ui/
├── package.json
├── tsconfig.json
├── tamagui.config.ts
```

#### Themes
```
packages/ui/src/themes/
├── tokens.ts                      # Design tokens
├── light.ts
└── dark.ts
```

#### Componentes
```
packages/ui/src/components/
├── Button/
│   ├── Button.tsx
│   ├── Button.types.ts
│   └── index.ts
├── Input/
│   ├── Input.tsx
│   └── index.ts
├── Card/
│   ├── Card.tsx
│   └── index.ts
├── Avatar/
│   └── Avatar.tsx
├── Badge/
│   └── Badge.tsx
├── Typography/
│   ├── Text.tsx
│   └── Heading.tsx
└── Icon/
    └── Icon.tsx                   # Phosphor wrapper
```

---

## Especificações Técnicas

### API Client (Axios)

```typescript
// apps/mobile/src/services/api/client.ts
import axios from 'axios';
import { getTokens, setTokens, clearTokens } from '../storage/secure-store';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

// Request interceptor - add auth token
api.interceptors.request.use(async (config) => {
  const { accessToken } = await getTokens();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      const { refreshToken } = await getTokens();
      if (refreshToken) {
        try {
          const { data } = await axios.post('/auth/refresh', { refreshToken });
          await setTokens(data.accessToken, data.refreshToken);
          // Retry original request
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios(error.config);
        } catch {
          await clearTokens();
          // Redirect to login
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### Design Tokens

```typescript
// packages/ui/src/themes/tokens.ts
export const tokens = {
  colors: {
    primary: '#8B5CF6',
    secondary: '#06B6D4',
    success: '#86EFAC',
    warning: '#FDE68A',
    error: '#FCA5A5',
    info: '#93C5FD',
  },
  space: {
    1: 8,
    2: 16,
    3: 24,
    4: 32,
    6: 48,
    8: 64,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },
  fonts: {
    body: 'Inter',
  },
};
```

---

## Critérios de Verificação

- [x] Login/logout funcionando no mobile e web
- [x] Tema claro/escuro alternando corretamente
- [x] API client com refresh token automático
- [x] WebSocket conectando e reconectando
- [x] Componentes base renderizando corretamente
- [x] Biometria funcionando (Face ID / Touch ID)
- [x] Navegação entre tabs funcionando
- [x] Formulários validando com Zod

---

## Status: ✅ Completa

**Data de Conclusão:** 2026-02-06
