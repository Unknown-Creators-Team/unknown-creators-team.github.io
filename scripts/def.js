import { cookie, getFromToken, refreshToken } from "./init.js";

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
    $(window).on("load", () => {
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
});