---
section: shared
document: conventions
status: complete
last_updated: 2026-01-10
---

# Convenções de Documentação

[← Voltar ao Índice](README.md)

---

## Símbolos de Prioridade

| Símbolo | Significado |
|---------|-------------|
| 🔴 | **MVP** - Essencial para lançamento |
| 🟡 | **Fase 2** - Importante mas não crítico |
| 🟢 | **Nice to Have** - Desejável no futuro |

---

## Símbolos de Status

| Símbolo | Significado |
|---------|-------------|
| ⚪ | **Não Iniciado** |
| 🟡 | **Em Especificação** |
| 🔵 | **Em Desenvolvimento** |
| 🟢 | **Concluído** |
| 🔴 | **Bloqueado** |

---

## YAML Front Matter

Todos os documentos devem incluir metadados no topo:

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

## Estrutura de Módulos

Cada módulo deve conter:

1. **README.md** - Índice e visão geral
2. **spec.md** - Especificação detalhada
3. **api.md** - Endpoints da API
4. **acceptance-criteria.md** - Critérios de aceitação

Arquivos adicionais conforme necessidade:
- `components.md` - Componentes de UI
- `[feature].md` - Features específicas

---

## Como Preencher Novas Seções

1. Copie o template de módulo
2. Preencha **Visão Geral** primeiro
3. Adicione **Objetivos** principais
4. Detalhe **Componentes** progressivamente
5. Defina **Fluxos de Navegação**
6. Liste **APIs Necessárias**
7. Estabeleça **Critérios de Aceitação**

---

## Formatação

### Títulos

```markdown
# Título Principal (H1) - Um por documento
## Seção (H2)
### Subseção (H3)
```

### Listas de Tarefas

```markdown
- [ ] Tarefa pendente
- [x] Tarefa concluída
```

### Código

```markdown
`inline code`

​```json
{
  "code": "block"
}
​```
```

### Tabelas

```markdown
| Coluna 1 | Coluna 2 |
|----------|----------|
| Valor 1  | Valor 2  |
```

---

## Links Internos

Sempre usar caminhos relativos:

```markdown
[Link para outro doc](../outro-modulo/doc.md)
[Link na mesma pasta](outro-doc.md)
[Link para seção](#nome-da-secao)
```

---

## Relacionados

- [README Principal](../README.md)
- [Glossário](../00-overview/glossary.md)
