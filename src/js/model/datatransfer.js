import { TOKEN_REGEX, getKeyValue } from "./objectconversion";

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

    getLabel() {
        if (this.data.label == undefined) {
            this.data.label = {};
        }
        return this.data.label;
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

    setBoardName(boardName) {//
        this.getBoard().name = boardName;
        return this;
    }

    setBoardId(boardId) {//
        this.getBoard().id = boardId;
        return this;
    }

    setListId(id) {//
        this.getList().id = id;
        return this;
    }

    setListName(name) {//
        this.getList().name = name;
        return this;
    }

    setListIdBoard(idBoard) {//
        this.getList().idBoard = idBoard;
        return this;
    }

    setListPos(pos) {//
        this.getList().pos = pos;
        return this;
    }

    setListColor(color) {//
        this.getList().color = color;
        return this;
    }

    setListClosed(closed) {//
        this.getList().closed = closed;
        return this;
    }

    setListDatasource(datasource) {
        this.getList().datasource = datasource;
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

    setCardId(boardId) {//
        this.getCard().id = boardId;
        return this;
    }

    setCardName(name) {//
        this.getCard().name = name;
        return this;
    }

    setCardDesc(desc) {//
        this.getCard().desc = desc;
        return this;
    }
    
    setCardProcessNumber(processNumber) {
        this.getCard().processNumber = processNumber;
        return this;
    }

    setCardList(list) {//
        this.getCard().list = list;
        return this;
    }

    setCardShortUrl(shortUrl) {//
        this.getCard().shortUrl = shortUrl;
        return this;
    }

    setCardDue(due) {//
        this.getCard().due = due;
        return this;
    }

    setCardDueComplete(dueComplete) {//
        this.getCard().dueComplete = dueComplete;
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

    setCardChecklistItemId(name) {
        this.getCardChecklistItem().id = name;
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

    setLabelId(labelId) {
        this.getLabel().id = labelId;
        return this;
    }

    setLabelName(labelName) {
        this.getLabel().name = labelName;
        return this;
    }

    setLabelColor(labelColor) {
        this.getLabel().color = labelColor;
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
        while (originalString.match(TOKEN_REGEX)) {
            const key = originalString.match(TOKEN_REGEX)[1];
            let newValue = getKeyValue(this.data, key);
            console.log(`Transforming key: ${key} with value: ${newValue}`);
            if (typeof newValue === 'string') {
                newValue = newValue.replaceAll("\n", "\\n");
            }
            if (typeof newValue === 'string')
                originalString = originalString.replace(`@{${key}}`, newValue);
            else {
                if (originalString.indexOf(`"@{${key}}"`) != -1)
                    originalString = originalString.replace(`"@{${key}}"`, newValue);
                else
                    originalString = originalString.replace(`@{${key}}`, newValue);
            }
        }
        return originalString;
    }

    getNewValue(key, newValue) {
        return new RegExp(key, 'g'), newValue.replace(/\\/g, '\\\\');
    }
}

export default DataTransfer;