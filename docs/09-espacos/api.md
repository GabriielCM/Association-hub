---
module: espacos
document: api
status: complete
priority: phase2
last_updated: 2026-01-12
---

# Espaços - API

[← Voltar ao Índice](README.md)

---

## Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
  - [Listar Espaços](#listar-espaços)
  - [Obter Espaço](#obter-espaço)
  - [Criar Espaço](#criar-espaço)
  - [Atualizar Espaço](#atualizar-espaço)
  - [Deletar Espaço](#deletar-espaço)
  - [Alterar Status](#alterar-status)
  - [Bloquear Datas](#bloquear-datas)
  - [Remover Bloqueio](#remover-bloqueio)
  - [Obter Disponibilidade](#obter-disponibilidade)
  - [Upload de Imagem](#upload-de-imagem)
- [Modelos de Dados](#modelos-de-dados)
- [Códigos de Erro](#códigos-de-erro)

---

## Visão Geral

Base URL: `/api/v1/espacos`

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/` | Listar espaços | Autenticado |
| GET | `/:id` | Obter espaço | Autenticado |
| POST | `/` | Criar espaço | ADM |
| PUT | `/:id` | Atualizar espaço | ADM |
| DELETE | `/:id` | Deletar espaço | ADM |
| PATCH | `/:id/status` | Alterar status | Gerente, ADM |
| POST | `/:id/bloqueios` | Bloquear datas | Gerente, ADM |
| DELETE | `/:id/bloqueios/:bloqueio_id` | Remover bloqueio | Gerente, ADM |
| GET | `/:id/disponibilidade` | Obter disponibilidade | Autenticado |
| POST | `/:id/imagens` | Upload de imagem | ADM |

---

## Autenticação

Todos os endpoints requerem autenticação via Bearer Token.

```
Authorization: Bearer <token>
```

---

## Endpoints

### Listar Espaços

Lista todos os espaços com filtros opcionais.

**Request:**
```http
GET /api/v1/espacos
```

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `status` | string | Não | Filtrar por status: `ativo`, `manutencao`, `inativo` |
| `periodo` | string | Não | Filtrar por período: `dia`, `turno`, `hora` |
| `capacidade_min` | integer | Não | Capacidade mínima |
| `capacidade_max` | integer | Não | Capacidade máxima |
| `page` | integer | Não | Página (default: 1) |
| `limit` | integer | Não | Itens por página (default: 20, max: 50) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "nome": "Churrasqueira 1",
      "descricao": "Churrasqueira com área coberta...",
      "foto_principal": "https://cdn.example.com/espacos/churrasqueira1.jpg",
      "capacidade": 30,
      "taxa": 150.00,
      "periodo_reserva": "dia",
      "status": "ativo",
      "created_at": "2026-01-10T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

**Permissões:**
- Funcionário: vê apenas `status: ativo`
- Gerente/ADM: vê todos os status

---

### Obter Espaço

Retorna detalhes completos de um espaço.

**Request:**
```http
GET /api/v1/espacos/:id
```

**Response (200):**
```json
{
  "id": "uuid",
  "nome": "Churrasqueira 1",
  "descricao": "Churrasqueira com área coberta, capacidade para 30 pessoas...",
  "fotos": [
    "https://cdn.example.com/espacos/churrasqueira1-1.jpg",
    "https://cdn.example.com/espacos/churrasqueira1-2.jpg"
  ],
  "foto_principal": "https://cdn.example.com/espacos/churrasqueira1-1.jpg",
  "capacidade": 30,
  "taxa": 150.00,
  "periodo_reserva": "dia",
  "turnos": null,
  "horario_abertura": null,
  "horario_fechamento": null,
  "duracao_minima": null,
  "antecedencia_minima": 2,
  "antecedencia_maxima": 60,
  "intervalo_locacoes": 2,
  "espacos_bloqueados": [
    {
      "id": "uuid",
      "nome": "Churrasqueira 2"
    }
  ],
  "status": "ativo",
  "bloqueios": [
    {
      "id": "uuid",
      "data": "2026-02-15",
      "motivo": "Manutenção preventiva"
    }
  ],
  "created_at": "2026-01-10T10:00:00Z",
  "updated_at": "2026-01-12T14:30:00Z"
}
```

**Response (404):**
```json
{
  "error": {
    "code": "ESPACO_NOT_FOUND",
    "message": "Espaço não encontrado"
  }
}
```

---

### Criar Espaço

Cria um novo espaço.

**Request:**
```http
POST /api/v1/espacos
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "Salão de Festas",
  "descricao": "Salão amplo com capacidade para eventos...",
  "fotos": [
    "https://cdn.example.com/temp/upload1.jpg",
    "https://cdn.example.com/temp/upload2.jpg"
  ],
  "capacidade": 100,
  "taxa": 500.00,
  "periodo_reserva": "turno",
  "turnos": [
    {
      "nome": "Manhã",
      "hora_inicio": "08:00",
      "hora_fim": "12:00"
    },
    {
      "nome": "Tarde",
      "hora_inicio": "13:00",
      "hora_fim": "18:00"
    },
    {
      "nome": "Noite",
      "hora_inicio": "19:00",
      "hora_fim": "23:00"
    }
  ],
  "antecedencia_minima": 3,
  "antecedencia_maxima": 90,
  "intervalo_locacoes": 3,
  "espacos_bloqueados": ["uuid-churrasqueira-1"]
}
```

**Validações:**

| Campo | Regra |
|-------|-------|
| `nome` | 3-100 caracteres, único |
| `descricao` | 10-2000 caracteres |
| `fotos` | Mín 1, máx 10 URLs válidas |
| `capacidade` | 1-1000 |
| `taxa` | ≥ 0 ou null |
| `periodo_reserva` | `dia`, `turno` ou `hora` |
| `turnos` | Obrigatório se periodo=turno, mín 2 turnos |
| `horario_abertura/fechamento` | Obrigatório se periodo=hora |
| `antecedencia_minima` | 0-365 |
| `antecedencia_maxima` | > antecedencia_minima, ≤365 |
| `intervalo_locacoes` | 0-12 ou null |
| `espacos_bloqueados` | Array de UUIDs válidos |

**Response (201):**
```json
{
  "id": "uuid",
  "nome": "Salão de Festas",
  "status": "ativo",
  "created_at": "2026-01-12T15:00:00Z"
}
```

**Response (400):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Erro de validação",
    "details": [
      {
        "field": "nome",
        "message": "Nome já existe"
      }
    ]
  }
}
```

---

### Atualizar Espaço

Atualiza um espaço existente.

**Request:**
```http
PUT /api/v1/espacos/:id
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "Salão de Festas Principal",
  "descricao": "Descrição atualizada...",
  "capacidade": 120,
  "taxa": 600.00
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "nome": "Salão de Festas Principal",
  "updated_at": "2026-01-12T16:00:00Z"
}
```

**Regras:**
- Alterar `periodo_reserva` com reservas futuras: retorna warning
- Alterar `espacos_bloqueados`: aplica apenas para novas reservas

---

### Deletar Espaço

Remove um espaço (soft delete).

**Request:**
```http
DELETE /api/v1/espacos/:id
```

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `cancelar_reservas` | boolean | Não | Cancelar reservas futuras (default: false) |

**Response (200):**
```json
{
  "message": "Espaço removido com sucesso",
  "reservas_canceladas": 3
}
```

**Response (409):**
```json
{
  "error": {
    "code": "RESERVAS_PENDENTES",
    "message": "Espaço possui reservas futuras",
    "details": {
      "total_reservas": 5,
      "proxima_reserva": "2026-01-20"
    }
  }
}
```

---

### Alterar Status

Altera o status de um espaço.

**Request:**
```http
PATCH /api/v1/espacos/:id/status
Content-Type: application/json
```

**Body:**
```json
{
  "status": "manutencao",
  "motivo": "Reforma do banheiro",
  "cancelar_reservas": false
}
```

**Status permitidos:**
- `ativo` → `manutencao`, `inativo`
- `manutencao` → `ativo`, `inativo`
- `inativo` → `ativo`

**Response (200):**
```json
{
  "id": "uuid",
  "status": "manutencao",
  "updated_at": "2026-01-12T17:00:00Z"
}
```

---

### Bloquear Datas

Bloqueia datas específicas para um espaço.

**Request:**
```http
POST /api/v1/espacos/:id/bloqueios
Content-Type: application/json
```

**Body:**
```json
{
  "datas": ["2026-02-15", "2026-02-16", "2026-02-17"],
  "motivo": "Feriado de carnaval"
}
```

**Response (201):**
```json
{
  "bloqueios": [
    {
      "id": "uuid",
      "data": "2026-02-15",
      "motivo": "Feriado de carnaval"
    },
    {
      "id": "uuid",
      "data": "2026-02-16",
      "motivo": "Feriado de carnaval"
    },
    {
      "id": "uuid",
      "data": "2026-02-17",
      "motivo": "Feriado de carnaval"
    }
  ],
  "reservas_rejeitadas": 1
}
```

**Regras:**
- Reservas pendentes nas datas bloqueadas são automaticamente rejeitadas
- Reservas aprovadas geram warning (ADM decide se cancela manualmente)

---

### Remover Bloqueio

Remove um bloqueio de data.

**Request:**
```http
DELETE /api/v1/espacos/:id/bloqueios/:bloqueio_id
```

**Response (200):**
```json
{
  "message": "Bloqueio removido com sucesso"
}
```

---

### Obter Disponibilidade

Retorna a disponibilidade de um espaço para um período.

**Request:**
```http
GET /api/v1/espacos/:id/disponibilidade
```

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `data_inicio` | date | Sim | Data inicial (YYYY-MM-DD) |
| `data_fim` | date | Sim | Data final (YYYY-MM-DD) |

**Response (200) - Período: Dia:**
```json
{
  "espaco_id": "uuid",
  "periodo_reserva": "dia",
  "disponibilidade": [
    {
      "data": "2026-01-15",
      "status": "disponivel"
    },
    {
      "data": "2026-01-16",
      "status": "pendente"
    },
    {
      "data": "2026-01-17",
      "status": "ocupado"
    },
    {
      "data": "2026-01-18",
      "status": "bloqueado",
      "motivo": "Feriado"
    },
    {
      "data": "2026-01-19",
      "status": "manutencao"
    }
  ]
}
```

**Response (200) - Período: Turno:**
```json
{
  "espaco_id": "uuid",
  "periodo_reserva": "turno",
  "turnos": [
    {"nome": "Manhã", "hora_inicio": "08:00", "hora_fim": "12:00"},
    {"nome": "Tarde", "hora_inicio": "13:00", "hora_fim": "18:00"},
    {"nome": "Noite", "hora_inicio": "19:00", "hora_fim": "23:00"}
  ],
  "disponibilidade": [
    {
      "data": "2026-01-15",
      "turnos": {
        "Manhã": "disponivel",
        "Tarde": "ocupado",
        "Noite": "disponivel"
      }
    }
  ]
}
```

**Response (200) - Período: Hora:**
```json
{
  "espaco_id": "uuid",
  "periodo_reserva": "hora",
  "horario_abertura": "08:00",
  "horario_fechamento": "22:00",
  "duracao_minima": 2,
  "disponibilidade": [
    {
      "data": "2026-01-15",
      "slots": [
        {"inicio": "08:00", "fim": "10:00", "status": "disponivel"},
        {"inicio": "10:00", "fim": "14:00", "status": "ocupado"},
        {"inicio": "14:00", "fim": "22:00", "status": "disponivel"}
      ]
    }
  ]
}
```

**Status possíveis:**
- `disponivel`: pode ser reservado
- `pendente`: reserva aguardando aprovação
- `ocupado`: reserva aprovada
- `bloqueado`: data bloqueada pelo ADM/Gerente
- `manutencao`: espaço em manutenção

---

### Upload de Imagem

Faz upload de uma imagem para o espaço.

**Request:**
```http
POST /api/v1/espacos/:id/imagens
Content-Type: multipart/form-data
```

**Form Data:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `imagem` | file | Arquivo de imagem (JPEG, PNG, WebP) |
| `principal` | boolean | Define como foto principal |

**Validações:**
- Tamanho máximo: 10MB
- Formatos aceitos: JPEG, PNG, WebP
- Dimensão mínima: 800x600px
- Máximo de 10 imagens por espaço

**Response (201):**
```json
{
  "url": "https://cdn.example.com/espacos/uuid/imagem3.jpg",
  "thumbnail": "https://cdn.example.com/espacos/uuid/imagem3-thumb.jpg",
  "principal": false
}
```

---

## Modelos de Dados

### Espaço

```typescript
interface Espaco {
  id: string;
  nome: string;
  descricao: string;
  fotos: string[];
  foto_principal: string;
  capacidade: number;
  taxa: number | null;
  periodo_reserva: 'dia' | 'turno' | 'hora';
  turnos: Turno[] | null;
  horario_abertura: string | null;
  horario_fechamento: string | null;
  duracao_minima: number | null;
  antecedencia_minima: number;
  antecedencia_maxima: number;
  intervalo_locacoes: number | null;
  espacos_bloqueados: EspacoRef[];
  status: 'ativo' | 'manutencao' | 'inativo';
  bloqueios: Bloqueio[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
```

### Turno

```typescript
interface Turno {
  nome: string;
  hora_inicio: string;
  hora_fim: string;
}
```

### Bloqueio

```typescript
interface Bloqueio {
  id: string;
  data: string;
  motivo: string | null;
  criado_por: string;
  created_at: string;
}
```

### EspacoRef

```typescript
interface EspacoRef {
  id: string;
  nome: string;
}
```

---

## Códigos de Erro

| Código | HTTP | Descrição |
|--------|------|-----------|
| `ESPACO_NOT_FOUND` | 404 | Espaço não encontrado |
| `VALIDATION_ERROR` | 400 | Erro de validação nos dados |
| `DUPLICATE_NAME` | 400 | Nome de espaço já existe |
| `RESERVAS_PENDENTES` | 409 | Operação bloqueada por reservas existentes |
| `MAX_IMAGES_EXCEEDED` | 400 | Limite de imagens excedido |
| `INVALID_IMAGE_FORMAT` | 400 | Formato de imagem inválido |
| `INVALID_STATUS_TRANSITION` | 400 | Transição de status não permitida |
| `BLOQUEIO_NOT_FOUND` | 404 | Bloqueio não encontrado |
| `UNAUTHORIZED` | 401 | Token inválido ou expirado |
| `FORBIDDEN` | 403 | Sem permissão para esta operação |

---

## Relacionados

- [README](README.md)
- [Especificação](spec.md)
- [Critérios de Aceitação](acceptance-criteria.md)
- [API Central](../api/endpoints-reference.md)
