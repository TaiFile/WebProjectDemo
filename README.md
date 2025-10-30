# Desafio Técnico — Todo List

Bem-vindo ao **Desafio Técnico da Cati Jr**!
Neste desafio, você deverá desenvolver um sistema de **gerenciamento de tarefas** inspirado no Trello, implementando as funcionalidades essenciais e, se desejar, recursos adicionais para aprimorar a experiência do usuário.

Este desafio tem como objetivo avaliar suas habilidades técnicas, organização e atenção aos detalhes. Características fundamentais para fazer parte do nosso time.

## Design de Referência

O layout do projeto está disponível no Figma:
🔗 [Acessar Figma](https://www.figma.com/design/h38QDuuw2oOo5JPMdk8EFB/Projeto-Trainee-2025---Produtos?node-id=30-2031&p=f&m=dev)

## Stack e Requisitos

### **Frontend**

- React
- TypeScript
- Tailwind CSS

### **Backend (escolha uma das opções abaixo)**

- **Spring Boot (Java)**
- **Nest.js (TypeScript)**

### **Pré-requisitos gerais**

- Java 21
- Maven
- Node 20
- Docker

## Requisitos de Desenvolvimento

### **Backend**

Implemente as rotas e operações a seguir:

#### **Listas**

- **[POST] `/lists`** — cria uma nova lista

  - Campos: `name: string`
  - O nome da lista deve ser único

- **[GET] `/lists`** — retorna todas as listas
- **[GET] `/lists/:id`** — retorna a lista pelo ID

  - Deve validar se a lista existe

- **[PUT] `/lists/:id`** — atualiza os dados da lista

  - Campos: `name: string`

- **[DELETE] `/lists/:id`** — remove uma lista existente

  - Deve verificar se há tarefas associadas
  - O candidato pode optar por **proibir a remoção** ou **remover em cascata**

#### **Tarefas**

- **[POST] `/tasks`** — cria uma nova tarefa

  - Campos:

    - `name: string`
    - `description: string` _(opcional)_
    - `priority: enum (LOW, MEDIUM, HIGH, VERY_HIGH)`
    - `expectedFinishDate: date` _(opcional, deve ser futura)_
    - `listId: integer`

- **[GET] `/tasks/:id`** — retorna a tarefa pelo ID
- **[PUT] `/tasks/:id`** — atualiza uma tarefa existente

  - Campos (todos opcionais):

    - `name`, `description`, `priority`, `expectedFinishDate`, `listId`, `finishDate`

- **[DELETE] `/tasks/:id`** — remove a tarefa pelo ID

#### **Testes**

- Implemente **testes unitários** para o CRUD de **listas ou tarefas** (à sua escolha).

  - Spring Boot → JUnit
  - Nest.js → Vitest

### **Frontend**

Implemente o frontend de acordo com o Figma, garantindo fidelidade visual e boa experiência de uso.

- Criação dos componentes necessários
- Integração com o backend
- Responsividade
- Funcionalidade de **drag and drop** para mover tarefas entre listas

## Critérios de Avaliação

Seu projeto será avaliado com base nos seguintes critérios:

1. **Entrega completa** das funcionalidades propostas
2. **Boas práticas** de código e organização do projeto
3. **Robustez da implementação**, incluindo validações e tratamento de erros/exceções
4. **Fidelidade ao layout** e atenção aos detalhes

## Prazo e Entrevista Final

O prazo para a conclusão do desafio é de **2 semanas** a partir da data de recebimento.
Após o envio, o projeto será analisado pela equipe técnica, e a **entrevista final será baseada diretamente nesta atividade**, explorando suas decisões técnicas, arquitetura e raciocínio de desenvolvimento.

## Dicas

- Estruture bem seu código e documentação.
- Demonstre sua capacidade de pensar como um desenvolvedor de produto, não apenas de código.

### Boa sorte no desafio! 💪

A nossa equipe está ansiosa para ver o seu trabalho.
