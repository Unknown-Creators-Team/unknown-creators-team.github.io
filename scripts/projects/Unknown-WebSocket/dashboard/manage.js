import { Cookie, cookie, getFromToken, refreshToken, getGuilds, setDropdownValue, getDropdownValue, waitNewToken, resetDropdowns } from "../../../init.js";
let token, params, serverUri, account, casette, firstData, latestData, guilds, setupFinished;
const retryButton = `<a href="${window.location}">再試行</a>`;

$(async function () {
    $("#viewer-spin").show();
    // defaultData = $("#viewer").html();
    firstData = toDate();

    if (cookie.has("token")) {
        console.log("waiting token");
        await waitNewToken();
        console.log("got token");
        token = cookie.get("token")?.access_token;
        getFromToken(token)
            .then((json) => {
                account = json;
                console.log(account);

                params = new URLSearchParams(window.location.search);
                serverUri = "https://api.un-known.xyz:22003";
                if (params.has("local1")) serverUri = "http://127.0.0.1:22002";
                if (params.has("local2")) serverUri = "http://192.168.1.42:22002";
                if (params.has("local3")) serverUri = "http://192.168.1.45:22002";
                if (params.has("dev")) serverUri = "http://dev.un-known.xyz:22002";
                if (params.has("unsecure")) serverUri = "http://api.un-known.xyz:22002";

                if (!params.has("id")) window.location.href = "./index.html" + window.location.search;
                if (!account || !token) window.location.href = "/login.html?redirect=" + window.location.href;
    
                        

                guilds = [];
                getGuilds(token).then((servers) => {
                    console.log(servers);
                    servers = servers.filter((g) => (g.permissions & 0x20) === 0x20);
                    fetch(serverUri + "/uws/v1/servers", {
                        headers: {
                            guilds: JSON.stringify(servers.map((g) => g.id)),
                        },
                    })
                    .then((res) => res.json())
                    .then((servers) => {
                        console.log(servers);
                        servers.forEach((guild) => {
                            guilds.push(guild);
                        });
    
                        getConfig();
                    })
                    .catch(console.error);
                })
                .fail(() => window.location.reload());
            })
            .fail(() => cookie.delete("token"));
    } else window.location.href = "/login.html?redirect=" + window.location.href;

    $(window).on("scroll", function () {
        buttonControl();
    });

    // keyup
    $(window).on("keyup", function (e) {
        buttonControl();
    });

    // click any
    $(window).on("click", function (e) {
        buttonControl();
    });

    setInterval(() => {
        buttonControl();
    }, 500);

    $("#closeSentDisplay").on("click", () => {
        $("#sentDisplay").fadeOut(200);
    });
});

function getConfig() {
    
    fetch(serverUri + "/uws/v1/dashboard/view", {
        headers: {
            token: cookie.load().get("token")?.access_token,
            administrator: account.id,
            casette: params.get("id"),
        },
    })
        .then((res) => {
            $("#viewer-spin").hide();
            if (res.status === 200) {
                res.json().then((json) => {
                    casette = json;
                    console.log(casette);

                    loadData();

                    firstData = toDate();

                    setUpHtml();
                    
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
        })
        .catch((error) => {
            $("#viewer-spin").hide();
            console.log(error);
            if (error.message.includes("ENOTFOUND")) {
                $("#viewer").html("<h1>Server not found</h1>");
            } else if (error.message.includes("Failed to fetch")) {
                $("#viewer").html(
                    [
                        `<h1>Failed to fetch data</h1>`,
                        retryButton,
                        `<a href="./index.html?local1">local1</a>`,
                        `<a href="./index.html?local2">local2</a>`,
                        `<a href="./index.html?local3">local3</a>`,
                        `<a href="./index.html?dev">dev</a>`,
                        `<a href="./index.html?unsecure">unsecure</a>`,
                    ].json("")
                );
            } else {
                $("#viewer").html("<h1>Error occurred</h1>${retryButton}");
            }
        });
}

function loadData() {

    resetDropdowns();
    // $("#viewer").html(defaultData);
    $("#casetteId").val(params.get("id"));
    $("#formatVersion").val(casette.formatVersion);
    let status = "不明";
    if (casette.subscription.status === "active") status = "アクティブ";
    else if (casette.subscription.status === "canceled") status = "キャンセル済み";
    else if (casette.subscription.status === "incomplete") status = "未完了";
    else if (casette.subscription.status === "incomplete_expired") status = "未完了(期限切れ)";
    else if (casette.subscription.status === "past_due") status = "支払い期限切れ";
    else if (casette.subscription.status === "paused") status = "一時停止中";
    else if (casette.subscription.status === "trialing") status = "トライアル中";
    else if (casette.subscription.status === "unpaid") status = "未払い";
    $("#subscription").val(status);
    const expires_at = casette.subscription.expires_at;
    $("#expires_at").val(expires_at === -1 ? "無期限" : new Date(expires_at * 1000).toLocaleString());
    $("#owner").val(casette.owner);
    $("#administrators").empty();
    casette.administrators.forEach((admin, i) => {
        $("#administrators")
            .append(`<li><input type="text" name="administrators" required><span></span></li>`)
            .children("li")
            .eq(i)
            .children("input")
            .val(admin);
    });
    guilds.forEach((guild, i) => {
        $("#guildId div").append(`<option value="${guild.id}">${guild.name}</option>`);
    });
    if (!guilds.find((guild) => guild.id === casette.guildId) && casette.guildId !== "") {
        $("#guildId div").append(`<option value="${casette.guildId}">アクセスできないサーバー</option>`);
    }
    setDropdownValue("#guildId", casette.guildId);
    
    setDropdownValue("#language", casette.language);
    $("#serverName").val(casette.serverName);
    setDropdownValue("#compatible", casette.compatible ?? "null");
    $("#globalBan #enabled").prop("checked", casette.globalBan.enabled);
    setDropdownValue("#globalBan #punishment", casette.globalBan.punishment);
    $("#globalChat #enabled").prop("checked", casette.globalChat.enabled);
    $("#globalChat #room").val(casette.globalChat.room);

    $("#blockedIps").empty();
    casette.blockedIps.forEach((ip, i) => {
        $("#blockedIps")
            .append(`<li><input type="text" name="blockedIps" required><span></span></li>`)
            .children("li")
            .eq(i)
            .children("input")
            .val(ip);
    });
    $("#sendMessageDelete").prop("checked", casette.sendMessageDelete);
    $("#sendSay").prop("checked", casette.sendSay);
    $("#sendMe").prop("checked", casette.sendMe);
    $("#maxCharacters").val(casette.maxCharacters);
    $("#console").prop("checked", casette.console);
    $("#playerChartIntervalMinutes").val(casette.playerChartIntervalMinutes);
    $("#setMaxPlayers").val(casette.setMaxPlayers);
    $("#killAtEProtection").prop("checked", casette["kill@eProtection"]);
    // $("#onlyLinkedPlayer").prop("checked", casette.onlyLinkedPlayer);
    // $("#discordInvite").val(casette.discordInvite);
    // $("#unLinkCommand").prop("checked", casette.unLinkCommand);
    // $("#channels #main").val(casette.channels.main);
    // $("#channels #status").val(casette.channels.status);
    // $("#channels #console").val(casette.channels.console);
    $("#emojis #join").val(casette.emojis.join);
    $("#emojis #leave").val(casette.emojis.leave);
    $("#emojis #death").val(casette.emojis.death);

    $("#roleTag").empty();
    casette.roleTag.forEach((tag, i) => {
        $("#roleTag")
            .append(
                `<li><div class="if"><p>もし<span class="right"></span></p><select name="type" class="type"><option value="tag">タグ</option><option value="role" selected>ロール</option></select><input type="text" class="id" placeholder="1093029073355296839" /><p class="inline">が</p><select name="action" class="action"><option value="add">ある</option><option value="remove">ない</option></select><p class="inline">なら</p></div><div class="do"><select name="type" class="type"><option value="tag">タグ</option><option value="role">ロール</option></select><input type="text" class="id" placeholder="uws:op" /><p class="inline">を</p><select name="action" class="action"><option value="add">追加</option><option value="remove">削除</option></select><p class="inline">する</p></div></li>`
            )
            .children("li")
            .eq(i)
            .find(".if .action")
            .val(tag.if.action)
            .end()
            .find(".if .type")
            .val(tag.if.type)
            .end()
            .find(".if .id")
            .val(tag.if.id)
            .end()
            .find(".do .action")
            .val(tag.do.action)
            .end()
            .find(".do .type")
            .val(tag.do.type)
            .end()
            .find(".do .id")
            .val(tag.do.id);
    });

    $("#playerNameRegex #enabled").prop("checked", casette.advanced.playerNameRegex.enabled);
    $("#playerNameRegex #regex").val(casette.advanced.playerNameRegex.regex);
    $("#chatRegex #enabled").prop("checked", casette.advanced.chatRegex.enabled);
    $("#chatRegex #regex").val(casette.advanced.chatRegex.regex);

    $("#betaModules").empty();
    casette.advanced.betaModules.forEach((module, i) => {
        $("#betaModules")
            .append(`<li><input type="text" name="betaModules" required><span></span></li>`)
            .children("li")
            .eq(i)
            .children("input")
            .val(module);
    });

    setChannels();
}

function toDate() {
    const data = {};

    data.administrators = [];
    $("#administrators li input").each((i, e) => {
        data.administrators.push($(e).val());
    });
    data.guildId = getDropdownValue("#guildId");
    data.language = getDropdownValue("#language");
    data.serverName = $("#serverName").val();
    data.compatible = getDropdownValue("#compatible") === "null" ? null : getDropdownValue("#compatible");
    data.globalBan = {
        enabled: $("#globalBan #enabled").prop("checked"),
        punishment: getDropdownValue("#globalBan #punishment"),
    };
    data.globalChat = {
        enabled: $("#globalChat #enabled").prop("checked"),
        room: $("#globalChat #room").val(),
    };
    data.blockedIps = [];
    $("#blockedIps li input").each((i, e) => {
        data.blockedIps.push($(e).val());
    });
    data.sendMessageDelete = $("#sendMessageDelete").prop("checked");
    data.sendSay = $("#sendSay").prop("checked");
    data.sendMe = $("#sendMe").prop("checked");
    data.maxCharacters = parseInt($("#maxCharacters").val());
    data.console = $("#console").prop("checked");
    data.playerChartIntervalMinutes = parseInt($("#playerChartIntervalMinutes").val());
    data.setMaxPlayers = $("#setMaxPlayers").val();
    data["kill@eProtection"] = $("#killAtEProtection").prop("checked");
    // data.onlyLinkedPlayer = $("#onlyLinkedPlayer").prop("checked");
    // data.discordInvite = $("#discordInvite").val();
    // data.unLinkCommand = $("#unLinkCommand").prop("checked");
    data.channels = {
        main: getDropdownValue("#channels #main"),
        status: getDropdownValue("#channels #status"),
        console: getDropdownValue("#channels #console"),
    };
    data.emojis = {
        join: $("#emojis #join").val(),
        leave: $("#emojis #leave").val(),
        death: $("#emojis #death").val(),
    };
    data.roleTag = [];
    $("#roleTag li").each((i, e) => {
        data.roleTag.push({
            if: {
                action: $(e).find(".if .action").val(),
                type: $(e).find(".if .type").val(),
                id: $(e).find(".if .id").val(),
            },
            do: {
                action: $(e).find(".do .action").val(),
                type: $(e).find(".do .type").val(),
                id: $(e).find(".do .id").val(),
            },
        });
    });

    data.advanced = {
        playerNameRegex: {
            enabled: $("#playerNameRegex #enabled").prop("checked"),
            regex: $("#playerNameRegex #regex").val(),
        },
        chatRegex: {
            enabled: $("#chatRegex #enabled").prop("checked"),
            regex: $("#chatRegex #regex").val(),
        },
        betaModules: [],
    };

    $("#betaModules li input").each((i, e) => {
        data.advanced.betaModules.push($(e).val());
    });

    return data;
}

function setUpHtml() {
    $("#administrators li span").on("click", function () {
        $(this).parent().remove();
    });

    $("#blockedIps li span").on("click", function () {
        $(this).parent().remove();
    });

    $("#roleTag li span").on("click", function () {
        $(this).parents("li").remove();
    });

    $("#betaModules li span").on("click", function () {
        $(this).parent().remove();
    });
    if (setupFinished) return;


    $("#add-administrator").on("click", () => {
        $("#administrators").append(`<li><input type="text" name="administrators" required><span></span></li>`);

        $("#administrators li:last-child span").on("click", function () {
            $(this).parent().remove();
        });
    });

    

    $("#add-blockedIp").on("click", () => {
        $("#blockedIps").append(`<li><input type="text" name="blockedIps" required><span></span></li>`);

        $("#blockedIps li:last-child span").on("click", function () {
            $(this).parent().remove();
        });
    });
    
    // #guildId のtextが変更されたとき
    $("#guildId p").on("change", function () {
        console.log("guildId changed");
    });
    

    

    $("#add-roleTag").on("click", () => {
        $("#roleTag").append(
            `<li><div class="if"><p>もし<span class="right"></span></p><select name="type" class="type"><option value="tag">タグ</option><option value="role" selected>ロール</option></select><input type="text" class="id" placeholder="1093029073355296839" /><p class="inline">が</p><select name="action" class="action"><option value="add">ある</option><option value="remove">ない</option></select><p class="inline">なら</p></div><div class="do"><select name="type" class="type"><option value="tag">タグ</option><option value="role">ロール</option></select><input type="text" class="id" placeholder="uws:op" /><p class="inline">を</p><select name="action" class="action"><option value="add">追加</option><option value="remove">削除</option></select><p class="inline">する</p></div></li>`
        );

        $("#roleTag li:last-child span").on("click", function () {
            $(this).parents("li").remove();
        });
    });

    

    $("#add-betaModule").on("click", () => {
        $("#betaModules").append(`<li><input type="text" name="betaModules" required><span></span></li>`);

        $("#betaModules li:last-child span").on("click", function () {
            $(this).parent().remove();
        });
    });

    // submit button
    $("#save").on("click", (event) => {
        // const form = document.querySelector('form');
        // if (!form.checkValidity()) return;

        event.preventDefault();
        $("#viewer-spin").show();
        sendConfig();
    });

    $("#cancel").on("click", () => {
        // location.reload();
        $("#viewer-spin").show();
        const token_ = cookie.load().get("token");
        console.log("token_:", token_);
        refreshToken(token_)
            .then((j) => {
                token = j.access_token;
                console.log("cancel1", j);
                cookie.set("token", j, (j.expires_in * 9) / 10);
                setTimeout(() => {
                    getFromToken(token)
                        .then((json) => {
                            console.log("cancel2", json);
                            account = json;
                            getConfig();
                        })
                        .fail(() => {
                            cookie.delete("token");
                            // location.reload();
                        });
                }, 500);
            })
            .fail(() => {
                cookie.delete("token");
                // location.reload();
            });
    });

    $("#reissueToken").on("click", () => reissueToken());
    $("#howToUse").on("click", () => howToUse());
    // setChannels();

    setupFinished = true;
}

function sendConfig() {
    const data = toDate();

    fetch(serverUri + "/uws/v1/dashboard/edit", {
        method: "POST",
        headers: {
            token: new Cookie().get("token")?.access_token,
            administrator: account.id,
            casette: params.get("id"),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((res) => {
            res.json().then((json) => {
                if (res.status === 200) {
                    refreshToken(cookie.load().get("token"))
                        .then((j) => {
                            token = j.access_token;
                            console.log("cancel1", j);
                            cookie.set("token", j, (j.expires_in * 9) / 10);
                            setTimeout(() => {
                                getFromToken(token)
                                    .then((json) => {
                                        console.log("cancel2", json);
                                        account = json;
                                        getConfig();

                                        const width = $("#sentDisplay").outerWidth();
                                        const height = $("#sentDisplay").outerHeight();
                                        $("#sentDisplay").css({
                                            position: "fixed",
                                            left: `calc(50% - ${width / 2}px)`,
                                            top: `calc(50% - ${height / 2}px)`,
                                        });
                                        $("#sentDisplay").fadeIn(200);
                                    })
                                    .fail(() => {
                                        cookie.delete("token");
                                        // location.reload();
                                    });
                            }, 500);
                        })
                        .fail(() => {
                            cookie.delete("token");
                            location.reload();
                        });
                } else {
                    if (json.message) {
                        $("#viewer").html(`<h1>${res.status} ${res.statusText}: ${json.message}</h1>${retryButton}`);
                    } else {
                        $("#viewer").html(`<h1>${res.status} ${res.statusText}</h1>${retryButton}`);
                    }
                }
            });
        })
        .catch((error) => {
            console.log(JSON.stringify(error, null, 4));
            if (error.message.includes("ENOTFOUND")) {
                $("#viewer").html("<h1>Server not found</h1>");
            } else if (error.message.includes("Failed to fetch")) {
                $("#viewer").html(
                    [
                        `<h1>Failed to fetch data</h1>`,
                        retryButton,
                        `<a href="./index.html?local1">local1</a>`,
                        `<a href="./index.html?local2">local2</a>`,
                        `<a href="./index.html?local3">local3</a>`,
                        `<a href="./index.html?dev">dev</a>`,
                    ].join("")
                );
            } else {
                $("#viewer").html(`<h1>Error occurred</h1>${retryButton}`);
            }
        });
}

function reissueToken() {
    $("#reissueToken").hide();
    const width = $("#reissueToken").width();
    $("#reissueToken-loading").width(width);
    $("#reissueToken-loading").show();
    
    fetch(serverUri + "/uws/v1/dashboard/reissue", {
        method: "POST",
        headers: {
            token: new Cookie().get("token")?.access_token,
            casette: params.get("id"),
        },
    })
        .then((res) => {
            res.json().then((json) => {
                if (res.status === 200) {
                    console.log(json);
                    const width = $("#reissuedDisplay").outerWidth();
                    const height = $("#reissuedDisplay").outerHeight();
                    $("#reissuedDisplay").css({
                        position: "fixed",
                        left: `calc(50% - ${width / 2}px)`,
                        top: `calc(50% - ${height / 2}px)`,
                    });

                    $("#reissuedDisplay").fadeIn(200);

                    $("#closeReissuedDisplay").on("click", () => {
                        location.reload();
                    });

                    $("#reissueToken-loading").hide();
                    $("#reissueToken").show();
                    
                } else {
                    if (json.message) {
                        $("#viewer").html(`<h1>${res.status} ${res.statusText}: ${json.message}</h1>${retryButton}`);
                    } else {
                        $("#viewer").html(`<h1>${res.status} ${res.statusText}</h1>${retryButton}`);
                    }

                    $("#reissueToken-loading").hide();
                    $("#reissueToken").show();
                }
            });
        })
        .catch((error) => {
            console.log(JSON.stringify(error, null, 4));
            if (error.message.includes("ENOTFOUND")) {
                $("#viewer").html("<h1>Server not found</h1>");
            } else if (error.message.includes("Failed to fetch")) {
                $("#viewer").html(
                    [
                        `<h1>Failed to fetch data</h1>`,
                        retryButton,
                        `<a href="./index.html?local1">local1</a>`,
                        `<a href="./index.html?local2">local2</a>`,
                        `<a href="./index.html?local3">local3</a>`,
                        `<a href="./index.html?dev">dev</a>`,
                    ].join("")
                );
            } else {
                $("#viewer").html(`<h1>Error occurred</h1>${retryButton}`);
            }
        });
}

function howToUse() {
    const width = $("#howToUseDisplay").outerWidth();
    const height = $("#howToUseDisplay").outerHeight();
    $("#howToUseDisplay").css({
        position: "fixed",
        left: `calc(50% - ${width / 2}px)`,
        top: `calc(50% - ${height / 2}px)`,
    });

    $("#casette-id").text($("#casette-id").text().replace("{CASETTE_ID}", params.get("id")));

    $("#howToUseDisplay").fadeIn(200);

    $("#closeHowToUse").on("click", () => {
        $("#howToUseDisplay").fadeOut(200);
    });
}

function buttonControl() {
    const viewerBottom = $("#viewer").offset().top + $("#viewer").outerHeight();
    const windowHeight = $(window).height();
    const data = toDate();

    if (JSON.stringify(data) !== JSON.stringify(firstData)) {
        $("#buttons").removeClass("fade-out");
        $("#buttons").addClass("slide-up");

        if (viewerBottom < $(window).scrollTop() + windowHeight) {
            $("#buttons").css({
                display: "block",
                position: "absolute",
            });
        } else {
            $("#buttons").css({
                display: "block",
                position: "fixed",
            });
        }

        setTimeout(() => {
            $("#buttons").css({
                opacity: "1",
            });
        }, 400);
    } else {
        $("#buttons").removeClass("slide-up");
        $("#buttons").addClass("fade-out");
    }

    if (JSON.stringify(data) !== JSON.stringify(latestData)) {
        if (data?.guildId !== latestData?.guildId) {
            // latestData = data;
            setChannels(true);
        }
    };
    latestData = data;
}

function setChannels(force = false) {
    console.log("Hi")
    
    $("#channels").children("div").eq(0).addClass("ban");
    $("#channels").children("div").eq(1).show();

    console.log(getDropdownValue("#guildId"))
    fetch(serverUri + `/uws/v1/server/${getDropdownValue("#guildId")}/channels`)
    .then((res) => res.json())
    .then((channels) => {
        $("#channels #main option").remove();
        $("#channels #status option").remove();
        $("#channels #console option").remove();
        
        channels.forEach((channel) => {
            if (![0,4].includes(channel.type)) return;
            const disabled = channel.type === 4 ? "disabled" : "";
            $("#channels #main div").append(`<option value="${channel.id}" ${disabled}>${channel.name}</option>`);
            $("#channels #status div").append(`<option value="${channel.id}" ${disabled}>${channel.name}</option>`);
            $("#channels #console div").append(`<option value="${channel.id}" ${disabled}>${channel.name}</option>`);
        });
        const channelsId = channels.map((channel) => channel.id);
        if (!channelsId.includes(casette.channels.main)) {
            $("#channels #main div").append(`<option value="${casette.channels.main}" selected>アクセスできないチャンネル</option>`);
        }
        if (!channelsId.includes(casette.channels.status)) {
            $("#channels #status div").append(`<option value="${casette.channels.status}" selected>アクセスできないチャンネル</option>`);
        }
        if (!channelsId.includes(casette.channels.console)) {
            $("#channels #console div").append(`<option value="${casette.channels.console}" selected>アクセスできないチャンネル</option>`);
        }
        setDropdownValue("#channels #main", casette.channels.main);
        setDropdownValue("#channels #status", casette.channels.status);
        setDropdownValue("#channels #console", casette.channels.console);

        $("#channels").children("div").eq(0).removeClass("ban");
        $("#channels").children("div").eq(1).hide();
        if (!force) firstData = toDate();
    })
    .catch((e) => console.error("error:", e));
}

