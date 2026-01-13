---
project: a-hub
document: gap-review-02-fase-02
status: pendente
created: 2026-01-12
---

# Fase 02 - Status e Endpoints

[← Voltar ao Sumário](README.md)

---

## Objetivo

Corrigir status conflitantes entre arquivos e atualizar endpoints-reference.md com os módulos Espaços e Reservas.

---

## Status

| Item | Status |
|------|--------|
| **Fase:** | Pendente |
| **Issues:** | 3 |
| **Arquivos:** | 5+ |
| **Esforço estimado:** | 2h |

---

## Correções Necessárias

### 1. Status Conflitantes

#### 1.1 Minha Carteira (05)

**Conflito:**
- `docs/README.md`: 🟡 Parcial
- `05-minha-carteira/spec.md`: `status: complete`

**Decisão:** Manter como Parcial no índice (spec está completo mas módulo pode ter pendências)

**Ação:** Nenhuma (já consistente conceitualmente)

#### 1.2 Notificações (07)

**Conflito:**
- `docs/README.md`: 🟡 Parcial
- `07-notificacoes/README.md`: `status: partial`
- **Realidade:** Estrutura de stub (apenas README.md)

**Decisão:** Mudar para stub no YAML, manter Parcial no índice

**Ação:**
```yaml
# 07-notificacoes/README.md
status: stub  # era: partial
```

**Ou** criar spec.md básico para justificar "partial"

#### 1.3 PDV (16)

**Conflito:**
- `docs/README.md`: 🟡 Parcial
- `16-pdv/spec.md`: `status: complete`

**Decisão:** Atualizar índice para Completo

**Ação em `docs/README.md`:**
```markdown
| PDV | 🟢 Completo | 🔴 MVP | [Ver](16-pdv/) |
```

---

### 2. Atualizar endpoints-reference.md

#### 2.1 Adicionar Seção: Espaços

```markdown
### Espaços

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/api/v1/espacos` | Listar espaços | Autenticado |
| GET | `/api/v1/espacos/:id` | Obter espaço | Autenticado |
| POST | `/api/v1/espacos` | Criar espaço | ADM |
| PUT | `/api/v1/espacos/:id` | Atualizar espaço | ADM |
| DELETE | `/api/v1/espacos/:id` | Deletar espaço | ADM |
| PATCH | `/api/v1/espacos/:id/status` | Alterar status | Gerente, ADM |
| POST | `/api/v1/espacos/:id/bloqueios` | Bloquear datas | Gerente, ADM |
| DELETE | `/api/v1/espacos/:id/bloqueios/:bloqueio_id` | Remover bloqueio | Gerente, ADM |
| GET | `/api/v1/espacos/:id/disponibilidade` | Obter disponibilidade | Autenticado |
| POST | `/api/v1/espacos/:id/imagens` | Upload de imagem | ADM |
```

#### 2.2 Adicionar Seção: Reservas

```markdown
### Reservas

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/api/v1/reservas` | Listar reservas | Gerente, ADM |
| GET | `/api/v1/reservas/:id` | Obter reserva | Autenticado |
| POST | `/api/v1/reservas` | Criar reserva | Autenticado |
| POST | `/api/v1/reservas/:id/aprovar` | Aprovar reserva | Gerente, ADM |
| POST | `/api/v1/reservas/:id/rejeitar` | Rejeitar reserva | Gerente, ADM |
| POST | `/api/v1/reservas/:id/cancelar` | Cancelar reserva | Autenticado |
| GET | `/api/v1/reservas/minhas` | Minhas reservas | Autenticado |
| GET | `/api/v1/reservas/pendentes` | Reservas pendentes | Gerente, ADM |
| POST | `/api/v1/reservas/fila` | Entrar na fila | Autenticado |
| DELETE | `/api/v1/reservas/fila/:id` | Sair da fila | Autenticado |
| POST | `/api/v1/reservas/fila/:id/confirmar` | Confirmar vaga | Autenticado |
| GET | `/api/v1/reservas/fila/posicao` | Minha posição na fila | Autenticado |
```

#### 2.3 Atualizar Índice

Adicionar na seção de índice do `endpoints-reference.md`:
```markdown
- [Espaços](#espaços)
- [Reservas](#reservas)
```

---

## Checklist de Execução

### Status
- [ ] Decidir sobre 07-notificacoes (stub ou criar spec básico)
- [ ] Atualizar `docs/README.md` - PDV para Completo
- [ ] Verificar consistência Minha Carteira

### Endpoints
- [ ] Adicionar seção Espaços em `api/endpoints-reference.md`
- [ ] Adicionar seção Reservas em `api/endpoints-reference.md`
- [ ] Atualizar índice do arquivo
- [ ] Verificar formato consistente (Método | Endpoint | Descrição | Permissão)

### Validação
- [ ] Todos os endpoints de 09-espacos/api.md estão listados
- [ ] Todos os endpoints de 10-reservas/api.md estão listados
- [ ] Formato de tabela consistente com outras seções

---

## Resultado Esperado

Após execução:
- Status consistentes entre índice e arquivos internos
- endpoints-reference.md completo com Espaços e Reservas
- Formato padronizado em todas as tabelas de endpoints
