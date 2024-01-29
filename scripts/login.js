import { CLIENT_ID, CLIENT_SECRET, Cookie, cookie, getFromToken, refreshToken } from "./init.js";

$(function () {
    const API_ENDPOINT = "https://discord.com/api/v10";
    // const CLIENT_ID = '1134773310127878274'
    // const CLIENT_SECRET = "mq-4uMfHlixM0rTaODV4Cfq92B2gfxrh";
    const REDIRECT_URI = `${location.protocol}//${location.hostname}${
        location.port ? `:${location.port}` : ""
    }/login.html`;

    const params = new URLSearchParams(window.location.search);

    if (params.has("redirect")) {
        console.log("href", window.location.href);
        console.log("redirect", window.location.search.replace("?redirect=", "").replace("=", ":-:"));
        console.log("redirect", params.get("redirect"));
        if (!params.get("redirect")) window.location.href = "/";
        cookie.set("redirect", window.location.search.replace("?redirect=", "").replace("=", ":-:"), 60 * 60);
    }

    if (params.has("code") || cookie.has("token")) {
        const code = params.get("code");
        const token = cookie.get("token")?.access_token;

        if (token) {
            getFromToken(token)
                .then((json) => {
                    refreshToken(cookie.get("token"))
                        .then((j) => {
                            cookie.set("token", j, (j.expires_in * 9) / 10);
                            console.log("refresh:", j);
                            backToPage();
                        })
                        .fail(() => {
                            cookie.delete("token");
                            login();
                        });
                })
                .fail(() => {
                    cookie.delete("token");
                    login();
                });
        } else if (code) {
            getToken(code)
                .then((json) => {
                    cookie.set("token", json, (json.expires_in * 9) / 10);
                    console.log("token:", json);
                    console.log("cookie:", new Cookie().get("token"));
                    getFromToken(json.access_token).then((json) => {
                        
                        backToPage();
                    });
                })
                .fail((json) => login());
        } else
            setTimeout(() => {
                login();
            }, 0);
    } else {
        $("h3").text("リダイレクト中...");
        setTimeout(() => {
            login();
        }, 0);
    }

    function login() {
        const host = window.location.hostname;
        if (host === "127.0.0.1") {
            window.location.href =
                "https://discord.com/api/oauth2/authorize?client_id=1134773310127878274&redirect_uri=http%3A%2F%2F127.0.0.1%3A5500%2Flogin.html&response_type=code&scope=identify%20guilds";
        } else if (host == "192.168.1.45") {
            window.location.href =
                "https://discord.com/api/oauth2/authorize?client_id=1134773310127878274&redirect_uri=http%3A%2F%2F192.168.1.45%3A5500%2Flogin.html&response_type=code&scope=identify%20guilds";
        } else if (host == "dev.un-known.xyz") {
            window.location.href =
                "https://discord.com/api/oauth2/authorize?client_id=1134773310127878274&redirect_uri=http%3A%2F%2Fdev.un-known.xyz%3A5500%2Flogin.html&response_type=code&scope=identify%20guilds";
        } else if (host == "www.un-known.xyz") {
            window.location.href =
                "https://discord.com/api/oauth2/authorize?client_id=1134773310127878274&redirect_uri=https%3A%2F%2Fwww.un-known.xyz%2Flogin.html&response_type=code&scope=identify%20guilds";
        }
    }

    function getToken(code) {
        const deferred = $.Deferred();

        const body = {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: REDIRECT_URI,
        };
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
        };

        const data = { method: "POST", body: encode(body), headers: headers };

        fetch(`${API_ENDPOINT}/oauth2/token`, data)
            .then((response) => response.json())
            .then((json) => {
                $("h3").text("ログインしました");
                if (!json.error) deferred.resolve(json);
                else deferred.reject(json);
            });

        return deferred.promise();
    }

    function backToPage() {
        setTimeout(() => {
            if (cookie.has("redirect")) {
                const redirect = cookie.get("redirect");
                cookie.delete("redirect");
                window.location.href = redirect.replace(":-:", "=");
            } else window.location.href = "/";
        }, 0);
    }

    function encode(obj) {
        return Object.keys(obj)
            .map((key) => {
                return encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
            })
            .join("&");
    }

    function isJson(data) {
        try {
            JSON.parse(data);
        } catch (error) {
            return false;
        }
        return true;
    }
});
