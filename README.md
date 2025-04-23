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

### Como transformar a estrutura do JSON mantendo os dados

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
          &nbsp;&nbsp; "identity": 1,<br>
          &nbsp;&nbsp; "name": "Teste"<br>
        }
      </td>
      <td>
        {<br>
          &nbsp;&nbsp; "id": "@{identity}",<br>
          &nbsp;&nbsp; "nome": "@{name}"<br>
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

Mais uma vez, o plugin sabe que uma informação deve ser substituída por outra por meio dos caracteres `@{}`, e dentro das chaves deve-se informar o placeholder que contém a informação que será substituída. Neste

### Transformando a estrutura utilizando arrays

#### Quando o JSON começa com um array

Quando os dados originais são formados por um array na raiz do JSON utilizamos a palavra `this` como placeholder para indicar esta situação ao plugin, assim ele saberá que o JSON inicia com um array.

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
        [<br>
          &nbsp;&nbsp; {<br>
            &nbsp;&nbsp;&nbsp;&nbsp; "identity": 1,<br>
            &nbsp;&nbsp;&nbsp;&nbsp; "name": "First Card"<br>
          &nbsp;&nbsp; },<br>
          &nbsp;&nbsp; {<br>
            &nbsp;&nbsp;&nbsp;&nbsp; "identity": 2,<br>
            &nbsp;&nbsp;&nbsp;&nbsp; "name": "Second Card"<br>
          &nbsp;&nbsp; },<br>
          &nbsp;&nbsp; {<br>
            &nbsp;&nbsp;&nbsp;&nbsp; "identity": 3,<br>
            &nbsp;&nbsp;&nbsp;&nbsp; "name": "Third Card"<br>
          &nbsp;&nbsp; }<br>
        ]
      </td>
      <td>
        [<br>
          &nbsp;&nbsp; {<br>
            &nbsp;&nbsp;&nbsp;&nbsp; "id": "@{this.identity}",<br>
            &nbsp;&nbsp;&nbsp;&nbsp; "nome": "@{this.name}"<br>
          &nbsp;&nbsp;&nbsp;&nbsp; }<br>
        ]
      </td>
      <td>
        [<br>
          &nbsp;&nbsp;&nbsp;&nbsp; {<br>
            &nbsp;&nbsp; "id": 1,<br>
            &nbsp;&nbsp; "nome": "First Card"<br>
          &nbsp;&nbsp;&nbsp;&nbsp; },<br>
          &nbsp;&nbsp;&nbsp;&nbsp; {<br>
            &nbsp;&nbsp; "id": 2,<br>
            &nbsp;&nbsp; "nome": "Second Card"<br>
          &nbsp;&nbsp;&nbsp;&nbsp; },<br>
          &nbsp;&nbsp;&nbsp;&nbsp; {<br>
            &nbsp;&nbsp; "id": 3,<br>
            &nbsp;&nbsp; "nome": "Third Card"<br>
          &nbsp;&nbsp;&nbsp;&nbsp; }<br>
        ]
      </td>
    </tr>
  </tbody>
</table>

#### Transformando um array de objetos em outro array de objetos

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
          &nbsp;&nbsp; "listId": 123,<br>
          &nbsp;&nbsp; "listName": "TODO",<br>
          &nbsp;&nbsp; "cards": [<br>
            &nbsp;&nbsp;&nbsp;&nbsp; {<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "identity": 1,<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "name": "First Card"<br>
            &nbsp;&nbsp;&nbsp;&nbsp; },<br>
            &nbsp;&nbsp;&nbsp;&nbsp; {<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "identity": 2,<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "name": "Second Card"<br>
            &nbsp;&nbsp;&nbsp;&nbsp; },<br>
            &nbsp;&nbsp;&nbsp;&nbsp; {<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "identity": 3,<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "name": "Third Card"<br>
            &nbsp;&nbsp;&nbsp;&nbsp; }<br>
          &nbsp;&nbsp; ]<br>
        }
      </td>
      <td>
        {<br>
          &nbsp;&nbsp; "lista": "@{listId}",<br>
          &nbsp;&nbsp; "cartoes": [<br>
            &nbsp;&nbsp;&nbsp;&nbsp; {<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "id": "@{cards.identity}",<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "nome": "@{cards.name}"<br>
            &nbsp;&nbsp;&nbsp;&nbsp;}<br>
          &nbsp;&nbsp;]<br>
        }
      </td>
      <td>
        {<br>
          &nbsp;&nbsp; "lista": 123,<br>
          &nbsp;&nbsp; "cartoes": [<br>
            &nbsp;&nbsp;&nbsp;&nbsp; {<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "id": 1,<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "nome": "First Card"<br>
            &nbsp;&nbsp;&nbsp;&nbsp; },<br>
            &nbsp;&nbsp;&nbsp;&nbsp; {<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "id": 2,<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "nome": "Second Card"<br>
            &nbsp;&nbsp;&nbsp;&nbsp; },<br>
            &nbsp;&nbsp;&nbsp;&nbsp; {<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "id": 3,<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "nome": "Third Card"<br>
            &nbsp;&nbsp;&nbsp;&nbsp; }<br>
          &nbsp;&nbsp; ]<br>
        }
      </td>
    </tr>
  </tbody>
</table>

#### Transformando um array de objetos em um array de tipos primitivos

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
          &nbsp;&nbsp; "listId": 123,<br>
          &nbsp;&nbsp; "listName": "TODO",<br>
          &nbsp;&nbsp; "cards": [<br>
            &nbsp;&nbsp;&nbsp;&nbsp; {<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "identity": 1,<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "name": "First Card"<br>
            &nbsp;&nbsp;&nbsp;&nbsp; },<br>
            &nbsp;&nbsp;&nbsp;&nbsp; {<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "identity": 2,<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "name": "Second Card"<br>
            &nbsp;&nbsp;&nbsp;&nbsp; },<br>
            &nbsp;&nbsp;&nbsp;&nbsp; {<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "identity": 3,<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "name": "Third Card"<br>
            &nbsp;&nbsp;&nbsp;&nbsp; }<br>
          &nbsp;&nbsp; ]<br>
        }
      </td>
      <td>
        {<br>
          &nbsp;&nbsp; "lista": "@{listId}",<br>
          &nbsp;&nbsp; "idCartoes": ["@{cards.identity}"]<br>
        }
      </td>
      <td>
        {<br>
          &nbsp;&nbsp; "lista": 123,<br>
          &nbsp;&nbsp; "cartoes": [1, 2, 3]<br>
        }
      </td>
    </tr>
  </tbody>
</table>

## Configurando as rotas do backend

Na página de configuração do plugin você poderá configurar as rotas para o backend com as seguintes informações:

- URL: A URL do backend que será feita a requisição
- Verbo: Qual verbo será usado na requisição para a rota (GET, POST, ...)
- Request Body: Define quais valores serão enviados para o backend ao fazer a requisição
   - Atenção: Para o verbo GET os valores serão enviados na URL via query parameters, para os outros verbos, os valores serão enviados no body da requisição.
- Response Data: Define como os valores que retornam do servidor serão transformados no formato aceito pelo plugin.

Veja abaixo um exemplo da configuração da rota que consulta quadros pelo nome

TODO: Adicionar aqui uma imagem com o exemplo da configuração da rota.

### Configuração da URL

Na página de configuração do plugin você encontrar uma lista de várias rotas que são utilizadas para o plugin funcionar corretamente. A configuração da URL é muito simples, basta adicionar no campo da URL o endereço da rota que exerce a função descrita na rota. Na página de configuração a rota tem um breve título que descreve a sua função, para mais detalhes sobre cada rota, leia os tópicos abaixo.

Importante notar que é possível utilizar os placeholders na URL da rota, permitindo assim que o endereço da rota seja alterado dinamicamente pelo plugin. Por exemplo `https://meubackend.com.br/board/@{board.id}/lists`, o placeholder `board.id` será devidamente substituído pelo id do quadro que está sendo requisitado.

### JSON de resposta do backend

Segue abaixo todas as rotas que devem ser configuradas para que o plugin funcione corretamente e como ele espera que seja a resposta do backend.

#### Rota 1 - Recuperar todos os quadros

Esta rota lista todos os quadros que o usuário tem acesso. Um quadro é composto por várias listas e uma lista pode ter zero ou mais cartões.

```
{
  "boards": [
    {
      "id": "@{}",
      "name": "@{}"
    }
  ]
}
```

#### Rota 2 - Consultar quadros por nome

Esta rota recebe uma string como parâmetro e retorna todos os quadros que o usuário tem acesso e que contém a string indicada no nome do quadro.

O placeholder que contém a string a ser pesquisada é `board.name`.

```
{
  "boards":[
    {
      "id":"@{this.id}",
      "name":"@{this.name}"
    }
  ]
}
```

#### Rota 3 - Criar quadro

TODO: Documentar

```

```

#### Rota 4 - Recuperar listas de um quadro

Esta rota é responsável por retornar todas as listas dentro de um quadro, o quadro que está sendo requisitado pode ser acessado pelo placeholder `board.id` e pode ser informado na URL ou no Request Body, como ficar melhor na rota.

```
{
  "lists":[
    {
      "id":"@{this.id}",
      "name":"@{this.name}"
    }
  ]
}
```

#### Rota 5 - Criar lista

TODO: Documentar

```

```

#### Rota 6 - Consultar cartões por nome

Esta rota recebe uma string como parâmetro e retorna todos os cartões que o usuário tem acesso e que contém a string indicada no nome do quadro.

O placeholder que contém a string a ser pesquisada é `card.desc`.

```
{
  "cards":[
    {
      "id":"@{}",
      "name":"@{}",
      "desc":"@{}",
      "labels":[
        {
          "id":"@{}",
          "color":"@{}",
          "name":"@{}"
        }
      ],
      "due":"@{}",
      "dueComplete":"@{}",
      "shortUrl":"@{}",
      "idChecklists":["@{}"],
      "seiNumbers":["@{}"]
    }
  ]
}
```

Atenção: O campo `seiNumber` deve contar uma lista com o número SEI dos processos associados a este cartão, desta maneira o plugin consegue identificar se um processo já está cadastrado no backend ou não.

#### Rota 7 - Consultar cartões de um quadro

Pesquisa todos os cartões de um quadro.

```
[
  {
    "name":"@{}",
    "id":"@{}",
    "board": {
      "id":"@{}",
      "name":"@{}"
    },
    "cards": [
      {
        "id":"@{}",
        "name":"@{}",
        "desc":"@{}",
        "labels":[
          {
            "id":"@{}",
            "color":"@{}",
            "name":"@{}"
          }
        ],
        "due":"@{}",
        "dueComplete":"@{}",
        "shortUrl":"@{}",
        "idChecklists":["@{}"],
        "seiNumbers":["@{}"]
      }
    ]
  }
]
```

Atenção: O campo `seiNumber` deve contar uma lista com o número SEI dos processos associados a este cartão, desta maneira o plugin consegue identificar se um processo já está cadastrado no backend ou não.

#### Rota X - 

AAA

```

```

#### Rota X - 

AAA

```

```

#### Rota X - 

AAA

```

```

## Autenticação do backend