---
module: eventos
document: acceptance-criteria
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Eventos - Critérios de Aceitação

[← Voltar ao Índice](README.md)

---

## Criação e Gestão (ADM)

- [ ] ADM consegue criar evento com todos campos obrigatórios
- [ ] Sistema valida campos corretamente
- [ ] Preview do Display funciona antes de publicar
- [ ] Preview do post no feed funciona
- [ ] Rascunho é salvo e editável
- [ ] Publicar cria Display e Post automaticamente
- [ ] Divisão de pontos (auto + customizada) funciona
- [ ] Upload de múltiplas imagens para Display funciona
- [ ] Cor personalizada aplica em todos lugares

---

## Listagem e Descoberta

- [ ] Usuários veem lista de eventos corretamente
- [ ] Filtros (Todos/Próximos/Passados) funcionam
- [ ] Filtro por categoria funciona
- [ ] Busca por texto funciona
- [ ] Card resumido mostra informações corretas
- [ ] Status do evento é exibido corretamente

---

## Página do Evento

- [ ] Todas informações são exibidas corretamente
- [ ] Botão "Confirmar Presença" funciona (toggle)
- [ ] Comentários funcionam (criar, listar, curtir)
- [ ] Link externo abre corretamente
- [ ] Mapa é exibido (se aplicável)
- [ ] Meu progresso é exibido corretamente

---

## Check-in

- [ ] Scanner abre ao clicar em "Fazer Check-in"
- [ ] Câmera funciona corretamente
- [ ] QR Code é escaneado e validado
- [ ] Check-in é registrado corretamente
- [ ] Pontos são creditados imediatamente
- [ ] Progresso é atualizado em tempo real
- [ ] Erro ao escanear QR inválido é exibido
- [ ] Erro ao tentar check-in muito cedo é exibido
- [ ] Badge é concedido quando aplicável
- [ ] Notificação de progresso é exibida

---

## Display

- [ ] Display é criado automaticamente ao publicar
- [ ] Layout imersivo é renderizado corretamente
- [ ] QR Code muda a cada 1 minuto (segurança)
- [ ] Check-in muda após intervalo configurado
- [ ] Contador de presença atualiza em tempo real
- [ ] WebSocket mantém conexão estável
- [ ] Fallback para polling funciona se WebSocket falhar
- [ ] Display funciona offline (com cache)
- [ ] Múltiplas imagens rotacionam no background
- [ ] Estados (aguardando, ativo, pausado, encerrado) são exibidos

---

## Lógica de Check-ins

- [ ] Usuário atrasado pode fazer check-in atual
- [ ] Usuário não pode fazer check-in passado
- [ ] Intervalo entre check-ins é respeitado (lado usuário)
- [ ] Progresso é calculado corretamente
- [ ] Badge é concedido conforme configuração do ADM
- [ ] Check-in duplicado é bloqueado

---

## Notificações

- [ ] Notificação de novo evento é enviada
- [ ] Lembretes (1 dia, 1 hora) são enviados
- [ ] Notificação "evento começou" é enviada
- [ ] Lembretes de check-in são enviados
- [ ] Notificação de badge conquistado é enviada
- [ ] Notificação de cancelamento é enviada
- [ ] Notificação de progresso é enviada

---

## Analytics (ADM)

- [ ] Dashboard mostra métricas corretas
- [ ] Gráfico de check-ins atualiza em tempo real
- [ ] Lista de participantes é exibida corretamente
- [ ] Taxa de presença é calculada corretamente
- [ ] Exportar CSV funciona
- [ ] Exportar PDF funciona

---

## Estados e Transições

- [ ] Rascunho → Agendado funciona
- [ ] Agendado → Em Andamento (automático) funciona
- [ ] Em Andamento → Encerrado (automático) funciona
- [ ] Cancelar evento funciona (soft delete)
- [ ] Pontos mantidos após cancelamento
- [ ] Regras de edição são respeitadas

---

## Integrações

- [ ] Post no feed é criado automaticamente
- [ ] Post é atualizado ao editar evento
- [ ] Post mostra badge "Cancelado" quando aplicável
- [ ] Badge aparece no perfil após conquista
- [ ] Pontos são creditados no Sistema de Pontos
- [ ] Espaços pré-cadastrados aparecem (se módulo implementado)
- [ ] Scanner universal detecta QR de check-in

---

## Performance

- [ ] Listagem de eventos: <2s
- [ ] Página do evento: <1.5s
- [ ] Scanner de QR Code: <500ms (reconhecimento)
- [ ] Display QR Code update: <200ms
- [ ] Analytics em tempo real: <3s

---

## Segurança

- [ ] Security token com HMAC-SHA256
- [ ] Timestamp validation (janela de 2 min)
- [ ] Rate limiting: 1 check-in por minuto por usuário
- [ ] Detecção de QR Code duplicado
- [ ] Display URL pública mas dados limitados
- [ ] WebSocket read-only para Display
- [ ] CORS configurado corretamente

---

## Acessibilidade

- [ ] Contrast ratio mínimo 4.5:1 (texto no Display)
- [ ] Touch targets mínimo 48x48px
- [ ] Labels descritivos para screen readers
- [ ] Suporte a font scaling (até 200%)
- [ ] QR Code com alt text explicativo

---

## Relacionados

- [Especificação](spec.md)
- [Criação de Eventos](creation.md)
- [Display](display.md)
- [Sistema de Check-in](checkin-system.md)
- [QR Code Security](qr-code-security.md)
- [Analytics](analytics.md)
- [API](api.md)
