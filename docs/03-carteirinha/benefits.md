---
module: carteirinha
document: benefits
status: complete
priority: mvp
last_updated: 2026-01-14
---

# Carteirinha - Benefícios e Convênios

[← Voltar ao Índice](README.md)

---

## Visão Geral dos Benefícios

**Layout:** Lista vertical com cards

**Header da Seção:**
- Título: "Benefícios e Convênios"
- Contador: "X parceiros disponíveis"
- Barra de busca (ícone 🔍)
- Filtros: Ícone de funil (🔽)

**Funcionalidades:**
- Busca por nome do parceiro
- Filtro por categoria
- Ordenação (A-Z, Mais próximos, Recentes)

---

## Filtros

### Categorias Disponíveis

- 🍽️ Alimentação
- 🏥 Saúde
- 🎭 Lazer & Entretenimento
- 🎓 Educação
- 🏃 Esportes & Fitness
- 🛒 Varejo & Serviços
- 🚗 Automotivo
- 💼 Outros

### Ordenação

- Alfabética (A-Z)
- Mais próximos (requer localização)
- Adicionados recentemente

### UI do Filtro

- Modal bottom sheet
- Checkboxes para múltiplas categorias
- Radio buttons para ordenação
- Botões: "Limpar" e "Aplicar"

---

## Card de Parceiro (Lista)

### Elementos

1. **Logo do Parceiro**
   - Tamanho: 60x60px
   - Formato: Circular ou quadrado com bordas arredondadas
   - Posição: Esquerda

2. **Informações Principais**
   - Nome do estabelecimento (16px, bold)
   - Categoria (12px, badge colorido)
   - Descrição resumida do benefício (14px, 2 linhas máx)

3. **Distância**
   - Ícone: 📍
   - Texto: "X,X km"
   - Posição: Canto superior direito
   - Cor: Cinza

4. **Indicador de Detalhes**
   - Seta ou chevron → (direita)

### Interações

- Toque no card → Abre detalhes do parceiro

### Estados

- [ ] Normal
- [ ] Pressionado (feedback visual)
- [ ] Novo (badge "NOVO" se adicionado há menos de 7 dias)

### Layout

- Padding: 16px
- Margem entre cards: 8px
- Divider sutil entre cards

---

## Detalhes do Parceiro

### Estrutura da Página

**1. Header com Imagem**
- Banner/foto do estabelecimento (16:9)
- Botão voltar (← canto superior esquerdo)
- Logo circular sobrepondo banner (bottom center)

**2. Informações Principais**
- Nome do estabelecimento (20px, bold)
- Categoria (badge)
- Rating/Avaliação (⭐ opcional - Fase 2)

**3. Benefício Oferecido**
- Card destacado com fundo colorido
- Ícone: 🎁
- Texto: "SEU BENEFÍCIO"
- Descrição: "Ex: 15% de desconto em todos os produtos"
- Tipografia: 16px, bold

**4. Como Usar**
- Ícone: ℹ️
- Instruções específicas deste parceiro
- Ex: "Apresente sua carteirinha antes de fechar a conta"

**5. Informações de Contato**

**Telefone:**
- Ícone: 📞
- Número clicável
- Ação: Discar

**Endereço:**
- Ícone: 📍
- Endereço completo
- Distância do usuário (se permissão de localização)
- Ação: Abrir no Maps

**Horário de Funcionamento:**
- Ícone: 🕐
- Listagem por dia da semana
- Destaque se está aberto agora (verde) ou fechado (vermelho)

**Site:** (Se houver)
- Ícone: 🌐
- Link clicável

**Redes Sociais:** (Se houver)
- Ícones: Instagram, Facebook, WhatsApp
- Links clicáveis

**6. Mapa (Opcional - Fase 2)**
- Minimap mostrando localização
- Botão "Ver no mapa"

**7. Botão de Ação Principal**
- Fixo no bottom (sticky)
- Texto: "Usar Benefício" ou "Ver Direções"
- Ação:
  - Se no local → Mostra QR Code ou instrução
  - Se longe → Abre navegação

---

## Histórico de Uso

**Localização:** Aba dentro do módulo Carteirinha

**Tabs:**
- "Usos do QR Code"
- "Transferências" (linking para módulo de Pontos)

### Aba: Usos do QR Code

**Layout:** Lista cronológica (mais recente primeiro)

**Card de Histórico:**

**Elementos:**
- Ícone representativo:
  - 🏢 Check-in na associação
  - 🎁 Uso de benefício em parceiro
  - 🎫 Validação em evento
- Nome do local
- Data e hora (formato: "DD/MM/YYYY às HH:MM")
- Endereço/Local (se disponível)

**Interações:**
- Toque no card → Expande detalhes (se houver)

**Estados Vazios:**
- Ícone: 📋
- Texto: "Nenhum uso registrado"
- Subtexto: "Seu histórico de uso aparecerá aqui"

**Filtros (Fase 2):**
- Por data
- Por tipo de uso
- Por local

---

## Badges de Categoria (Cores)

```
Alimentação: 🟠 Laranja
Saúde: 🔵 Azul
Lazer: 🟣 Roxo
Educação: 🟢 Verde
Esportes: 🔴 Vermelho
Varejo: 🟡 Amarelo
Automotivo: ⚫ Cinza escuro
Outros: 🟤 Marrom
```

---

## Público-Alvo de Convênios

> **Integração com [Assinaturas](../17-assinaturas/)**

### Públicos Disponíveis

Com o módulo de Assinaturas, convênios podem ser restritos por público-alvo:

| Público | Código | Descrição |
|---------|--------|-----------|
| Todos | `all` | Qualquer associado |
| Assinantes | `subscribers` | Apenas quem tem assinatura ativa |
| Não-assinantes | `non_subscribers` | Apenas quem NÃO tem assinatura |
| Planos específicos | `specific_plans` | Apenas assinantes de planos específicos |

### Configuração por Convênio

O ADM pode definir para cada convênio:
- **Públicos elegíveis:** Seleção múltipla de públicos
- **Planos específicos:** Se "Assinantes" selecionado, pode restringir a planos específicos
- **Mostrar bloqueado:** Se não elegíveis veem o convênio com cadeado

### Exibição para Não Elegíveis

**Se `show_locked_for_ineligible = true`:**
```
┌─────────────────────────────────────┐
│ [Logo] 🔒 Restaurante Exemplo      │
│ [Alimentação]                       │
│                                     │
│ Benefício exclusivo para           │
│ assinantes do plano Gold           │
│                                     │
│ [Assinar para desbloquear →]       │
└─────────────────────────────────────┘
```

**Se `show_locked_for_ineligible = false`:**
- Convênio não aparece na lista

---

## Estrutura de Dados - Parceiro

```json
{
  "id": "1",
  "name": "Pizzaria Bella",
  "category": "Alimentação",
  "logo_url": "https://...",
  "banner_url": "https://...",
  "benefit": "15% de desconto",
  "instructions": "Apresente a carteirinha antes de fechar a conta",
  "address": {
    "street": "Rua das Flores, 123",
    "city": "São Paulo",
    "state": "SP",
    "zip": "01234-567",
    "lat": -23.5505,
    "lng": -46.6333
  },
  "contact": {
    "phone": "(11) 1234-5678",
    "website": "https://pizzariabella.com.br",
    "instagram": "@pizzariabella",
    "facebook": "pizzariabellasp"
  },
  "hours": {
    "monday": "11:00-23:00",
    "tuesday": "11:00-23:00",
    "wednesday": "11:00-23:00",
    "thursday": "11:00-23:00",
    "friday": "11:00-00:00",
    "saturday": "11:00-00:00",
    "sunday": "11:00-22:00"
  },
  "is_new": false,
  "added_at": "2024-01-01T00:00:00Z",

  "eligible_audiences": ["all"],
  "eligible_plans": [],
  "show_locked_for_ineligible": true
}
```

---

## Relacionados

- [Especificação](spec.md)
- [QR Code](qr-code.md)
- [API](api.md)
