---
review: gap-review-03
document: fase-04
fase: shared
status: concluido
prioridade: baixa
completed: 2026-01-15
---

# Fase 4: Melhorias Shared

## Objetivo
Completar e melhorar arquivos compartilhados em `docs/shared/`.

---

## Issues

### Issue 4.1 - Fonte sem Fallback
**Severidade:** Baixa

**Problema:** `design-system.md` especifica fonte Inter sem fallback

**Solução:** Adicionar stack de fontes fallback:
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Arquivo:** `docs/shared/design-system.md`

---

### Issue 4.2 - Phosphor Icons sem Versão
**Severidade:** Baixa

**Problema:** Não especifica versão do package Phosphor Icons

**Solução:** Adicionar versão recomendada e comando de instalação:
```bash
npm install @phosphor-icons/react@^2.0.0
```

**Arquivo:** `docs/shared/design-system.md`

---

### Issue 4.3 - Shadows Dark Mode
**Severidade:** Média

**Problema:** Shadows para dark mode podem ter contraste insuficiente em alguns displays

**Solução:** Adicionar nota sobre testes de contraste em displays variados

**Arquivo:** `docs/shared/design-system.md`

---

### Issue 4.4 - Template Front Matter Incompleto
**Severidade:** Média

**Problema:** `conventions.md` não mostra valores válidos para status e priority

**Solução:** Expandir template com exemplos:
```yaml
status: complete | partial | stub
priority: mvp | phase2 | nice-to-have
```

**Arquivo:** `docs/shared/conventions.md`

---

### Issue 4.5 - Placeholder não Preenchido
**Severidade:** Baixa

**Problema:** `authentication.md` contém "[X dias]" como placeholder

**Solução:** Definir valor real ou remover placeholder

**Arquivo:** `docs/shared/authentication.md`

---

### Issue 4.6 - Sem Menção a i18n
**Severidade:** Média

**Problema:** `accessibility.md` não menciona internacionalização ou suporte RTL

**Solução:** Adicionar seção sobre i18n/l10n se aplicável ao projeto

**Arquivo:** `docs/shared/accessibility.md`

---

### Issue 4.7 - Checklist de Testes Vazio
**Severidade:** Baixa

**Problema:** `accessibility.md` tem checklist de testes com checkboxes vazios

**Solução:** Preencher ou remover se não aplicável

**Arquivo:** `docs/shared/accessibility.md`

---

## Checklist de Implementação

- [x] Adicionar fallback de fontes em design-system.md
- [x] Especificar versão do Phosphor Icons
- [x] Adicionar nota sobre contraste em dark mode
- [ ] Expandir template em conventions.md (já estava OK - Issue 4.4)
- [x] Resolver placeholder em authentication.md (30 dias)
- [x] Adicionar seção i18n em accessibility.md
- [ ] Preencher checklist de testes (mantido intencional - Issue 4.7)

## Critério de Aceite

Arquivos shared completos e úteis como referência para desenvolvedores

**Status:** ✅ Critério atendido - concluído em 2026-01-15

### Alterações Realizadas

**design-system.md:**
- Adicionado fallback de fonte: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Adicionada versão Phosphor Icons: `@phosphor-icons/react@^2.0.0`
- Adicionada nota sobre contraste em dark mode shadows

**authentication.md:**
- Placeholder `[X dias]` substituído por `30 dias`

**accessibility.md:**
- Adicionada seção "Internacionalização (i18n)" com definição de PT-BR único

### Issues Não Alteradas

- **Issue 4.4:** conventions.md já continha valores válidos no template
- **Issue 4.7:** Checklist de testes mantido vazio intencionalmente (é para verificação de devs)
