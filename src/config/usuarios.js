// Configuração de Usuários e Cargos
// Baseado no arquivo "Cargos e nomes.json"

export const USUARIOS_CONFIG = [
  {
    email: "andre.violaro@velotax.com.br",
    nome: "André",
    cargo: "DIRETOR"
  },
  {
    email: "emerson.jose@velotax.com.br",
    nome: "Emerson",
    cargo: "GESTOR"
  },
  {
    email: "anderson.silva@velotax.com.br",
    nome: "Anderson",
    cargo: "GESTOR"
  },
  {
    email: "gabriel.araujo@velotax.com.br",
    nome: "Gabriel",
    cargo: "SUPERADMIN"
  },
  {
    email: "joao.silva@velotax.com.br",
    nome: "João",
    cargo: "ANALISTA"
  },
  {
    email: "gabrielli.assuncao@velotax.com.br",
    nome: "Gabrielli",
    cargo: "OPERADOR"
  },
  {
    email: "caroline.santiago@velotax.com.br",
    nome: "Caroline",
    cargo: "ANALISTA"
  },
  {
    email: "vanessa.souza@velotax.com.br",
    nome: "Vanessa",
    cargo: "ANALISTA"
  },
  {
    email: "fabio.santos@velotax.com.br",
    nome: "Fabio",
    cargo: "ANALISTA"
  },
  {
    email: "tainara.silva@velotax.com.br",
    nome: "Tainara",
    cargo: "OPERADOR"
  },
  {
    email: "dimas.nascimento@velotax.com.br",
    nome: "Dimas",
    cargo: "OPERADOR"
  },
  {
    email: "brenda.miranda@velotax.com.br",
    nome: "Brenda",
    cargo: "OPERADOR"
  },
  {
    email: "octavio.silva@velotax.com.br",
    nome: "Octavio",
    cargo: "ANALISTA"
  },
  {
    email: "nayara.ribeiro@velotax.com.br",
    nome: "Nayara",
    cargo: "OPERADOR"
  },
  {
    email: "geovane.souza@velotax.com.br",
    nome: "Geovane",
    cargo: "OPERADOR"
  },
  {
    email: "nathalia.villanova@velotax.com.br",
    nome: "Nathalia",
    cargo: "OPERADOR"
  },
  {
    email: "rodrigo.reis@velotax.com.br",
    nome: "Rodrigo",
    cargo: "OPERADOR"
  },
  {
    email: "thainara.silva@velotax.com.br",
    nome: "Thainara",
    cargo: "OPERADOR"
  },
  {
    email: "stephanie.oliveira@velotax.com.br",
    nome: "Stephanie",
    cargo: "OPERADOR"
  },
  {
    email: "laura.guedes@velotax.com.br",
    nome: "Laura Guedes",
    cargo: "OPERADOR"
  },
  {
    email: "viviane.silva@velotax.com.br",
    nome: "Viviane",
    cargo: "OPERADOR"
  },
  {
    email: "murilo.caetano@velotax.com.br",
    nome: "Murilo",
    cargo: "OPERADOR"
  },
  {
    email: "igor.siqueira@velotax.com.br",
    nome: "Igor",
    cargo: "SUPERADMIN"
  },
  {
    email: "marcos.pereira@velotax.com.br",
    nome: "Marcos",
    cargo: "OPERADOR"
  },
  {
    email: "vinicius.assuncao@velotax.com.br",
    nome: "Vinicius",
    cargo: "OPERADOR"
  },
  {
    email: "juliana.rofino@velotax.com.br",
    nome: "Juliana",
    cargo: "OPERADOR"
  },
  {
    email: "shirley.cunha@velotax.com.br",
    nome: "Shirley",
    cargo: "OPERADOR"
  },
  {
    email: "bruno.silva@velotax.com.br",
    nome: "Bruno",
    cargo: "OPERADOR"
  },
  {
    email: "laura.almeida@velotax.com.br",
    nome: "Laura Almeida",
    cargo: "OPERADOR"
  },
  {
    email: "marcelo.silva@velotax.com.br",
    nome: "Marcelo",
    cargo: "OPERADOR"
  },
  {
    email: "monike.silva@velotax.com.br",
    nome: "Monike",
    cargo: "OPERADOR"
  },
  {
    email: "mariana.luz@velotax.com.br",
    nome: "Mariana",
    cargo: "OPERADOR"
  }
]

// Função para buscar usuário por email
export const getUserByEmail = (email) => {
  return USUARIOS_CONFIG.find(user => 
    user.email.toLowerCase() === email.toLowerCase()
  )
}

// Função para obter cargo do usuário
export const getUserCargo = (email) => {
  const user = getUserByEmail(email)
  return user ? user.cargo : 'OPERADOR'
}

// Função para obter nome do usuário
export const getUserName = (email) => {
  const user = getUserByEmail(email)
  return user ? user.nome : 'Usuário'
}
