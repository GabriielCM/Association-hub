---
module: rankings
document: acceptance-criteria
status: complete
priority: phase2
last_updated: 2026-01-28
---

# Rankings - Critérios de Aceitação

[← Voltar](README.md)

---

## 1. Listagem de Rankings

### 1.1 Visualização

- [ ] Usuário consegue acessar rankings via carrossel no Dashboard
- [ ] Tela exibe Top 10 da categoria selecionada
- [ ] Pódio (Top 3) possui destaque visual com ícones de medalha
- [ ] Cada entrada mostra: posição, avatar, nome, pontuação
- [ ] Posição do usuário logado é exibida mesmo se fora do Top 10
- [ ] Card de posição do usuário fica fixo na parte inferior

### 1.2 Navegação

- [ ] Tabs permitem alternar entre Posts, Eventos e Strava
- [ ] Toggle permite alternar entre Mensal e All-time
- [ ] Transição entre tabs é suave (< 500ms)
- [ ] Estado da tab e toggle é preservado durante a sessão

### 1.3 Dados

- [ ] Ranking exibe dados em tempo real
- [ ] Posições atualizam automaticamente quando há mudanças
- [ ] Total de participantes é exibido
- [ ] Timestamp de última atualização é exibido

### 1.4 Desempate

- [ ] Em caso de empate, quem atingiu a pontuação primeiro fica à frente
- [ ] Posições são calculadas corretamente com regra de desempate

---

## 2. Badges de Ranking

### 2.1 Concessão

- [ ] Badge é concedida automaticamente ao entrar no Top 3
- [ ] Usuário recebe badge correta para categoria + período + posição
- [ ] Múltiplas badges podem ser concedidas simultaneamente
- [ ] Badge aparece imediatamente no perfil após concessão

### 2.2 Remoção

- [ ] Badge é removida automaticamente ao sair do Top 3
- [ ] Remoção ocorre em tempo real quando outro usuário ultrapassa
- [ ] Badge removida é registrada no histórico com data de perda

### 2.3 Exibição

- [ ] Máximo 3 badges são exibidas no header do perfil
- [ ] Usuário pode escolher quais badges exibir
- [ ] Botão "+X" aparece quando há mais de 3 badges
- [ ] Modal expande para mostrar todas as badges
- [ ] Tap em badge exibe tooltip com descrição

### 2.4 Tipos

- [ ] Sistema suporta 18 tipos de badges (3 cat × 2 per × 3 pos)
- [ ] Cada badge tem ID único no formato `{categoria}-{periodo}-top{posicao}`
- [ ] Badges de períodos diferentes são independentes

---

## 3. Integração com Perfil

### 3.1 Aba Rankings

- [ ] Aba "Rankings" é exibida no perfil do usuário
- [ ] Aba mostra posição atual em todas as categorias e períodos
- [ ] Posições no pódio exibem ícone de medalha
- [ ] Pontuação de cada categoria é exibida

### 3.2 Timeline de Histórico

- [ ] Histórico de conquistas é exibido na aba Rankings
- [ ] Ordenação cronológica (mais recente primeiro)
- [ ] Cada entrada mostra: data, badge, categoria
- [ ] Scroll infinito com lazy loading funciona
- [ ] Badges perdidas aparecem com indicador visual

### 3.3 Badges no Header

- [ ] Badges de ranking aparecem junto com outras badges do perfil
- [ ] Priorização respeita seleção do usuário
- [ ] Tamanho correto (24x24px)
- [ ] Interação (tap) funciona corretamente

---

## 4. Configuração ADM

### 4.1 Gestão de Badges

- [ ] ADM consegue listar todas as 18 badges
- [ ] ADM consegue editar nome de cada badge
- [ ] ADM consegue editar descrição de cada badge
- [ ] ADM consegue fazer upload de ícone (PNG/SVG, máx 512KB)
- [ ] ADM consegue configurar cores (primary, background)
- [ ] ADM consegue ativar/desativar badges individualmente

### 4.2 Preview

- [ ] ADM visualiza preview da badge em contexto de header (24px)
- [ ] ADM visualiza preview da badge em contexto de modal (48px)
- [ ] ADM visualiza preview da badge em contexto de lista
- [ ] Preview atualiza em tempo real conforme edição

### 4.3 Configurações Gerais

- [ ] ADM consegue ativar/desativar categorias de ranking
- [ ] ADM consegue ativar/desativar períodos de ranking
- [ ] Mudanças de configuração refletem imediatamente no app

---

## 5. Estados e Performance

### 5.1 Loading

- [ ] Skeleton é exibido durante carregamento
- [ ] Skeleton tem estrutura similar ao conteúdo final
- [ ] Não há "flash" de conteúdo durante transição

### 5.2 Empty

- [ ] Estado vazio é exibido quando categoria não tem participantes
- [ ] Mensagem amigável encoraja usuário a participar
- [ ] Ícone ilustrativo é exibido

### 5.3 Error

- [ ] Estado de erro é exibido quando API falha
- [ ] Mensagem de erro é clara e amigável
- [ ] Botão "Tentar novamente" está disponível
- [ ] Retry funciona corretamente

### 5.4 Performance

- [ ] Carregamento inicial completa em < 2 segundos
- [ ] Troca de categoria completa em < 500ms
- [ ] Troca de período completa em < 500ms
- [ ] Atualização em tempo real ocorre em < 1 segundo
- [ ] Scroll é suave sem travamentos

---

## 6. Acessibilidade

### 6.1 Visual

- [ ] Contrast ratio mínimo de 4.5:1 em todos os textos
- [ ] Ícones de medalha têm alternativa textual
- [ ] Cores não são único indicador de informação
- [ ] Fontes escaláveis respeitam preferências do sistema

### 6.2 Interação

- [ ] Touch targets mínimo de 48x48px
- [ ] Focus visible em elementos interativos
- [ ] Ordem de foco lógica (tabs → toggle → lista)
- [ ] Gestos alternativos para ações de swipe

### 6.3 Screen Reader

- [ ] Labels descritivos em todos os elementos
- [ ] Anúncios de mudança de conteúdo (ARIA live)
- [ ] Estrutura semântica correta (headings, lists)
- [ ] Badges possuem descrição acessível

---

## 7. Offline e Conectividade

### 7.1 Cache

- [ ] Último ranking visualizado é cacheado
- [ ] Usuário pode ver ranking cacheado offline
- [ ] Indicador visual mostra dados são do cache
- [ ] Cache é invalidado quando online e há mudanças

### 7.2 Reconexão

- [ ] App detecta reconexão automaticamente
- [ ] Ranking é atualizado após reconexão
- [ ] Não há duplicação de dados após reconexão

---

## 8. Segurança

### 8.1 Autenticação

- [ ] Endpoints requerem autenticação
- [ ] Token inválido retorna 401
- [ ] Token expirado solicita reautenticação

### 8.2 Autorização

- [ ] Common User não acessa endpoints ADM
- [ ] ADM não pode editar dados de outros ADMs
- [ ] Usuário só pode modificar própria seleção de badges

### 8.3 Validação

- [ ] Input de categorias é validado no backend
- [ ] Input de períodos é validado no backend
- [ ] Upload de ícone valida tipo e tamanho

---

## 9. Integrações

### 9.1 Sistema de Pontos

- [ ] Rankings refletem pontos creditados corretamente
- [ ] Transações por `source` são filtradas corretamente
- [ ] Multiplicadores de assinatura não afetam categorização

### 9.2 Dashboard

- [ ] Card de ranking aparece no carrossel de acesso rápido
- [ ] Navegação do card leva à tela de rankings
- [ ] Preview no card mostra informação útil

### 9.3 Perfil

- [ ] Badges de ranking integram com outras badges
- [ ] Aba Rankings integra com outras abas do perfil
- [ ] Histórico de badges é persistido corretamente

---

## Relacionados

- [Especificação](spec.md) - Detalhes técnicos
- [API](api.md) - Endpoints
- [Badges](badges.md) - Sistema de badges
