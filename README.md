# 🚀 Desafio Técnico Sênior – Backend PIX (Node.js)

## 🧠 Diagnóstico

### Contexto do Problema
A API de consulta de participantes PIX do Banco Central do Brasil sofreu mudanças no formato de exposição de dados. O endpoint público `https://www.bcb.gov.br/api/pix/participants` deixou de retornar dados em CSV e migrrou para um novo formato (PDF com lista atualizada diariamente).

### Root Cause Identificada
O bug não estava em consultas ocasionais, mas sim em um **mismatch de formato de ISPB**:
- ISPBs armazenados no PDF: formato normalizado com 8 dígitos (e.g., `00416968`)
- ISPBs consultados por clientes: formato reduzido sem zeros à esquerda (e.g., `416968`)
- Busca no cache: comparação de string exata falhava pela diferença de zeros à esquerda

**Exemplo da falha:**
```
Cliente solicita: GET /pix/participants/416968
Buscamos em cache: "416968" 
Cache tem armazenado: "00416968"
Resultado: 404 ❌
```

---

## 🎯 Solução

### Arquitetura MVC
O projeto foi estruturado seguindo o padrão **Model-View-Controller** para máxima separação de responsabilidades:

- **Controllers** (`src/controllers/`) - Validação de entrada, formatação de respostas HTTP
- **Services** (`src/services/`) - Lógica de negócio, orquestração de dados
- **Clients** (`src/clients/`) - Integração com APIs externas (BCB)
- **Utils** (`src/utils/`) - Funções utilitárias reutilizáveis

### Normalização de ISPB
Implementamos a função `normalizeIspb()` que:
1. Remove espaços em branco
2. Valida se contém apenas dígitos (1-8 caracteres)
3. **Padroniza para 8 dígitos com zeros à esquerda usando `padStart(8, '0')`**
4. Lança erro descritivo para ISPBs inválidos

Esta função é **injeção obrigatória** em toda consulta, garantindo consistência de formato.

### Cache Inteligente com TTL
Implementamos cache em memória (`TtlCache<T>`) que:
- Armazena participantes PIX em um `Map<string, PixParticipant>`
- Suporta expiração automática (TTL configurável)
- Reduz chamadas repetidas ao PDF remoto
- Melhora latência de respostas (< 1ms após carregamento inicial)

### Parser Robusto de PDF
O cliente BCB implementa:
- Download seguro do PDF com timeout de 15s
- Extração de texto com `pdf-parse`
- Parsing inteligente: procura por ISPBs válidos (padr  `^\d{8}$`)
- Recuperação de dados associados (nome reduzido, CNPJ 
- Logs estruturados para auditoria completa

### Resolução Dinâmica de URL
A função `resolvePdfUrl()` implementa **resiliência automática**:
- Tenta encontrar PDF válido nos últimos 5 dias
- Faz requisições `HEAD` para validação rápida (sem download)
- Falha gracefully com mensagem descritiva

### Documentação via OpenAPI/Swagger
- Especificação completa em JSDoc
- Schema detalhado de requisições/respostas
- Códigos HTTP documentados (200, 400, 404, 502)
- Disponível em `http://localhost:3000/api-docs`

### Logs Estruturados
Cada camada implementa logs com prefixos específicos:
- `[BCB-CLIENT]` - Operações de download/parse do PDF
- `[PIX-SERVICE]` - Lógica de cache e busca
- `[PDF-RESOLVER]` - Resolução de URL do PDF
- Facilita troubleshooting em produção

### Testes Abrangentes
- **Testes Unitários** (`tests/unit/`) - Validação de normalizações e transformações
- **Testes de Integração** (`tests/integration/`) - Fluxos end-to-end com mocks HTTP
- Cobertura de casos de sucesso, erro e edge cases
- Validação específica do bug fix (ISPB com zeros à esquerda)

---

## 🧱 Decisões técnicas

### 1. Cache em Memória vs. Redis
**Decisão:** Cache em memória nativa (`Map<string, PixParticipant>`)

**Justificativa:**
- Dados são públicos e podem ser recarregados a qualquer momento
- Escopo: single-instance ou replicação simples via load balancer
- Reduz complexidade operacional (sem dependência Redis)
- Latência < 1ms (vs. ~10ms com Redis)
- **Trade-off:** Replicação entre instâncias requer consideração de arquitetura

### 2. Busca Linear no PDF vs. Índices
**Decisão:** Parsing linear com armazenamento em `Map`

**Justificativa:**
- PDFs do BCB contêm ~300-400 instituições (dataset pequeno)
- Carregamento é operação única/rara (comparado com consultas)
- `Map.get()` oferece O(1) em busca após carregamento
- Simplicidade reduz bugs em parser complexo

### 3. Validação Obrigatória de ISPB
**Decisão:** Normalização em todos os endpoints

**Justificativa:**
- Garante consistência invariável no sistema
- Previne bugs de mismatch de formato
- Falha rápido e cedo com erro específico (400)
- Reduz defensive programming no resto do código

### 4. Logs com Prefixos e Separadores
**Decisão:** Logs estruturados com emojis e delimitadores visuais

**Justificativa:**
- Facilita busca de logs em dashboards (ELK, DataDog)
- Rastreabilidade de fluxo distribuído
- Debug local com cores/emojis (desenvolvimento)
- Preparação para observabilidade em produção

---

## ▶️ Como executar o projeto
### Execução com Docker
```bash
docker-compose up --build
```

A aplicação ficará disponível em:
- **API REST:** `http://localhost:3000`
- **Swagger Docs:** `http://localhost:3000/api-docs`

---

## 🧪 Testes

### ExecutarTestes
```bash
npm test
```

### Cobertura de Testes

**Testes Unitários** (`tests/unit/normalizeIspb.spec.ts`)
- ✅ Normaliza ISPB curto para 8 dígitos
- ✅ Mantém ISPB já normalizado
- ✅ Remove espaços em branco
- ✅ Rejeita caracteres não-numéricos
- ✅ Rejeita ISPBs > 8 dígitos

**Testes de Integração** (`tests/integration/pixParticipants.spec.ts`)
- ✅ Retorna participante com ISPB normalizado (bug fix)
- ✅ Encontra ISPB reduzido após normalização
- ✅ Retorna 404 para ISPB não encontrado
- ✅ Retorna 400 para ISPB inválido
- ✅ Retorna 502 para falhas externas



---

