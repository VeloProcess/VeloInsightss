# 📊 Cálculos dos Gráficos - VeloInsights

## 📋 Índice
1. [Gráficos de Telefonia](#gráficos-de-telefonia)
2. [Gráficos de Tickets](#gráficos-de-tickets)
3. [Estrutura de Dados](#estrutura-de-dados)
4. [Fórmulas Gerais](#fórmulas-gerais)

---

# 📞 Gráficos de Telefonia (55pbx)

## 1. 📈 Tendência Semanal / Análise Geral

### Colunas Utilizadas
- **Coluna D (índice 3)** - Data da chamada
- **Coluna E (índice 4)** - Total de chamadas
- **Coluna F (índice 5)** - Chamadas atendidas
- **Coluna G (índice 6)** - Chamadas abandonadas

### Cálculo
```
Filtro por período: data ∈ [startDate, endDate]
Agrupamento: por semana

Métricas calculadas:
  - Total = Σ(coluna E) para cada semana
  - Atendidas = Σ(coluna F) para cada semana
  - Abandonadas = Σ(coluna G) para cada semana

Exibição: 3 linhas no gráfico
  - Linha Azul: Total de Chamadas
  - Linha Verde: Chamadas Atendidas
  - Linha Vermelha: Chamadas Abandonadas
```

### Fórmula Final
```javascript
totalChamadas = soma(coluna E agrupado por semana)
chamadasAtendidas = soma(coluna F agrupado por semana)
chamadasAbandonadas = soma(coluna G agrupado por semana)
```

---

## 2. ⭐ CSAT - Satisfação do Cliente

### Colunas Utilizadas
- **Coluna D (índice 3)** - Data da chamada
- **Coluna Q (índice 16)** - "Pergunta2 1 PERGUNTA ATENDENTE" (Nota de atendimento, escala 1-5)
- **Coluna R (índice 17)** - "Pergunta2 2 PERGUNTA SOLUCAO" (Nota de solução, escala 1-5)

### Cálculo
```
Filtro por período: data ∈ [startDate, endDate]
Agrupamento: por semana/mês

Nota Média de Atendimento:
  notasAtendimento = [todas as colunas Q válidas]
  notaMediaAtendimento = media(notasAtendimento)

Nota Média de Solução:
  notasSolucao = [todas as colunas R válidas]
  notaMediaSolucao = media(notasSolucao)

Validação: Notas devem ser entre 1 e 5
```

### Fórmula Final
```javascript
notaMediaAtendimento = media(colecao.filter(1 <= x <= 5))
notaMediaSolucao = media(colecao.filter(1 <= x <= 5))
```

### Exibição
- **Linha Azul**: Nota Média de Atendimento
- **Linha Roxa**: Nota Média de Solução
- **Eixo Y**: Escala 1-5

---

## 3. ⏰ Volume por Hora

### Colunas Utilizadas
- **Coluna D (índice 3)** - Data da chamada
- **Coluna E (índice 4)** - Total de chamadas (conta)

### Cálculo
```
Filtro por período: data ∈ [startDate, endDate]
Agrupamento: por hora do dia (00h-23h)

volumePorHora[hora] = contar registros onde hora(data) = hora
Onde hora vai de 0 a 23 (00:00 até 23:00)
```

### Fórmula Final
```javascript
volumes[0-23] = [contagem de registros por hora]
peakHour = hora com maior volume
peakVolume = max(volumes)
```

### Exibição
- **Tipo**: Histograma (barras)
- **Eixo X**: Horas do dia (0h-23h)
- **Eixo Y**: Volume de chamadas
- **Cores**: Gradiente roxo baseado na intensidade

---

## 4. ⏱️ TMA - Tempo Médio de Atendimento

### Colunas Utilizadas
- **Coluna D (índice 3)** - Data da chamada
- **Coluna K (índice 10)** - Fila/Produto (para agrupamento por produto)
- **Coluna O (índice 14)** - Tempo Total (formato HH:MM:SS)

### Cálculo

#### Por Produto (quando groupBy="produto")
```
Filtro: produtos na lista permitida (IRPF, CALCULADORA, etc.)
Agrupamento: por mês E produto

Para cada produto E cada mês:
  tempoTotal[produto][mes] = Σ(tempo em minutos da coluna O)
  chamadas[produto][mes] = contar(registros)
  
  TMA[produto][mes] = tempoTotal[produto][mes] / chamadas[produto][mes]
```

#### TMA Geral (sem agrupamento por produto)
```
Agrupamento: apenas por mês

Para cada mês:
  tempoTotal[mes] = Σ(tempo em minutos da coluna O)
  chamadas[mes] = contar(registros)
  
  TMA[mes] = tempoTotal[mes] / chamadas[mes]
```

### Conversão de Tempo
```javascript
function parseTimeToMinutes(timeString) {
  // Formato: "HH:MM:SS" → minutos
  const parts = timeString.split(':')
  const hours = parseInt(parts[0]) || 0
  const minutes = parseInt(parts[1]) || 0
  const seconds = parseInt(parts[2]) || 0
  
  return hours * 60 + minutes + seconds / 60
}
```

### Fórmula Final
```javascript
// Por produto
TMA[produto][mes] = Σ(tempoMinutos) / count(registros)

// Geral
TMA[mes] = Σ(tempoMinutos) / count(registros)
```

### Produtos Permitidos (Filtro)
```javascript
const produtosPermitidos = [
  'IRPF',
  'Calculadora',
  'OFF',
  'Empréstimo Pessoal',
  'Tabulação Pendente',
  'PIX',
  'ANTECIPAÇÃO DA RESTITUIÇÃO',
  'Declaração Anual'
]
```

### Exibição
- **Tipo**: Linha
- **Eixo X**: Meses (Jan/2025, Fev/2025, etc.)
- **Eixo Y**: Tempo em minutos
- **Legendas**: Uma linha por produto (ou linha única para TMA Geral)

---

## 5. 📞 Volume por Produto URA

### Colunas Utilizadas
- **Coluna D (índice 3)** - Data da chamada
- **Coluna K (índice 10)** - Fila/Produto
- **Coluna E (índice 4)** - Total de chamadas (contagem)

### Cálculo
```
Filtro por período: data ∈ [startDate, endDate]
Agrupamento: por mês E produto

Para cada produto E cada mês:
  volume[produto][mes] = contar(registros)
  
Ordenação: por volume total (maior para menor)
```

### Fórmula Final
```javascript
volume[produto][mes] = count(registros agrupado por produto E mês)
totalPorProduto[produto] = Σ(volume[produto][*]) // Soma de todos os meses
```

### Exibição
- **Tipo**: Tabela com heatmap
- **Linhas**: Produtos (ordenados do maior para o menor)
- **Colunas**: Meses
- **Heatmap**: Intensidade de azul baseada no volume
- **Sparkline**: Mini gráfico de linha por produto

---

# 🎫 Gráficos de Tickets

## 1. 📈 Tendência Semanal / Análise Geral

### Colunas Utilizadas
- **Coluna AC (índice 28)** - Data do ticket
- **Coluna B (índice 1)** - Assunto
- **Coluna O (índice 14)** - Tipo de avaliação

### Cálculo
```
Filtro por período: data ∈ [startDate, endDate]
Agrupamento: por semana

Total de Tickets:
  total[ semana ] = contar(todos os registros)

Pesquisa (%):
  avaliacoesBom = contar(coluna O == "Bom" ou similar)
  avaliacoesRuim = contar(coluna O == "Ruim" ou similar)
  pesquisa[ semana ] = (avaliacoesBom / (avaliacoesBom + avaliacoesRuim)) * 100
```

### Fórmula Final
```javascript
total[ semana ] = count(registros)
pesquisa[ semana ] = (bom / (bom + ruim)) * 100
```

### Exibição
- **Linha Azul**: Total de Tickets
- **Linha Roxa**: Pesquisa(%) - porcentagem de avaliações "Bom"

---

## 2. ⭐ CSAT - Satisfação do Cliente (Tickets)

### Colunas Utilizadas
- **Coluna AC (índice 28)** - Data do ticket
- **Coluna O (índice 14)** - Tipo de avaliação

### Cálculo
```
Filtro por período: data ∈ [startDate, endDate]
Agrupamento: por semana/mês

Avaliações:
  bom = contar(coluna O contém "bom" ou "ótimo" ou "excelente")
  ruim = contar(coluna O contém "ruim" ou "péssimo")
  
Performance Geral:
  performance = (bom / (bom + ruim)) * 100
```

### Fórmula Final
```javascript
bom = count(filter(coluna O, "bom|ótimo|excelente"))
ruim = count(filter(coluna O, "ruim|péssimo"))
performance = (bom / (bom + ruim)) * 100
```

### Exibição
- **Escala**: 0-100%
- **Tipo**: Linha de porcentagem

---

## 3. ⏰ Volume por Hora (Tickets)

### Colunas Utilizadas
- **Coluna AC (índice 28)** - Data do ticket
- **Coluna J (índice 9)** - Hora do ticket

### Cálculo
```
Filtro por período: data ∈ [startDate, endDate]
Agrupamento: por hora (00h-23h)

volumePorHora[hora] = contar(registros onde hora = hora)
```

### Fórmula Final
```javascript
volumes[0-23] = [contagem de tickets por hora]
```

### Exibição
- **Tipo**: Histograma (barras)
- **Eixo X**: Horas do dia (0h-23h)
- **Eixo Y**: Volume de tickets

---

## 4. ⏱️ TMA de Resolução por Assunto

### Colunas Utilizadas
- **Coluna AC (índice 28)** - Data do ticket
- **Coluna B (índice 1)** - Assunto (para agrupamento)
- **Coluna K (índice 10)** - Tempo de resolução (formato "X min(s)" ou "X hora(s) Y min(s)")

### Cálculo
```
Filtro por período: remove filtro (processa TODOS os dados)
Agrupamento: por mês E assunto (apenas assuntos permitidos)

Para cada assunto E cada mês:
  tempoResolucao = parseTempo(coluna K)
  tempoTotal[assunto][mes] = Σ(tempoResolucao)
  chamadas[assunto][mes] = contar(registros)
  
  TMA[assunto][mes] = tempoTotal[assunto][mes] / chamadas[assunto][mes]
```

### Conversão de Tempo
```javascript
function parseTempo(tempoField) {
  // Exemplos: "40 min(s)", "18 hora(s) 32 min(s)"
  let totalMinutos = 0
  
  if (tempoField.includes('hora')) {
    const horasMatch = tempoField.match(/(\d+)\s*hora/)
    const minutosMatch = tempoField.match(/(\d+)\s*min/)
    
    const horas = parseInt(horasMatch ? horasMatch[1] : 0)
    const minutos = parseInt(minutosMatch ? minutosMatch[1] : 0)
    
    totalMinutos = (horas * 60) + minutos
  } else if (tempoField.includes('min')) {
    const minutosMatch = tempoField.match(/(\d+)\s*min/)
    totalMinutos = parseInt(minutosMatch ? minutosMatch[1] : 0)
  }
  
  return totalMinutos
}
```

### Assuntos Permitidos (Filtro)
```javascript
const assuntosPermitidos = [
  'IRPF',
  'Calculadora',
  'OFF',
  'Empréstimo Pessoal',
  'Tabulação Pendente',
  'PIX',
  'ANTECIPAÇÃO DA RESTITUIÇÃO',
  'Declaração Anual'
]
```

### Fórmula Final
```javascript
TMA[assunto][mes] = Σ(tempoMinutos) / count(registros)
```

### Exibição
- **Tipo**: Linha (múltiplas linhas, uma por assunto)
- **Eixo X**: Meses
- **Eixo Y**: Tempo em minutos (HH:MM:SS)
- **Legendas**: Uma cor por assunto permitido

---

## 5. 📋 Volume por Fila (Tickets)

### Colunas Utilizadas
- **Coluna AC (índice 28)** - Data do ticket
- **Coluna B (índice 1)** - Assunto/Fila

### Cálculo
```
Filtro por período: data ∈ [startDate, endDate]
Agrupamento: por mês E fila

Para cada fila E cada mês:
  volume[fila][mes] = contar(registros)
```

### Fórmula Final
```javascript
volume[fila][mes] = count(registros agrupado por fila E mês)
```

### Exibição
- **Tipo**: Tabela com heatmap
- **Linhas**: Filas
- **Colunas**: Meses
- **Heatmap**: Intensidade baseada no volume

---

# 📐 Estrutura de Dados

## Telefonia (rawData)
```javascript
record = [
  0: 'Cabeçalho',
  1: '...',
  2: '...',
  3: 'Data',              // Coluna D - Data
  4: 'Total',             // Coluna E - Total de chamadas
  5: 'Atendidas',         // Coluna F - Chamadas atendidas
  6: 'Abandonadas',       // Coluna G - Chamadas abandonadas
  ...
  10: 'Fila/Produto',     // Coluna K - Fila ou Produto
  ...
  14: 'Tempo Total',      // Coluna O - Tempo HH:MM:SS
  16: 'Nota Atendimento', // Coluna Q - Nota de atendimento (1-5)
  17: 'Nota Solução',     // Coluna R - Nota de solução (1-5)
  ...
]
```

## Tickets (ticketsData)
```javascript
record = [
  0: 'Cabeçalho',
  1: 'Assunto',           // Coluna B - Assunto/Fila
  ...
  9: 'Hora',              // Coluna J - Hora
  10: 'Tempo Resolução',  // Coluna K - Tempo de resolução
  14: 'Tipo Avaliação',   // Coluna O - Tipo de avaliação
  ...
  28: 'Data',             // Coluna AC - Data do ticket
  ...
]
```

---

# 🧮 Fórmulas Gerais

## Taxa de Atendimento
```javascript
taxaAtendimento = (atendidas / total) * 100
```

## Taxa de Abandono
```javascript
taxaAbandono = (abandonadas / total) * 100
```

## TMA (Tempo Médio de Atendimento)
```javascript
TMA = soma(tempoMinutos) / count(chamadas)
```

## Performance Geral (Tickets)
```javascript
performance = (avaliacoesBom / (avaliacoesBom + avaliacoesRuim)) * 100
```

## Conversão de Tempo para Minutos
```javascript
// HH:MM:SS → minutos
tempoMinutos = (horas * 60) + minutos + (segundos / 60)

// X min(s) → minutos
tempoMinutos = parseInt(minutos)

// X hora(s) Y min(s) → minutos
tempoMinutos = (horas * 60) + minutos
```

---

# 📊 Resumo de Colunas

## Telefonia
| Índice | Coluna | Descrição | Uso |
|--------|--------|-----------|-----|
| 3 | D | Data | Filtro de período |
| 4 | E | Total | Volume de chamadas |
| 5 | F | Atendidas | Chamadas atendidas |
| 6 | G | Abandonadas | Chamadas abandonadas |
| 10 | K | Fila/Produto | Agrupamento |
| 14 | O | Tempo Total | TMA |
| 16 | Q | Nota Atendimento | CSAT |
| 17 | R | Nota Solução | CSAT |

## Tickets
| Índice | Coluna | Descrição | Uso |
|--------|--------|-----------|-----|
| 1 | B | Assunto | Agrupamento |
| 9 | J | Hora | Volume por hora |
| 10 | K | Tempo Resolução | TMA |
| 14 | O | Tipo Avaliação | CSAT |
| 28 | AC | Data | Filtro de período |

---

**Desenvolvido para VeloInsights** 🚀
*Última atualização: Outubro 2025*

