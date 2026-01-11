---
module: carteirinha
document: qr-code
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Carteirinha - Sistema de QR Code

[← Voltar ao Índice](README.md)

---

## Visão Geral

O QR Code da carteirinha serve para identificação do associado em estabelecimentos parceiros e eventos da associação.

---

## Características do QR Code

- Único por usuário
- Contém hash de segurança
- Não sensível (baixo risco de fraude)
- Timestamp de geração

---

## Estrutura do QR Code

**Conteúdo codificado (JSON):**

```json
{
  "user_id": "12345",
  "card_number": "A-2024-00001",
  "timestamp": 1704067200,
  "hash": "a1b2c3d4e5f6...",
  "type": "member_card"
}
```

**Campos:**
- `user_id`: ID único do usuário
- `card_number`: Número da matrícula/carteirinha
- `timestamp`: Data/hora de geração do QR Code
- `hash`: Hash de segurança para validação
- `type`: Tipo do QR Code (member_card)

---

## Segurança e Validação

### Nível de Segurança

**Nível: Baixo** (ambiente pequeno, todos se conhecem)

### Medidas de Segurança

- QR Code único por usuário
- Validação de status antes de gerar QR
- Log de histórico de uso
- Foto do usuário visível na carteirinha

### Processo de Validação

1. Estabelecimento escaneia QR Code
2. Backend recebe dados do QR Code
3. Backend valida:
   - Hash é válido
   - Timestamp não muito antigo
   - Usuário está ativo
4. Retorna dados do usuário para confirmação
5. Estabelecimento confirma nome/foto
6. Registra uso no histórico

---

## Prevenção de Fraude

**Medidas implementadas:**

1. **Hash de Segurança**
   - Gerado com HMAC-SHA256
   - Inclui user_id + timestamp + secret

2. **Validação de Timestamp**
   - QR Code pode ter validade (opcional)
   - Regenera automaticamente se expirado

3. **Log de Uso**
   - Registra cada validação
   - Detecta usos múltiplos simultâneos (alerta)

4. **Foto do Usuário**
   - Visível na carteirinha
   - Estabelecimento pode conferir

---

## Funcionamento Offline

**Cache Local:**
- QR Code é armazenado localmente
- Atualiza a cada abertura do app (se online)
- Funciona mesmo sem internet

**Validação Offline (Estabelecimento):**
- Pode validar hash localmente
- Sincroniza uso quando voltar online

---

## Diferença para QR Code de Eventos

| Característica | Carteirinha | Eventos |
|---------------|-------------|---------|
| Validade | Longa (dias) | Curta (1-2 min) |
| Dinâmico | Não | Sim (muda a cada 1 min) |
| Propósito | Identificação | Check-in seguro |
| Segurança | Baixa | Alta (anti-fraude) |

---

## Relacionados

- [Especificação](spec.md)
- [Benefícios](benefits.md)
- [API](api.md)
- [Eventos - QR Code Security](../04-eventos/qr-code-security.md)
