---
module: carteirinha
document: spec
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Carteirinha - Especificação

[← Voltar ao Índice](README.md)

---

## Índice

- [Visão Geral](#visão-geral)
- [Carteirinha Digital](#carteirinha-digital)
- [Navegação e Estrutura](#navegação-e-estrutura)
- [Design e UX](#design-e-ux)
- [Funcionalidade Offline](#funcionalidade-offline)
- [Notificações](#notificações)
- [Responsividade](#responsividade)
- [Notas de Desenvolvimento](#notas-de-desenvolvimento)
- [Fases de Implementação](#fases-de-implementação)

---

## Visão Geral

**Prioridade:** 🔴 MVP
**Status:** 🟢 Especificação Completa

**Descrição:**
Carteirinha digital de identificação do associado com QR Code para validação de benefícios, acesso a parceiros e informações de contato da associação. Funciona parcialmente offline.

---

## Carteirinha Digital

### Layout Visual

**Formato:** Vertical (estilo carteirinha tradicional)
**Dimensões:** Proporção 3:5 (padrão cartão de crédito vertical)
**Animação:** Flip 3D ao virar

**Estados:**
- [ ] Ativa (padrão)
- [ ] Inativa/Bloqueada
- [ ] Loading (skeleton)

---

### Frente da Carteirinha

**Elementos (de cima para baixo):**

1. **Logo da Associação**
   - Posição: Topo centro
   - Tamanho: 60x60px
   - Formato: PNG com transparência

2. **Foto do Usuário**
   - Posição: Centro superior
   - Formato: Circular 100x100px
   - Border: 2px sólido na cor primária
   - Fallback: Ícone de usuário se sem foto

3. **Nome do Usuário**
   - Tipografia: 18px, bold
   - Posição: Abaixo da foto
   - Alinhamento: Centro
   - Max caracteres visíveis: 25 (truncar com "...")

4. **Matrícula/ID**
   - Tipografia: 14px, regular
   - Formato: "Matrícula: #XXXXX"
   - Cor: Cinza médio
   - Posição: Abaixo do nome

5. **QR Code** (Se carteirinha ativa)
   - Tamanho: 180x180px
   - Posição: Centro inferior
   - Formato: QR Code dinâmico
   - Conteúdo codificado: JSON com user_id + timestamp + hash
   - Margem interna: 16px

**OU**

5. **Status Inativo** (Se carteirinha bloqueada)
   - Ícone: ⚠️ ou 🔒
   - Texto: "CARTEIRINHA INATIVA"
   - Subtexto: Motivo (ex: "Inadimplente", "Suspenso")
   - Botão: "Regularizar Situação"
   - Cor de fundo: Overlay vermelho semi-transparente

6. **Ícone de Virar**
   - Posição: Canto inferior direito
   - Ícone: Setas circulares (🔄) ou seta curva
   - Tamanho: 24x24px
   - Cor: Primária ou branca (conforme fundo)

**Background:**
- Gradiente ou cor sólida da identidade visual
- Padrão geométrico sutil (opcional)

**Interações:**
- Toque em qualquer lugar → Flip para o verso
- Toque no ícone de virar → Flip para o verso
- Ao abrir carteirinha → Aumenta brilho da tela automaticamente

---

### Verso da Carteirinha

**Elementos:**

1. **Título**
   - Texto: "Como usar sua carteirinha"
   - Tipografia: 16px, bold
   - Posição: Topo

2. **Instruções de Uso**
   - Lista numerada ou com ícones
   - Tipografia: 12px, regular
   - Espaçamento: 8px entre itens
   - Exemplo:
```
     1. Apresente o QR Code ao estabelecimento parceiro
     2. Aguarde a leitura do código
     3. Confirme seu nome na tela do estabelecimento
     4. Aproveite seu benefício!
```

3. **Informações de Contato da Associação**
   - Ícones + texto
   - 📞 Telefone: (XX) XXXX-XXXX
   - 📧 Email: contato@associacao.com.br
   - 🌐 Site: www.associacao.com.br
   - 📍 Endereço: Rua X, 000 - Cidade

4. **Logo/Marca d'água**
   - Posição: Fundo, centro
   - Opacidade: 10-15%
   - Tamanho: 120x120px

**Interações:**
- Toque em qualquer lugar → Flip para frente
- Toque em telefone → Abre discador
- Toque em email → Abre cliente de email
- Toque em site → Abre navegador
- Toque em endereço → Abre Google Maps

---

## Navegação e Estrutura

### Fluxo Principal

```
Dashboard → Acessos Rápidos → "Minha Carteira"
                                     ↓
                            ┌────────────────┐
                            │  CARTEIRINHA   │
                            │  [Frente/Verso]│
                            └────────────────┘
                                     ↓
                    ┌────────────────┴────────────────┐
                    ↓                                 ↓
            ┌───────────────┐                ┌──────────────┐
            │  BENEFÍCIOS   │                │  HISTÓRICO   │
            │   (Lista)     │                │   (Tabs)     │
            └───────────────┘                └──────────────┘
                    ↓
            ┌───────────────┐
            │  DETALHES DO  │
            │   PARCEIRO    │
            └───────────────┘
```

### Estrutura de Tabs

```
┌─────────────────────────────────────────┐
│  [Carteirinha] [Benefícios] [Histórico] │
└─────────────────────────────────────────┘
```

---

## Design e UX

### Cores e Estados

**Carteirinha Ativa:**
- Fundo: Gradiente da identidade visual
- Texto: Branco (alto contraste)
- QR Code: Fundo branco, código preto

**Carteirinha Inativa:**
- Fundo: Overlay vermelho/cinza (opacidade 80%)
- Ícone: Vermelho ou amarelo (alerta)
- Texto: Vermelho escuro

### Animações

**Flip da Carteirinha:**
- Duração: 400ms
- Easing: ease-in-out
- Eixo: Y (vertical flip)

**Transição de Telas:**
- Slide from right (300ms)
- Slide to left ao voltar (300ms)

**Loading States:**
- Skeleton screens para listas
- Shimmer effect
- Spinner circular para ações

### Feedback Visual

**Brilho Automático:**
- Ao abrir carteirinha → Brilho para 100%
- Ao sair → Restaura brilho anterior
- Transição suave (200ms)

**Haptic Feedback:**
- Ao virar carteirinha (leve)
- Ao filtrar benefícios (leve)
- Ao escanear QR Code (médio)

---

## Funcionalidade Offline

**O que funciona offline:**
- ✅ Visualização da carteirinha (frente e verso)
- ✅ QR Code (gerado localmente com cache)
- ✅ Lista completa de benefícios (cache)
- ✅ Detalhes dos parceiros (cache)

**O que requer internet:**
- ❌ Atualização de status (ativo/inativo)
- ❌ Novos parceiros adicionados
- ❌ Histórico de uso
- ❌ Distância até parceiros (requer localização + dados)
- ❌ Sincronização de informações

**Estratégia de Cache:**
- Cache de 7 dias para lista de benefícios
- Cache de 24h para detalhes de parceiros
- QR Code armazenado localmente (atualiza a cada abertura se online)

**Indicadores:**
- Badge "Offline" discreto no header quando sem internet
- Toast informando "Usando dados em cache" ao abrir benefícios offline

---

## Notificações

### Tipos de Notificações

**1. Mudança de Status**
- Trigger: Status alterado para inativo
- Título: "Carteirinha Inativa"
- Mensagem: "Sua carteirinha foi suspensa. [Motivo]"
- Ação: "Regularizar"

**2. Novos Parceiros**
- Trigger: Novo parceiro adicionado
- Título: "Novo Benefício Disponível!"
- Mensagem: "[Nome do Parceiro] agora é parceiro"
- Ação: "Ver Benefícios"

**3. Parceiro Próximo** (Opcional - Fase 2)
- Trigger: Geofencing detecta usuário próximo a parceiro
- Título: "Você está perto de um parceiro!"
- Mensagem: "[Nome] - [Benefício]"
- Ação: "Ver Detalhes"

### Configurações

Usuário pode desabilitar:
- [ ] Notificações de novos parceiros
- [ ] Notificações de proximidade

---

## Responsividade

**Mobile (Primary):**
- Layout otimizado para telas 360x640 até 414x896
- Carteirinha ocupa 90% da largura da tela
- Benefícios em lista vertical

**Tablet:**
- Carteirinha centralizada (max-width: 400px)
- Benefícios em grid 2 colunas

**Desktop (Web - Fase 2):**
- Carteirinha centralizada
- Benefícios em grid 3 colunas

---

## Notas de Desenvolvimento

### Performance

- Implementar lazy loading na lista de benefícios (20 por vez)
- Cache agressivo de imagens de logos e banners
- Comprimir imagens antes de exibir
- Virtual scroll na lista de benefícios (se >50 parceiros)

### Acessibilidade

- Contrast ratio mínimo de 4.5:1 em textos
- Tamanho mínimo de toque: 48x48px
- Labels descritivos para screen readers
- Suporte a font scaling (até 200%)

### Testes

**Casos de Teste Críticos:**
1. Carteirinha funciona offline
2. QR Code é escaneável por leitores padrão
3. Flip animation funciona em todos os dispositivos
4. Brilho aumenta/diminui corretamente
5. Cache de benefícios persiste após fechar app
6. Estado bloqueado impede acesso ao QR Code
7. Distância é calculada corretamente
8. Links externos abrem apps corretos (phone, maps, etc)

### Melhorias Futuras (Backlog)

- 🟢 Apple Wallet / Google Pay integration
- 🟢 Avaliações/reviews de parceiros
- 🟢 Mapa interativo com todos os parceiros
- 🟢 Notificações geofencing de parceiros próximos
- 🟢 Modo escuro
- 🟢 Compartilhar benefício com amigo (invite)
- 🟢 Favoritar parceiros
- 🟢 Histórico de benefícios usados (analytics pessoal)

---

## Fases de Implementação

### Fase 1 - MVP (Essencial)

✅ Carteirinha digital (frente/verso)
✅ QR Code funcional
✅ Lista de benefícios
✅ Detalhes de parceiros
✅ Busca e filtros básicos
✅ Histórico de uso
✅ Funcionamento offline

### Fase 2 - Aprimoramentos

🟡 Geolocalização e distância
🟡 Ordenação por proximidade
🟡 Notificações de novos parceiros
🟡 Onboarding (tooltips)
🟡 Mapa de parceiros

### Fase 3 - Nice to Have

🟢 Apple Wallet / Google Pay
🟢 Avaliações de parceiros
🟢 Geofencing notifications
🟢 Analytics pessoal de uso

---

## Métricas de Sucesso

**KPIs a Acompanhar:**

1. **Adoção:**
   - % de usuários que acessam carteirinha (meta: >80%)
   - Frequência média de uso por semana

2. **Engajamento com Benefícios:**
   - Taxa de clique em parceiros
   - Parceiros mais visualizados
   - Uso de busca/filtros

3. **Validação:**
   - Quantidade de scans do QR Code por semana
   - Locais mais utilizados

4. **Performance:**
   - Tempo médio de carregamento da carteirinha
   - Taxa de erro ao gerar QR Code
   - Taxa de uso offline

5. **Notificações:**
   - Open rate de notificações de novos parceiros
   - Taxa de conversão (notificação → visualização do parceiro)

---

## Relacionados

- [Benefícios](benefits.md)
- [QR Code](qr-code.md)
- [API](api.md)
- [Critérios de Aceitação](acceptance-criteria.md)
