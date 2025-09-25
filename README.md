<p align="center">
  <a href="#" target="blank"><img src="https://cdn-icons-png.flaticon.com/512/6020/6020687.png" width="120" alt="Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<h3 align="center"><strong>Carteira Financeira</strong></h3>

## Descrição

Criar uma interface funcional de **carteira digital** que permita aos usuários gerenciar saldos, com foco principal na realização de **transferências** (envio e recebimento) e **depósitos**. O sistema deve garantir a integridade financeira por meio de transações atômicas e reversíveis.

## ✨ Requisitos Funcionais

### 1. Acesso e Segurança (Autenticação)
| Requisito | Descrição |
| :--- | :--- |
| **Cadastro de Usuário** | O sistema deve permitir o registro de novos usuários. |
| **Autenticação** | Deve garantir um processo de login seguro para acesso às funcionalidades da carteira. |

### 2. Operações de Saldo (Envio, Recebimento e Depósito)
| Operação | Tipo de Transação | Detalhe |
| :--- | :--- | :--- |
| **Envio/Transferência** | `TRANSFER` | Usuários podem enviar saldo para a conta de outro usuário. |
| **Recebimento** | N/A (Passivo) | Usuários podem receber saldo de outros usuários. |
| **Depósito** | `DEPOSIT` | Usuários podem adicionar fundos à sua própria conta. |

### 3. Validações e Integridade Financeira
| Validação | Regra de Negócio | Impacto |
| :--- | :--- | :--- |
| **Saldo Suficiente** | **Obrigatório** validar se o usuário remetente possui saldo antes de executar uma transferência. | Transação é abortada se o saldo for insuficiente. |
| **Tratamento de Saldo Negativo** | Em caso de depósito, o valor deve ser **integralmente acrescido** ao saldo, independentemente de o saldo estar positivo ou negativo. | Saldo deve refletir `saldo_atual + valor_deposito`. |
| **Atomidade** | Todas as operações de movimentação de saldo (transferência e depósito) devem ser executadas como **transações de banco de dados (ACID)** para garantir consistência. |

### 4. Reversão de Transações
| Reversibilidade | Fluxo | Detalhe Técnico |
| :--- | :--- | :--- |
| **Obrigatória** | A operação de transferência ou depósito deve ser passível de **reversão** (`REVERSAL`). | Pode ser solicitada pelo usuário ou acionada por inconsistência. |
| **Lógica da Reversão** | Reverte o efeito da transação original: | <ul><li>**Transferência:** Debita do destinatário e Credita no remetente.</li><li>**Depósito:** Debita do destinatário (a própria conta).</li></ul> |

## Setup

<h3 style="font-size: 18px;">🧬 Clonando repositório</h3>

```bash
git clone https://github.com/joaovictorgit/carteira-financeira.git
```

<h3 style="font-size: 18px;">📂 Instalar dependências</h3>

```bash
cd carteira-financeira
cd backend
npm install
cd ..
cd frontend
npm install
```

## Adicionando variáveis de ambiente

<h3 style="font-size: 18px">⚙ Crie um arquivo <strong>.env</strong> na raiz do projeto</h3>

```bash
DATABASE_URL="postgresql://username_do_seu_postgres:senha_do_seu_postgres@localhost:porta_do_postgres(5432)/wallet?schema=public"
POSTGRES_USER="seu usuário"
POSTGRES_PASSWORD="sua senha"
POSTGRES_DB="wallet"
JWT_SECRET="valor secret para rodar o jwt"
```

## Compilar e executar o projeto backend
<h2 style="font-size: 15px;">OBS: Ambas as execuções necessitam que as variáveis de ambiente estejam criadas no arquivo <strong>.env</strong></h2>

<h3 style="font-size: 18px;">💻 Executar Aplicação (Manual)</h3>

```bash
npm run start
```

<h3 style="font-size: 18px;">💻 Executar Aplicação (Docker)</h3>

```bash
docker-compose up --build
```

## Documentação da API

- **Link da documentação do Swagger: http://localhost:3000/api/docs**

## Rodar os testes

```bash
# testes unitários
npm run test
```