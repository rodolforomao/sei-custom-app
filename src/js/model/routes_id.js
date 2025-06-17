/**
 * @fileoverview Arquivo com os identificadores das rotas que serão utilizadas no plugin.
 * @author Túlio Marinho Guimarães
 * @date 2024-12-17
 */

/**
 * @typedef {Object} routesId - Lista de nomes que são utilizados para identificar os valores no espaço de armazenamento do plugin.
 */
const routesId = {
    searchAllBoards: {
        id: 1,
        shortdesc: "Recuperar todos os quadros",
        longdesc: "Rota utilizada para recuperar todos os quadros do usuário."
    },
    searchBoardsByName: {
        id: 2,
        shortdesc: "Consultar quadros por nome",
        longdesc: "Rota utilizada para recuperar os quadros do usuário que possuem um nome específico."
    },
    createBoard: {
        id: 3,
        shortdesc: "Criar quadro",
        longdesc: "Rota utilizada para criar um novo quadro."
    },
    getListsFromBoard: {
        id: 4,
        shortdesc: "Recuperar listas de um quadro",
        longdesc: "Rota utilizada para recuperar as listas de um quadro."
    },
    createList: {
        id: 5,
        shortdesc: "Criar lista",
        longdesc: "Rota utilizada para criar uma nova lista."
    },
    searchCards: {
        id: 6,
        shortdesc: "Consultar cartões por nome",
        longdesc: "Rota utilizada para recuperar os cartões do usuário que possuem um nome específico."
    },
    searchBoardCards: {
        id: 7,
        shortdesc: "Consultar cartões de um quadro",
        longdesc: "Rota utilizada para recuperar os cartões de um quadro."
    },
    getCardData: {
        id: 8,
        shortdesc: "Recuperar dados de um cartão",
        longdesc: "Rota utilizada para recuperar os dados de um cartão."
    },
    createCard: {
        id: 9,
        shortdesc: "Criar cartão",
        longdesc: "Rota utilizada para criar um novo cartão."
    },
    updateCard: {
        id: 10,
        shortdesc: "Atualizar cartão",
        longdesc: "Rota utilizada para atualizar as informações de um cartão."
    },
    deleteCard: {
        id: 11,
        shortdesc: "Deletar cartão",
        longdesc: "Rota utilizada para deletar um cartão."
    },
    getCardChecklistData: {
        id: 12,
        shortdesc: "Recuperar dados do checklist de um cartão",
        longdesc: "Rota utilizada para recuperar os dados do checklist de um cartão."
    },
    createCardChecklist: {
        id: 13,
        shortdesc: "Criar checklist",
        longdesc: "Rota utilizada para criar um novo checklist."
    },
    createCardChecklistItem: {
        id: 14,
        shortdesc: "Criar item de checklist",
        longdesc: "Rota utilizada para criar um novo item de checklist."
    },
    updateCardChecklistItem: {
        id: 15,
        shortdesc: "Atualizar item do checklist",
        longdesc: "Rota utilizada para atualizar um item do checklist."
    },
    updateCardChecklistItemPosition: {
        id: 16,
        shortdesc: "Atualizar posição de item do checklist",
        longdesc: "Rota utilizada para atualizar a posição de um item do checklist."
    },
    deleteCardChecklistItem: {
        id: 17,
        shortdesc: "Deletar item de checklist",
        longdesc: "Rota utilizada para deletar um item de checklist."
    },
    deleteCardChecklist: {
        id: 18,
        shortdesc: "Deletar checklist",
        longdesc: "Rota utilizada para deletar um checklist."
    },
    getBoardLabels: {
        id: 19,
        shortdesc: "Recuperar labels de um quadro",
        longdesc: "Rota utilizada para recuperar os labels de um quadro."
    },
    addLabelToCard: {
        id: 20,
        shortdesc: "Adicionar label a um cartão",
        longdesc: "Rota utilizada para adicionar um label a um cartão."
    },
    removeLabelFromCard: {
        id: 21,
        shortdesc: "Remover label de um cartão",
        longdesc: "Rota utilizada para remover um label de um cartão."
    },
}

export default routesId;