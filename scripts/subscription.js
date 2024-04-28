import { Cookie, cookie, getFromToken, refreshToken, waitNewToken } from "./init.js";
let token, params, serverUri, account, casette, firstData, defaultData;
const retryButton = `<a href="${window.location}">再試行</a>`;

$(async function () {
    // defaultData = $("#viewer").html();
    // firstData = toDate();
    await waitNewToken();
    token = cookie.get("token")?.access_token;
    account = await getFromToken(token).fail(() => cookie.delete("token"));
    if (account && account.message) account = undefined;

    if (!account) {
        window.location.href = "/login.html?redirect=" + window.location.href;
    }
    
    console.log("account:", account);
    
    params = new URLSearchParams(window.location.search);
    serverUri = "https://api.un-known.xyz:22003";
    if (params.has("local1")) serverUri = "http://127.0.0.1:22002";
    if (params.has("local2")) serverUri = "http://192.168.1.42:22002";
    if (params.has("local3")) serverUri = "http://192.168.1.45:22002";
    if (params.has("dev")) serverUri = "http://dev.un-known.xyz:22002";
    if (params.has("unsecure")) serverUri = "http://api.un-known.xyz:22002";

    // $("form").attr("action", serverUri + "/uws/v1/subscription/portal");

    fetch(serverUri + "/uws/v1/subscription/get", {
        headers: {
            token: cookie.load().get("token")?.access_token
        }
    })
    .then(res => {
        console.log(res);
        if (res.status === 200) {
            res.json().then((json) => {
                console.log(json);
                let status = "不明";
                // "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid"
                if (json.status === "active") status = "有効";
                if (json.status === "canceled") status = "キャンセル済み";
                if (json.status === "incomplete") status = "未完了";
                if (json.status === "incomplete_expired") status = "未完了(期限切れ)";
                if (json.status === "past_due") status = "延滞";
                if (json.status === "paused") status = "一時停止";
                if (json.status === "trialing") status = "トライアル中";
                if (json.status === "unpaid") status = "未払い";

                const timeToStr = (time) => new Date(time * 1000).toLocaleString();

                $("#product h1").text(json.product);
                $("#status p").text(status);
                $("#price p").text(`${json.subscription.amount} ${json.subscription.currency.toUpperCase()} / ${json.interval.count}${json.interval.type}`);
                $("#start p").text(timeToStr(json.subscription.created));
                $("#next p").text(timeToStr(json.subscription.current_period_end));

                $(".subscription-wrapper").show();
                $(".manage-wrapper").show();
                $(".spinner").hide();
            });
        } else {
            res.json().then((json) => {
                if (json.message) {
                    $(".subscription-wrapper").html(`<h1>${res.status} ${res.statusText}: ${json.message}</h1>${retryButton}`);
                } else {
                    $(".subscription-wrapper").html(`<h1>${res.status} ${res.statusText}</h1>${retryButton}`);
                }
                $(".subscription-wrapper").show();
            });
        }
    })
    .catch(error => {
        console.error(error);
        if (error.message.includes("ENOTFOUND")) {
            $(".subscription-wrapper").html("<h1>Server not found</h1>");
        } else if (error.message.includes("Failed to fetch")) {
            $(".subscription-wrapper").html(
                [
                    `<h1>Failed to fetch data</h1>`,
                    retryButton,
                    `<a href="./subscription.html?local1">local1</a>`,
                    `<a href="./subscription.html?local2">local2</a>`,
                    `<a href="./subscription.html?local3">local3</a>`,
                    `<a href="./subscription.html?dev">dev</a>`,
                    `<a href="./subscription.html?unsecure">unsecure</a>`,
                ].join("<br>")
            );
        } else {
            $(".subscription-wrapper").html("<h1>Error occurred</h1>${retryButton}");
        }
        $(".subscription-wrapper").show();
    });

    $("#manage").one("click", function () {
        $(".manage-wrapper").addClass("active");
        $("#manage h3").text("Stripeにリクエスト中...")
        //event.preventDefault();
        fetch(serverUri + "/uws/v1/subscription/portal", {
            headers: {
                token: cookie.load().get("token")?.access_token,
                "return-url": window.location.href
            }
        })
        .then(res => {
            console.log(res);
            if (res.status === 200) {
                res.json().then((json) => {
                    console.log(json);
                    $("#manage h3").text("リダイレクト中...");
                    window.location.href = json.url;
                });
            } else {
                res.json().then((json) => {
                    if (json.message) {
                        $(".subscription-wrapper").html(`<h1>${res.status} ${res.statusText}: ${json.message}</h1>${retryButton}`);
                    } else {
                        $(".subscription-wrapper").html(`<h1>${res.status} ${res.statusText}</h1>${retryButton}`);
                    }
                });
            }
        })
        .catch(error => {
            console.error(error);
            if (error.message.includes("ENOTFOUND")) {
                $(".subscription-wrapper").html("<h1>Server not found</h1>");
            } else if (error.message.includes("Failed to fetch")) {
                $(".subscription-wrapper").html(
                    [
                        `<h1>Failed to fetch data</h1>`,
                        retryButton,
                        `<a href="./subscription.html?local1">local1</a>`,
                        `<a href="./subscription.html?local2">local2</a>`,
                        `<a href="./subscription.html?local3">local3</a>`,
                        `<a href="./subscription.html?dev">dev</a>`,
                        `<a href="./subscription.html?unsecure">unsecure</a>`,
                    ].join("<br>")
                );
            } else {
                $(".subscription-wrapper").html("<h1>Error occurred</h1>${retryButton}");
            }
        });
    });


    // if (cookie.has("token")) {
    //     token = cookie.get("token")?.access_token;
    //     getFromToken(token)
    //         .then((json) => {
    //             account = json;
    //             console.log(account);

    //             params = new URLSearchParams(window.location.search);
    //             serverUri = "https://api.un-known.xyz:22003";
    //             if (params.has("local1")) serverUri = "http://127.0.0.1:22002";
    //             if (params.has("local2")) serverUri = "http://192.168.1.42:22002";
    //             if (params.has("local3")) serverUri = "http://192.168.1.45:22002";
    //             if (params.has("dev")) serverUri = "http://dev.un-known.xyz:22002";
    //             if (params.has("unsecure")) serverUri = "http://api.un-known.xyz:22002";

    //             if (!params.has("id")) window.location.href = "./subscription.html" + window.location.search;
    //             if (!account || !token) window.location.href = "/login.html?redirect=" + window.location.href;

    //             getConfig();
    //         })
    //         .fail(() => cookie.delete("token"));
    // } else window.location.href = "/login.html?redirect=" + window.location.href;

});