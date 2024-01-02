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

    const retryButton = `<a href="${window.location}">再試行</a>`

    if (cookie.has("token")) {
        const token = cookie.get("token")?.access_token;
        getFromToken(token)
            .then((json) => {
                cookie.set("token", json, (json.expires_in * 9) / 10);

                console.log(json);

                const params = new URLSearchParams(window.location.search);
                let serverUri = "https://api.un-known.xyz:22003";
                if (params.has("local1")) serverUri = "http://127.0.0.1:22002";
                if (params.has("local2")) serverUri = "http://192.168.1.42:22002";
                if (params.has("local3")) serverUri = "http://192.168.1.45:22002";
                if (params.has("dev")) serverUri = "http://dev.un-known.xyz:22002";
                if (params.has("unsecure")) serverUri = "http://api.un-known.xyz:22002";
                
                if (!params.has("id")) window.location.href = "./index.html" + window.location.search;
                if (!json || !token) window.location.href = "/login.html?redirect=" + window.location.href;

                fetch(serverUri + "/uws/v1/dashboard/view", {
                    headers: {
                        token: token,
                        administrator: json.id,
                        casette: params.get("id"),
                    },
                }).then((res) => {
                    if (res.status === 200) {
                        res.json().then((/** @type {{formatVersion: number;token: string;owner: string;administrators: string[];guildId: string;language: string;serverName: string;compatible:| "TN-AntiCheat"| "Unknown Anti-Cheat"| string| null;globalBan: boolean;sendMessageDelete: boolean;sendSay: boolean;sendMe: boolean;maxCharacters: number;console: boolean;playerChartIntervalMinutes: number;setMaxPlayers: string | number;"kill@eProtection": boolean;onlyLinkedPlayer: boolean;discordInvite: string;unLinkCommand: boolean;channels: {main: string;status: string;console: string;};emojis: {join: string;leave: string;death: string;};roleTags: string[];}} */casette) => {
                            console.log(casette);
                            
                            $("#formatVersion").val(casette.formatVersion);
                            $("#token").val(casette.token ? "暗号化されています" : "暗号化されていません");
                            $("#owner").val(casette.owner);
                            $("#administrators").val(casette.administrators.join(", "));
                            $("#guildId").val(casette.guildId);
                            $("#language").val(casette.language);
                            $("#serverName").val(casette.serverName);
                            $("#compatible").val(casette.compatible ?? "null");
                            $("#globalBan").prop("checked", casette.globalBan);
                            $("#sendMessageDelete").prop("checked", casette.sendMessageDelete);
                            $("#sendSay").prop("checked", casette.sendSay);
                            $("#sendMe").prop("checked", casette.sendMe);
                            $("#maxCharacters").val(casette.maxCharacters);
                            $("#console").prop("checked", casette.console);
                            $("#playerChartIntervalMinutes").val(casette.playerChartIntervalMinutes);
                            $("#setMaxPlayers").val(casette.setMaxPlayers);
                            $("#killEProtection").prop("checked", casette["kill@eProtection"]);
                            $("#onlyLinkedPlayer").prop("checked", casette.onlyLinkedPlayer);
                            $("#discordInvite").val(casette.discordInvite);
                            $("#unLinkCommand").prop("checked", casette.unLinkCommand);
                            $("#channels #main").val(casette.channels.main);
                            $("#channels #status").val(casette.channels.status);
                            $("#channels #console").val(casette.channels.console);
                            $("#emojis #join").val(casette.emojis.join);
                            $("#emojis #leave").val(casette.emojis.leave);
                            $("#emojis #death").val(casette.emojis.death);
                            $("#roleTags").val(casette.roleTags.join(", "));

                            // submit button
                            $("#save").on("click", (event) => {
                                event.preventDefault();

                                const data = {};
                            
                                data.administrators = $("#administrators").val().replace(/ /g, "").split(",").filter((v) => v && v.length);
                                data.guildId = $("#guildId").val();
                                data.language = $("#language").val();
                                data.serverName = $("#serverName").val();
                                data.compatible = $("#compatible").val() === "null" ? null : $("#compatible").val();
                                data.globalBan = $("#globalBan").prop("checked");
                                data.sendMessageDelete = $("#sendMessageDelete").prop("checked");
                                data.sendSay = $("#sendSay").prop("checked");
                                data.sendMe = $("#sendMe").prop("checked");
                                data.maxCharacters = parseInt($("#maxCharacters").val());
                                data.console = $("#console").prop("checked");
                                data.playerChartIntervalMinutes = parseInt($("#playerChartIntervalMinutes").val());
                                data.setMaxPlayers = $("#setMaxPlayers").val();
                                data["kill@eProtection"] = $("#killEProtection").prop("checked");
                                data.onlyLinkedPlayer = $("#onlyLinkedPlayer").prop("checked");
                                data.discordInvite = $("#discordInvite").val();
                                data.unLinkCommand = $("#unLinkCommand").prop("checked");
                                data.channels = {
                                    main: $("#channels #main").val(),
                                    status: $("#channels #status").val(),
                                    console: $("#channels #console").val(),
                                };
                                data.emojis = {
                                    join: $("#emojis #join").val(),
                                    leave: $("#emojis #leave").val(),
                                    death: $("#emojis #death").val(),
                                };
                                data.roleTags = $("#roleTags").val().replace(/ /g, "").split(",").filter((v) => v && v.length);

                                console.log("data:", data);
                                fetch(serverUri + "/uws/v1/dashboard/edit", {
                                    method: "POST",
                                    headers: {
                                        token: new Cookie().get("token")?.access_token,
                                        administrator: json.id,
                                        casette: params.get("id"),
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(data),
                                }).then((res) => {
                                    res.json().then((json) => {
                                        if (res.status === 200) {
                                            console.log(json);
                                            this.location.reload();
                                        } else {
                                            if (json.message) {
                                                $("#viewer").html(`<h1>${res.status} ${res.statusText}: ${json.message}</h1>${retryButton}`);
                                            } else {
                                                $("#viewer").html(`<h1>${res.status} ${res.statusText}</h1>${retryButton}`);
                                            }
                                        }
                                    });
                                }).catch((error) => {
                                    console.log(JSON.stringify(error, null, 4));
                                    if (error.message.includes('ENOTFOUND')) {
                                        $("#viewer").html("<h1>Server not found</h1>");
                                    } else if (error.message.includes('Failed to fetch')) {
                                        $("#viewer").html(`<h1>Failed to fetch data</h1>
                                        ${retryButton}
                                        <a href="./index.html?local1">local1</a>
                                        <a href="./index.html?local2">local2</a>
                                        <a href="./index.html?local3">local3</a>
                                        <a href="./index.html?dev">dev</a>`);
                                    } else {
                                        $("#viewer").html(`<h1>Error occurred</h1>${retryButton}`);
                                    }
                                });
                            });

                            $("#cancel").on("click", () => {
                                this.location.reload();
                            });
                        });
                    } else {
                        res.json().then((json) => {
                            if (json.message) {
                                $("#viewer").html(`<h1>${res.status} ${res.statusText}: ${json.message}</h1>${retryButton}`);
                            } else {
                                $("#viewer").html(`<h1>${res.status} ${res.statusText}</h1>${retryButton}`);
                            }
                        });
                    }
                }).catch((error) => {
                    console.log(error);
                    if (error.message.includes('ENOTFOUND')) {
                        $("#viewer").html("<h1>Server not found</h1>");
                    } else if (error.message.includes('Failed to fetch')) {
                        $("#viewer").html(`<h1>Failed to fetch data</h1>
                        ${retryButton}
                        <a href="./index.html?local1">local1</a>
                        <a href="./index.html?local2">local2</a>
                        <a href="./index.html?local3">local3</a>
                        <a href="./index.html?dev">dev</a>
                        <a href="./index.html?unsecure">unsecure</a>`);
                    } else {
                        $("#viewer").html("<h1>Error occurred</h1>${retryButton}");
                    }
                });

                
            })
            .fail(() => cookie.delete("token"));
    } else window.location.href = "/login.html?redirect=" + window.location.href;

    function getFromToken(token) {
        console.log("first:", token);
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
