---
module: minha-carteira
status: stub
priority: mvp
last_updated: 2026-01-10
---

# Minha Carteira (Scanner)

[← Voltar ao Índice](../README.md)

---

**Status:** ⚪ Não Iniciado
**Prioridade:** 🔴 MVP

---

## Visão Geral

Módulo de scanner de QR Code para transferência de pontos entre usuários. Acessível via "Acessos Rápidos" no Dashboard.

---

## Objetivos

- Permitir transferência de pontos entre usuários
- Facilitar identificação rápida do destinatário via QR Code
- Registrar histórico de transferências

---

## Scanner Universal

O scanner detecta o tipo de QR Code automaticamente:

| Tipo | Ação |
|------|------|
| `event_checkin` | Processa check-in em evento |
| `user_transfer` | Transferência de pontos |
| `member_card` | Validação de carteirinha |

---

## Componentes

[A preencher]

---

## API

[A preencher]

---

## Dependências

- [Sistema de Pontos](../06-sistema-pontos/)
- [Eventos](../04-eventos/) - Check-in via scanner
- [Carteirinha](../03-carteirinha/) - QR Code de identificação

---

## Relacionados

- [Dashboard - Acessos Rápidos](../01-dashboard/components.md)
- [Sistema de Pontos](../06-sistema-pontos/)
