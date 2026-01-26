---
review: gap-review-03
document: fase-01
fase: front-matter
status: concluido
prioridade: alta
completed: 2026-01-14
---

# Fase 1: Front Matter e Consistência

## Objetivo
Padronizar YAML front matter em todos os arquivos conforme `shared/conventions.md`.

## Padrão Esperado

```yaml
---
module: nome-do-modulo
document: tipo-do-documento
status: complete | partial | stub
priority: mvp | phase2 | nice-to-have
last_updated: YYYY-MM-DD
---
```

---

## Issues

### Issue 1.1 - docs/README.md
**Severidade:** Alta

**Problema:**
```yaml
# Atual
---
project: a-hub
version: "1.5"
last_updated: 2026-01-14
---
```

**Solução:**
```yaml
# Corrigido
---
module: a-hub
document: index
status: complete
priority: mvp
last_updated: 2026-01-14
---
```

**Arquivo:** `docs/README.md`

---

### Issue 1.2 - 00-overview/README.md
**Severidade:** Alta

**Problema:**
```yaml
# Atual
---
section: overview
last_updated: 2026-01-10
---
```

**Solução:**
```yaml
# Corrigido
---
module: overview
document: index
status: complete
priority: mvp
last_updated: 2026-01-10
---
```

**Arquivo:** `docs/00-overview/README.md`

---

### Issue 1.3 - 00-overview/product-overview.md
**Severidade:** Alta

**Problema:** Faltam campos `status` e `priority`

**Solução:** Adicionar:
```yaml
status: complete
priority: mvp
```

**Arquivo:** `docs/00-overview/product-overview.md`

---

### Issue 1.4 - 00-overview/user-types.md
**Severidade:** Alta

**Problema:** Faltam campos `status` e `priority`

**Solução:** Adicionar:
```yaml
status: complete
priority: mvp
```

**Arquivo:** `docs/00-overview/user-types.md`

---

### Issue 1.5 - 00-overview/roadmap.md
**Severidade:** Alta

**Problema:** Faltam campos `status` e `priority`

**Solução:** Adicionar:
```yaml
status: partial
priority: mvp
```

**Arquivo:** `docs/00-overview/roadmap.md`

---

### Issue 1.6 - 00-overview/glossary.md
**Severidade:** Alta

**Problema:** Faltam campos `status` e `priority`

**Solução:** Adicionar:
```yaml
status: complete
priority: mvp
```

**Arquivo:** `docs/00-overview/glossary.md`

---

### Issue 1.7 - api/README.md
**Severidade:** Alta

**Problema:** Faltam campos `document` e `priority`

**Solução:**
```yaml
---
module: api
document: index
status: complete
priority: mvp
last_updated: 2026-01-10
---
```

**Arquivo:** `docs/api/README.md`

---

### Issue 1.8 - shared/authentication.md
**Severidade:** Alta

**Problema:** Status é `partial` mas conteúdo é praticamente um stub

**Solução:** Mudar status para `stub`:
```yaml
status: stub
```

**Arquivo:** `docs/shared/authentication.md`

---

## Checklist de Implementação

- [x] docs/README.md - Ajustar front matter
- [x] docs/00-overview/README.md - Ajustar front matter
- [x] docs/00-overview/product-overview.md - Adicionar status/priority
- [x] docs/00-overview/user-types.md - Adicionar status/priority
- [x] docs/00-overview/roadmap.md - Adicionar status/priority
- [x] docs/00-overview/glossary.md - Adicionar status/priority
- [x] docs/api/README.md - Ajustar front matter
- [x] docs/shared/authentication.md - Mudar status para stub

## Critério de Aceite

Todos os arquivos com YAML front matter válido contendo:
- `module` ou `section`
- `document`
- `status`
- `priority`
- `last_updated`
