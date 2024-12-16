const values = {
    routes: "routes"
}

export const isInitializedRoutes = async () => {
    const routes = await chrome.storage.sync.get([values.routes]);
    return routes.routes !== undefined && Array.isArray(routes.routes) && routes.routes.length > 0;
}

export const clearRoutes = async () => {
    await chrome.storage.sync.remove([values.routes]);
}

export const listRoutes = async () => {
    let routes = await chrome.storage.sync.get([values.routes]);
    routes.routes.forEach(element => {
        console.log("Route list: %o", element);
    });
}

export const saveRoute = async (routeId, routeURL, routeBody) => {
    console.log("Novão!");
    let routes = await chrome.storage.sync.get([values.routes]);
    routes = routes.routes;
    if (!Array.isArray(routes)) {
        routes = [];
    }
    routes.push({id: routeId, url: routeURL, body: routeBody});
    await chrome.storage.sync.set({"routes": routes});
};

export const getRoute = async (routeId) => {
    const routes = await chrome.storage.sync.get([values.routes]);
    return routes.find((route) => route.id === routeId);
};