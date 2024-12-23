/**
 * Classe que ajuda a transferir dados do quadro, lista e cartão entre diferentes partes do código.
 */

class DataTransfer {
    constructor() {
        this.data = {};
    }

    getBoard() {   
        if (this.data.board == undefined) {
            this.data.board = {};
        }
        return this.data.board;
    }

    getList() {
        if (this.data.list == undefined) {
            this.data.list = {};
        }
        return this.data.list;
    }

    getCard() {
        if (this.data.card == undefined) {
            this.data.card = {};
        }
        return this.data.card;
    }

    getCardChecklist() {
        if (this.getCard().checklist == undefined) {
            this.getCard().checklist = {};
        }
        return this.getCard().checklist;
    }

    getCardChecklistItem() {
        if (this.getCardChecklist().item == undefined) {
            this.getCardChecklist().item = {};
        }
        return this.getCardChecklist().item;
    }

    setBoardName(boardName) {
        this.getBoard().name = boardName;
        return this;
    }

    setBoardId(boardId) {
        this.getBoard().id = boardId;
        return this;
    }

    setListClosed(closed) {
        this.getList().closed = closed;
        return this;
    }

    setListColor(color) {
        this.getList().color = color;
        return this;
    }

    setListDatasource(datasource) {
        this.getList().datasource = datasource;
        return this;
    }

    setListId(id) {
        this.getList().id = id;
        return this;
    }

    setListIdBoard(idBoard) {
        this.getList().idBoard = idBoard;
        return this;
    }

    setListName(name) {
        this.getList().name = name;
        return this;
    }

    setListPos(pos) {
        this.getList().pos = pos;
        return this;
    }

    setListSoftLimit(softLimit) {
        this.getList().softLimit = softLimit;
        return this;
    }

    setListSubscribed(subscribed) {
        this.getList().subscribed = subscribed;
        return this;
    }

    setListType(type) {
        this.getList().type = type;
        return this;
    }

    setCardDesc(desc) {
        this.getCard().desc = desc;
        return this;
    
    }

    setCardDue(due) {
        this.getCard().due = due;
        return this;
    }

    setCardDueComplete(dueComplete) {
        this.getCard().dueComplete = dueComplete;
        return this;
    }

    setCardId(boardId) {
        this.getCard().id = boardId;
        return this;
    }

    setCardChecklistId(checklistId) {
        this.getCardChecklist().id = checklistId;
        return this;
    }

    setCardChecklistName(checklistName) {
        this.getCardChecklist().name = checklistName;
        return this;
    }

    setCardLabels(labels) {
        this.getCard().labels = labels;
        return this;
    }

    setCardList(list) {
        this.getCard().list = list;
        return this;
    }

    setCardName(name) {
        this.getCard().name = name;
        return this;
    }

    setCardShortUrl(shortUrl) {
        this.getCard().shortUrl = shortUrl;
        return this;
    }

    setCardChecklistItemName(name) {
        this.getCardChecklistItem().name = name;
        return this;
    }

    setCardChecklistItemState(state) {
        this.getCardChecklistItem().state = state;
        return this;
    }

    setCardChecklistItemPos(position) {
        this.getCardChecklistItem().position = position;
        return this;
    }

    build() {
        return this.data;
    }

    /**
     * 
     * @param {String} originalString string que será utilizada na transformação. Quando a chave ${XXX} for encontrada, será substituída pelo valor correspondente deste objeto.
     * @returns {String} string transformada com os valores substituídos.
     */
    transformString(originalString) {
        while (originalString.match(/@\{([^}]+)\}/)) {
            const key = originalString.match(/@\{([^}]+)\}/)[1];
            originalString = originalString.replace(`@{${key}}`, this.getKeyValue(key));
        }
        return originalString;
    }

    /**
     * Função que faz a busca do valor correspondente a uma chave informada.
     * @param {String} key chave que será utilizada para buscar o valor no objeto. A chave pode ser composta por várias chaves separadas por ponto.
     * @returns {String} valor correspondente à chave informada, ou null caso a chave não exista.
     */
    getKeyValue(key) {
        const keys = key.split('.');
        let value = this.data;
        for (let k of keys) {
            if (value[k] !== undefined) {
                value = value[k];
            } else {
                return null;
            }
        }
        return value;
    }
}

export default DataTransfer;