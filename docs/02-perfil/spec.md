---
module: perfil
document: spec
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Perfil do Usuário - Especificação

[← Voltar ao Índice](README.md)

---

## Índice

- [Visão Geral](#visão-geral)
- [Componentes](#componentes)
- [Estrutura Lógica](#estrutura-lógica)
- [Fluxos de Navegação](#fluxos-de-navegação)

---

## Visão Geral

**Prioridade:** 🔴 MVP
**Status:** 🟢 Especificação Completa

**Descrição:**
Página de perfil do usuário exibindo informações pessoais, badges, posts e estatísticas.

---

## Componentes

### 1. Header do Perfil

#### 1.1 Foto do Perfil

**Elementos:**
- Imagem circular (120x120px)
- Anel colorido se houver stories ativos
- Ícone de câmera no canto (apenas no próprio perfil)

**Interações:**
- **Toque simples:** Abre stories (se houver)
- **Toque longo:** Amplia foto em modal
- **Ícone de câmera:** Abre seletor de foto

**Estados:**
- [ ] Com stories não vistos (anel colorido)
- [ ] Com stories vistos (anel cinza)
- [ ] Sem stories
- [ ] Loading (skeleton circular)

**Regras:**
- Formatos aceitos: jpg, png
- Tamanho máx: 5MB
- Resolução mín: 200x200px

---

#### 1.2 Nome e Username

**Elementos:**
- Nome social (24px, bold)
- @username (16px, cinza)

**Regras:**
- Nome social: 3-50 caracteres

---

#### 1.3 Badges

**Tipos de Badges:**

**Fixos (Sistema):**
- 🥇 Top 1 (ranking x mensal)
- 🥈 Top 2 (ranking x mensal)
- 🥉 Top 3 (ranking x mensal)
- 🎂 Aniversariante (no mês)

**Personalizados (Usuário escolhe):**
- Badges de eventos participados
- Badges de conquistas especiais

**UX:**
- Máximo 3 badges visíveis
- Ícones 24x24px abaixo do nome
- Botão "+X" para ver todos (se tiver mais de 3)

**Interações:**
- Ao clicar → Tooltip com explicação do badge
- Ao clicar em "+X" → Modal com todos os badges

**Modal de Badges:**
- Grid 3 colunas
- Título + descrição de cada badge
- Opção de selecionar 3 para exibir (apenas próprio perfil)

---

#### 1.4 Posts

**Elementos:**
- Grid 3 colunas (quadrados)
- Thumbnail das fotos
- Ícone se for enquete ou evento

**Interações:**
- Ao clicar → Abre modal com post completo (estilo Instagram)

**Estados:**
- [ ] Com posts
- [ ] Sem posts (mensagem "Nenhum post ainda")
- [ ] Loading (skeleton grid)

---

### 2. Abas de Conteúdo

#### 2.1 Aba: Badges

- Lista completa de badges conquistados
- Progresso de badges a conquistar

---

#### 2.2 Aba: Rankings

- Posições em diferentes rankings
- Histórico de conquistas

---

### 3. Ações do Perfil

#### 3.1 Perfil de Outro Usuário

**Botões disponíveis:**
- 💬 Enviar mensagem
- 📊 Ver rankings
- 🏆 Ver badges

**Ações secundárias (menu):**
- Denunciar
- Bloquear

---

#### 3.2 Meu Perfil

**Botões disponíveis:**
- ✏️ Editar perfil
- 📸 Alterar foto
- 🏆 Selecionar badges (3)

**Atalhos rápidos:**
- 🎫 Carteirinha
- 💬 Mensagens
- ⚙️ Configurações

---

## Estrutura Lógica

```
┌─────────────────────────────────┐
│┌─────────┐          [⚙️ Config] │
││  Foto   │        [💬 Mensagem] │
│└─────────┘                      │
│                                 │
│       Nome do Usuário           │
│       @username                 │
│       🥇 🎂 ⭐                    │
│                                 │
│ [🏆 Badges]       [📊 Rankings] │
├─────────────────────────────────┤
|            "Posts"              |
│  ┌───┐     ┌───┐      ┌───┐     │
│  │ 1 │     │ 2 │      │ 3 │     │
│  └───┘     └───┘      └───┘     │
│  ┌───┐     ┌───┐      ┌───┐     │
│  │ 4 │     │ 5 │      │ 6 │     │
│  └───┘     └───┘      └───┘     │
└─────────────────────────────────┘
```

---

## Fluxos de Navegação

```
Perfil → Editar Perfil
Perfil → Post Individual
Perfil → Stories
Perfil → Mensagem (se for outro usuário)
Perfil → Rankings
Perfil → Carteirinha (atalho) (Próprio user)
```

---

## Relacionados

- [API](api.md)
- [Critérios de Aceitação](acceptance-criteria.md)
- [Dashboard](../01-dashboard/)
