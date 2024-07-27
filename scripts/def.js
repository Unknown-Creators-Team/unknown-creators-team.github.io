import { cookie, getFromToken, getTextWidth, refreshToken } from "./init.js";

$(function() {
    const lang = (window.navigator.language || window.navigator.userLanguage || window.navigator.browserLanguage).replace(/[A-Z-]/g, "");
    const path = window.location.pathname.split('/');
    if (["ja"].includes(lang)) {
        if (lang !== path[1]) window.location.href = `/${lang}/${path.slice(2)}`;
    }
    
    // window.location.href = lang;

    $("header").load(`/${path[1]}/header.html`);
    $("footer").load(`/${path[1]}/footer.html`);
    
    function activateNav() {
        $(".menu").on("click", function() {
            $("#nav-menu").slideToggle();
        });
        $(".system-login").on("click", () => {
            window.location.href = "/login.html?redirect=" + window.location.href;
        });

        $(".system-logout").hide(); 
    }

    // activateNav();

    const start = Date.now();
    console.log("A");
    $(document).ready(() => {
        console.log("B");
        const loadTime = Date.now() - start;

        console.log(loadTime);

        setTimeout(() => {
            activateNav();
        }, loadTime > 500 ? 500 : loadTime);

        if (cookie.has("token")) {
            const token = cookie.get("token")?.access_token;
            getFromToken(token).then(json => {
                console.log("def:", json);
                console.log("cookie:", cookie.get("token"));
                refreshToken(cookie.get("token")).then(j => {
                    cookie.set("token", j, j.expires_in * 9 / 10);
    
                    
                    $(".menu").html(`<img src="https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.png" alt="Avatar" class="avatar">`);
                    $(".menu").css("margin", "14px 20px 0 0");
                    $(".menu").css("display", "inline");
                    
                    $(".system-logout").show();
                    $(".system-login").hide();
                    $(".header-right").hide();


                    $(".system-logout").click(() => {
                        cookie.delete("token");
                        window.location.reload();
                    });
    
                }).fail(() => cookie.delete("token"));
                
            })
            .fail(() => cookie.delete("token"))
        } else console.log("No token")
    });

    $(".dropdown").each(function () {
        if ($(this).children("div").children("option").length === 0) return;
        const width = $(this).children("div").children("option").map(function () {
            return getTextWidth($(this).text());
        }).get().reduce((a, b) => Math.max(a, b)) * 10 + 40;
        if (Number($(this).css("width").replace(/[^0-9.]/g, "")) < width) {
            $(this).css("width", width + "px");
        }
    });

    // $(".dropdown div option").on("click", function () {
    //     $(this).parent().parent().children("p").text($(this).text());
    //     $(this).parent().slideUp();
    //     $(this).parent().parent().removeClass("dropdown-active");
    // });

    $(".dropdown p").on("click", function () {
        $(this).next().slideToggle();
        $(this).parent().toggleClass("dropdown-active");

        $(".dropdown").each(function () {
            if ($(this).children("div").children("option").length === 0) return;
            const width = $(this).children("div").children("option").map(function () {
                return getTextWidth($(this).text());
            }).get().reduce((a, b) => Math.max(a, b)) * 10 + 40;
            if (Number($(this).css("width").replace(/[^0-9.]/g, "")) < width) {
                $(this).css("width", width + "px");
            }
        });

        $(".dropdown div option").one("click", function () {
            $(this).parent().parent().children("p").text($(this).text());
            $(this).parent().slideUp();
            $(this).parent().parent().removeClass("dropdown-active");
        });
    });

    $(".dropdown input").on("keyup search", function () {
        const value = $(this).val().toLowerCase();
        $(this).parent().children("option").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    $(document).on("click", function (e) {
        if (!$(e.target).closest(".dropdown").length) {
            $(".dropdown div").each(function () {
                $(this).slideUp();
                $(this).parent().removeClass("dropdown-active");
            });
        }
    });

    // <pre><code>...</code></pre> をクリックしたら中身をコピーする
    $("pre code").on("click", function () {
        const text = $(this).text();
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
        $(this).after("<div class='copy'>Copied!</div>");
        setTimeout(() => {
            $(".copy").remove();
        }, 1000);
    });

    $('.info').on('mouseenter', function () {
        const $description = $(this).children('.description');
        const windowWidth = $(window).width();
        const windowHeight = $(window).height();

        $description.css({
            "width": "max-content",
            "left": "0",
            "top": "20px",
        });

        // 右端にはみ出す場合
        let rect = $description[0].getBoundingClientRect();
        console.log (rect.right, $description.width(), windowWidth);
        if (rect.right > windowWidth) {
            console.log("はみだした");
            const newWidth = Math.floor(windowWidth * 0.9 - 20);
            const newLeft = (windowWidth - newWidth) / 3;
            console.log("newWidth:", newWidth, "newLeft:", newLeft);
            console.log("rect.left:", rect.left);
            $description.css({
                "width": `${newWidth}px`,
                "left": `${newLeft - rect.left}px`
            });
        }

        // 下端にはみ出す場合
        rect = $description[0].getBoundingClientRect();
        if (rect.bottom > windowHeight) {
            $description.css('top', `-${rect.height + 20}px`);
        } else {
            $description.css('top', '20px');
        }
    });
});