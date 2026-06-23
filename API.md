
------------------------------
## 📑 Documentação da API Web - SITREV (Backend)
Esta documentação descreve todos os endpoints disponíveis na API REST do SITREV hospedada na nuvem do Render.

* URL Base de Produção: https://sitrevdavid2026.onrender.com
* URL Base de Desenvolvimento: http://localhost:8000/api
* Formato de Dados: JSON (exceto uploads de mídia que utilizam Multipart FormData)

------------------------------
## 🔑 1. Autenticação e Sessão (Acesso Livre) ## POST /token/

* Função: Realiza o login do usuário no sistema.
* Corpo da Requisição (JSON):

{
  "username": "nome.usuario",
  "password": "senha_secreta_123"
}


* Resposta de Sucesso (200 OK):

{
  "refresh": "eyJhbGciOiJIUzI1Ni...",
  "access": "eyJhbGciOiJIUzI1Ni...",
  "role": "administrador" // Retorna 'administrador' ou 'comum'
}

## POST /token/refresh/

* Função: Renova um Token de Acesso (access) que expirou.
* Corpo da Requisição (JSON):

{
  "refresh": "eyJhbGciOiJIUzI1Ni..." // Token de refresh obtido no login
}


* Resposta de Sucesso (200 OK):

{
  "access": "eyJhbGciOiJIUzI1Ni..." // Novo token de acesso válido
}

------------------------------
## 👥 2. Módulo Motoristas (Requer Token JWT)

💡 Nota de Permissão: Usuários comuns e administradores possuem acesso ao método GET. Os métodos POST, PUT, PATCH e DELETE são restritos exclusivamente a usuários administradores.

## GET /motoristas/

* Função: Lista todos os motoristas cadastrados.
* Parâmetros de URL (Opcional): ?search=nome (Filtra motoristas por nome em tempo real).
* Resposta de Sucesso (200 OK):

[
  {
    "id": 1,
    "nome": "Fernando Condutor 1",
    "status": "Em viagem", // Pode ser 'Em viagem' ou 'Parado'
    "ultimo_veiculo": "Fiat Uno",
    "ultimo_registro": "2026-06-17T10:00:00-03:00"
  }
]

## POST /motoristas/

* Função: Cadastra um novo motorista no sistema.
* Corpo da Requisição (JSON):

{
  "nome": "Carlos Alberto de Souza"
}


* Resposta de Sucesso (201 Created): Retorna o objeto JSON criado com o seu novo id.

## GET /motoristas/{id}/

* Função: Traz os detalhes de um motorista específico baseado no ID.

## PATCH /motoristas/{id}/

* Função: Atualiza um campo específico do cadastro do motorista.
* Corpo da Requisição (JSON): Enviar apenas a chave que deseja mudar (ex: {"nome": "Novo Nome"}).

## DELETE /motoristas/{id}/

* Função: Exclui o motorista do banco de dados do Neon.
* Resposta de Sucesso: 204 No Content (Vazio). [1] 

------------------------------
## 🚗 3. Módulo Veículos (Requer Token JWT)## GET /veiculos/

* Função: Lista todos os veículos da frota.
* Parâmetros de URL (Opcional): ?search=termo (Filtra por modelo ou placa).
* Resposta de Sucesso (200 OK):

[
  {
    "id": 1,
    "modelo": "Mercedes-Benz Axor",
    "placa": "ABC1B23",
    "imagem": "https://onrender.com", // null se não houver
    "ultimo_motorista": "Fernando Condutor 1",
    "ultimo_registro": "2026-06-17T10:00:00-03:00",
    "rastro_gps_ultima_viagem": "[[-3.761268, -49.680708], [-3.761707, -49.681400]]" // String JSON de coordenadas
  }
]

## POST /veiculos/

* Função: Adiciona um veículo à frota (Permissão: Admin).
* Formato de Envio: Multipart FormData (Não definir Content-Type no fetch).
* Campos Aceitos:
* modelo (Texto, Obrigatório)
   * placa (Texto, Obrigatório e Único)
   * imagem (Arquivo de Imagem Binário, Opcional)

## GET /veiculos/{id}/viagens/

* Função: Rota customizada que extrai o histórico de todas as viagens realizadas exclusivamente por este veículo.
* Resposta de Sucesso (200 OK):

[
  {
    "id": 10,
    "motorista_nome": "João Silva",
    "duracao": 2.5 // Duração em horas (null se a viagem ainda estiver em andamento)
  }
]

## PATCH /veiculos/{id}/

* Função: Altera campos cadastrais do veículo (Permissão: Admin).

## DELETE /veiculos/{id}/

* Função: Exclui o veículo da frota (Permissão: Admin).

------------------------------
## 📋 4. Módulo de Viagens e Telemetria (Requer Token JWT)

📡 Nota de Operação: Este módulo gerencia o rastro de geolocalização e é o endpoint atualizado em tempo real pelo simulador em Python.

## GET /viagens/

* Função: Lista todas as viagens cadastradas (Alimenta a aba de Registros Gerais).
* Resposta de Sucesso (200 OK):

[
  {
    "id": 1,
    "veiculo_modelo": "Fiat Uno",
    "veiculo_placa": "ABC1B23",
    "motorista_nome": "Fernando Condutor 1",
    "inicio_viagem": "2026-06-17T10:00:00-03:00",
    "fim_viagem": "2026-06-17T12:30:00-03:00",
    "duracao": 2.5,
    "rastro_gps": "[[-3.761268, -49.680708], [-3.761707, -49.681400]]" // Coordenadas de Tucuruí
  },
  {
    "id": 2,
    "veiculo_modelo": "Fiat Uno",
    "veiculo_placa": "ABC1B23",
    "motorista_nome": "Fernando Condutor 1",
    "inicio_viagem": "2026-06-17T10:00:00-03:00",
    "fim_viagem": "2026-06-17T12:30:00-03:00",
    "duracao": 2.5,
    "rastro_gps": "[[-3.761264, -49.680705], [-3.761701, -49.681405]]" // Coordenadas de Tucuruí
}
]

## POST /viagens/

* Função: Inicia um novo registro de viagem.
* Corpo da Requisição (JSON):

{
  "motorista": 1, // ID do Motorista cadastrado
  "veiculo": 2    // ID do Veículo cadastrado
}

Note que os campos inicio_viagem, fim_viagem e rastro_gps são calculados e gerenciados automaticamente pelo backend.
## GET /viagens/{id}/

* Função: Detalha uma viagem trazendo o texto completo de coordenadas geográficas do campo rastro_gps.

## PATCH /viagens/{id}/

* Função: Atualiza o trajeto de uma viagem. (Usado para anexar novos pontos de GPS ou definir a data final da viagem).

------------------------------
## 🛡️ 5. Módulo Dashboard User/Admin
## POST /usuarios/

* Função: Cadastra uma nova conta de acesso (Sign Up) no banco do Neon (Permissão: Admin).
* Corpo da Requisição (JSON):

{
  "username": "novo.operador",
  "password": "senha_criptografada_segura",
  "is_superuser": false // Se true, conta de Administrador. Se false, usuário comum.
}

## POST /alterar-senha/

* Função: Permite que qualquer usuário autenticado (comum ou administrador) mude a própria senha de acesso.
* Corpo da Requisição (JSON):

{
  "senha_atual": "senha_antiga_123",
  "nova_senha": "nova_senha_ultra_secreta"
}


* Respostas Possíveis:
* 200 OK: {"detail": "Senha alterada com sucesso!"}
   * 400 Bad Request: {"senha_atual": ["A senha atual digitada está incorreta."]}

------------------------------
## ⚠️ Padrões de Erro da API
Se uma requisição falhar, o backend retornará os seguintes códigos HTTP acompanhados de um JSON explicativo:

* 401 Unauthorized: Token ausente, inválido ou expirado.
* JSON: {"detail": "Authentication credentials were not provided."} [2] 
* 403 Forbidden: O token é válido, mas o usuário não tem o cargo necessário (ex: usuário comum tentando cadastrar motorista).
* JSON: {"detail": "You do not have permission to perform this action."}
* 400 Bad Request: Dados obrigatórios faltando ou placa/usuário duplicado.
* JSON: {"placa": ["veiculo with this placa already exists."]}

------------------------------
