---
module: eventos
document: spec
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Eventos - Especificação

[← Voltar ao Índice](README.md)

---

## Índice

- [Visão Geral](#visão-geral)
- [Tipos de Usuários](#tipos-de-usuários)
- [Estados e Ciclo de Vida](#estados-e-ciclo-de-vida)
- [Integrações](#integrações)
- [Responsividade](#responsividade)
- [Notas de Desenvolvimento](#notas-de-desenvolvimento)
- [Fases de Implementação](#fases-de-implementação)
- [Métricas de Sucesso](#métricas-de-sucesso)

---

## Visão Geral

**Prioridade:** 🔴 MVP
**Status:** 🟢 Especificação Completa

**Descrição:**
Sistema completo de gestão de eventos com check-ins por QR Code dinâmico, distribuição de pontos, badges, display fullscreen para TVs/monitores e integração automática com o feed social.

---

## Tipos de Usuários

### 1. Common User (Usuário Comum)

**Pode:**
- ✅ Visualizar lista de eventos
- ✅ Ver detalhes de eventos
- ✅ Confirmar presença (RSVP)
- ✅ Fazer check-in via QR Code (scanner)
- ✅ Ver próprio progresso de check-ins
- ✅ Ganhar pontos e badges
- ✅ Comentar em eventos
- ✅ Ver no mapa (se aplicável)

**Não pode:**
- ❌ Criar/editar/deletar eventos
- ❌ Acessar analytics
- ❌ Fazer check-in manual de outros

---

### 2. ADM (Administrador)

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

---

### 3. Display (Tela de Exibição)

**Características:**
- 📺 Modo fullscreen (kiosk)
- 🔒 Read-only (apenas exibe)
- 🔄 Auto-refresh via WebSocket
- 📱 Não interage (não tem login de usuário)
- 🎯 Vinculado a 1 evento específico
- ⚡ Funciona offline (com cache)

**Exibe:**
- QR Code dinâmico (muda a cada 1 min)
- Informações do evento
- Check-in atual disponível
- Contador de check-ins realizados
- Banner/imagem do evento

---

## Estados e Ciclo de Vida

### Fluxo de Estados

```
[Rascunho] → [Agendado] → [Em Andamento] → [Encerrado]
     ↓             ↓              ↓
[Cancelado]   [Cancelado]   [Cancelado]
```

---

### Detalhamento dos Estados

**1. Rascunho**
- Evento criado mas não publicado
- Visível apenas para ADM
- Não aparece em listagens públicas
- Não cria Display
- Não cria post no feed
- Pode ser editado/deletado livremente
- **Transição:** Checkbox "Publicar evento" → Agendado

**2. Agendado**
- Evento publicado e visível
- Aguardando data de início
- **Ações do sistema:**
  - ✅ Cria Display vinculado
  - ✅ Cria post no feed (se checkbox marcado)
  - ✅ Aparece em listagens públicas
  - ✅ Usuários podem confirmar presença
  - ✅ Envia notificação de novo evento
- **Transição Automática:** Ao atingir data/hora de início → Em Andamento

**3. Em Andamento**
- Evento acontecendo agora
- Check-ins ativos
- Display mostrando QR Codes
- **Comportamento:**
  - ✅ Check-ins funcionando
  - ✅ QR Code rotacionando (segurança + check-ins)
  - ✅ Analytics em tempo real
  - ✅ Notificações de lembrete
  - ✅ Contador de presença atualizando
- **Transição Automática:** Ao atingir data/hora de fim → Encerrado

**4. Encerrado**
- Evento terminou
- Check-ins desabilitados
- Modo read-only
- **Comportamento:**
  - ❌ Não aceita mais check-ins
  - ✅ Usuários podem ver recap
  - ✅ Analytics disponíveis
  - ✅ Relatórios podem ser exportados
  - ✅ Pode editar descrição (adicionar fotos/recap)

**5. Cancelado (Soft Delete)**
- Evento foi cancelado pelo ADM
- Hidden para common users
- **Comportamento:**
  - ❌ Não aparece em listagens públicas
  - ✅ ADM ainda vê no painel (com badge "Cancelado")
  - ✅ Histórico preservado
  - ✅ Notifica quem confirmou presença
  - ✅ Post no feed é atualizado (badge "Cancelado")
  - ✅ Pontos já ganhos são mantidos

---

## Integrações

### Feed Social
- Post criado automaticamente ao publicar evento (se checkbox marcado)
- Editar evento → Atualiza post automaticamente
- Cancelar evento → Badge "Cancelado" no post
- Deletar evento → Remove post (apenas rascunhos)

### Sistema de Pontos
- Check-in realizado → Pontos creditados automaticamente
- Atualiza saldo em tempo real
- Histórico de transações registra fonte
- **Rollback:** Se evento cancelado após check-ins, pontos NÃO são retirados

### Perfil do Usuário
- Badge conquistado → Aparece no perfil automaticamente
- Usuário pode selecionar 3 badges para exibir

### Notificações
- Notificações de eventos vão para centro de notificações
- Badge contador no ícone de sino
- Ações rápidas nas notificações

### Módulo de Espaços
- Se implementado: Dropdown com espaços pré-cadastrados
- Auto-preenche: Endereço, capacidade, fotos
- Se não implementado: Campo "Local" é texto livre

### Minha Carteira (Scanner)
- Scanner universal detecta tipo de QR Code
- `type: "event_checkin"` → Processa check-in

---

## Responsividade

### Mobile (360px - 414px)
- Layout padrão (single column)
- Cards fullwidth
- Display: Não aplicável (TV/monitor)
- Scanner: Câmera fullscreen

### Tablet (768px - 1024px)
- Listagem: Grid 2 colunas
- Página do evento: Max-width 700px
- Display: Fullscreen

### Desktop (>1024px)
- Listagem: Grid 3 colunas
- Página do evento: Max-width 800px centralizado
- Display: Fullscreen (1920x1080 otimizado)

---

## Notas de Desenvolvimento

### Performance

**Otimizações Críticas:**
- Cache agressivo de imagens (banner, ícones)
- Lazy loading na listagem de eventos
- Virtual scroll se >50 eventos
- WebSocket com heartbeat (30s) para Display
- Debounce em check-in (500ms) para evitar duplicatas
- Compressão de imagens antes de upload

**Métricas Alvo:**
- Listagem de eventos: <2s
- Página do evento: <1.5s
- Scanner de QR Code: <500ms (reconhecimento)
- Display QR Code update: <200ms
- Analytics em tempo real: <3s

### Segurança

**QR Code:**
- Security token com HMAC-SHA256
- Timestamp validation (janela de 2 min)
- Rate limiting: 1 check-in por minuto por usuário
- Detecção de QR Code duplicado (mesmo token)

**Display:**
- URL pública mas dados limitados
- Apenas exibe, não modifica
- WebSocket read-only
- CORS configurado corretamente

**Check-in:**
- Validação no backend (não confiar no app)
- Verificar permissões de usuário
- Log de todas tentativas (sucesso e falha)

### Acessibilidade

**WCAG 2.1 AA:**
- Contrast ratio mín 4.5:1 (texto no Display)
- Touch targets mín 48x48px
- Labels descritivos para screen readers
- Suporte a font scaling (até 200%)
- QR Code com alt text explicativo

**Scanner:**
- Feedback sonoro ao escanear (opcional)
- Haptic feedback
- Mensagens de erro claras
- Instruções visuais de posicionamento

---

## Fases de Implementação

### Fase 1 - MVP (Essencial)

✅ Criar evento básico (todos campos obrigatórios)
✅ Listagem e filtros
✅ Página detalhada do evento
✅ Confirmar presença
✅ Sistema de check-in via QR Code
✅ Display fullscreen
✅ QR Code dinâmico (segurança + rotação)
✅ Distribuição de pontos
✅ Badges (seleção de existentes)
✅ Post automático no feed
✅ Categorias de eventos
✅ Notificações básicas
✅ Analytics básico (ADM)

### Fase 2 - Aprimoramentos

🟡 Eventos recorrentes
🟡 Mapa/localização
🟡 Galeria de fotos pós-evento
🟡 Analytics avançado
🟡 Exportar relatórios (CSV, PDF)
🟡 Capacidade e filas
🟡 Comentários com menções

### Fase 3 - Nice to Have

🟢 Eventos pagos
🟢 Check-in facial
🟢 Transmissão ao vivo
🟢 Integração com redes sociais

---

## Métricas de Sucesso

**KPIs a Acompanhar:**

### Criação de Eventos
- Eventos criados por mês
- Taxa de publicação (publicados / criados)
- Tempo médio de criação

### Engajamento
- Taxa de confirmação (confirmados / total de usuários)
- Taxa de presença (check-ins / confirmados)
- Check-ins por evento (média)
- Comentários por evento (média)

### Check-ins
- Total de check-ins por mês
- Taxa de completude (todos check-ins / pelo menos 1)
- Tempo médio entre check-ins
- Taxa de check-ins atrasados

### Display
- Uptime do Display (%)
- Taxa de erro do QR Code
- Latência do WebSocket

### Badges
- Taxa de conquista de badges
- Badges mais populares
- Tempo médio para conquistar

### Notificações
- Open rate por tipo de notificação
- Taxa de conversão (notificação → ação)

---

## Relacionados

- [Criação de Eventos](creation.md)
- [Display](display.md)
- [Sistema de Check-in](checkin-system.md)
- [QR Code Security](qr-code-security.md)
- [Badges](badges.md)
- [Analytics](analytics.md)
- [API](api.md)
- [Critérios de Aceitação](acceptance-criteria.md)
