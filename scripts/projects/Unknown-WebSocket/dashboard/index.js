$(function () {
    const CLIENT_ID = "1134773310127878274";
    const CLIENT_SECRET = "mq-4uMfHlixM0rTaODV4Cfq92B2gfxrh";
    class Cookie extends Map {
        constructor() {
            super();
            document.cookie.split(";").forEach((cookie) => {
                const [key, value] = cookie.split("=");
                this.set(key.trim(), value);
            });
        }
        set(key, value, expire = 0) {
            if (typeof value === "object") value = JSON.stringify(value);
            super.set(key, value);
            document.cookie = `${key}=${value};${
                expire ? `expires=${new Date(Date.now() + expire * 1000).toUTCString()};` : ""
            }path=/;`;
        }
        get(key) {
            let value = super.get(key);
            return this.isJson(value) ? JSON.parse(value) : value;
        }
        delete(key) {
            super.delete(key);
            document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
        }
        isJson(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }
    }

    const cookie = new Cookie();

    const retryButton = `<a href="${window.location}">再試行</a>`;

    if (cookie.has("token")) {
        const token = cookie.get("token")?.access_token;
        getFromToken(token)
            .then((json) => {
                cookie.set("token", json, (json.expires_in * 9) / 10);

                console.log(json);

                const params = new URLSearchParams(window.location.search);
                let serverUri = "https://api.un-known.xyz:22003";
                if (params.has("local1")) serverUri = "http://127.0.0.1:22003";
                if (params.has("local2")) serverUri = "http://192.168.1.42:22003";
                if (params.has("local3")) serverUri = "http://192.168.1.45:22003";
                if (params.has("dev")) serverUri = "http://dev.un-known.xyz:22003";
                if (params.has("unsecure")) serverUri = "http://api.un-known.xyz:22003";

                if (!json || !token) window.location.href = "/login.html?redirect=" + window.location.href;

                fetch(serverUri + "/uws/v1/dashboard", {
                    headers: {
                        token: token,
                        Administrator: json.id,
                    },
                }).then((res) => {
                    if (res.status === 200) {
                        res.json().then((/** @type {{id: string, serverName: string}[]} */casette) => {
                            console.log(casette);
                            const html = casette.map((c) => `<div class="casette">
                                <h4><code>${c.id}</code></h5>
                                <h3>${c.serverName}</h3>
                                <a href="./manage.html${window.location.search ? window.location.search + "&" : "?"}id=${c.id}">View</a>
                            </div>`).join("");
                            $("#casettes").html(html);
                            if (casette.length === 0) $("#casettes").html("<h1>No casette</h1>");
                        });
                    } else {
                        $("#casettes").html(`<h1>${res.status} ${res.statusText}</h1>${retryButton}`);
                    }
                }).catch((error) => {
                    console.log(error);
                    if (error.message.includes('ENOTFOUND')) {
                        $("#casettes").html("<h1>Server not found</h1>");
                    } else if (error.message.includes('Failed to fetch')) {
                        $("#casettes").html(`<h1>Failed to fetch data</h1>
                        ${retryButton}
                        <a href="./index.html?local1">local1</a>
                        <a href="./index.html?local2">local2</a>
                        <a href="./index.html?local3">local3</a>
                        <a href="./index.html?dev">dev</a>
                        <a href="./index.html?unsecure">unsecure</a>`);
                    } else {
                        $("#casettes").html(`<h1>Error occurred</h1>${retryButton}`);
                    }
                });

                
            })
            .fail(() => cookie.delete("token"));
    } else window.location.href = "/login.html?redirect=" + window.location.href;

    function getFromToken(token) {
        const deferred = $.Deferred();

        fetch("https://discordapp.com/api/users/@me", {
            headers: {
                Authorization: "Bearer " + token,
            },
        })
            .then((response) => response.json())
            .then((json) => {
                if (!json.error) deferred.resolve(json);
                else deferred.reject(json);
            });

        return deferred.promise();
    }

    function refreshToken(json) {
        const deferred = $.Deferred();
        fetch("https://discordapp.com/api/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${json.refresh_token}`,
        })
            .then((response) => response.json())
            .then((json) => {
                if (!json.error) deferred.resolve(json);
                else deferred.reject(json);
            });

        return deferred.promise();
    }

    function getGuilds(token) {
        console.log("first:", token);
        const deferred = $.Deferred();

        fetch("https://discordapp.com/api/users/@me/guilds", {
            headers: {
                Authorization: "Bearer " + token,
            },
        })
            .then((response) => response.json())
            .then((json) => {
                if (!json.error) deferred.resolve(json);
                else deferred.reject(json);
            });

        return deferred.promise();
    }
});
