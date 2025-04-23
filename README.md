# SEI Custom App

Extensão disponível para Chrome e Edge que possibilita a integração entre o Sistema Eletrônico de Informações (SEI) com o backend (RESTFull) de uma outra aplicação. Esta extensão é um fork do projeto [SEI+Trello](https://github.com/luiscrjunior/sei-trello).

## Quer apenas usar a extensão?

Em breve mais instruções.

<!-- TODO: Ajustar os links e a descrição deste tópico após publicar o Plugin na web store

:arrow_right: Está usando o **Chrome**? Acesse a página da extensão na [na Chrome Web Store](https://chrome.google.com/webstore/detail/sei%2Btrello/dnjlkohajpocckjiddppmfhkpfdbkecl?hl=pt-BR) e clique em `Usar no Chrome` (canto superior direito).

:arrow_right: Está usando o **Firefox**? Acesse a página da extensão [no Firefox Browser Add-Ons](https://addons.mozilla.org/pt-BR/firefox/addon/sei-trello/) e clique em `Adicionar ao Firefox`.

Depois de instalar a extensão, configure-a na página de opções (credenciais e outras informações, tais como lista e quadro padrão) e pronto! Abra o SEI e seu Trello já estará integrado.

-->

## Quer contribuir com o desenvolvimento?

A extensão está sendo mantida neste repositório e quem quiser colaborar, fique à vontade em submeter seu _pull request_.

### Tecnologias utilizadas

- O código é escrito em `javascript` (todo ele em [`es6`](http://www.ecma-international.org/ecma-262/6.0/)), com transpilação para es5 via [`babel`](https://babeljs.io/);
- O gerenciador de pacotes é o [`npm`](https://www.npmjs.com/);
- O bundler é o [`webpack`](https://webpack.js.org/);
- A renderização usa [`react`](https://reactjs.org/).

### Ambiente de desenvolvimento

O primeiro passo é clonar este repositório para um diretório na sua máquina. Entre no diretório do repositório e execute:

```
npm install
```

Isto irá instalar todos os pacotes listados no `package.json`, necessários ao funcionamento da aplicação.

Após a instalação de todos os pacotes, é preciso compilar o código para que seja carregado no browser; execute:

```
npm run webpack:dev
```

Isto irá gerar o código da extensão no subdiretório `dist/expanded`.

Este diretório poderá ser incluído no Chrome na página de Gerenciamento de Extensões, no "Modo de desenvolvedor", como extensão expandida ("Carregar expandida").

O comando `npm run webpack:dev:watch` monitora a mudança nos arquivos e compila em tempo real a cada modificação no código fonte.

Para gerar uma versão de produção, use o comando `npm run webpack:prod`. A versão final será minificada e o código morto (logs, debug) será eliminado.

### Testes

O projeto conta com testes unitários, de integração e end-to-end (com puppeteer). A cobertura não é total, mas abrangem as principais funcionalidades.

Gere o bundle para testes antes com `npm run webpack:test` (somente necessário para os testes e2e). Depois, para rodar todos os testes, execute `npm run test`.

Você pode executar somente os testes unitários/integração com `npx jest --selectProjects 'Unit and Integration Tests'` e somente os testes e2e com `npx jest --selectProjects 'E2E Tests'`.

### Playground

O projeto conta com um ambiente preparado para esculpir os componentes React, com `HotModuleReplacementPlugin` e `ReactRefreshWebpackPlugin`, ou seja, os componentes atualizam automaticamente assim que o código é alterado. O ambiente é muito útil para construção dos componentes antes de usá-los como extensão e testar no SEI.

Execute `npm run playground` e abra seu navegador em `http://localhost:8080/`.

![Playground](/docs/images/playground.png)

### Regras para codificar

O projeto usa o `eslint` como linter e o `prettier` para formatação do código. As regras estão no arquivo `.eslintrc.js` e `.prettierrc.js`.

Todo o código é escrito em inglês, para manter um padrão. Os termos em português do SEI foram traduzidos livremente.

## Integração entre SEI e Backend

Este projeto foi criado com o objetivo de ampliar a funcinalidade do Plugin SEI+Trello permitindo que o Plugin se conecte com outros backends além do Trello.

Para que essa funcionalidade (conexão com outros backends) seja alcançada foi criada uma nova camada entre os dados que são usados dentro do do Plugin e os dados que são enviados/recebidos pelo backend permitindo a transformação do JSON em uma nova estrutura.

Por exemplo, considere a rota `https://meubackend.com.br/board/query` utilizada para pesquisar os quadros pelo nome, e para esta rota o parâmetro da pesquisa se chama `query`. Você configura o plugin para enviar este parâmetro da seguinte maneira:

```
{ "query": "@{board.name}" }
```

Desta maneira, quando o plugin for enviar a requisição para a rota indicada ele utilizará o nome do cartão no parâmetro `query`. O plugin sabe que uma informação do JSON deve ser substituída por outra por meio dos caracteres `@{}`, dentro das chaves você deve informar o placeholder que contém a informação desejada.

A transformação da resposta da rota para os dados utilizados dentro do Plugin segue a mesma lógica, ou seja, você utilizará placeholders para identificar a informação que está vindo do backend e transforma-la na estrutura utilizada dentro do plugin. Por exemplo, considere a resposta desta mesma rota `https://meubackend.com.br/board/query` sendo enviada no seguinte formato:

```
{
  aggregator: [
    {
      "identity": 123,
      "fullName": "This is my card",
      "description": "This is the card I created to test this app",
      "createdAt": "2025-01-01T12:00:00"
    },
    {
      "identity": 456,
      "fullName": "Somenone created this card",
      "description": "I don't know who created this card, but it is here",
      "createdAt": "2025-01-01T12:25:00"
    }
  ]
}
```

O Plugin não conseguirá entender esta resposta pois ele utiliza uma outra estrutura do JSON, então precisamos transformar esta resposta em um formato que o Plugin entende, isso pode ser feito da seguinte maneira:

```
{
  boards: [
    {
      "id": "@{aggregator.identity}",
      "name": "@{aggregator.fullName}"
    }
  ]
}
```

O resultado final será o seguinte JSON que é interpretado corretamente pelo Plugin:

```
{
  boards: [
    {
      "id": 123,
      "name": "This is my card"
    },
    {
      "id": 456,
      "name": "Somenone created this card"
    }
  ]
}
```

Desta maneira é possível transformar a estrutura do JSON utilizando os placehoders, essa transformação é aplicada quando o plugin fizer a requisição para o backend e também quando recebe uma resposta do backend.

### Placeholders do plugin

Todas as informações utilizadas dentro do Plugin podem ser acessadas por meio dos placeholders  descritos abaixo (os placeholders são case sensitive):

- Informações do quadro:
  - Id do quadro: board.id
  - Nome do quadro: board.name
- Informações da lista:
  - Id da lista: list.id
  - Nome da lista: list.name
  - Id do quadro que a lista está inserida: list.idBoard
  - Posição da lista: list.pos
  - Cor da lista: list.color
  - Lista está fechada: list.closed
- Informações do cartão:
  - Id do cartão: card.id
  - Nome do cartão: card.name
  - Descrição do cartão: card.desc
  - Lista que o cartão está inserido: card.list (com todas as informações da lista)
  - URL de acesso ao cartão: card.shortUrl
  - Prazo do cartão: card.due
  - Prazo concluído: card.dueComplete

_Obs: Esses placeholders permitem acessar diversas informações diferentes, porém, nem todas as informações podem estar disponíveis em uma determinada rota pois depende de como essas informações foram processadas dentro do Plugin._

### Como mudar a estrutura do JSON mantendo os dados

Abaixo está um simples exemplo de uma transformação. Observe que os dados da primeira coluna foram utilizados para preencher a estrutura definida na segunda coluna e o resultado é apresentado na terceira coluna.

<table>
  <thead>
    <tr>
      <th>Dados originais</th>
      <th>Nova estrutura</th>
      <th>Resultado final</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        {<br>
          &nbsp;&nbsp; "<span style="color: green">identity</span>": 1,<br>
          &nbsp;&nbsp; "<span style="color: orange">name</span>": "Teste"<br>
        }
      </td>
      <td>
        {<br>
          &nbsp;&nbsp; "id": "@{<span style="color: green">identity</span>}",<br>
          &nbsp;&nbsp; "nome": "@{<span style="color: orange">name</span>}"<br>
        }
      </td>
      <td>
        {<br>
          &nbsp;&nbsp; "id": 1,<br>
          &nbsp;&nbsp; "nome": "Teste"<br>
        }
      </td>
    </tr>
  </tbody>
</table>

Mais uma vez o plugin sabe que uma informação deve ser substituída por outra por meio dos caracteres `@{}`, e dentro das chaves deve-se informar o placeholder que contém a informação que será substituída. Neste


### Funcionalidades 

- **Conversão de Dados**: Recebe informações em formato JSON provenientes do SEI e as converte em uma estrutura utilizável para interação com o Trello. 

- **Mapeamento Flexível:** Permite definir uma estrutura personalizada para mapear os campos do SEI aos atributos do Trello (como nome do card, ID da lista, etc.).

- **Modularidade:** O código é organizado em módulos, facilitando manutenção e expansão.

### Objetivo da Integração

Essa lógica pode ser utilizada para sincronizar registros do SEI com tarefas ou cartões em quadros do Trello, mantendo campos essenciais como:

- ID do processo no SEI.

- Nome ou título do documento. 

- Nome da lista no Trello.

- ID da lista no Trello.

## Exemplo de Conversão

Abaixo temos um exemplo prático de como a função `getObjectData` pode ser utilizada para transformar dados do SEI em uma estrutura compatível com o Trello:

```js
import { getObjectData } from './src/js/model/objectconversion.js';

const estrutura = {
    identity: "@{id}",
    nome: "@{name}",
    listname: "@{project.listname}",
    listId: "@{project.listId}",
};

const dados = {
    id: 1,
    name: "Teste",
    project: {
        listname: "ENTRADA",
        listId: 1
    }
};

console.log("Teste");
console.log(getObjectData(estrutura, dados));
```
### Saída esperada: 
``` json
{
  "identity": 1,
  "nome": "Teste",
  "listname": "ENTRADA",
  "listId": 1
}
```
### Conclusão  
- **Estrutura:** Define como os dados devem ser mapeados e renomeados. A sintaxe @{} indica qual valor será extraído.

- **Dados:** Contém os dados originais (por exemplo, vindos do SEI).

- **getObjectData:** Realiza a substituição dinâmica e devolve um novo objeto com os campos renomeados conforme o mapeamento definido!

## Outro modo de utilização, com array:

### Funcionalidade 

**A função getObjectData recebe dois parâmetros:**

Estrutura: Um objeto que define o formato desejado, contendo placeholders no formato @{caminho} que indicam onde os valores do objeto de dados devem ser inseridos.
dados: O objeto que contém os valores reais a serem mapeados para a estrutura.
A função percorre a estrutura, substitui os placeholders pelos valores correspondentes do objeto dados e retorna um novo objeto formatado. Suporta objetos aninhados e arrays, permitindo a extração de múltiplos valores de listas.

### Exemplo de Uso

**Abaixo está um exemplo de como utilizar a função getObjectData:**

``` js
import { getObjectData } from './src/js/model/objectConversion.js';

// Definindo a estrutura com placeholders
const estrutura = {
  identity: "@{id}",
  nome: "@{name}",
  info: [
    {
      cidade: "@{info.city}",
      idade: "@{info.age}",
      rua: "@{info.street}"
    },
  ],
  cidades: ["@{info.city}"],
  idades: ["@{info.age}"],
  ruas: ["@{info.street}"],
};

// Objeto de dados de entrada
const dados = {
  id: 1,
  name: "Teste",
  info: [
    {
      city: "Brasília",
      age: 30,
      street: "Rua Teste"
    },
    {
      city: "Goiania",
      age: 25,
      street: "Rua Centro"
    },
    {
      city: "São Paulo",
      age: 35,
      street: "Rua São Paulo"
    }
  ]
};

// Executando a conversão
console.log("Dados:", getObjectData(estrutura, dados)); 

```

### Observações: 

- Os placeholders na estrutura devem corresponder aos caminhos válidos no objeto dados. Caso um caminho não exista, o valor será substituído por undefined.
- Arrays na estrutura são processados para mapear todos os elementos correspondentes no objeto dados, como visto no exemplo com cidades, idades e ruas.