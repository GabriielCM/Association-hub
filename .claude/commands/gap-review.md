Execute um novo Gap Review na documentação do A-hub.

## Instruções

1. **Identificar próximo número:**
   - Verificar pasta `gap-review/` para encontrar o próximo número disponível (01, 02, etc.)

2. **Criar estrutura:**
   - Criar pasta `gap-review/gap-review-XX/`
   - Criar `README.md` com sumário
   - Criar `00-analise-macro.md` com template

3. **Iniciar análise macro:**
   - Perguntar ao usuário qual o escopo do review (módulos específicos ou documentação completa)
   - Analisar os arquivos do escopo definido
   - Identificar pontos de correção (completude e consistência)
   - Listar observações
   - Propor fases baseadas nos problemas encontrados

4. **Preencher análise:**
   - Documentar todos os pontos encontrados no `00-analise-macro.md`
   - Propor divisão em fases
   - Aguardar aprovação do usuário

5. **Criar fases:**
   - Para cada fase aprovada, criar arquivo `fase-XX-[nome].md`
   - Preencher com issues detalhadas

6. **Atualizar índice:**
   - Atualizar `gap-review/README.md` com o novo review

## Checklist de Verificação

Durante a análise, verificar:

### Completude
- [ ] Todos os módulos MVP têm spec.md, api.md, acceptance-criteria.md
- [ ] YAML front matter presente em todos os arquivos
- [ ] Links internos funcionando
- [ ] Seções "Relacionados" presentes

### Consistência
- [ ] Padrões do design system seguidos
- [ ] Nomenclatura consistente
- [ ] Formato de endpoints padronizado
- [ ] Status atualizado no README principal

## Módulos MVP a Verificar

1. 01-dashboard (Completo)
2. 02-perfil (Completo)
3. 03-carteirinha (Completo)
4. 04-eventos (Completo)
5. 05-minha-carteira (Completo)
6. 06-sistema-pontos (Completo)
7. 07-notificacoes (Parcial)
8. 08-mensagens (Stub)
9. 16-pdv (Completo)

## Estrutura Esperada por Módulo

Cada módulo deve ter:
- `README.md` - Índice e visão geral
- `spec.md` - Especificação técnica
- `api.md` - Endpoints da API
- `acceptance-criteria.md` - Critérios de aceitação

## Formato de Saída

Após análise, criar documento com:
1. Tabela de pontos de correção (módulo, descrição, severidade, fase)
2. Lista de observações gerais
3. Proposta de fases agrupando issues relacionadas
