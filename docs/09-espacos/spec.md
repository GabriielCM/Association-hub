---
module: espacos
document: spec
status: complete
priority: phase2
last_updated: 2026-01-12
---

# Espaços - Especificação

[← Voltar ao Índice](README.md)

---

## Índice

- [Visão Geral](#visão-geral)
- [Tipos de Usuários](#tipos-de-usuários)
- [Estrutura de Dados](#estrutura-de-dados)
- [Configurações por Espaço](#configurações-por-espaço)
- [Estados e Ciclo de Vida](#estados-e-ciclo-de-vida)
- [Fluxos de Operação](#fluxos-de-operação)
- [Integrações](#integrações)
- [Responsividade](#responsividade)
- [Notas de Desenvolvimento](#notas-de-desenvolvimento)
- [Fases de Implementação](#fases-de-implementação)
- [Métricas de Sucesso](#métricas-de-sucesso)

---

## Visão Geral

**Prioridade:** 🟡 Fase 2
**Status:** 🟢 Especificação Completa

**Descrição:**
Sistema de cadastro e gestão de espaços físicos da associação. Permite que administradores configurem espaços de lazer (churrasqueiras, salões de festa, quadras, piscinas) com regras específicas de reserva, que serão aplicadas pelo [módulo de Reservas](../10-reservas/).

---

## Tipos de Usuários

### 1. Common User (Funcionário)

**Pode:**
- ✅ Visualizar lista de espaços ativos
- ✅ Ver detalhes completos (fotos, descrição, capacidade)
- ✅ Consultar regras de reserva
- ✅ Ver calendário de disponibilidade
- ✅ Acessar via módulo de Reservas

**Não pode:**
- ❌ Criar/editar/deletar espaços
- ❌ Alterar configurações
- ❌ Marcar manutenção
- ❌ Bloquear datas

---

### 2. Gerente

**Pode:**
- ✅ Tudo que Funcionário pode
- ✅ Marcar espaço em manutenção
- ✅ Bloquear datas específicas (feriados, eventos internos)
- ✅ Ver histórico de reservas do espaço

**Não pode:**
- ❌ Criar novos espaços
- ❌ Editar configurações permanentes
- ❌ Deletar espaços
- ❌ Definir regras de reserva

---

### 3. ADM (Administrador)

**Pode:**
- ✅ Tudo que Gerente pode
- ✅ Criar novos espaços
- ✅ Editar todos os campos do espaço
- ✅ Deletar espaços (soft delete)
- ✅ Configurar regras de reserva
- ✅ Definir taxa de locação
- ✅ Configurar bloqueio de espaços relacionados
- ✅ Reativar espaços inativos
- ✅ Exportar relatórios de uso

---

## Estrutura de Dados

### Campos do Espaço

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------|
| `id` | UUID | Auto | - | Identificador único |
| `nome` | String | Sim | 3-100 caracteres | Nome do espaço |
| `descricao` | Text | Sim | 10-2000 caracteres | Descrição detalhada |
| `fotos` | Array[URL] | Sim | Mín 1, máx 10 | Galeria de imagens |
| `foto_principal` | URL | Auto | Primeira da galeria | Imagem de capa |
| `capacidade` | Integer | Sim | 1-1000 | Número máximo de pessoas |
| `taxa` | Decimal | Não | ≥ 0 | Valor da locação (0 = gratuito) |
| `periodo_reserva` | Enum | Sim | dia/turno/hora | Tipo de período |
| `turnos` | Array[Turno] | Condicional | Se periodo=turno | Definição dos turnos |
| `horario_abertura` | Time | Condicional | Se periodo=hora | Hora de início |
| `horario_fechamento` | Time | Condicional | Se periodo=hora | Hora de fim |
| `duracao_minima` | Integer | Condicional | Se periodo=hora | Horas mínimas |
| `antecedencia_minima` | Integer | Sim | 0-365 | Dias mínimos para reservar |
| `antecedencia_maxima` | Integer | Sim | 1-365 | Dias máximos para reservar |
| `intervalo_locacoes` | Integer | Não | 0-12 | Meses entre reservas do mesmo usuário |
| `espacos_bloqueados` | Array[UUID] | Não | IDs válidos | Espaços bloqueados quando reservado |
| `status` | Enum | Sim | ativo/manutencao/inativo | Estado atual |
| `created_at` | DateTime | Auto | - | Data de criação |
| `updated_at` | DateTime | Auto | - | Última atualização |
| `deleted_at` | DateTime | Auto | - | Soft delete |

### Estrutura de Turno

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | String | Ex: "Manhã", "Tarde", "Noite" |
| `hora_inicio` | Time | Hora de início do turno |
| `hora_fim` | Time | Hora de fim do turno |

### Estrutura de Bloqueio de Data

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `espaco_id` | UUID | Espaço bloqueado |
| `data` | Date | Data bloqueada |
| `motivo` | String | Ex: "Feriado", "Evento interno" |
| `criado_por` | UUID | Gerente/ADM que bloqueou |

---

## Configurações por Espaço

### Período de Reserva

O ADM define como o espaço pode ser reservado:

**1. Dia Inteiro**
- Reserva ocupa o dia completo
- Não permite múltiplas reservas no mesmo dia
- Ideal para: salões de festa, churrasqueiras

**2. Turno**
- ADM define turnos (ex: Manhã 8h-12h, Tarde 13h-18h, Noite 19h-23h)
- Permite múltiplas reservas no mesmo dia (turnos diferentes)
- Ideal para: quadras esportivas, salas de jogos

**3. Hora**
- Usuário escolhe horário específico (ex: 14h às 18h)
- ADM define: horário de funcionamento, duração mínima
- Permite múltiplas reservas no mesmo dia
- Ideal para: piscinas, academias

---

### Antecedência

| Configuração | Descrição | Exemplo |
|--------------|-----------|---------|
| Antecedência mínima | Quantos dias antes o usuário pode reservar | 2 dias (não pode reservar para amanhã) |
| Antecedência máxima | Até quantos dias no futuro pode reservar | 60 dias (não pode reservar para daqui 3 meses) |

---

### Intervalo entre Locações

Tempo mínimo que o mesmo usuário deve esperar entre reservas do mesmo espaço.

**Exemplo:**
- Churrasqueira com intervalo de 2 meses
- Usuário reservou em 15/01
- Próxima reserva permitida: a partir de 15/03

**Comportamento:**
- Conta a partir da data da reserva realizada (não da solicitação)
- Reservas canceladas não contam
- ADM pode fazer exceções manualmente

---

### Bloqueio de Espaços Relacionados

Quando um espaço é reservado, outros espaços selecionados ficam automaticamente indisponíveis.

**Exemplo:**
- "Salão de Festas Grande" bloqueia "Salão de Festas Pequeno"
- Ao reservar o Grande, o Pequeno fica indisponível na mesma data

**Casos de uso:**
- Espaços que compartilham estrutura (estacionamento, banheiros)
- Espaços que competem por recursos (som, iluminação)
- Eventos exclusivos que precisam de privacidade

**Regras:**
- Bloqueio é unidirecional (A bloqueia B não significa que B bloqueia A)
- Aplica-se apenas para o mesmo período (dia/turno/hora)
- Funciona tanto para reservas aprovadas quanto pendentes

---

## Estados e Ciclo de Vida

### Fluxo de Estados do Espaço

```
[Criação] → [Ativo] ←→ [Manutenção]
                ↓
           [Inativo]
```

### Detalhamento dos Estados

**1. Ativo**
- Espaço disponível para reservas
- Aparece na listagem pública
- Calendário mostra disponibilidade
- Estado padrão após criação

**2. Manutenção**
- Temporariamente indisponível
- Aparece na listagem com badge "Em manutenção"
- Não aceita novas reservas
- Reservas existentes são mantidas (ADM decide se cancela)
- Gerente ou ADM podem marcar
- **Transição:** ADM ou Gerente remove → volta para Ativo

**3. Inativo**
- Desativado permanentemente (soft delete)
- Não aparece na listagem pública
- Histórico preservado para relatórios
- Apenas ADM pode desativar
- **Transição:** ADM pode reativar → volta para Ativo

---

## Fluxos de Operação

### Criar Espaço (ADM)

```
1. ADM acessa "Gerenciar Espaços"
2. Clica em "Novo Espaço"
3. Preenche dados obrigatórios:
   - Nome, descrição
   - Upload de fotos (mín 1)
   - Capacidade
4. Configura período de reserva:
   - Seleciona: Dia inteiro / Turno / Hora
   - Define turnos ou horários (se aplicável)
5. Configura regras:
   - Antecedência mín/máx
   - Intervalo entre locações (opcional)
   - Taxa (opcional)
6. Configura bloqueios (opcional):
   - Seleciona espaços que serão bloqueados
7. Salva
8. Espaço criado com status "Ativo"
```

### Editar Espaço (ADM)

```
1. ADM acessa detalhes do espaço
2. Clica em "Editar"
3. Modifica campos desejados
4. Salva alterações
5. Sistema valida:
   - Se alterou período, verifica reservas futuras
   - Se alterou capacidade, apenas informativo
6. Atualiza espaço
```

### Bloquear Data (Gerente/ADM)

```
1. Acessa calendário do espaço
2. Seleciona data(s) a bloquear
3. Informa motivo (opcional)
4. Confirma bloqueio
5. Data fica indisponível para novas reservas
6. Reservas pendentes na data são rejeitadas automaticamente
```

### Marcar Manutenção (Gerente/ADM)

```
1. Acessa detalhes do espaço
2. Clica em "Marcar em Manutenção"
3. Sistema pergunta sobre reservas futuras:
   - Manter reservas
   - Cancelar todas
   - Cancelar apenas período X
4. Confirma
5. Espaço muda para status "Manutenção"
6. Notifica usuários afetados (se houver cancelamentos)
```

---

## Integrações

### Módulo de Reservas

**Fornece:**
- Lista de espaços ativos
- Regras de reserva por espaço
- Disponibilidade de datas/períodos
- Validação de intervalo entre locações
- Cálculo de bloqueios relacionados

**Recebe:**
- Atualização de ocupação (reservas aprovadas/pendentes)
- Solicitações de verificação de disponibilidade

---

### Módulo de Eventos

**Se implementado:**
- Dropdown de espaços na criação de evento
- Auto-preenche capacidade do espaço
- Exibe fotos do espaço no evento
- Link para detalhes do espaço

**Se não implementado:**
- Campo "Local" é texto livre no evento

---

### Feed Social

- Espaços não aparecem diretamente no feed
- Integração via Reservas: "Espaço X está ocupado em [data]"
- Privacidade: não mostra quem reservou

---

### Notificações

**Enviadas pelo módulo de Espaços:**
- Espaço entrou em manutenção (para quem tem reserva)
- Reserva cancelada por manutenção
- Data bloqueada (para quem tinha reserva pendente)

---

## Responsividade

### Mobile (360px - 414px)
- Lista de espaços: cards fullwidth em coluna única
- Galeria: swipe horizontal
- Formulário: campos empilhados
- Calendário: scroll horizontal por semana

### Tablet (768px - 1024px)
- Lista: grid 2 colunas
- Galeria: grid 2x2 com lightbox
- Formulário: 2 colunas para campos curtos
- Calendário: mês completo visível

### Desktop (>1024px)
- Lista: grid 3-4 colunas
- Galeria: grid com thumbnail preview
- Formulário: layout em seções lado a lado
- Calendário: mês com detalhes no hover

---

## Notas de Desenvolvimento

### Performance

**Otimizações:**
- Lazy loading de imagens na galeria
- Paginação na lista de espaços (20 por página)
- Cache de disponibilidade (5 min TTL)
- Compressão de imagens no upload (max 1MB, 1920px)
- Thumbnail gerado automaticamente (400px)

**Métricas Alvo:**
- Lista de espaços: <1.5s
- Página de detalhes: <1s
- Calendário de disponibilidade: <500ms
- Upload de imagem: <3s por imagem

---

### Segurança

**Upload de Imagens:**
- Validação de tipo (JPEG, PNG, WebP)
- Scan de malware
- Sanitização de metadados
- Storage em CDN separado

**Permissões:**
- Verificar role em todas operações de escrita
- Log de todas alterações (audit trail)
- Rate limiting: 10 uploads por minuto

---

### Acessibilidade

**WCAG 2.1 AA:**
- Alt text obrigatório para todas as fotos
- Labels descritivos nos formulários
- Navegação por teclado na galeria
- Calendário acessível via screen reader
- Contraste adequado nos status badges

---

## Fases de Implementação

### Fase 1 - MVP

✅ CRUD básico de espaços
✅ Campos: nome, descrição, fotos, capacidade
✅ Período de reserva (dia inteiro apenas)
✅ Antecedência mín/máx
✅ Status: Ativo/Inativo
✅ Listagem pública
✅ Página de detalhes
✅ Integração básica com Reservas

### Fase 2 - Aprimoramentos

🟡 Período por turno
🟡 Período por hora
🟡 Taxa de locação
🟡 Intervalo entre locações
🟡 Bloqueio de espaços relacionados
🟡 Status de manutenção
🟡 Bloqueio de datas específicas
🟡 Integração com Eventos

### Fase 3 - Nice to Have

🟢 Galeria com vídeo
🟢 Tour virtual 360°
🟢 Avaliações de usuários
🟢 Sugestões de espaços similares
🟢 Integração com calendário externo (Google/Outlook)

---

## Métricas de Sucesso

### KPIs a Acompanhar

**Cadastro:**
- Total de espaços cadastrados
- Espaços por status (ativo/manutenção/inativo)
- Taxa de completude dos dados (% com todos campos preenchidos)

**Visualização:**
- Visualizações de espaços por mês
- Espaços mais visualizados
- Tempo médio na página de detalhes
- Taxa de conversão (visualização → reserva)

**Operacional:**
- Tempo médio em manutenção
- Frequência de bloqueio de datas
- Uso do recurso de bloqueio de espaços relacionados

---

## Relacionados

- [README](README.md)
- [API](api.md)
- [Critérios de Aceitação](acceptance-criteria.md)
- [Reservas - Especificação](../10-reservas/spec.md)
- [Eventos - Criação](../04-eventos/creation.md)
