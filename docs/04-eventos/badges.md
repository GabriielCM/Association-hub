---
module: eventos
document: badges
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Eventos - Módulo de Badges (ADM)

[← Voltar ao Índice](README.md)

---

## Índice

- [Visão Geral](#visão-geral)
- [Gestão de Badges](#gestão-de-badges)
- [Biblioteca de Badges](#biblioteca-de-badges)
- [Integração com Eventos](#integração-com-eventos)

---

## Visão Geral

> **Nota:** Módulo separado e independente. Eventos apenas selecionam badges da biblioteca.

O sistema de badges permite que administradores criem recompensas visuais que usuários podem conquistar ao participar de eventos.

---

## Gestão de Badges

### Página de Badges

```
┌─────────────────────────────────────────────┐
│ 🏆 Badges                    [+ Criar Badge]│
├─────────────────────────────────────────────┤
│                                             │
│ ┌───────────────────┐ ┌───────────────────┐│
│ │   [Ícone 🎉]      │ │   [Ícone 🏃]      ││
│ │                   │ │                   ││
│ │ Festa Junina 2026 │ │ Corrida 5K        ││
│ │                   │ │                   ││
│ │ Participe da      │ │ Complete a        ││
│ │ tradicional festa │ │ corrida de 5km    ││
│ │                   │ │                   ││
│ │ 25 conquistados   │ │ 10 conquistados   ││
│ │                   │ │                   ││
│ │ [Editar] [Deletar]│ │ [Editar] [Deletar]││
│ └───────────────────┘ └───────────────────┘│
│                                             │
└─────────────────────────────────────────────┘
```

---

### Formulário de Criação

**Campos:**

**1. Ícone/Imagem**
- Upload: PNG (transparente) ou JPG
- Tamanho: 200x200px recomendado
- Formato: Quadrado
- Preview em tempo real

**2. Nome**
- Input: Texto
- Limite: 5-80 caracteres
- Exemplo: "Participante Festa Junina 2026"

**3. Descrição**
- Input: Textarea
- Limite: 10-200 caracteres
- Exemplo: "Participe da tradicional Festa Junina da associação"

**4. Cor de Fundo** (Opcional)
- Color picker
- Padrão: Cinza claro
- Usado como fundo do card do badge

---

### Ações

- **Criar Badge:** Adiciona à biblioteca
- **Editar Badge:** Apenas se não estiver vinculado a evento ativo
- **Deletar Badge:** Apenas se não estiver vinculado
- **Preview:** Visualizar em diferentes contextos (perfil, modal, notificação)

---

## Biblioteca de Badges

### Sistema Pré-definido

- ADM pode criar badges customizados
- Badges ficam salvos na biblioteca
- Reutilizáveis em múltiplos eventos

### Seleção no Evento

- Dropdown com preview
- Busca por nome
- Ordenação: Mais recentes, Alfabética, Mais usados

---

## Integração com Eventos

### Configuração no Evento

Ao criar evento, ADM pode:
1. Selecionar badge da biblioteca
2. Definir critério de conquista:
   - [ ] Ao fazer primeiro check-in
   - [ ] Ao completar todos os check-ins
   - [x] **Padrão:** Ao fazer pelo menos 1 check-in

### Fluxo de Conquista

1. Usuário faz check-in
2. Sistema verifica critério configurado
3. Se atendido: Badge creditado automaticamente
4. Notificação enviada ao usuário
5. Badge aparece no perfil

### Integração com Perfil

- Badge conquistado → Aparece no perfil automaticamente
- Usuário pode selecionar 3 badges para exibir
- Tooltip ao clicar: Nome + descrição + data de obtenção

---

## Relacionados

- [Especificação](spec.md)
- [Criação de Eventos](creation.md)
- [Sistema de Check-in](checkin-system.md)
- [API](api.md)
- [Perfil do Usuário](../02-perfil/spec.md)
