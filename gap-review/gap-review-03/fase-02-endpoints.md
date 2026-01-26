---
review: gap-review-03
document: fase-02
fase: endpoints
status: concluido
prioridade: alta
completed: 2026-01-15
---

# Fase 2: Endpoints Reference

## Objetivo
Completar `docs/api/endpoints-reference.md` com endpoints de todos os módulos documentados.

---

## Situação Atual

### Módulos Documentados em endpoints-reference.md
- 01-dashboard ✓
- 02-perfil ✓
- 03-carteirinha ✓
- 04-eventos ✓
- 09-espacos ✓
- 10-reservas ✓
- 05-minha-carteira ✓ (adicionado)
- 06-sistema-pontos ✓ (adicionado)
- 08-mensagens ✓ (adicionado)
- 11-pedidos ✓ (adicionado)
- 12-loja ✓ (adicionado)
- 16-pdv ✓ (adicionado)
- 17-assinaturas ✓ (adicionado)

### Módulos Faltando
- 07-notificacoes (aguardando documentação do módulo)

---

## Issues

### Issue 2.1 - Módulos Faltando
**Severidade:** Alta

**Problema:** 8 módulos não estão documentados na referência centralizada

**Solução:** Adicionar seções para cada módulo faltando, extraindo endpoints dos respectivos api.md

**Arquivo:** `docs/api/endpoints-reference.md`

---

### Issue 2.2 - Versão de API
**Severidade:** Média

**Problema:** Não há menção à versão de API (v1, v2)

**Solução:** Adicionar seção de versionamento no início do documento

---

### Issue 2.3 - URL Base Inconsistente
**Severidade:** Média

**Problema:** Alguns endpoints usam `/api/v1/` e outros usam `/` direto

**Solução:** Padronizar todas as URLs para incluir `/api/v1/`

---

## Endpoints a Adicionar

### 05-minha-carteira
Extrair de `docs/05-minha-carteira/api.md`:
- GET /carteira
- GET /carteira/qr-code
- GET /carteira/extrato
- POST /carteira/scan

### 06-sistema-pontos
Extrair de `docs/06-sistema-pontos/api.md`:
- GET /pontos/saldo
- GET /pontos/historico
- POST /pontos/resgatar
- GET /pontos/ranking

### 08-mensagens
Extrair de `docs/08-mensagens/api.md`:
- GET /mensagens/conversas
- GET /mensagens/conversa/:id
- POST /mensagens/enviar
- WebSocket /ws/mensagens

### 11-pedidos
Extrair de `docs/11-pedidos/api.md`:
- GET /pedidos
- GET /pedidos/:id
- POST /pedidos/cancelar

### 12-loja
Extrair de `docs/12-loja/api.md`:
- GET /loja/produtos
- GET /loja/produto/:id
- POST /loja/carrinho
- POST /loja/checkout

### 16-pdv
Extrair de `docs/16-pdv/api.md`:
- GET /pdv/produtos
- POST /pdv/venda
- POST /pdv/pix/iniciar
- GET /pdv/pix/status

### 17-assinaturas
Extrair de `docs/17-assinaturas/api.md`:
- GET /assinaturas/planos
- GET /assinaturas/minhas
- POST /assinaturas/assinar
- DELETE /assinaturas/:id

---

## Checklist de Implementação

- [ ] Adicionar seção de versionamento (mantido como está - cada módulo define sua base URL)
- [ ] Padronizar URL base para /api/v1/ (mantido consistência com documentos originais)
- [x] Adicionar endpoints de 05-minha-carteira
- [x] Adicionar endpoints de 06-sistema-pontos
- [x] Adicionar endpoints de 08-mensagens
- [x] Adicionar endpoints de 11-pedidos
- [x] Adicionar endpoints de 12-loja
- [x] Adicionar endpoints de 16-pdv
- [x] Adicionar endpoints de 17-assinaturas
- [x] Atualizar índice do documento

## Critério de Aceite

Todos os módulos com status `complete` devem ter seus endpoints listados em endpoints-reference.md

**Status:** ✅ Critério atendido - 7 módulos adicionados em 2026-01-15
