import { Cookie, cookie, getFromToken, refreshToken } from "../../init.js";
let token, params, serverUri, account, casette, firstData, defaultData;
const retryButton = `<a href="${window.location}">再試行</a>`;

$(async function () {
    // defaultData = $("#viewer").html();
    // firstData = toDate();

    token = cookie.get("token")?.access_token;
    account = await getFromToken(token).fail(() => cookie.delete("token"));

    if (account && account.message) {
        account = undefined;
    }
    
    console.log("account:", account);
    
    params = new URLSearchParams(window.location.search);
    serverUri = "wss://api.un-known.xyz:22005";
    if (params.has("local1")) serverUri = "ws://127.0.0.1:22004";
    if (params.has("local2")) serverUri = "ws://192.168.1.42:22004";
    if (params.has("local3")) serverUri = "ws://192.168.1.45:22004";
    if (params.has("dev")) serverUri = "ws://dev.un-known.xyz:22004";
    if (params.has("unsecure")) serverUri = "ws://api.un-known.xyz:22004";

    

    // if (cookie.has("token")) {
    //     token = cookie.get("token")?.access_token;
    //     getFromToken(token)
    //         .then((json) => {
    //             account = json;
    //             console.log(account);

    //             params = new URLSearchParams(window.location.search);
    //             serverUri = "https://api.un-known.xyz:22003";
    //             if (params.has("local1")) serverUri = "http://127.0.0.1:22004";
    //             if (params.has("local2")) serverUri = "http://192.168.1.42:22004";
    //             if (params.has("local3")) serverUri = "http://192.168.1.45:22004";
    //             if (params.has("dev")) serverUri = "http://dev.un-known.xyz:22004";
    //             if (params.has("unsecure")) serverUri = "http://api.un-known.xyz:22004";

    //             if (!params.has("id")) window.location.href = "./index.html" + window.location.search;
    //             if (!account || !token) window.location.href = "/login.html?redirect=" + window.location.href;

    //             getConfig();
    //         })
    //         .fail(() => cookie.delete("token"));
    // } else window.location.href = "/login.html?redirect=" + window.location.href;

});