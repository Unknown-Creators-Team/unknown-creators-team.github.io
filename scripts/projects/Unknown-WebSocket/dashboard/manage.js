import { Cookie, cookie, getFromToken, refreshToken } from "../../../init.js";
let token, params, serverUri, account, casette, firstData, defaultData;
const retryButton = `<a href="${window.location}">再試行</a>`;

$(function () {
    defaultData = $("#viewer").html();
    firstData = toDate();

    if (cookie.has("token")) {
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

                getConfig();
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
    $(".spinner").show();
    fetch(serverUri + "/uws/v1/dashboard/view", {
        headers: {
            token: token,
            administrator: account.id,
            casette: params.get("id"),
        },
    })
        .then((res) => {
            $(".spinner").hide();
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
            $(".spinner").hide();
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
    $("#viewer").html(defaultData);
    $("#casetteId").val(params.get("id"));
    $("#formatVersion").val(casette.formatVersion);
    $("#owner").val(casette.owner);
    casette.administrators.forEach((admin, i) => {
        $("#administrators")
            .append(`<li><input type="text" name="administrators" required><span></span></li>`)
            .children("li")
            .eq(i)
            .children("input")
            .val(admin);
    });
    $("#guildId").val(casette.guildId);
    $("#language").val(casette.language);
    $("#serverName").val(casette.serverName);
    $("#compatible").val(casette.compatible ?? "null");
    $("#globalBan #enabled").prop("checked", casette.globalBan.enabled);
    $("#globalBan #punishment").val(casette.globalBan.punishment); // $("#blockedIps").val(casette.blockedIps.join(", "));
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
    $("#onlyLinkedPlayer").prop("checked", casette.onlyLinkedPlayer);
    $("#discordInvite").val(casette.discordInvite);
    $("#unLinkCommand").prop("checked", casette.unLinkCommand);
    $("#channels #main").val(casette.channels.main);
    $("#channels #status").val(casette.channels.status);
    $("#channels #console").val(casette.channels.console);
    $("#emojis #join").val(casette.emojis.join);
    $("#emojis #leave").val(casette.emojis.leave);
    $("#emojis #death").val(casette.emojis.death);
    casette.roleTag.forEach((tag, i) => {
        $("#roleTag")
            .append(`<li><div class="if"><p>もし<span class="right"></span></p><select name="type" class="type"><option value="tag">タグ</option><option value="role" selected>ロール</option></select><input type="text" class="id" placeholder="1093029073355296839" /><p class="inline">が</p><select name="action" class="action"><option value="add">ある</option><option value="remove">ない</option></select><p class="inline">なら</p></div><div class="do"><select name="type" class="type"><option value="tag">タグ</option><option value="role">ロール</option></select><input type="text" class="id" placeholder="uws:op" /><p class="inline">を</p><select name="action" class="action"><option value="add">追加</option><option value="remove">削除</option></select><p class="inline">する</p></div></li>`)
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
    // casette.tagRoles.forEach((tag, i) => {
    //     $("#tagRoles")
    //         .append(`<li><input type="text" name="tagRoles" required><span></span></li>`)
    //         .children("li")
    //         .eq(i)
    //         .children("input")
    //         .val(tag);
    // });
}

function toDate() {
    const data = {};

    data.administrators = [];
    $("#administrators li input").each((i, e) => {
        data.administrators.push($(e).val());
    });
    data.guildId = $("#guildId").val();
    data.language = $("#language").val();
    data.serverName = $("#serverName").val();
    data.compatible = $("#compatible").val() === "null" ? null : $("#compatible").val();
    data.globalBan = {
        enabled: $("#globalBan #enabled").prop("checked"),
        punishment: $("#globalBan #punishment").val(),
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

    // console.log("data:", data);
    return data;
}

function setUpHtml() {
    $("#administrators li span").on("click", function () {
        $(this).parent().remove();
    });

    $("#add-administrator").on("click", () => {
        $("#administrators").append(`<li><input type="text" name="administrators" required><span></span></li>`);

        $("#administrators li:last-child span").on("click", function () {
            $(this).parent().remove();
        });
    });

    $("#blockedIps li span").on("click", function () {
        $(this).parent().remove();
    });

    $("#add-blockedIp").on("click", () => {
        $("#blockedIps").append(`<li><input type="text" name="blockedIps" required><span></span></li>`);

        $("#blockedIps li:last-child span").on("click", function () {
            $(this).parent().remove();
        });
    });

    $("#roleTag li span").on("click", function () {
        $(this).parents("li").remove();
    });
    
    $("#add-roleTag").on("click", () => {
        $("#roleTag").append(`<li><div class="if"><p>もし<span class="right"></span></p><select name="type" class="type"><option value="tag">タグ</option><option value="role" selected>ロール</option></select><input type="text" class="id" placeholder="1093029073355296839" /><p class="inline">が</p><select name="action" class="action"><option value="add">ある</option><option value="remove">ない</option></select><p class="inline">なら</p></div><div class="do"><select name="type" class="type"><option value="tag">タグ</option><option value="role">ロール</option></select><input type="text" class="id" placeholder="uws:op" /><p class="inline">を</p><select name="action" class="action"><option value="add">追加</option><option value="remove">削除</option></select><p class="inline">する</p></div></li>`);

        $("#roleTag li:last-child span").on("click", function () {
            $(this).parents("li").remove();
        });
    });

    // submit button
    $("#save").on("click", (event) => {
        event.preventDefault();
        $(".spinner").show();
        sendConfig();
    });

    $("#cancel").on("click", () => {
        // location.reload();
        $(".spinner").show();
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
}
