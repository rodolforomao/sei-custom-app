/**
 * @global
 * @type {RegExp}
 * @description Regex que captura o token de chave de um objeto
 */
export const TOKEN_REGEX = /@\{([^}]+)\}/;

/**
 * @global
 * @type {string}
 * @description Prefixo do token que identifica uma chave de objeto
 */
export const TOKEN_PREFIX = "@{";

/**
 * @global
 * @type {string}
 * @description Sufixo do token que identifica uma chave de objeto
 */
export const TOKEN_SUFFIX = "}";

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
        // Verifica se o valor é uma string, se for, basta pegar o valor que está no objeto de dados
        if (typeof conversionStruct[key] === 'string') {
            returnObj[key] = getFieldData(conversionData, conversionStruct[key]);
            continue;
        }
        // Verifica se o valor é um objeto, se não for, não nos interessa
        if (typeof conversionStruct[key] !== 'object' || conversionStruct[key] === null)
            continue;
        // Verifica se o valor é um array, se for, precisamos iterar sobre ele
        if (Array.isArray(conversionStruct[key])) {
            // O comando abaixo foi sugestão do VSCode, revisar
            returnObj[key] = getArrayData(conversionStruct[key], conversionData);
        // Aqui sabemos que o objeto é um objeto normal, então monta o objeto
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
    // Como os dados que vem do arrayStruct são apenas uma estrutura, o que nos interessa é a primeira posição do array
    const dataStruct = arrayStruct[0];
    // Pega a chave do array baseado no primeiro valor do objeto de dados
    let arrayKey = Object.values(dataStruct)[0];
    arrayKey = arrayKey.split('.').slice(0, -1).join('.');
    // Transforma a estrutura do array em string para poder fazer a substituição da chave do array
    const conversionString = JSON.stringify(dataStruct);
    const newConversion = JSON.parse(conversionString.replaceAll(arrayKey + ".", "@{"));
    // Aqui é onde realmente monta o array a partir dos dados tratados
    let returnArray = [];
    for (let arrayItem of getFieldData(conversionData, arrayKey + TOKEN_SUFFIX)) {
        returnArray.push(getObjectData(newConversion, arrayItem));
    }
    return returnArray;
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