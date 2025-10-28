# 📊 Guia: Comparar Gráficos no VeloInsights

## 🎯 Visão Geral

O botão **"Comparar Gráficos"** permite visualizar dois gráficos lado a lado, facilitando a análise comparativa de diferentes métricas e períodos.

---

## 📍 Localização

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [📅 Seletor de Período]  [🔄 Comparar Gráficos]       │
│                                                         │
│  ←─── Período                                    Botão ──→
```

O botão está localizado no **canto superior direito** do dashboard, ao lado do seletor de período.

---

## 🚀 Como Usar

### Passo 1: Abrir o Seletor
```
┌─────────────────────────────────────────────────┐
│  Dashboard                                   [X] │
├─────────────────────────────────────────────────┤
│                                                 │
│  [📅 Período Atual: Últimas 2 Semanas]         │
│                                                 │
│  [🔄 Comparar Gráficos]  ←─ Clique aqui      │
│                                                 │
│  ──────────────────────────────────────        │
│                                                 │
│  💡 Cards de Gráficos                          │
│     └─ Análise Geral                            │
│     └─ CSAT                                    │
│     └─ Volume por Hora                         │
│     └─ TMA                                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Passo 2: Selecionar Gráficos para Comparar
```
┌─────────────────────────────────────────────────┐
│  Comparar Gráficos                          [X] │
├─────────────────────────────────────────────────┤
│                                                 │
│  🔍 Buscar gráficos...                          │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  │  ○ Análise Geral (Tendência Semanal)   │   │
│  │  ○ CSAT - Satisfação do Cliente        │   │
│  │  ○ Volume por Hora                     │   │
│  │  ○ TMA - Tempo Médio de Atendimento    │   │
│  │  ○ Volume por Produto URA              │   │
│  │  ○ TMA de Resolução (Tickets)         │   │
│  │  ○ Volume por Fila (Tickets)          │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Cancelar]              [Comparar (0/2)]        │
└─────────────────────────────────────────────────┘
```

Você pode selecionar **até 2 gráficos** para comparação.

### Passo 3: Visualizar Comparação
```
┌───────────────────────────────────────────────────────────┐
│  Comparação de Gráficos                               [X] │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────────────────┐  ┌───────────────────────┐   │
│  │  Gráfico 1            │  │  Gráfico 2            │   │
│  │  📊 Análise Geral     │  │  ⭐ CSAT             │   │
│  │  ────────────────     │  │  ────────────────     │   │
│  │                       │  │                       │   │
│  │    📈                  │  │    📊                 │   │
│  │       ╱╲              │  │    ┃┃┃              │   │
│  │      ╱  ╲             │  │    ┃┃┃┃┃            │   │
│  │     ╱    ╲            │  │    ┃┃┃┃┃┃┃          │   │
│  │    ╱      ╲           │  │    ┃┃┃┃┃┃┃┃         │   │
│  │   ──────────────       │  │    ──────────────     │   │
│  │  Jan Fev Mar Abr       │  │  Jan Fev Mar Abr     │   │
│  │                       │  │                       │   │
│  └───────────────────────┘  └───────────────────────┘   │
│                                                           │
│  💡 Ambas visualizações usam o mesmo período selecionado │
└───────────────────────────────────────────────────────────┘
```

---

## 📋 Gráficos Disponíveis para Comparação

### Telefonia (55pbx)
- 📊 **Análise Geral** - Tendências gerais de volume
- ⭐ **CSAT** - Satisfação do cliente
- ⏰ **Volume por Hora** - Distribuição horária
- ⏱️ **TMA** - Tempo médio de atendimento
- 📞 **Volume por Produto URA**

### Tickets
- 📊 **Análise Geral** - Tendências de tickets
- 🎯 **TMA de Resolução por Assunto**
- 📋 **Volume por Fila**
- ⏰ **Volume por Hora**

---

## 💡 Casos de Uso

### 1. Comparar Métricas Relacionadas
```
┌───────────────────┐  ┌───────────────────┐
│  Volume           │  │  TMA             │
│  (Atendimentos)   │  │  (Tempo Médio)   │
└───────────────────┘  └───────────────────┘
  ↑                     ↑
  |                     |
  Quantidade        Performance
```

**Use quando:** Quer ver se volume alto corresponde a TMA alto.

### 2. Comparar Períodos Diferentes
```
┌───────────────────┐  ┌───────────────────┐
│  Mês Atual        │  │  Mês Anterior     │
└───────────────────┘  └───────────────────┘
  ↑                     ↑
  |                     |
  Agora              Antes
```

**Use quando:** Quer ver evolução temporal.

### 3. Comparar Diferentes Categorias
```
┌───────────────────┐  ┌───────────────────┐
│  IRPF             │  │  CALCULADORA     │
│  (TMA por Produto)│  │  (TMA por Produto)│
└───────────────────┘  └───────────────────┘
  ↑                     ↑
  |                     |
  Produto A           Produto B
```

**Use quando:** Quer comparar performance entre produtos.

---

## ⚙️ Recursos Avançados

### Busca Rápida
```
┌────────────────────────────────────┐
│  🔍 Buscar gráficos...             │
│                                    │
│  Digite para filtrar:             │
│  - "TMA"                          │
│  - "Volume"                       │
│  - "CSAT"                         │
└────────────────────────────────────┘
```

Digite no campo de busca para filtrar gráficos por nome.

### Scroll Horizontal
```
┌────────────────────────────────────┐
│  →                                │
│  Quando os gráficos são grandes:  │
│  Use scroll horizontal ← →        │
└────────────────────────────────────┘
```

Gráficos grandes permitem scroll horizontal para visualização completa.

---

## 🎨 Interface

### Estados do Botão
```
┌─────────────────────────────┐
│  [Comparar Gráficos]        │  ← Inativo
│                             │
│  (Nenhuma seleção ainda)   │
└─────────────────────────────┘

┌─────────────────────────────┐
│  [Comparar Gráficos (1/2)] │  ← Parcial
│                             │
│  (1 gráfico selecionado)    │
└─────────────────────────────┘

┌─────────────────────────────┐
│  [Comparar (2/2)]           │  ← Ativo
│                             │
│  (Pronto para comparar)    │
└─────────────────────────────┘
```

---

## 📱 Responsividade

### Desktop (Telas Grandes)
```
┌────────────────────────────────────────────┐
│                                            │
│  ┌──────────────┐  ┌──────────────┐       │
│  │  Gráfico 1   │  │  Gráfico 2   │       │
│  └──────────────┘  └──────────────┘       │
│                                            │
└────────────────────────────────────────────┘
  Side by Side (Lado a Lado)
```

### Tablet/Mobile (Telas Pequenas)
```
┌────────────────────────────┐
│                            │
│  ┌──────────────────────┐ │
│  │  Gráfico 1           │ │
│  └──────────────────────┘ │
│                            │
│  ┌──────────────────────┐ │
│  │  Gráfico 2           │ │
│  └──────────────────────┘ │
│                            │
└────────────────────────────┘
  Stacked (Empilhado)
```

---

## ⌨️ Atalhos de Teclado

- `Esc` - Fechar modal de comparação
- `Enter` - Confirmar seleção de gráficos
- `Tab` - Navegar entre gráficos

---

## ❓ Perguntas Frequentes

### Quantos gráficos posso comparar?
**Resposta:** Máximo de **2 gráficos** por vez.

### Posso comparar gráficos de fontes diferentes?
**Resposta:** Sim! Você pode comparar:
- Telefonia vs Tickets
- Diferentes períodos
- Diferentes produtos

### Os gráficos usam o mesmo período?
**Resposta:** Sim, ambos usam o período selecionado no dashboard.

### Posso exportar a comparação?
**Resposta:** Em desenvolvimento - em breve você poderá exportar as comparações.

---

## 🎓 Dicas de Análise

### 1. Correlação e Causa
```
Volume ↑    TMA ↑
  ├─────────┘
  └─> Alta demanda pode aumentar tempo médio
```

### 2. Sazonalidade
```
Jan    Fev    Mar    Abr
  📈    📈     📊     📉
  └──────┬──────┘
         │
    Período de pico
```

### 3. Tendências Opostas
```
Gráfico 1: ↑ Subindo
Gráfico 2: ↓ Descendo

→ Análise: Performance em questão
```

---

## 📞 Suporte

Para mais informações ou dúvidas sobre comparação de gráficos:
- Consulte a documentação completa
- Entre em contato com o suporte técnico

---

**Desenvolvido para VeloInsights** 🚀
*Última atualização: Outubro 2025*

