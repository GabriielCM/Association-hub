---
document: changelog
last_updated: 2026-01-11
---

# Changelog

Histórico de alterações na documentação do A-hub.

---

## [1.1.0] - 2026-01-11

### Sistema de Pontos, Minha Carteira e PDV

Documentação completa do sistema central de gamificação do A-hub.

### Adicionado

**Módulo Sistema de Pontos (06-sistema-pontos/):**
- `spec.md` - Especificação completa com modelo de dados, fluxos e regras
- `api.md` - Endpoints para saldo, histórico, transferências, Strava e ADM
- `acceptance-criteria.md` - Critérios de aceitação detalhados
- Integração com Strava (OAuth, sincronização manual, limite 5km/dia)
- Sistema de rankings (pontos, eventos, Strava)
- Configuração ADM (taxas, estorno, relatórios CSV)

**Módulo Minha Carteira (05-minha-carteira/):**
- `spec.md` - Especificação com telas, fluxos e componentes
- `api.md` - Endpoints da carteira, scanner e transferência
- `acceptance-criteria.md` - Critérios de aceitação
- Scanner universal (detecta QR de check-in, transferência, PDV)
- Design de carteira visual com QR pessoal
- Fluxo de transferência com biometria

**Módulo PDV - Novo (16-pdv/):**
- `README.md` - Visão geral do sistema de pontos de venda
- `spec.md` - Arquitetura, interface do display, fluxos
- `api.md` - Endpoints para display e gestão ADM
- `acceptance-criteria.md` - Critérios de aceitação
- Sistema de kiosks com displays touchscreen
- Gestão de estoque por PDV
- Fluxo de pagamento via QR Code
- Relatórios de vendas por PDV

### Alterado

- `06-sistema-pontos/README.md` - Atualizado com índice e visão geral completa
- `05-minha-carteira/README.md` - Atualizado com índice e funcionalidades

### Decisões de Negócio Documentadas

- Nome da moeda: Association-points (customizável por associação)
- Pontos não expiram
- Transferências sem limite e sem valor mínimo
- Confirmação de transações via biometria (Face ID / Touch ID)
- Strava: sincronização manual, máximo 5km/dia pontuáveis
- Taxas Strava: Corrida 10pts/km, Bike 5pts/km (configurável ADM)
- PDV: usuário escaneia QR do display, liberação manual do produto
- Rankings múltiplos: por pontos, eventos e atividades físicas

---

## [1.0.0] - 2026-01-10

### Reestruturação Completa

A documentação foi reestruturada de um único arquivo (`a-hub.md` com ~5.045 linhas) para uma estrutura modular com ~50 arquivos organizados em 18 pastas.

### Adicionado

**Estrutura de Pastas:**
- `docs/` - Diretório raiz da documentação
- `00-overview/` - Visão geral do produto
- `01-dashboard/` - Módulo Dashboard
- `02-perfil/` - Módulo Perfil do Usuário
- `03-carteirinha/` - Módulo Carteirinha Digital
- `04-eventos/` - Módulo Eventos (maior módulo)
- `05-minha-carteira/` - Módulo Scanner (stub)
- `06-sistema-pontos/` - Módulo Pontos (parcial)
- `07-notificacoes/` - Módulo Notificações (parcial)
- `08-mensagens/` - Módulo Mensagens (stub)
- `09-espacos/` - Módulo Espaços (stub, Fase 2)
- `10-reservas/` - Módulo Reservas (stub, Fase 2)
- `11-pedidos/` - Módulo Pedidos (stub, Fase 2)
- `12-loja/` - Módulo Loja (stub, Fase 2)
- `13-rankings/` - Módulo Rankings (stub, Fase 2)
- `14-suporte/` - Módulo Suporte (stub, Fase 2)
- `15-jukebox/` - Módulo Jukebox (stub, Nice to Have)
- `shared/` - Componentes e padrões compartilhados
- `api/` - Documentação da API

**Documentos Principais:**
- README.md principal com índice e status de todos os módulos
- YAML front matter em todos os arquivos para metadados
- Links internos entre documentos relacionados
- Seções de "Relacionados" em cada documento

**Módulos Completos (MVP):**
- Dashboard: spec, components, api, acceptance-criteria
- Perfil: spec, api, acceptance-criteria
- Carteirinha: spec, benefits, qr-code, api, acceptance-criteria
- Eventos: spec, creation, display, checkin-system, qr-code-security, badges, analytics, api, acceptance-criteria

**Seções Compartilhadas:**
- Design System
- Autenticação
- Responsividade
- Acessibilidade (WCAG 2.1 AA)
- Performance
- Convenções de documentação

**Referência de API:**
- Índice consolidado de endpoints
- Organização por módulo
- Documentação de WebSocket

### Melhorado

- Navegação entre documentos com links relativos
- Consistência na estrutura de cada módulo
- Metadados YAML para automação futura
- Separação clara entre conteúdo MVP, Fase 2 e Nice to Have

### Notas

- Todo o conteúdo original foi preservado
- Módulos stub contêm placeholder "[A preencher]" para expansão futura
- Conteúdo duplicado foi consolidado na pasta `shared/`

---

## Formato do Changelog

Este changelog segue o formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

Tipos de mudanças:
- **Adicionado** - Novos recursos
- **Alterado** - Mudanças em recursos existentes
- **Obsoleto** - Recursos que serão removidos em breve
- **Removido** - Recursos removidos
- **Corrigido** - Correções de bugs
- **Segurança** - Vulnerabilidades corrigidas
