# MongoDB Setup - VeloInsights

## 🚀 Configuração Rápida

### 1. Instalar Dependências
```bash
npm install mongodb
```

### 2. Configurar MongoDB

#### Opção A: MongoDB Local
```bash
# Instalar MongoDB localmente
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# macOS: brew install mongodb-community
# Linux: https://docs.mongodb.com/manual/administration/install-on-linux/

# Iniciar MongoDB
mongod
```

#### Opção B: MongoDB Atlas (Recomendado)
1. Acesse [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie uma conta gratuita
3. Crie um cluster
4. Obtenha a string de conexão
5. Configure no arquivo `.env`

### 3. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp mongodb.env.example .env

# Editar configurações
MONGODB_URL=mongodb://localhost:27017
# ou para Atlas: mongodb+srv://username:password@cluster.mongodb.net
```

## 📋 Scripts Disponíveis

### Migração da Planilha
```bash
# Migrar dados da planilha atual para MongoDB
npm run migrate

# Migrar limpando dados existentes
npm run migrate:clear
```

### Sincronização
```bash
# Executar sincronização manual
npm run sync

# Sincronização em modo desenvolvimento
npm run sync:dev
```

### Monitoramento
```bash
# Executar diagnóstico completo
npm run diagnostic

# Monitorar sistema
npm run monitor

# Limpar logs antigos
npm run cleanup
```

## 🔍 Estrutura do Banco

### Collections
- **calls**: Dados de ligações
- **sync_logs**: Logs de sincronização
- **metrics**: Métricas calculadas
- **operators**: Dados dos operadores
- **system_status**: Status do sistema

### Índices Criados Automaticamente
- `callId` (único)
- `date`
- `operator`
- `syncDate`
- `timestamp` (logs)

## 🚨 Troubleshooting

### Erro de Conexão
```bash
# Verificar se MongoDB está rodando
mongosh --eval "db.adminCommand('ismaster')"

# Verificar logs
npm run diagnostic
```

### Dados Corrompidos
```bash
# Verificar integridade
npm run diagnostic

# Limpar logs antigos
npm run cleanup
```

### Performance
```bash
# Verificar estatísticas
npm run monitor

# Verificar índices
mongosh veloinsights --eval "db.calls.getIndexes()"
```

## 📊 Monitoramento

### Status do Sistema
- Última sincronização
- Total de registros
- Status da API
- Contadores de erro

### Logs Estruturados
- Timestamp
- Operação
- Status (success/error/warning)
- Detalhes da execução
- Tempo de execução

### Métricas por Operador
- Total de ligações
- Duração média
- Notas médias
- Última ligação

## 🔧 Configuração da API do %%pbx

Quando a API estiver disponível, configure:

```bash
# No arquivo .env
PBX_API_URL=https://api.pbx.com
PBX_API_KEY=your_api_key_here
```

## 📈 Próximos Passos

1. **Configurar MongoDB** (Atlas ou Local)
2. **Testar sincronização** com dados simulados
3. **Configurar API do %%pbx** quando disponível
4. **Implementar cron job** para sincronização automática
5. **Atualizar frontend** para usar MongoDB

## 🆘 Suporte

Para problemas ou dúvidas:
1. Execute `npm run diagnostic`
2. Verifique os logs
3. Consulte a documentação do MongoDB
4. Entre em contato com o suporte
