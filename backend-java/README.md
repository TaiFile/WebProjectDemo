# Backend Java (Spring Boot) — Desafio Todo List

Este diretório contém a implementação do backend para o **Desafio Técnico da Cati Jr.**, utilizando Java e o ecossistema Spring Boot.

O projeto foi pré-configurado para facilitar o desenvolvimento, incluindo integração com Docker para o banco de dados e as dependências essenciais para a construção de uma API REST.

## Pré-requisitos

Antes de iniciar, garanta que você tenha os seguintes softwares instalados:

- [**Java 21**](https://github.com/shyiko/jabba) ou superior
- [**Maven**](https://maven.apache.org/install.html)
- [**Docker**](https://www.docker.com/)

## Como Executar a Aplicação

### 1. Banco de Dados com Docker

O projeto está configurado para usar o **Docker Compose** para subir uma instância do PostgreSQL. O Spring Boot gerenciará o ciclo de vida do contêiner automaticamente graças à dependência `spring-boot-docker-compose`.

As configurações do banco de dados estão no arquivo `docker-compose.yaml`:

- **Database:** `todolist-db`
- **Usuário:** `postgres`
- **Senha:** `password`

Não é necessário executar `docker-compose up` manualmente.

### 2. Iniciando o Backend

Para iniciar a aplicação, navegue até a raiz do diretório `backend-java` e execute o comando:

```bash
mvn spring-boot:run
```

O servidor será iniciado, e a API estará acessível em `http://localhost:8080`.

O SpringDoc OpenAPI cria uma documentação automática para a API, que pode ser acessada em `http://localhost:8080/swagger-ui.html`.

## Estrutura do Projeto

- `src/main/java`: Código-fonte da aplicação.
- `src/main/test`: Código-fonte de testes.
- `src/main/resources`: Arquivos de configuração.
  - `application.properties`: Configurações do Spring Boot.
- `pom.xml`: Define as dependências e plugins do Maven.
- `docker-compose.yaml`: Define o serviço do banco de dados PostgreSQL.
