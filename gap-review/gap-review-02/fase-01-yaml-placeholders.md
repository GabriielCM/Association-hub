---
project: a-hub
document: gap-review-02-fase-01
status: pendente
created: 2026-01-12
---

# Fase 01 - YAML e Placeholders

[← Voltar ao Sumário](README.md)

---

## Objetivo

Padronizar YAML front matter e remover placeholders "[A preencher]" em todos os arquivos.

---

## Status

| Item | Status |
|------|--------|
| **Fase:** | Pendente |
| **Issues:** | 3 |
| **Arquivos:** | 10+ |
| **Esforço estimado:** | 1h |

---

## Correções Necessárias

### 1. YAML Front Matter

#### 1.1 shared/README.md

**Atual:**
```yaml
---
section: shared
status: partial
last_updated: 2026-01-10
---
```

**Corrigir para:**
```yaml
---
module: shared
document: README
status: partial
priority: mvp
last_updated: 2026-01-12
---
```

#### 1.2 CHANGELOG.md

**Atual:**
```yaml
---
document: changelog
last_updated: 2026-01-12
---
```

**Corrigir para:**
```yaml
---
module: projeto
document: changelog
status: complete
priority: mvp
last_updated: 2026-01-12
---
```

#### 1.3 Módulos Stub (11-15)

**Adicionar campo `document: README` em:**
- [ ] `11-pedidos/README.md`
- [ ] `12-loja/README.md`
- [ ] `13-rankings/README.md`
- [ ] `14-suporte/README.md`
- [ ] `15-jukebox/README.md`

**Exemplo de correção:**
```yaml
---
module: pedidos
document: README
status: stub
priority: phase2
last_updated: 2026-01-12
---
```

#### 1.4 07-notificacoes/README.md

**Adicionar campo `document: README`:**
```yaml
---
module: notificacoes
document: README
status: partial
priority: mvp
last_updated: 2026-01-12
---
```

---

### 2. Placeholders "[A preencher]"

#### Estratégia
Para módulos stub, substituir placeholders por texto indicando que será documentado quando o módulo for especificado:

```markdown
## Componentes

_Será documentado quando o módulo for especificado._

## API

_Será documentado quando o módulo for especificado._
```

#### Arquivos a Corrigir

| # | Arquivo | Seções |
|---|---------|--------|
| 1 | `07-notificacoes/README.md` | Componentes, API |
| 2 | `11-pedidos/README.md` | Componentes, API |
| 3 | `12-loja/README.md` | Componentes, API |
| 4 | `13-rankings/README.md` | Componentes, API |
| 5 | `14-suporte/README.md` | Componentes, API |
| 6 | `15-jukebox/README.md` | Componentes, API |

---

## Checklist de Execução

### YAML Front Matter
- [ ] Corrigir `shared/README.md`
- [ ] Corrigir `CHANGELOG.md`
- [ ] Adicionar `document:` em `07-notificacoes/README.md`
- [ ] Adicionar `document:` em `11-pedidos/README.md`
- [ ] Adicionar `document:` em `12-loja/README.md`
- [ ] Adicionar `document:` em `13-rankings/README.md`
- [ ] Adicionar `document:` em `14-suporte/README.md`
- [ ] Adicionar `document:` em `15-jukebox/README.md`

### Placeholders
- [ ] Substituir em `07-notificacoes/README.md`
- [ ] Substituir em `11-pedidos/README.md`
- [ ] Substituir em `12-loja/README.md`
- [ ] Substituir em `13-rankings/README.md`
- [ ] Substituir em `14-suporte/README.md`
- [ ] Substituir em `15-jukebox/README.md`

### Validação
- [ ] Verificar que todos os arquivos têm YAML válido
- [ ] Confirmar zero placeholders "[A preencher]"
- [ ] Atualizar `last_updated` em arquivos modificados

---

## Resultado Esperado

Após execução:
- 100% dos arquivos com YAML padronizado
- Zero placeholders "[A preencher]"
- Todos os campos obrigatórios presentes
