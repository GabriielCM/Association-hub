---
project: a-hub
document: gap-review-02-fase-03
status: pendente
created: 2026-01-12
---

# Fase 03 - Referências Cruzadas

[← Voltar ao Sumário](README.md)

---

## Objetivo

Adicionar referências bidirecionais entre módulos e documentar integrações com Feed Social.

---

## Status

| Item | Status |
|------|--------|
| **Fase:** | Pendente |
| **Issues:** | 2 |
| **Arquivos:** | 6+ |
| **Esforço estimado:** | 1h |

---

## Correções Necessárias

### 1. Referências Unidirecionais

#### 1.1 Sistema de Pontos (06) não menciona módulos dependentes

**Adicionar em `06-sistema-pontos/spec.md` seção Integrações:**

```markdown
### Módulos que Integram com Pontos

| Módulo | Tipo de Integração |
|--------|-------------------|
| [Pedidos](../11-pedidos/) | Pagamento com pontos |
| [Loja](../12-loja/) | Compras com pontos |
| [Rankings](../13-rankings/) | Rankings de pontos |
| [Jukebox](../15-jukebox/) | Seleção de músicas com pontos |
| [PDV](../16-pdv/) | Pagamento em kiosks |
```

#### 1.2 Dashboard (01) não menciona Espaços/Reservas

**Adicionar em `01-dashboard/spec.md` seção Feed Social:**

```markdown
### Espaços e Reservas no Feed

- Quando um espaço é reservado, aparece no feed: "Churrasqueira 1 está ocupada em 20/01"
- Privacidade: nome do reservante não é exibido
- Card simples com foto do espaço e data
```

#### 1.3 Notificações (07) não menciona Mensagens

**Adicionar em `07-notificacoes/README.md` seção Integrações:**

```markdown
### Módulos que Disparam Notificações

| Módulo | Notificações |
|--------|--------------|
| [Mensagens](../08-mensagens/) | Nova mensagem, menção |
| [Eventos](../04-eventos/) | Novo evento, lembrete, check-in |
| [Reservas](../10-reservas/) | Aprovação, rejeição, fila de espera |
```

---

### 2. Integrações com Feed Social

#### 2.1 Em 09-espacos/spec.md

**Adicionar/expandir seção:**

```markdown
### Feed Social

**Comportamento:**
- Espaços NÃO aparecem diretamente no feed
- Integração é feita via módulo de Reservas
- Quando espaço é reservado: "Espaço X está ocupado em [data]"

**Privacidade:**
- Nome do reservante NUNCA é exibido
- Apenas status de ocupação
```

#### 2.2 Em 10-reservas/spec.md

**Verificar/expandir seção existente:**

```markdown
### Feed Social

**Publicações automáticas:**
- Ao aprovar reserva: card no feed com "Espaço ocupado"
- Formato: Foto do espaço + Nome + Data

**Privacidade:**
- Apenas mostra que está ocupado
- NÃO mostra nome do reservante
- NÃO mostra detalhes da reserva
```

---

## Checklist de Execução

### Referências em 06-sistema-pontos
- [ ] Adicionar seção "Módulos que Integram"
- [ ] Listar: Pedidos, Loja, Rankings, Jukebox, PDV
- [ ] Usar links relativos corretos

### Referências em 01-dashboard
- [ ] Mencionar integração com Espaços/Reservas no feed
- [ ] Documentar formato do card de "espaço ocupado"

### Referências em 07-notificacoes
- [ ] Adicionar seção "Módulos que Disparam"
- [ ] Listar: Mensagens, Eventos, Reservas

### Feed Social
- [ ] Verificar seção em 09-espacos/spec.md
- [ ] Verificar seção em 10-reservas/spec.md
- [ ] Confirmar regras de privacidade documentadas

### Validação
- [ ] Todas as referências usam caminhos relativos
- [ ] Links funcionam (testar navegação)
- [ ] Consistência de informações entre módulos

---

## Mapeamento Completo de Integrações

### Matriz de Dependências

```
                    Dashboard  Eventos  Pontos  Reservas  Feed
09-espacos              -        ref      -       ←→       via reservas
10-reservas             -         -       -       ←→       publica
11-pedidos              -         -       →        -        -
12-loja                 -         -       →        -        -
13-rankings            ref        -       →        -        -
15-jukebox              -         -       →        -        -
16-pdv                  -         -      ←→        -        -

Legenda:
←→ = bidirecional (já existe)
→  = unidirecional (adicionar retorno)
ref = referência informativa
```

---

## Resultado Esperado

Após execução:
- Todas as referências são bidirecionais
- Integrações com Feed Social documentadas
- Navegação entre módulos relacionados funcional
- Matriz de dependências reflete realidade
