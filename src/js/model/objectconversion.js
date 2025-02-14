/**
 * @global
 * @type {RegExp}
 * @description Regex que captura o token de chave de um objeto, o TOKEN começa com "@{" e termina com "}"
 */
export const TOKEN_REGEX = /@\{([^}]+)\}/;

/**
 * @global
 * @type {RegExp}
 * @description Regex que verifica se uma string contém '[' e ']'
 */
// const arrayBracketsRegex = /\[.*?\]/;
const arrayBracketsRegex = /\[(\d+)\]/;

/**
 * @global
 * @type {string}
 * @description Prefixo do token que identifica uma chave de objeto
 */
const TOKEN_PREFIX = "@{";

/**
 * @global
 * @type {string}
 * @description Sufixo do token que identifica uma chave de objeto
 */
const TOKEN_SUFFIX = "}";

/**
 * @global
 * @type {string}
 * @description String utilizada para separar os campos dentro do TOKEN
 */
const TOKEN_SEPARATOR = ".";

/**
 * @global
 * @type {string}
 * @description Identificador utilizado para saber se a chave de um array é a raiz do array
 */
const ARRAY_ROOT_IDENTIFIER = "this";

/**
 * Este método transforma um objeto de dados em outro objeto de dados, seguindo uma estrutura de conversão
 * @param {Object} conversionStruct Este é o objeto que contém a estrutura de conversão, ou seja, após a conversão o retorno será um objeto com a mesma estrutura deste objeto
 * @param {Object} conversionData Objeto que contém os dados que serão a fonte da conversão
 * @returns {Object} Retorna um objeto com a estrutura definida em conversionStruct, preenchido com os dados de conversionData
 */
export const getObjectData = (conversionStruct, conversionData) => {
    let returnObj = {};
    for (let key in conversionStruct) {
        // Verifica se o valor pertence ao objeto ou se foi herdado (os valores herdados não nos interessam)
        if (!conversionStruct.hasOwnProperty(key))
            continue;
        // Se o valor está nulo vamos usar nulo
        if (conversionStruct[key] === null) {
            returnObj[key] = null;
            continue;
        }
        // Verifica se o valor é um objeto, se não for simplesmente retorna o valor
        if (typeof conversionStruct[key] !== 'object') {
            returnObj[key] = getFieldData(conversionData, conversionStruct[key]);
            continue;
        }
        // Verifica se o valor é um array, se for, chama o método que trata arrays
        if (Array.isArray(conversionStruct[key])) {
            returnObj[key] = getArrayData(conversionStruct[key], conversionData);
        // Aqui sabemos que o objeto é um objeto normal, então monta o objeto de forma recursiva
        } else {
            returnObj[key] = getObjectData(conversionStruct[key], conversionData);
        }
    }
    return returnObj;
};

/**
 * Este método cria um array a partir de um objeto de dados
 * @param {Object} arrayStruct objeto que contém a estrutura do array
 * @param {Object} conversionData objeto que contém os dados que serão a fonte da conversão
 * @returns {Array} Retorna um array com a estrutura definida em arrayStruct, preenchido com os dados de conversionData
 */
export const getArrayData = (arrayStruct, conversionData) => {
    // Se não tem dados no arrayStruct, retorna um array vazio
    if (arrayStruct.length === 0)
        return [];
    // Pega a chave do array baseado no primeiro valor do objeto de dados
    const arrayKey = getArrayKey(arrayStruct);
    // Como os dados que vem do arrayStruct são apenas uma estrutura, o que nos interessa é a primeira posição do array
    const dataStruct = arrayStruct[0];
    const originalKey = (typeof dataStruct) === 'object' ? Object.values(dataStruct)[0] : arrayKey;
    // Verifica se foi indicada a posição do array
    const arrayPos = checkFlattenArray(originalKey);
    // Transforma a estrutura do array em string para poder fazer a substituição da chave do array
    const conversionString = JSON.stringify(dataStruct);
    let searchString = arrayKey + TOKEN_SEPARATOR;
    const newConversion = JSON.parse(conversionString.replaceAll(searchString, TOKEN_PREFIX));
    // Aqui é onde realmente monta o array a partir dos dados tratados
    let returnArray = [];
    let arrayData = getArrayDataToIterate(conversionData, arrayKey, arrayPos);
    for (let arrayItem of arrayData) {
        if (typeof dataStruct === 'object')
            returnArray.push(getObjectData(newConversion, arrayItem));
        else
            returnArray.push(getFieldData(arrayItem, newConversion));
    }
    return returnArray;
}

/**
 * Pesquisa a primeira chave válida de um array dentro da nova estrutura de conversão
 * @param {Array} arrayStruct Objeto contendo a definição da estrutura do Array que será montado
 * @returns {String} Retorna a primeira ocorrência válida da chave do array
 */
function getArrayKey(arrayStruct) {
    // Como os dados que vem do arrayStruct são apenas uma estrutura, começamos a pesquisa pela primeira posição da estrutura
    let dataStruct = arrayStruct;
    // Pega a chave do array baseado no primeiro valor válido dentro da estrutura de retorno
    while (Array.isArray(Object.values(dataStruct[0])[0]))
        dataStruct = Object.values(dataStruct[0])[0];
    let arrayKey = Object.values(dataStruct[0]).find((item) => item.startsWith(TOKEN_PREFIX));
    if (!arrayKey) {
        if (dataStruct[0].startsWith(TOKEN_PREFIX))
            arrayKey = dataStruct[0];
        else
            throw new Error("Não foi encontrada uma chave válida na estrutura do JSON de resposta");
    }
    arrayKey = arrayKey.split(TOKEN_SEPARATOR);
    // Verifica se o Array é a raiz do objeto
    if (arrayKey[0] === (TOKEN_PREFIX + ARRAY_ROOT_IDENTIFIER)) {
        arrayKey = TOKEN_PREFIX + ARRAY_ROOT_IDENTIFIER;
    } else {
        arrayKey = arrayKey.slice(0, -1).join(TOKEN_SEPARATOR);
    }
    return arrayKey;
}

/**
 * Função para recuperar os dados que serão percorridos no array dentro de um objeto a partir de uma string que indica onde está o array dentro do objeto
 * @param {Object} conversionData Objeto com os dados do Array que será percorrido
 * @param {String} arrayKey Chave do objeto onde está o array com os dados que serão percorridos
 * @param {int} arrayPos Caso deseje apenas 1 posição do array informe a posição desejada
 * @returns Um array com os dados que serão percorridos
 */
function getArrayDataToIterate(conversionData, arrayKey, arrayPos = null) {
    if (arrayPos !== null && Number.isInteger(arrayPos)) {
        arrayKey = arrayKey.slice(0, -3);
    }
    if (arrayKey.startsWith(TOKEN_PREFIX + ARRAY_ROOT_IDENTIFIER)) {
        return arrayPos !== null ? conversionData.slice(arrayPos, arrayPos + 1) : conversionData;
    }
    const arrayData = getFieldData(conversionData, arrayKey + TOKEN_SUFFIX);
    return arrayPos !== null ? arrayData.slice(arrayPos, arrayPos + 1) : arrayData;
}

/**
 * Método que verifica se a chave do array contém a indicação da posição de um array e retorna a posição do array
 * @param {arrayKey} arrayKey Essa é a chave do array que será verificada
 * @returns [boolean, int] Retorna um array com dois valores, o primeiro é um booleano que indica se a chave do array contém indicação de posição, o segundo é a posição do array
 */
function checkFlattenArray(arrayKey) {
    // A string tem indicação de posição do array?
    if (!arrayBracketsRegex.test(arrayKey)) {
        // Se não tem posicionamento do array, retorna nulo
        return null;
    }
    // Se está dentro do padrão do TOKEN, recupera o valor corresponde ao TOKEN
    const arrayPos = arrayKey.match(arrayBracketsRegex)[1];
    return parseInt(arrayPos, 10);
}

/**
 * Método que extrai o valor de um objeto de dados baseado em uma chave
 * @param {Object} dataObj objeto que contém os dados de onde será extraído o valor
 * @param {String} dataKey chave que será usada para buscar o valor no objeto de dados
 * @returns {Object} Retorna o valor que foi extraído do objeto de dados
 */
export const getFieldData = (dataObj, dataKey) => {
    // A string está dentro do padrão do TOKEN?
    if (!TOKEN_REGEX.test(dataKey)) {
        // Se não está dentro do padrão do TOKEN retorna o próprio valor informado
        return dataKey;
    }
    // Se está dentro do padrão do TOKEN, recupera o valor corresponde ao TOKEN
    const keyValue = dataKey.match(TOKEN_REGEX)[1];
    return getKeyValue(dataObj, keyValue);
};

/**
 * Método que extrai um valor de um objeto de dados baseado em uma chave em formato de string
 * @param {Object} dataObj objeto que contém os dados de onde será extraído o valor
 * @param {String} key chave que será usada para buscar o valor no objeto de dados, pode ser uma chave composta (ex: "chave1.chave2.chave3")
 * @returns {Object} Retorna o valor que foi extraído do objeto de dados, caso a chave não seja encontrada no valor retorna null
 */
export const getKeyValue = (dataObj, key) => {
    // Separa a chave composta em um array
    const keys = key.split('.');
    let value = dataObj;
    // Itera sobre o array de chaves para buscar o valor
    for (let k of keys) {
        if (value[k] !== undefined) {
            value = value[k];
        } else {
            return null;
        }
    }
    return value;
}