📘 Documentação Técnica – Planilha VeloInsights
🧩 Estrutura Geral

O sistema é dividido em duas abas principais, responsáveis por processar e visualizar métricas de Telefonia e Tickets.

📞 ABA 1 – TELEFONIA
1. Análise Geral

Colunas utilizadas:

A → Tipo de Chamada

D → Data

Processos:

Identifica o tipo de registro (atendida, abandonada, etc.).

Agrupa por data e tipo de chamada.

Calcula:

Total de chamadas realizadas.

Total atendidas.

Total abandonadas.

Saída esperada:
Relatório consolidado de volume de chamadas por tipo e por dia.

2. Volume por Hora

Colunas utilizadas:

A → Tipo de Chamada

D → Data

E → Hora

Processos:

Agrupa chamadas por faixa horária e por data.

Calcula a média de chamadas em cada hora do dia, entre diferentes datas.

Identifica horários de pico de atendimento.

Saída esperada:
Gráfico de distribuição de chamadas por hora e horário de maior concentração de ligações.

3. CSAT – Satisfação do Cliente

Colunas utilizadas:

AC → Pontuação de Satisfação

Processos:

Calcula a média das notas de satisfação.

Representa o resultado percentual de satisfação média.

Saída esperada:
Indicador geral de satisfação do cliente.

4. TMA – Tempo Médio de Atendimento

Colunas utilizadas:

D → Data

O → Tempo Total (em segundos ou minutos)

Processos:

Agrupa registros por data.

Calcula:

Tempo médio de atendimento por dia.

Tempo total de atendimento no período.

Fórmula base:

TMA = SOMA(Tempo Total) / QUANTIDADE(Chamadas do dia)


Saída esperada:
Tabela de TMA diário e média geral.

5. Volume de Chamadas × Contact Rate

Status:
Indicador ainda não definido, previsto para futura implementação.

🎫 ABA 2 – TICKETS
1. Análise Geral

Colunas utilizadas:

A → Número do Ticket

O → Tipo de Avaliação

AB → Data

Processos:

Converte datas do formato 2025-01-01 00:00:00 para DD/MM/AAAA.

Desconsidera hora no cálculo.

Calcula a quantidade total de tickets.

Calcula taxa de satisfação:

Taxa de Satisfação = ((Bom + Bom com comentário) / Total de avaliações) * 100


Saída esperada:
Total de tickets e percentual de satisfação do atendimento.

2. TMA – Operação de Tickets

Colunas utilizadas:

A → Número do Ticket

D → Data de Entrada

E → Data de Resolução

AB → Dia

Processos:

Calcula o tempo médio de resolução considerando o período entre entrada e resolução.

Converte e padroniza datas (DD/MM/AAAA).

Fórmula base:

TMA = MÉDIA(Data de Resolução - Data de Entrada)


Saída esperada:
Tempo médio de resolução geral dos tickets.

3. Volume por Fila de Tickets

Colunas utilizadas:

A → Número do Ticket

B → Assunto do Ticket

AB → Dia

Processos:

Verifica se o ticket pertence a produtos válidos; caso contrário, é desconsiderado.

Conta a quantidade de tickets válidos por assunto e data.

Saída esperada:
Volume de tickets por produto/fila e distribuição entre categorias.

4. Volume por Hora

Colunas utilizadas:

A → Número do Ticket

D → Data de Entrada

Processos:

Agrupa tickets por faixa horária.

Faz média entre diferentes dias.

Define horários de pico de recebimento de tickets.

Saída esperada:
Gráfico de volume horário de tickets.

5. TMA de Resolução por Assunto

Colunas utilizadas:

A → Número do Ticket

B → Assunto do Ticket

D → Data de Entrada

E → Data de Resolução

Processos:

Calcula tempo médio de resolução agrupando por assunto.

Considera apenas tickets de produtos definidos.

Desconsidera horas no cálculo (usa apenas datas).

Fórmula base:

TMA por Assunto = MÉDIA(Data de Resolução - Data de Entrada)


Saída esperada:
Tempo médio de resolução por categoria de ticket.