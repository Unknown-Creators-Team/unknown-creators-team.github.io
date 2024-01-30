import { Cookie, cookie, getFromToken } from "../../../init.js";

$(function () {
    const retryButton = `<a href="${window.location}">再試行</a>`;
    let firstData = toDate();

    if (cookie.has("token")) {
        const token = cookie.get("token")?.access_token;
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

                fetch(serverUri + "/uws/v1/dashboard/view", {
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

                                $(".spinner").hide();
                                $("#viewer").show();

                                $("#casetteId").val(params.get("id"));
                                $("#formatVersion").val(casette.formatVersion);
                                $("#owner").val(casette.owner);
                                $("#administrators").val(casette.administrators.join(", "));
                                $("#guildId").val(casette.guildId);
                                $("#language").val(casette.language);
                                $("#serverName").val(casette.serverName);
                                $("#compatible").val(casette.compatible ?? "null");
                                $("#globalBan #enabled").prop("checked", casette.globalBan.enabled);
                                $("#globalBan #punishment").val(casette.globalBan.punishment);
                                $("#blockedIps").val(casette.blockedIps.join(", "));
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
                                $("#roleTags").val(casette.roleTags.join(", "));
                                $("#tagRoles").html(casette.tagRoles.join(", "));

                                firstData = toDate();

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
            })
            .fail(() => cookie.delete("token"));
    } else window.location.href = "/login.html?redirect=" + window.location.href;

    const buttonControl = () => {
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
                    // bottom: "10px",
                });
            } else {
                $("#buttons").css({
                    display: "block",
                    position: "fixed",
                    // bottom: "10px",
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

            // setTimeout(() => {
            //     $("#buttons").css({
            //         display: "none",
            //         opacity: "0",
            //     });
            // }, 0);
        }
    };

    $(window).on("scroll", function () {
        buttonControl();
        // console.log("scroll")
    });

    // keyup
    $(window).on("keyup", function (e) {
        buttonControl();
        // console.log("keyup")
    });

    // click any
    $(window).on("click", function (e) {
        buttonControl();
        // console.log("click")
    });

    // setInterval(() => {
    //     buttonControl();
    // }, 1000);
});

function toDate() {
    const data = {};

    data.administrators = $("#administrators")
        .val()
        .replace(/ /g, "")
        .split(",")
        .filter((v) => v && v.length);
    data.guildId = $("#guildId").val();
    data.language = $("#language").val();
    data.serverName = $("#serverName").val();
    data.compatible = $("#compatible").val() === "null" ? null : $("#compatible").val();
    data.globalBan = {
        enabled: $("#globalBan #enabled").prop("checked"),
        punishment: $("#globalBan #punishment").val(),
    };
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
    data.roleTags = $("#roleTags")
        .val()
        .replace(/ /g, "")
        .split(",")
        .filter((v) => v && v.length);
    data.tagRoles = $("#tagRoles")
        .html()
        .replace(/ /g, "")
        .split(",")
        .filter((v) => v && v.length);

    console.log("data:", data);
    return data;
}
