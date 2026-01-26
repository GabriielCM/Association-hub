---
section: overview
document: user-types
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Tipos de Usuários

[← Voltar ao Índice](README.md)

---

## Visão Geral

O A-hub possui três tipos de usuários com diferentes níveis de permissão:

| Tipo | Descrição | Uso |
|------|-----------|-----|
| Common User | Usuário comum/membro | App mobile |
| ADM | Administrador | App mobile + Painel web |
| Display | Tela de exibição | Modo kiosk em TV/monitor |

---

## 1. Common User (Usuário Comum)

### Descrição
Membro da associação que utiliza o aplicativo para interagir com a comunidade, participar de eventos e usufruir de benefícios.

### Permissões

**Pode:**
- ✅ Visualizar lista de eventos
- ✅ Ver detalhes de eventos
- ✅ Confirmar presença (RSVP)
- ✅ Fazer check-in via QR Code (scanner)
- ✅ Ver próprio progresso de check-ins
- ✅ Ganhar pontos e badges
- ✅ Comentar em eventos
- ✅ Ver no mapa (se aplicável)
- ✅ Criar posts e stories
- ✅ Curtir e comentar em posts
- ✅ Visualizar carteirinha digital
- ✅ Usar benefícios em parceiros
- ✅ Enviar mensagens diretas
- ✅ Configurar notificações

**Não pode:**
- ❌ Criar/editar/deletar eventos
- ❌ Acessar analytics
- ❌ Fazer check-in manual de outros
- ❌ Moderar conteúdo
- ❌ Fixar posts no feed
- ❌ Criar badges

---

## 2. ADM (Administrador)

### Descrição
Gestor da associação responsável por criar eventos, moderar conteúdo e analisar métricas de engajamento.

### Permissões

**Pode:**
- ✅ Tudo que Common User pode
- ✅ Criar/editar/deletar eventos
- ✅ Gerenciar badges (módulo separado)
- ✅ Configurar pontos e check-ins
- ✅ Visualizar analytics em tempo real
- ✅ Exportar relatórios
- ✅ Fazer check-in manual (exceções)
- ✅ Pausar/cancelar eventos
- ✅ Acessar painel de controle do Display
- ✅ Fixar posts no topo do feed
- ✅ Moderar posts e comentários
- ✅ Suspender usuários (24h, 7d, 30d, permanente)
- ✅ Gerenciar benefícios/parceiros

**Não pode:**
- ❌ Ver como Display (modo diferente)

### Indicadores Visuais
- Badge "🛡️ ADMINISTRAÇÃO" em posts de eventos
- Destaque em comentários de ADM

---

## 3. Display (Tela de Exibição)

### Descrição
Modo especial para TVs e monitores que exibem QR Codes de eventos para check-in.

### Características
- 📺 Modo fullscreen (kiosk)
- 🔒 Read-only (apenas exibe)
- 🔄 Auto-refresh via WebSocket
- 📱 Não interage (não tem login de usuário)
- 🎯 Vinculado a 1 evento específico
- ⚡ Funciona offline (com cache)

### O que Exibe
- QR Code dinâmico (muda a cada 1 min)
- Informações do evento
- Check-in atual disponível
- Contador de check-ins realizados
- Banner/imagem do evento

### Acesso
- URL: `/display/[EVENT_ID]`
- Token de autenticação gerado automaticamente
- Não requer login de usuário

---

## Matriz de Permissões

| Funcionalidade | Common | ADM | Display |
|---------------|--------|-----|---------|
| Ver eventos | ✅ | ✅ | ✅ |
| Criar eventos | ❌ | ✅ | ❌ |
| Fazer check-in | ✅ | ✅ | ❌ |
| Check-in manual | ❌ | ✅ | ❌ |
| Ver analytics | ❌ | ✅ | ❌ |
| Criar posts | ✅ | ✅ | ❌ |
| Fixar posts | ❌ | ✅ | ❌ |
| Moderar conteúdo | ❌ | ✅ | ❌ |
| Suspender usuários | ❌ | ✅ | ❌ |
| Exibir QR Code | ❌ | ❌ | ✅ |

---

## Fluxo de Autenticação

```
Common User: Login (email/senha ou social) → App Mobile
ADM: Login (email/senha) → App Mobile + Painel Web
Display: URL com token → Modo Kiosk (sem login)
```

---

## Relacionados

- [Autenticação](../shared/authentication.md)
- [Sistema de Moderação](../01-dashboard/spec.md#moderação-e-privacidade)
- [Eventos - Permissões ADM](../04-eventos/spec.md)
