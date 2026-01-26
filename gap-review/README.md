---
project: a-hub
document: gap-review-index
last_updated: 2026-01-14
---

# Gap Reviews - A-hub

Registro de gap reviews realizados na documentação.

---

## Reviews

| # | Data | Escopo | Status | Fases | Issues |
|---|------|--------|--------|-------|--------|
| [01](gap-review-01/) | 2026-01-11 | Documentação completa | ✅ Concluído | 3 | 6 |
| [02](gap-review-02/) | 2026-01-12 | Pós-Espaços/Reservas | ✅ Concluído | 3 | 8 |
| [03](gap-review-03/) | 2026-01-14 | Documentação completa | 🟡 Em análise | 5 | 27 |

---

## Processo

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW DO GAP REVIEW                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Criar pasta gap-review-XX/                              │
│                                                             │
│  2. Executar análise macro                                  │
│     └─ 00-analise-macro.md                                  │
│                                                             │
│  3. Identificar pontos de correção e observações            │
│                                                             │
│  4. Definir fases baseadas nos pontos                       │
│                                                             │
│  5. Criar arquivos de fase                                  │
│     └─ fase-XX-[nome].md                                    │
│                                                             │
│  6. Executar correções                                      │
│                                                             │
│  7. Atualizar status                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Comandos

- `/gap-review` - Inicia um novo gap review

---

## Objetivos do Gap Review

### Completude
- Verificar se todos os módulos têm a documentação completa
- Identificar seções faltantes ou incompletas
- Validar presença de YAML front matter

### Consistência
- Verificar aderência ao design system
- Validar nomenclatura e padrões
- Confirmar formato de endpoints padronizado
- Verificar links internos funcionando

---

## Estrutura de Cada Review

```
gap-review-XX/
├── README.md              # Sumário do review
├── 00-analise-macro.md    # Análise inicial → define as fases
├── fase-01-[nome].md      # Primeira fase de correções
├── fase-02-[nome].md      # Segunda fase de correções
└── ...                    # Quantas fases forem necessárias
```
