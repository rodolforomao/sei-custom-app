const popUpOptions = "width=700,height=600,resizable=yes,scrollbars=yes";

export const openJWTPopup = async (authUrl, desktopsSelect) => {
    console.log("Opening JWT Popup with URL: %o", authUrl);
    return new Promise((resolve, reject) => {
        authUrl = sanitizeUrl(authUrl);
        if (!authUrl) {
            alert.error("Não foi possível fazer a autenticação do usuário pois a URL informada é inválida.");
        }

        // Abre a URL para o usuário fazer a autenticação e registra o evento que vai tratar o retorno do popup
        window.open(authUrl, 'popupWindow', popUpOptions);
        window.addEventListener('message', (event) => handleAuthResponse(event, authUrl, desktopsSelect, resolve, reject));
    });
};

const handleAuthResponse = async (event, authUrl, desktopsSelect, resolve, reject) => {
    const parsedUrl = new URL(authUrl);
    const allowedOrigin = parsedUrl.origin;
    // Verifica a origem da mensagem e desconsidera mensagens de outras origens
    if (event.origin !== allowedOrigin) {
        reject("Origem da mensagem não permitida: " + event.origin);
        return;
    }
    // Verifica se a mensagem tem dados
    if (!event.data) {
        reject("A URL informada não retornou os dados necessários para autenticação.");
        return;
    }

    if (event.data.desktops)
        updateDesktopsSelect(desktopsSelect, event.data.desktops);

    if (event.data.token) {
        await updateJWTToken(event.data.token, event.data.destinyDomain);
        saveAuthUrl(authUrl);
    }
    resolve();
};

const saveAuthUrl = (authUrl) => {
    chrome.storage.sync.set({ authUrl: authUrl });
};

const updateJWTToken = async (token, destinyDomain) => {
    return new Promise((resolve, reject) => {
        const encodedToken = JSON.stringify({ token: token });
        const exp = JSON.parse(window.atob(token.split('.')[1])).exp;
        const data = {
            from: "options",
            action: "setCookie",
            destinyDomain: destinyDomain,
            encodedToken: encodedToken,
            exp: exp
        };

        chrome.runtime.sendMessage(data, (response) => {
            if (response.success) {
                console.log("Response: %o", response);
                resolve();
            } else {
                console.log("Erro ao tentar enviar mensagem: %o", response.error);
                reject(response.error);
            }
        });
    });
};

const updateDesktopsSelect = (desktopsSelect, desktops) => {
    if (desktopsSelect === null)
        return;
    // Limpa as opções existentes
    desktopsSelect.innerHTML = "<option value=''>Selecione uma opção</option>";

    // Adiciona as novas opções vindas do `data.desktops`
    desktops.forEach(desktop => {
        const option = document.createElement("option");
        option.value = desktop.id;
        option.textContent = desktop.nameDesktop;
        desktopsSelect.appendChild(option);
    });
};

const sanitizeUrl = (url) => {
    url = url.trim();
    return url.endsWith("/") ? url.slice(0, -1) : url;
}