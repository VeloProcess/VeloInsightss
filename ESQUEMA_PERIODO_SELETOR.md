# 📅 ESQUEMA DO SELETOR DE PERÍODO - VELOINSIGHTS

## Estrutura Atual

### 🔄 Estado Inicial (Dropdown Fechado)

```
┌─────────────────────────┐
│ [Selecione um período ▼]│  ← Botão principal
└─────────────────────────┘
```

---

### 1️⃣ Ao Clicar no Botão - Opções Principais

```
┌────────────────────────────┐
│ ☐ Dia anterior            │  ← Seleciona dia anterior
│ ☐ Mês atual               │  ← Seleciona mês atual
│ ☐ Últimos 3 meses         │  ← Seleciona últimos 3 meses
│ ☐ Personalizado ▶         │  ← Expande submenu
└────────────────────────────┘
```

---

### 2️⃣ Ao Clicar em "Personalizado" - Expande Submenu

```
┌────────────────────────────┐
│ ☐ Dia anterior            │
│ ☐ Mês atual               │
│ ☐ Últimos 3 meses         │
│ ☑ Personalizado ▼         │  ← Botão desce e aparece ▼
│   │─┐                     │
│   │ ☐ De: [___________]  │  ← Campo data inicial
│   │ ☐ Até: [_________]   │  ← Campo data final
│   │ ☐ [✓ Aplicar]        │  ← Botão aplicar
└────────────────────────────┘
```

**Comportamento ao clicar em "Personalizado":**
- Mostra campos de data inicial e final
- Usuário preenche as datas (ex: 01/10/2025 até 19/10/2025)
- Clica em "Aplicar"
- Sistema inverte datas automaticamente se necessário
- Dados são filtrados e exibidos

---

### 3️⃣ Como os Dados São Agrupados

Conforme o número de dias selecionados, o gráfico agrupa automaticamente:

```
┌────────────────────────────────────┐
│ 📊 AGRUPAMENTO POR PERÍODO         │
├────────────────────────────────────┤
│                                    │
│ 1-15 dias  →  Por DIA 📅          │
│             01/10, 02/10, 03/10... │
│                                    │
│ 16-30 dias →  Por SEMANA 📊        │
│             Semana 1: 01-07/10    │
│             Semana 2: 08-14/10    │
│             Semana 3: 15-21/10    │
│                                    │
│ 30+ dias   →  Por MÊS 📆          │
│             Out 2025, Nov 2025...  │
└────────────────────────────────────┘
```

---

### 4️⃣ Exemplo: Personalizado (01/10 até 19/10)

```
┌──────────────────────────────────────┐
│ 📊 PERÍODO SELECIONADO               │
├──────────────────────────────────────┤
│ De: 01/10/2025                      │
│ Até: 19/10/2025                     │
│ Total: 19 dias                      │
├──────────────────────────────────────┤
│ 📊 AGRUPAMENTO: Por SEMANA          │
│                                     │
│ Semana 1: 01/10 a 07/10  →   145   │
│ Semana 2: 08/10 a 14/10  →   280   │
│ Semana 3: 15/10 a 19/10  →   165   │
└──────────────────────────────────────┘
```

---

### 5️⃣ Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                     FLUXO DE SELEÇÃO                        │
└─────────────────────────────────────────────────────────────┘

1️⃣ Usuário clica no seletor
   └─> Abre dropdown com 4 opções

2️⃣ Usuário clica em "Personalizado"
   └─> Expande mostrando campos "De" e "Até"

3️⃣ Usuário seleciona datas
   ├─> De: 01/10/2025
   └─> Até: 19/10/2025

4️⃣ Usuário clica em "Aplicar"
   ├─> Sistema detecta período: 19 dias
   ├─> Escolhe agrupamento: Por SEMANA
   ├─> Calcula semanas a partir de 01/10:
   │   ├─> Semana 1: 01/10 a 07/10
   │   ├─> Semana 2: 08/10 a 14/10
   │   └─> Semana 3: 15/10 a 19/10
   └─> Exibe gráfico com 3 pontos
```

---

## ✨ Características Especiais

### 🔄 Inversão Automática de Datas

Se o usuário digitar as datas invertidas (ex: 19/10 até 01/10), o sistema **detecta e inverte automaticamente**:

```
┌──────────────────────────────────────┐
│ ⚠️ DETECÇÃO DE DATAS INVERTIDAS     │
├──────────────────────────────────────┤
│ Input:    De: 19/10, Até: 01/10    │
│ Sistema:  ⚠️ Datas invertidas       │
│ Ajuste:   ✅ Automaticamente corrige │
│ Output:   De: 01/10, Até: 19/10    │
└──────────────────────────────────────┘
```

### 📊 Períodos Disponíveis

```
┌─────────────────────────────────────┐
│ PERÍODOS RÁPIDOS                    │
├─────────────────────────────────────┤
│ • Dia anterior   → Últimas 24h     │
│ • Mês atual      → Do dia 01 até hoje│
│ • Últimos 3 meses → 3 meses completos│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ PERÍODO PERSONALIZADO              │
├─────────────────────────────────────┤
│ • Qualquer intervalo de datas      │
│ • Flexível e personalizado         │
│ • Agrupamento inteligente          │
└─────────────────────────────────────┘
```

---

## 🎯 Resumo Visual

```
                     ┌─────────────────┐
                     │ Selecione       │
                     │ Período ▼      │
                     └────────┬────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
    ┌───────────┐      ┌───────────┐      ┌───────────┐
    │ Dia       │      │ Mês       │      │ Últimos   │
    │ Anterior  │      │ Atual     │      │ 3 Meses   │
    └───────────┘      └───────────┘      └───────────┘
           │                  │                  │
           │                  │                  │
           └──────────────────┼──────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │ Personalizado ▶ │
                     └────────┬────────┘
                              │
                              ▼
           ┌─────────────────────────────────────┐
           │ 📅 De: [01/10/2025]                │
           │ 📅 Até: [19/10/2025]               │
           │ [✓ Aplicar]                        │
           └─────────────┬───────────────────────┘
                         │
                         ▼
           ┌─────────────────────────────────────┐
           │ 🧠 Sistema Processa:                │
           │ • Detecta: 19 dias                 │
           │ • Escolhe: Agrupar por SEMANA       │
           │ • Calcula: Semanas a partir 01/10   │
           │ • Exibe: Gráfico com 3 semanas      │
           └─────────────────────────────────────┘
```

