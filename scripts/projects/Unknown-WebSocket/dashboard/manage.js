import { Cookie, cookie, getFromToken } from "../../../init.js";
let firstData = toDate();
// @ts-ignore
let token, json, casette, params;
const retryButton = `<a href="${window.location}">再試行</a>`;

$(function async() {
    
    

    if (cookie.has("token")) {
        token = cookie.get("token")?.access_token;
        getFromToken(token)
            .then((json) => {
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

                getConfig(serverUri);
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
});

/**
 * 
 * @param {string} URI 
 * @returns 
 */
function getConfig(URI) {
    $(".spinner").show();
    return new Promise((resolve, reject) => {
        fetch(URI + "/uws/v1/dashboard/view", {
            headers: {
                token: token,
                administrator: json.id,
                casette: params.get("id"),
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    res.json().then((casette) => {
                        console.log(casette);

                        $("#administrators li span").on("click", function () {
                            $(this).parent().remove();
                        });

                        $("#add-administrator").on("click", () => {
                            $("#administrators").append(
                                `<li><input type="text" name="administrators" required><span></span></li>`
                            );

                            $("#administrators li:last-child span").on("click", function () {
                                $(this).parent().remove();
                            });
                        });

                        $("#blockedIps li span").on("click", function () {
                            $(this).parent().remove();
                        });

                        $("#add-blockedIp").on("click", () => {
                            $("#blockedIps").append(
                                `<li><input type="text" name="blockedIps" required><span></span></li>`
                            );

                            $("#blockedIps li:last-child span").on("click", function () {
                                $(this).parent().remove();
                            });
                        });

                        $("#roleTags li span").on("click", function () {
                            $(this).parent().remove();
                        });

                        $("#add-roleTag").on("click", () => {
                            $("#roleTags").append(`<li><input type="text" name="roleTags" required><span></span></li>`);

                            $("#roleTags li:last-child span").on("click", function () {
                                $(this).parent().remove();
                            });
                        });

                        $("#tagRoles li span").on("click", function () {
                            $(this).parent().remove();
                        });

                        $("#add-tagRole").on("click", () => {
                            $("#tagRoles").append(`<li><input type="text" name="tagRoles" required><span></span></li>`);

                            $("#tagRoles li:last-child span").on("click", function () {
                                $(this).parent().remove();
                            });
                        });

                        // submit button
                        $("#save").on("click", (event) => {
                            event.preventDefault();

                            const data = toDate();

                            fetch(serverUri + "/uws/v1/dashboard/edit", {
                                method: "POST",
                                headers: {
                                    token: new Cookie().get("token")?.access_token,
                                    administrator: json.id,
                                    casette: params.get("id"),
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(data),
                            })
                                .then((res) => {
                                    res.json().then((json) => {
                                        if (res.status === 200) {
                                            console.log(json);
                                            this.location.reload();
                                        } else {
                                            if (json.message) {
                                                $("#viewer").html(
                                                    `<h1>${res.status} ${res.statusText}: ${json.message}</h1>${retryButton}`
                                                );
                                            } else {
                                                $("#viewer").html(
                                                    `<h1>${res.status} ${res.statusText}</h1>${retryButton}`
                                                );
                                            }
                                        }
                                    });
                                })
                                .catch((error) => {
                                    console.log(JSON.stringify(error, null, 4));
                                    if (error.message.includes("ENOTFOUND")) {
                                        $("#viewer").html("<h1>Server not found</h1>");
                                    } else if (error.message.includes("Failed to fetch")) {
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

                        $("#reissueToken").on("click", () => {
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
                                                this.location.reload();
                                            });
                                        } else {
                                            if (json.message) {
                                                $("#viewer").html(
                                                    `<h1>${res.status} ${res.statusText}: ${json.message}</h1>${retryButton}`
                                                );
                                            } else {
                                                $("#viewer").html(
                                                    `<h1>${res.status} ${res.statusText}</h1>${retryButton}`
                                                );
                                            }
                                        }
                                    });
                                })
                                .catch((error) => {
                                    console.log(JSON.stringify(error, null, 4));
                                    if (error.message.includes("ENOTFOUND")) {
                                        $("#viewer").html("<h1>Server not found</h1>");
                                    } else if (error.message.includes("Failed to fetch")) {
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
                    });
                } else {
                    res.json().then((json) => {
                        if (json.message) {
                            $("#viewer").html(
                                `<h1>${res.status} ${res.statusText}: ${json.message}</h1>${retryButton}`
                            );
                        } else {
                            $("#viewer").html(`<h1>${res.status} ${res.statusText}</h1>${retryButton}`);
                        }
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                if (error.message.includes("ENOTFOUND")) {
                    $("#viewer").html("<h1>Server not found</h1>");
                } else if (error.message.includes("Failed to fetch")) {
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
    });
}

function loadData() {
    $(".spinner").hide();

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
    $("#globalBan #punishment").val(casette.globalBan.punishment);
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
    casette.roleTags.forEach((tag, i) => {
        $("#roleTags")
            .append(`<li><input type="text" name="roleTags" required><span></span></li>`)
            .children("li")
            .eq(i)
            .children("input")
            .val(tag);
    });
    casette.tagRoles.forEach((tag, i) => {
        $("#tagRoles")
            .append(`<li><input type="text" name="tagRoles" required><span></span></li>`)
            .children("li")
            .eq(i)
            .children("input")
            .val(tag);
    });

    firstData = toDate();
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
    data.roleTags = [];
    $("#roleTags li input").each((i, e) => {
        data.roleTags.push($(e).val());
    });
    data.tagRoles = [];
    $("#tagRoles li input").each((i, e) => {
        data.tagRoles.push($(e).val());
    });

    console.log("data:", data);
    return data;
}

function buttonControl () {
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
};