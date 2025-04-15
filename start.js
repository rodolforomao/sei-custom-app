import { getObjectData } from './src/js/model/objectConversion.js';

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
        ruas: ["@{info.street}"]
};

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
console.log("Dados:", getObjectData(estrutura, dados)); 