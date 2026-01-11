---
module: eventos
document: creation
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Eventos - Criação de Evento (ADM)

[← Voltar ao Índice](README.md)

---

## Índice

- [Formulário de Criação](#formulário-de-criação)
- [Campos Obrigatórios](#campos-obrigatórios)
- [Campos Opcionais](#campos-opcionais)
- [Divisão de Pontos](#divisão-de-pontos)
- [Preview e Publicação](#preview-e-publicação)

---

## Formulário de Criação

Interface para ADM criar novos eventos com todos os campos necessários para configuração completa.

---

## Campos Obrigatórios

### 1. Título do Evento

- **Input:** Texto
- **Limite:** 5-100 caracteres
- **Exemplo:** "Festa Junina 2026"
- **Validação:** Não pode ser vazio

---

### 2. Descrição

- **Input:** Textarea
- **Limite:** 10-2000 caracteres
- **Suporte a quebras de linha**
- **Preview disponível**

---

### 3. Categoria

- **Input:** Select/Dropdown
- **Opções:**
  - 🎉 Social
  - 🏃 Esportivo
  - 🎭 Cultural
  - 🎓 Educacional
  - 💼 Networking
  - 🍔 Gastronômico
  - 🎵 Musical
  - 🎨 Arte
  - 🎮 Games/E-sports
  - 📢 Institucional
- **Usado para:** Filtros, ícone visual, analytics

---

### 4. Data e Hora de Início

- **Input:** DateTime picker
- **Validação:** Deve ser data futura
- **Formato:** DD/MM/YYYY HH:MM

---

### 5. Data e Hora de Fim

- **Input:** DateTime picker
- **Validação:** Deve ser após data de início
- **Formato:** DD/MM/YYYY HH:MM
- **Cálculo automático de duração**

---

### 6. Local

- **Input:** Select de Espaços + Opção "Outro"

**Se módulo Espaços implementado:**
- Dropdown com espaços pré-cadastrados
- Carrega automaticamente: Nome, endereço, capacidade

**Se "Outro":**
- Campo de texto livre
- Opcional: Coordenadas GPS (para mapa)

---

### 7. Imagem do Evento - Feed

- **Upload:** JPG, PNG
- **Tamanho máx:** 5MB
- **Proporção recomendada:** 1:1 ou 4:5 (mobile feed)
- **Preview disponível**
- **Crop tool para ajustar**

---

### 8. Imagem do Evento - Display

- **Upload:** JPG, PNG (pode ser múltiplas)
- **Tamanho máx:** 5MB por imagem
- **Proporção:** 16:9 (widescreen)

**Se múltiplas imagens:**
- Rotacionam no background do Display
- Intervalo: 10 segundos (configurável)
- Preview fullscreen disponível

---

### 9. Cor Personalizada

- **Input:** Color picker
- **Usado em:**
  - ✅ Background do header da página do evento
  - ✅ Cor do botão "Confirmar Presença"
  - ✅ Borda do card do evento (listagem)
  - ✅ Tema do Display (overlay)
  - ✅ Cor do progresso de check-ins
- **Preview em tempo real**

---

### 10. Pontos Totais Distribuídos

- **Input:** Number
- **Min:** 1, **Max:** 10.000
- **Exemplo:** 100 pontos
- **Será dividido entre check-ins**

---

### 11. Quantidade de Check-ins

- **Input:** Number
- **Min:** 1, **Max:** 20
- **Exemplo:** 4 check-ins
- **Define quantas vezes usuário pode fazer check-in**

---

### 12. Intervalo entre Check-ins

- **Input:** Number + Select (minutos/horas)
- **Min:** 0 (sem intervalo)
- **Max:** 24 horas
- **Exemplo:** "30 minutos" ou "2 horas"

**Lógica:**
- Display muda QR Code após intervalo
- CHECK-IN 1 → espera X tempo → CHECK-IN 2
- Usuário só pode escanear o check-in atual

---

## Campos Opcionais

### 13. Badge do Evento

- **Input:** Select/Modal de seleção
- **Fonte:** Módulo de Badges (ADM)
- **Preview do badge selecionado**
- **Se não selecionado:** Evento não tem badge

**Quando usuário ganha:**
- ADM escolhe ao criar evento:
  - [ ] Ao fazer primeiro check-in
  - [ ] Ao completar todos os check-ins
  - [x] **Padrão:** Ao fazer pelo menos 1 check-in

---

### 14. Capacidade Máxima

- **Input:** Number
- **Min:** 1, **Max:** 100.000
- **Exemplo:** 500 pessoas

**Efeitos:**
- Aviso quando X% da capacidade atingido
- Bloqueia confirmações quando lotado (opcional)
- Exibido na página do evento

---

### 15. Link Externo

- **Input:** URL
- **Validação:** URL válida
- **Exemplo:** Site de inscrições, formulário, live stream
- **Botão "Mais informações" na página do evento**

---

## Divisão de Pontos

### Sistema Híbrido

**Padrão - Auto-divisão:**
```
Pontos totais: 100
Check-ins: 4
Divisão: 25 pts por check-in
```

**Opção Avançada - Customização:**
- Toggle "Customizar pontos por check-in"
- ADM define manualmente cada um:
  ```
  Check-in 1: 10 pts
  Check-in 2: 20 pts
  Check-in 3: 30 pts
  Check-in 4: 40 pts
  Total: 100 pts (validação automática)
  ```
- Soma total deve bater com "Pontos Totais"

---

## Preview e Publicação

### Antes de Publicar

**Preview do Display:**
- Botão "Ver preview do Display"
- Modal fullscreen simulando TV
- Mostra como ficará o evento na tela
- Testa rotação de imagens de background

**Preview do Post no Feed:**
- Botão "Ver como ficará no feed"
- Modal mostrando card do post
- Inclui banner, título, data, botão interesse

---

### Estados de Publicação

**Rascunho:**
- Evento salvo mas não publicado
- Apenas ADM vê
- Não aparece em listagens
- Não cria post no feed
- Pode editar livremente

**Publicado (Checkbox):**
- Evento visível para todos
- Aparece em listagens
- **Cria automaticamente:**
  - Display vinculado
  - Post no feed (se checkbox marcado)
  - Notificações (se configurado)

---

## Relacionados

- [Especificação](spec.md)
- [Display](display.md)
- [Sistema de Check-in](checkin-system.md)
- [Badges](badges.md)
- [API](api.md)
