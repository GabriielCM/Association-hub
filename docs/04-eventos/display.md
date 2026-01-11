---
module: eventos
document: display
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Eventos - Display Fullscreen

[← Voltar ao Índice](README.md)

---

## Índice

- [Geração Automática](#geração-automática)
- [Layout do Display](#layout-do-display)
- [Tecnologia e Atualização](#tecnologia-e-atualização)
- [Estados do Display](#estados-do-display)
- [Múltiplos Displays](#múltiplos-displays)

---

## Geração Automática

**Ao publicar evento:**
- Sistema gera automaticamente 1 Display vinculado
- Display tem ID único: `DISP-[EVENT_ID]`
- URL de acesso: `/display/[EVENT_ID]`
- Token de autenticação gerado

**Acesso:**
- ADM acessa painel de controle do evento
- Seção "Display"
- Botão "Abrir Display em Tela Cheia"
- Abre em nova aba/janela
- Recomendação: F11 para fullscreen

---

## Layout do Display

### Modo: Imersivo

```
┌─────────────────────────────────────────┐
│                                         │
│  [Background: Imagem do evento rotativa]│
│         (Overlay com cor do evento)     │
│                                         │
│          [LOGO ASSOCIAÇÃO - Topo]       │
│                                         │
│         FESTA JUNINA 2026               │
│         15 de Junho • 19h-23h           │
│                                         │
│         ┌─────────────────┐             │
│         │                 │             │
│         │   [QR CODE]     │             │
│         │   Grande        │             │
│         │                 │             │
│         └─────────────────┘             │
│                                         │
│       Escaneie para Check-in            │
│       CHECK-IN 1 de 4 • +25 pontos      │
│                                         │
│       ✓ 42 pessoas fizeram check-in     │
│                                         │
└─────────────────────────────────────────┘
```

---

### Elementos

**1. Background Dinâmico**
- Imagem(ns) do evento em fullscreen
- Se múltiplas: Rotação a cada 10s
- Overlay semi-transparente (cor do evento, 40% opacidade)
- Blur leve (10px) para destacar conteúdo frontal

**2. Logo da Associação**
- Posição: Topo centro
- Tamanho: 80x80px
- Sempre visível

**3. Informações do Evento**
- Título (36px, bold, branco)
- Data e hora (24px, branco)
- Centralizado

**4. QR Code**
- Tamanho: 400x400px
- Background branco (padding 20px)
- Border radius: 16px
- Shadow forte para destaque

**Conteúdo do QR Code:**
```json
{
  "type": "event_checkin",
  "event_id": "evt_123",
  "checkin_number": 1,
  "security_token": "abc123...",
  "timestamp": 1704067200,
  "expires_at": 1704067260
}
```

**5. Instruções**
- Texto: "Escaneie para Check-in" (28px)
- Check-in atual: "CHECK-IN 1 de 4" (24px)
- Pontos: "+25 pontos" (24px, destaque)
- Cor: Branco com shadow

**6. Contador de Presença**
- Ícone: ✓
- Texto: "42 pessoas fizeram check-in" (global do evento)
- Atualiza em tempo real (WebSocket)
- Posição: Bottom center

---

## Tecnologia e Atualização

### WebSocket (Tempo Real)

- Conexão persistente com backend
- Atualiza automaticamente:
  - Novo QR Code a cada 1 min
  - Mudança de check-in (após intervalo)
  - Contador de presença
  - Status do evento (pausado, cancelado)

### Fallback - Polling

- Se WebSocket falhar
- Polling a cada 30 segundos
- Menos eficiente mas funcional

### Funcionamento Offline

- Display funciona offline
- QR Code em cache (último válido)
- Backend valida check-ins quando reconectar
- Aviso discreto: "Modo Offline" no canto

### Reconexão

- Tenta reconectar a cada 5 segundos
- Sincroniza automaticamente ao voltar online
- Atualiza QR Code imediatamente

---

## Estados do Display

### 1. Aguardando Início

```
Evento começa em X horas
Aguarde...
```

### 2. Em Andamento

- Layout normal (conforme descrito acima)
- QR Code ativo e rotacionando

### 3. Intervalo entre Check-ins

```
[QR CODE]
Próximo check-in disponível em 15 minutos
Aguarde ou escaneie se chegou agora
```

- Mostra QR Code do check-in atual (ainda válido)
- Contador regressivo para próximo

### 4. Pausado (ADM)

```
Check-ins temporariamente pausados
Aguarde instruções
```

- Overlay escuro
- Sem QR Code
- Mensagem clara

### 5. Encerrado

```
Evento encerrado
Obrigado pela participação!
[Estatísticas finais]
```

### 6. Cancelado

```
Evento Cancelado
Desculpe pelo inconveniente.
```

---

## Múltiplos Displays

### Configuração

- **Ilimitados displays por evento**
- Todos mostram:
  - Mesmo evento
  - Mesmo check-in atual
  - Mesmo QR Code (sincronizado)

**Útil para:**
- Múltiplas entradas
- Eventos grandes
- Backup de hardware

### Sincronização

- WebSocket garante sincronia
- Todos os displays recebem update simultaneamente
- Contador de presença é global (não por display)

---

## Relacionados

- [Especificação](spec.md)
- [Criação de Eventos](creation.md)
- [QR Code Security](qr-code-security.md)
- [Sistema de Check-in](checkin-system.md)
- [API](api.md)
