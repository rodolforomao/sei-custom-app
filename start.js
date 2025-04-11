import { getObjectData } from './src/js/model/objectconversion.js';  

const estrutura = {
  usuarios: [
    {
      identity: "@{id}",
      nome: "@{name}",
      listname: "@{project.listname}",
      listId: "@{project.listId}"
    }
  ]
};

const dados = {
  usuarios: [
    {
      id: 1,
      name: "Teste",
      project: {
        listname: "ENTRADA",
        listId: 101
      }
    },
    {
      id: 2,
      name: "Teste 2",
      project: {
        listname: "SAÍDA", 
        listId: 102
      }
    },
  ]
};

console.log(getObjectData(estrutura, dados));



