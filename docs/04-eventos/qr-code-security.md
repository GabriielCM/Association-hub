---
module: eventos
document: qr-code-security
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Eventos - QR Code Security

[← Voltar ao Índice](README.md)

---

## Índice

- [Sistema de QR Code Dinâmico](#sistema-de-qr-code-dinâmico)
- [Dupla Rotação](#dupla-rotação)
- [Exemplo Completo](#exemplo-completo)
- [Validação de Segurança](#validação-de-segurança)

---

## Sistema de QR Code Dinâmico

O QR Code de eventos utiliza um sistema de segurança anti-fraude com dupla rotação para garantir que apenas usuários presentes fisicamente possam fazer check-in.

---

## Dupla Rotação

### Tipo 1: QR Code de Segurança (Anti-Fraude)

- **Frequência:** Muda a cada **1 minuto**
- **Objetivo:** Evitar screenshots/fotos do QR Code

**Implementação:**
- Token de segurança no QR Code
- Backend valida se timestamp está dentro de janela de **2 minutos**
- Permite validação offline (tolerância de 1 min)

**Comportamento:**
- QR Code visualmente muda (novo hash)
- Conteúdo interno tem novo token
- Antigo QR Code expira após 2 min

---

### Tipo 2: Rotação de Check-ins

- **Frequência:** Baseada no **intervalo entre check-ins** definido
- **Objetivo:** Controlar quando cada check-in está disponível

**Implementação:**
- Display mostra apenas o check-in atual
- Após intervalo, muda para próximo check-in
- QR Code de segurança continua mudando a cada 1 min

---

## Exemplo Completo

```
Evento: 4 check-ins, 30 min intervalo, 100 pontos

19:00 - Evento inicia
        Display: CHECK-IN 1 (25 pts)
        QR Security: Token A (válido até 19:01)

19:01 - QR Security: Token B (válido até 19:02)
19:02 - QR Security: Token C (válido até 19:03)
... (continua a cada 1 min)

19:30 - Intervalo passou (30 min)
        Display: CHECK-IN 2 (25 pts)
        QR Security: Token X (válido até 19:31)

20:00 - Display: CHECK-IN 3 (25 pts)
20:30 - Display: CHECK-IN 4 (25 pts)
21:00 - Evento termina
```

---

## Validação de Segurança

### Estrutura do QR Code

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

### Processo de Validação (Backend)

1. **Verificar tipo:** `type === "event_checkin"`
2. **Verificar evento:** Evento existe e está ativo
3. **Verificar timestamp:** Dentro da janela de 2 minutos
4. **Verificar token:** HMAC-SHA256 válido
5. **Verificar check-in:** Usuário não fez este check-in ainda
6. **Verificar intervalo:** Respeita intervalo desde último check-in

### Medidas de Segurança

**Token de Segurança:**
- Gerado com HMAC-SHA256
- Inclui: event_id + checkin_number + timestamp + secret
- Não pode ser forjado sem a chave secreta

**Rate Limiting:**
- 1 check-in por minuto por usuário
- Previne ataques de força bruta

**Detecção de Duplicatas:**
- Mesmo token não pode ser usado duas vezes
- Log de todas as tentativas (sucesso e falha)

**Validação no Backend:**
- Nunca confiar apenas no app
- Todas validações críticas são server-side

---

## Comparação: QR Carteirinha vs QR Eventos

| Característica | Carteirinha | Eventos |
|---------------|-------------|---------|
| Validade | Longa (dias) | Curta (1-2 min) |
| Dinâmico | Não | Sim (muda a cada 1 min) |
| Propósito | Identificação | Check-in seguro |
| Segurança | Baixa | Alta (anti-fraude) |

---

## Relacionados

- [Especificação](spec.md)
- [Display](display.md)
- [Sistema de Check-in](checkin-system.md)
- [Carteirinha - QR Code](../03-carteirinha/qr-code.md)
- [API](api.md)
