---
module: eventos
document: checkin-system
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Eventos - Sistema de Check-in

[← Voltar ao Índice](README.md)

---

## Índice

- [Scanner de QR Code](#scanner-de-qr-code)
- [Processo de Check-in](#processo-de-check-in)
- [Lógica de Check-ins Atrasados](#lógica-de-check-ins-atrasados)
- [Controle de Intervalo](#controle-de-intervalo)

---

## Scanner de QR Code

### Abertura do Scanner

**Origem:**
- Botão "Fazer Check-in" na página do evento
- Abre modal fullscreen com câmera

**Permissões:**
- Solicita acesso à câmera
- Se negado: Instrução de como habilitar

---

### Interface do Scanner

```
┌─────────────────────────────────┐
│ [× Fechar]      Check-in        │
├─────────────────────────────────┤
│                                 │
│     [Preview da Câmera]         │
│                                 │
│     ┌───────────────┐           │
│     │               │           │
│     │  [Área QR]    │           │
│     │               │           │
│     └───────────────┘           │
│                                 │
│ Posicione o QR Code no centro   │
│                                 │
│ CHECK-IN 2 de 4                 │
│ +25 pontos                      │
└─────────────────────────────────┘
```

**Elementos:**
- Preview da câmera (fullscreen)
- Guia visual (quadrado com cantos)
- Instruções claras
- Informações do check-in atual

---

## Processo de Check-in

### Fluxo Completo

**1. Usuário escaneia QR Code no Display**

**2. App valida localmente:**
- QR Code é válido? (formato correto)
- Timestamp não expirado? (< 2 min)

**3. App envia ao backend:**
```json
POST /events/:id/checkin
{
  "qr_data": "...",
  "checkin_number": 2,
  "security_token": "abc123",
  "timestamp": 1704067200
}
```

**4. Backend valida:**
- ✓ Evento existe e está ativo
- ✓ Check-in atual está disponível
- ✓ Security token é válido
- ✓ Timestamp dentro da janela (2 min)
- ✓ Usuário não fez este check-in ainda
- ✓ Intervalo desde último check-in respeitado (lado usuário)

**5. Sucesso:**
```
┌─────────────────────────────────┐
│  ✅                              │
│  Check-in realizado!             │
│                                  │
│  +25 pontos                      │
│  3 de 4 check-ins completos      │
│                                  │
│  Próximo check-in em 25 minutos  │
│                                  │
│  [Fechar]                        │
└─────────────────────────────────┘
```

**Feedback:**
- Haptic feedback (sucesso)
- Animação celebratória
- Som (opcional)
- Atualiza progresso automaticamente

**6. Erro:**
- **QR Code inválido:** "QR Code não reconhecido"
- **Check-in já feito:** "Você já fez este check-in"
- **Muito cedo:** "Check-in disponível em X minutos"
- **Evento não ativo:** "Este evento não está acontecendo"
- **Token expirado:** "QR Code expirado, escaneie novamente"

---

## Lógica de Check-ins Atrasados

### Cenário: Usuário chega atrasado

**Exemplo:**
- Evento: 4 check-ins, 30 min intervalo
- Display está mostrando: CHECK-IN 3

**O que acontece:**

1. Usuário escaneia CHECK-IN 3
2. Sistema registra apenas o CHECK-IN 3
3. **Resultado:**
   - Progresso: 1 de 4 ✓ (fez apenas o 3)
   - Pontos: 25 de 100
   - Badge: Depende da configuração do ADM
     - **Se "pelo menos 1 check-in":** ✅ Ganha badge
     - **Se "todos os check-ins":** ❌ Não ganha badge

**Próximo Check-in:**
- Usuário pode fazer CHECK-IN 4 quando disponível
- Não pode voltar e fazer 1 ou 2 (já passaram)

---

## Controle de Intervalo

### Lado Usuário

**Objetivo:** Evitar que usuário escaneie múltiplas vezes seguidas

**Implementação:**
- Após fazer check-in, app armazena timestamp
- Se tentar escanear novamente antes do intervalo:
  ```
  ⏱️ Aguarde 28 minutos

  Você pode fazer o próximo check-in às 20h00
  ```
- Bloqueia scanner até intervalo passar
- Timer visível na página do evento

### Edge Case - Múltiplos Check-ins Simultâneos

- Se evento tem intervalo = 0 (múltiplos check-ins disponíveis)
- Usuário pode escanear todos imediatamente
- Sistema registra todos normalmente

---

## Experiência do Usuário

### Botões de Ação

**Antes do Evento:**
```
[✓ Confirmar Presença]
```
- Grande, destaque (cor do evento)
- Toggle: Confirmado ↔ Não confirmado
- Feedback: Animação + toast

**Botões Secundários:**
- [📅 Adicionar ao Calendário]
- [📍 Ver no Mapa] (se aplicável)
- [🔗 Link Externo] (se configurado)

---

**Durante o Evento:**
```
[📷 Fazer Check-in]
```
- Grande, cor vibrante (verde)
- Abre scanner de QR Code
- Destaque pulsante se usuário confirmou presença

**Botão Secundário:**
```
[Ver Meu Progresso]
```
- Abre modal com detalhes dos check-ins
- Mostra horário de cada check-in feito
- Pontos ganhos até o momento

---

**Depois do Evento:**

```
┌─────────────────────────────────┐
│ ✅ Você participou deste evento │
│                                 │
│ ✓ 3 de 4 check-ins realizados   │
│ ⭐ 75 pontos ganhos             │
│ 🏆 Badge conquistado!           │
│                                 │
│ [Ver Badge] [Ver Fotos]         │
└─────────────────────────────────┘
```

---

## Relacionados

- [Especificação](spec.md)
- [Display](display.md)
- [QR Code Security](qr-code-security.md)
- [API](api.md)
- [Critérios de Aceitação](acceptance-criteria.md)
