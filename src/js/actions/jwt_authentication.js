import axios from 'axios';

//const popUpOptions = "width=700,height=600,resizable=yes,scrollbars=yes";

export const openJWTPopup = async (authUrl, desktopsSelect) => {
    console.log("Opening JWT Popup with URL: %o", authUrl);
    return new Promise(async (resolve, reject) => {
        authUrl = sanitizeUrl(authUrl);
        if (!authUrl) {
            alert.error("Não foi possível fazer a autenticação do usuário pois a URL informada é inválida.");
        }
        console.log("Before code verifier");
        const codeVerifier = generateCodeVerifier();
        console.log("Verifier: %o", codeVerifier);
        console.log("Before code challenge");
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        console.log("Challenge: %o", codeChallenge);
        const fullAuthUrl = new URL(authUrl);
        fullAuthUrl.searchParams.set("response_type", "code");
        fullAuthUrl.searchParams.set("client_id", "chrome_extension");
        fullAuthUrl.searchParams.set("code_challenge", codeChallenge);
        fullAuthUrl.searchParams.set("code_challenge_method", "S256");
        console.log("Auth URL: %o", fullAuthUrl.toString());
        
        chrome.identity.launchWebAuthFlow(
            {
                url: fullAuthUrl.toString(),
                interactive: true
            },
            function (redirectUrl) {
                if (chrome.runtime.lastError) {
                    //console.log("Erro ao abrir a janela de autenticação: %o", chrome.runtime.lastError);
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                if (!redirectUrl) {
                    //console.log("A URL de redirecionamento não foi retornada.");
                    reject("A URL de redirecionamento não foi retornada.");
                    return;
                }
                saveAuthUrl(authUrl);
                const urlParams = new URLSearchParams(new URL(redirectUrl).search);
                const code = urlParams.get('code');
                if (code === null) {
                    reject("O código de autenticação não foi retornado.");
                    return;
                }
                console.log("Código de autenticação: %o", code);
                axios.get(`http://localhost:5055/auth/oauth/gettoken/?code=${code}&grant_type=token&code_verifier=${codeVerifier}`)
                .then((response) => {
                    console.log("Response data: %o", response.data);
                    updateJWTToken(response.data.token, response.data.domain)
                    .then(() => {
                        console.log("Token armazenado com sucesso para o domínio %o", response.data.domain);
                        resolve(true);
                    })
                    .catch((error) => {
                        reject(error);
                    });
                })
                .catch((error) => {
                    console.log("Erro ao tentar enviar requisição: %o", error);
                    reject(error);
                });
            }
        );

        /*******************************************************
        *                   OLD CODE
        ********************************************************/
        // const messageHandler = (event) => handleAuthResponse(event, authUrl, desktopsSelect, resolve, reject);
        // window.addEventListener('message', messageHandler, { once: true });
        // window.open(authUrl, 'popupWindow', popUpOptions);
    });
};

function base64urlencode(str) {
    try {
        return window.btoa(String.fromCharCode(...new Uint8Array(str)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (e) {
        return btoa(String.fromCharCode(...new Uint8Array(str)))
               .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
}

function generateCodeVerifier() {
    return base64urlencode(crypto.getRandomValues(new Uint8Array(32)));
}

async function generateCodeChallenge(codeVerifier) {
    try {
        const msgBuffer = new TextEncoder().encode(codeVerifier);
        const digest = await crypto.subtle.digest('SHA-256', msgBuffer);
        console.log("Digest: %o", digest);
        return base64urlencode(digest);
    } catch (e) {
        console.error("Erro ao gerar o code challenge: %o", e);
        throw e;
    }
}

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
        saveAuthUrl(authUrl);
        await updateJWTToken(event.data.token, event.data.destinyDomain);
    }
    resolve();
};

const saveAuthUrl = (authUrl) => {
    chrome.storage.sync.set({ authUrl: authUrl });
    console.log("Auth URL saved: %o", authUrl);
};

const updateJWTToken = async (token, destinyDomain) => {
    return new Promise((resolve, reject) => {
        const encodedToken = JSON.stringify({ token: token });
        let exp;
        try {
            exp = JSON.parse(window.atob(token.split('.')[1])).exp;
        } catch (e) {
            exp = JSON.parse(atob(token.split('.')[1])).exp;
        }
        const data = {
            from: "options",
            action: "setCookie",
            destinyDomain: destinyDomain,
            encodedToken: encodedToken,
            exp: exp
        };

        chrome.runtime.sendMessage(data, (response) => {
            if (response.success) {
                resolve();
            } else {
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