---
module: eventos
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Eventos

[← Voltar ao Índice](../README.md)

---

**Status:** 🟢 Especificação Completa
**Prioridade:** 🔴 MVP

---

## Links Rápidos

| Documento | Descrição |
|-----------|-----------|
| [Especificação](spec.md) | Visão geral, objetivos, tipos de usuários |
| [Criação de Eventos](creation.md) | Formulário de criação (ADM) |
| [Display](display.md) | Display fullscreen para TVs |
| [Sistema de Check-in](checkin-system.md) | Scanner, processo, lógica |
| [QR Code Security](qr-code-security.md) | QR Code dinâmico anti-fraude |
| [Badges](badges.md) | Sistema de badges de eventos |
| [Analytics](analytics.md) | Dashboard de analytics (ADM) |
| [API](api.md) | Endpoints do módulo |
| [Critérios de Aceitação](acceptance-criteria.md) | Checklist de validação |

---

## Visão Geral

Sistema completo de gestão de eventos com check-ins por QR Code dinâmico, distribuição de pontos, badges, display fullscreen para TVs/monitores e integração automática com o feed social. Suporta múltiplos check-ins por evento com intervalos configuráveis e sistema de segurança anti-fraude.

---

## Objetivos

- Permitir criação e gestão de eventos pela administração
- Facilitar presença física através de check-ins via QR Code
- Distribuir pontos de forma gamificada baseada em presença
- Exibir eventos em displays fullscreen para facilitar check-ins
- Gerar engajamento através do feed social
- Fornecer analytics detalhados sobre participação
- Recompensar presença com badges personalizados

---

## Tipos de Usuários

| Tipo | Descrição | Permissões |
|------|-----------|------------|
| Common User | Membro comum | Ver eventos, fazer check-in, ganhar pontos |
| ADM | Administrador | Criar/editar eventos, ver analytics, check-in manual |
| Display | Tela de TV | Exibir QR Code, modo kiosk, read-only |

Ver detalhes em [Tipos de Usuários](../00-overview/user-types.md)

---

## Componentes Principais

1. **Criação de Eventos (ADM)**
   - Formulário completo
   - Preview Display/Feed
   - Configuração de pontos e check-ins

2. **Display Fullscreen**
   - QR Code dinâmico
   - Contador de presença
   - Múltiplos displays por evento

3. **Sistema de Check-in**
   - Scanner QR Code
   - Validação anti-fraude
   - Múltiplos check-ins por evento

4. **Analytics (ADM)**
   - Métricas em tempo real
   - Exportação de relatórios

---

## Dependências

- [Dashboard](../01-dashboard/) - Post automático no feed
- [Sistema de Pontos](../06-sistema-pontos/) - Distribuição de pontos
- [Perfil](../02-perfil/) - Badges conquistados
- [Notificações](../07-notificacoes/) - Lembretes e alertas
- [Minha Carteira](../05-minha-carteira/) - Scanner QR Code

---

## Integrações

### Feed Social
- Post criado automaticamente ao publicar evento
- Sincronizado com edições/cancelamentos

### Sistema de Pontos
- Check-in = pontos creditados
- Histórico de transações

### Badges
- Conquistados via check-in
- Aparecem no perfil

### Espaços (se implementado)
- Dropdown de espaços cadastrados
- Auto-preenche endereço/capacidade
