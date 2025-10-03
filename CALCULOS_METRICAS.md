# 📊 Cálculos de Métricas - VeloInsights

## 🎯 Visão Geral dos Cálculos

O sistema VeloInsights calcula métricas baseadas nos dados da planilha Google Sheets, processando informações dos últimos 60 dias.

## 📋 Estrutura dos Dados

### Colunas Utilizadas:
- **Coluna A (0)**: Chamada - Status da chamada
- **Coluna C (2)**: Operador - Nome do atendente  
- **Coluna D (3)**: Data - Data da chamada
- **Coluna E (4)**: Hora - Horário da chamada
- **Coluna L (11)**: Tempo Na URA - Tempo na URA
- **Coluna M (12)**: Tempo De Espera - Tempo de espera
- **Coluna N (13)**: Tempo Falado - Tempo de atendimento
- **Coluna O (14)**: Tempo Total - Tempo total da chamada
- **Coluna AB (27)**: Pergunta2 1 PERGUNTA ATENDENTE - Nota do atendimento
- **Coluna AC (28)**: Pergunta2 2 PERGUNTA SOLUCAO - Nota da solução

### Colunas Especiais (quando disponíveis):
- **T M Logado / Dia**: Tempo médio logado por dia
- **T M Pausado**: Tempo médio pausado

## 🔢 Função de Conversão de Tempo

```javascript
const tempoParaMinutos = (tempo) => {
  if (!tempo || tempo === '00:00:00') return 0
  
  // Formato HH:MM:SS
  if (tempo.includes(':')) {
    const [horas, minutos, segundos] = tempo.split(':').map(Number)
    return horas * 60 + minutos + segundos / 60
  }
  
  // Se já é número, retorna como está
  return parseFloat(tempo) || 0
}
```

## 📊 Métricas Gerais

### 1. Classificação de Chamadas
```javascript
// Critérios de classificação:
if (chamada.toLowerCase().includes('retida') || chamada.toLowerCase().includes('ura')) {
  retidaURA++
} else if (chamada.toLowerCase().includes('abandonada')) {
  abandonada++
} else if (tempoMinutos > 0 || chamada.toLowerCase().includes('atendida')) {
  atendida++
} else if (tempoEsperaMinutos > 0 && tempoMinutos === 0 && !chamada.toLowerCase().includes('retida')) {
  abandonada++
}
```

### 2. Tempo Médio de Atendimento (TMA)
```javascript
const temposFalado = dados.map(row => tempoParaMinutos(row.tempoFalado)).filter(tempo => tempo > 0)
const duracaoMediaAtendimento = temposFalado.length > 0 
  ? temposFalado.reduce((sum, tempo) => sum + tempo, 0) / temposFalado.length
  : 0
```

### 3. Tempo Médio de Espera
```javascript
const temposEspera = dados.map(row => tempoParaMinutos(row.tempoEspera)).filter(tempo => tempo > 0)
const tempoMedioEspera = temposEspera.length > 0 
  ? temposEspera.reduce((sum, tempo) => sum + tempo, 0) / temposEspera.length
  : 0
```

### 4. Tempo Médio na URA
```javascript
const temposURA = dados.map(row => tempoParaMinutos(row.tempoURA)).filter(tempo => tempo > 0)
const tempoMedioURA = temposURA.length > 0 
  ? temposURA.reduce((sum, tempo) => sum + tempo, 0) / temposURA.length
  : 0
```

### 5. Tempo Médio Logado e Pausado
```javascript
const temposLogado = dados.map(row => tempoParaMinutos(row.tempoLogado)).filter(tempo => tempo > 0)
const tempoMedioLogado = temposLogado.length > 0 
  ? temposLogado.reduce((sum, tempo) => sum + tempo, 0) / temposLogado.length
  : 0

const temposPausado = dados.map(row => tempoParaMinutos(row.tempoPausado)).filter(tempo => tempo > 0)
const tempoMedioPausado = temposPausado.length > 0 
  ? temposPausado.reduce((sum, tempo) => sum + tempo, 0) / temposPausado.length
  : 0
```

### 6. Notas Médias
```javascript
// Nota média de atendimento
const notasAtendimentoValidas = dados.filter(d => d.notaAtendimento !== null)
const notaMediaAtendimento = notasAtendimentoValidas.length > 0 ?
  notasAtendimentoValidas.reduce((sum, d) => sum + d.notaAtendimento, 0) / notasAtendimentoValidas.length : 0

// Nota média de solução
const notasSolucaoValidas = dados.filter(d => d.notaSolucao !== null)
const notaMediaSolucao = notasSolucaoValidas.length > 0 ?
  notasSolucaoValidas.reduce((sum, d) => sum + d.notaSolucao, 0) / notasSolucaoValidas.length : 0
```

### 7. Taxas
```javascript
const taxaAtendimento = totalChamadas > 0 ? (atendida / totalChamadas) * 100 : 0
const taxaAbandono = totalChamadas > 0 ? (abandonada / totalChamadas) * 100 : 0
```

## 👥 Métricas por Operador

### 1. Agregação de Dados
```javascript
dados.forEach(d => {
  if (!operadores[d.operador]) {
    operadores[d.operador] = {
      operador: d.operador,
      totalAtendimentos: 0,
      tempoTotal: 0,
      notasAtendimento: [],
      notasSolucao: []
    }
  }

  operadores[d.operador].totalAtendimentos++
  const tempoMinutos = tempoParaMinutos(d.tempoFalado)
  operadores[d.operador].tempoTotal += tempoMinutos
  
  if (d.notaAtendimento !== null) {
    operadores[d.operador].notasAtendimento.push(d.notaAtendimento)
  }
  
  if (d.notaSolucao !== null) {
    operadores[d.operador].notasSolucao.push(d.notaSolucao)
  }
})
```

### 2. Cálculo de Médias por Operador
```javascript
Object.values(operadores).forEach(op => {
  op.tempoMedio = op.totalAtendimentos > 0 ? op.tempoTotal / op.totalAtendimentos : 0
  op.notaMediaAtendimento = op.notasAtendimento.length > 0 ? 
    op.notasAtendimento.reduce((sum, nota) => sum + nota, 0) / op.notasAtendimento.length : 0
  op.notaMediaSolucao = op.notasSolucao.length > 0 ?
    op.notasSolucao.reduce((sum, nota) => sum + nota, 0) / op.notasSolucao.length : 0
})
```

## 🏆 Sistema de Ranking

### 1. Filtro de Operadores Válidos
```javascript
const operadoresValidos = operadores.filter(op => {
  if (!op.operador || op.operador.trim() === '') return false
  
  const nome = op.operador.toLowerCase()
  const isDesligado = nome.includes('desl') || 
                     nome.includes('desligado') || 
                     nome.includes('excluído') || 
                     nome.includes('inativo')
  
  const isSemOperador = nome.includes('sem operador') || 
                       nome.includes('agentes indisponíveis')
  
  return !isDesligado && !isSemOperador
})
```

### 2. Normalização de Valores
```javascript
const normalizar = (valor, min, max) => {
  if (max === min) return 0.5
  const normalized = (valor - min) / (max - min)
  return Math.max(0, Math.min(1, normalized))
}
```

### 3. Fórmula de Score (Velodados)
```javascript
// Fórmula oficial do projeto Velodados:
const score = 0.35 * normTotal +           // 35% - Quantidade de atendimentos
              0.20 * (1 - normTempo) +     // 20% - Tempo médio (invertido - menor é melhor)
              0.20 * normNotaAtendimento + // 20% - Nota média de atendimento
              0.20 * normNotaSolucao       // 20% - Nota média de solução

// Score final em porcentagem (0-100)
const scoreFinal = (score * 100).toFixed(1)
```

## 📅 Filtro de Período (Últimos 60 Dias)

```javascript
const filtrarUltimos60Dias = (linhas) => {
  const hoje = new Date()
  const sessentaDiasAtras = new Date(hoje.getTime() - (60 * 24 * 60 * 60 * 1000))
  
  return linhas.filter(linha => {
    const dataStr = linha[3] // Coluna D - Data
    
    try {
      // Suporte a múltiplos formatos de data:
      // DD/MM/YYYY, DD/MM/YY, YYYY-MM-DD
      let data
      if (dataStr.includes('/')) {
        const partes = dataStr.split('/')
        if (partes.length === 3) {
          const dia = parseInt(partes[0])
          const mes = parseInt(partes[1]) - 1 // Mês é 0-indexado
          let ano = parseInt(partes[2])
          
          // Se ano tem 2 dígitos, assumir 20XX
          if (ano < 100) {
            ano += 2000
          }
          
          data = new Date(ano, mes, dia)
        }
      } else if (dataStr.includes('-')) {
        data = new Date(dataStr)
      } else {
        data = new Date(dataStr)
      }
      
      return data >= sessentaDiasAtras && data <= hoje
    } catch (error) {
      return false
    }
  })
}
```

## 🎯 Resumo dos Pesos do Score

| Métrica | Peso | Descrição |
|---------|------|-----------|
| **Total de Atendimentos** | 35% | Quantidade de chamadas atendidas |
| **Tempo Médio** | 20% | Duração média (invertido - menor é melhor) |
| **Nota de Atendimento** | 20% | Avaliação do atendimento (1-5) |
| **Nota de Solução** | 20% | Avaliação da solução (1-5) |

## 📊 Exemplo de Cálculo

Para um operador com:
- 100 atendimentos
- Tempo médio: 3.5 minutos
- Nota atendimento: 4.8
- Nota solução: 4.5

**Cálculo:**
1. Normalizar valores (0-1)
2. Aplicar fórmula: `0.35 * normTotal + 0.20 * (1 - normTempo) + 0.20 * normNotaAtendimento + 0.20 * normNotaSolucao`
3. Converter para porcentagem: `score * 100`

**Resultado:** Score final entre 0-100 pontos
