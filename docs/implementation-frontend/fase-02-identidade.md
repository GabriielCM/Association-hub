# Fase 2: Identidade (Perfil + Carteirinha + Carteira)

**Complexidade:** Média
**Duração estimada:** 2 semanas
**Dependências:** Fase 1

## Objetivo

Implementar funcionalidades de identidade do usuário:
- Perfil com badges e posts
- Carteirinha digital com QR code e flip 3D
- Scanner de carteira para transferências
- Integração com Strava

---

## Arquivos para Ler Antes de Implementar

### Documentação - Perfil
```
docs/02-perfil/spec.md
docs/02-perfil/api.md
docs/02-perfil/acceptance-criteria.md
```

### Documentação - Carteirinha
```
docs/03-carteirinha/spec.md
docs/03-carteirinha/api.md
docs/03-carteirinha/qr-code.md
docs/03-carteirinha/benefits.md
```

### Documentação - Carteira
```
docs/05-minha-carteira/spec.md
docs/05-minha-carteira/api.md
```

### Backend (DTOs de referência)
```
apps/api/src/modules/profile/dto/
apps/api/src/modules/profile/profile.controller.ts
apps/api/src/modules/card/dto/
apps/api/src/modules/card/controllers/
apps/api/src/modules/wallet/dto/
apps/api/src/modules/wallet/wallet.controller.ts
```

---

## Arquivos para Criar

### Mobile - Perfil

#### Screens
```
apps/mobile/src/features/profile/screens/
├── ProfileScreen.tsx              # Perfil próprio
├── EditProfileScreen.tsx          # Editar perfil
├── OtherUserProfileScreen.tsx     # Ver perfil de outro usuário
└── BadgesScreen.tsx               # Todos os badges
```

#### Components
```
apps/mobile/src/features/profile/components/
├── ProfileHeader.tsx              # Avatar, nome, badges
├── BadgeGrid.tsx                  # 3 badges em destaque
├── BadgeItem.tsx                  # Badge individual
├── StatsRow.tsx                   # Pontos, eventos, etc.
└── PostsGrid.tsx                  # Grid de posts do usuário
```

#### Hooks
```
apps/mobile/src/features/profile/hooks/
├── useProfile.ts
├── useBadges.ts
└── useUpdateProfile.ts
```

#### API
```
apps/mobile/src/features/profile/api/
└── profile.api.ts
```

---

### Mobile - Carteirinha

#### Screens
```
apps/mobile/src/features/card/screens/
├── CardScreen.tsx                 # Carteirinha principal
├── CardHistoryScreen.tsx          # Histórico de uso
├── BenefitsScreen.tsx             # Lista de parceiros
└── PartnerDetailScreen.tsx        # Detalhes do parceiro
```

#### Components
```
apps/mobile/src/features/card/components/
├── MemberCard.tsx                 # Card com flip 3D
├── CardFront.tsx                  # Frente (foto, nome, ID)
├── CardBack.tsx                   # Verso (QR code)
├── QRCodeDisplay.tsx              # QR em modal grande
├── BenefitCard.tsx                # Card de benefício
└── PartnerMap.tsx                 # Mapa de parceiros
```

#### Hooks
```
apps/mobile/src/features/card/hooks/
├── useCard.ts
├── useBenefits.ts
└── useCardHistory.ts
```

#### API
```
apps/mobile/src/features/card/api/
└── card.api.ts
```

---

### Mobile - Carteira (Wallet)

#### Screens
```
apps/mobile/src/features/wallet/screens/
├── WalletScreen.tsx               # Home da carteira
├── ScannerScreen.tsx              # Scanner QR
├── TransferScreen.tsx             # Fluxo de transferência
├── HistoryScreen.tsx              # Histórico detalhado
└── StravaScreen.tsx               # Conexão Strava
```

#### Components
```
apps/mobile/src/features/wallet/components/
├── WalletCard.tsx                 # Display principal
├── MonthSummary.tsx               # +/- do mês
├── QuickActions.tsx               # Ações rápidas
├── QRScanner.tsx                  # Câmera scanner
├── ScanResult.tsx                 # Resultado do scan
├── StravaConnect.tsx              # Botão OAuth
├── StravaStatus.tsx               # Status da conexão
└── ActivityList.tsx               # Atividades sincronizadas
```

#### Hooks
```
apps/mobile/src/features/wallet/hooks/
├── useWallet.ts
├── useScan.ts
└── useStrava.ts
```

#### API
```
apps/mobile/src/features/wallet/api/
├── wallet.api.ts
└── strava.api.ts
```

---

### Web Admin - Parceiros

#### Components
```
apps/web/src/features/card/components/
├── PartnersTable.tsx              # Tabela de parceiros
├── CreatePartnerForm.tsx          # Criar/editar parceiro
└── CategoriesManager.tsx          # Gerenciar categorias
```

#### Pages
```
apps/web/src/features/card/pages/
├── PartnersPage.tsx
└── CardConfigPage.tsx
```

---

## Endpoints da API

### Perfil
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/user/:id/profile` | Perfil do usuário |
| GET | `/user/:id/badges` | Badges do usuário |
| GET | `/user/:id/rankings` | Rankings do usuário |
| PUT | `/user/profile` | Atualizar perfil |
| POST | `/user/avatar` | Upload de foto |
| PUT | `/user/badges/display` | Selecionar badges (max 3) |
| GET | `/user/username/check` | Verificar disponibilidade |

### Carteirinha
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/user/card` | Dados da carteirinha |
| GET | `/user/card/status` | Status da carteirinha |
| GET | `/user/card/qrcode` | QR code |
| GET | `/user/card/history` | Histórico de uso |

### Benefícios/Parceiros
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/benefits` | Lista de parceiros |
| GET | `/benefits/categories` | Categorias |
| POST | `/benefits/nearby` | Parceiros próximos |
| GET | `/benefits/:id` | Detalhes do parceiro |

### Carteira
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/wallet` | Dashboard da carteira |
| GET | `/wallet/summary` | Resumo de ganhos/gastos |
| POST | `/wallet/scan` | Processar QR escaneado |
| GET | `/wallet/pdv/checkout/:code` | Detalhes do checkout PDV |
| POST | `/wallet/pdv/pay` | Confirmar pagamento PDV |

---

## Especificações Técnicas

### Flip 3D da Carteirinha

```typescript
// apps/mobile/src/features/card/components/MemberCard.tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate
} from 'react-native-reanimated';

const MemberCard = () => {
  const rotation = useSharedValue(0);
  const isFlipped = useSharedValue(false);

  const flip = () => {
    rotation.value = withTiming(isFlipped.value ? 0 : 180, { duration: 600 });
    isFlipped.value = !isFlipped.value;
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotation.value, [0, 180], [0, 180])}deg` },
    ],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` },
    ],
    backfaceVisibility: 'hidden',
  }));

  return (
    <Pressable onPress={flip}>
      <Animated.View style={[styles.card, frontStyle]}>
        <CardFront />
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
        <CardBack />
      </Animated.View>
    </Pressable>
  );
};
```

### QR Code Security

```typescript
// QR Code contém:
// - userId
// - timestamp
// - HMAC-SHA256 hash

const generateQRPayload = (userId: string) => {
  const timestamp = Date.now();
  const data = `${userId}:${timestamp}`;
  const hash = hmacSHA256(data, SECRET_KEY);
  return JSON.stringify({ userId, timestamp, hash });
};
```

### Strava OAuth

```typescript
// apps/mobile/src/features/wallet/hooks/useStrava.ts
const connectStrava = async () => {
  const authUrl = `https://www.strava.com/oauth/authorize?` +
    `client_id=${STRAVA_CLIENT_ID}&` +
    `redirect_uri=${REDIRECT_URI}&` +
    `response_type=code&` +
    `scope=activity:read`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

  if (result.type === 'success') {
    const code = extractCodeFromUrl(result.url);
    await api.post('/strava/connect', { code });
  }
};
```

---

## Regras de Negócio

### Perfil
- Máximo **3 badges** em destaque
- Username único, validação em tempo real
- Foto: 120x120px, formato circular
- Ring de story ao redor da foto se houver story ativo

### Carteirinha
- QR code estático no verso
- Segurança baixa (ambiente controlado)
- Validação HMAC-SHA256
- Funciona **offline**

### Carteira/Strava
- Token permanente após conexão
- Sync **manual** (não automático)
- Limite: **5km/dia** pontuáveis
- Atividades: Run, Ride, Walk, Swim, Hike

---

## Critérios de Verificação

- [ ] Ver e editar perfil próprio
- [ ] Ver perfil de outro usuário
- [ ] Upload de foto de perfil
- [ ] Selecionar 3 badges para exibição
- [ ] Ver carteirinha com animação de flip
- [ ] QR code legível e válido
- [ ] Listar parceiros e benefícios
- [ ] Ver parceiros no mapa
- [ ] Escanear QR code com câmera
- [ ] Conectar conta Strava
- [ ] Sincronizar atividades do Strava
- [ ] Admin: gerenciar parceiros
