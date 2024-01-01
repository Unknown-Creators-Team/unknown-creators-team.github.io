$(function() {
    const lang = (window.navigator.language || window.navigator.userLanguage || window.navigator.browserLanguage).replace(/[A-Z-]/g, "");
    const path = window.location.pathname.split('/');
    if (["ja"].includes(lang)) {
        if (lang !== path[1]) window.location.href = `/${lang}/${path.slice(2)}`;
    }
    
    // window.location.href = lang;

    $("header").load(`/${path[1]}/header.html`);
    $("footer").load(`/${path[1]}/footer.html`);

    const CLIENT_ID = '1134773310127878274'
    const CLIENT_SECRET = 'mq-4uMfHlixM0rTaODV4Cfq92B2gfxrh'

    class Cookie extends Map {
        constructor() {
            super();
            document.cookie.split(';').forEach(cookie => {
                const [key, value] = cookie.split('=');
                this.set(key.trim(), value);
            });
        }
        set(key, value, expire = 0) {
            if (typeof value === 'object') value = JSON.stringify(value);
            super.set(key, value);
            document.cookie = `${key}=${value};${expire ? `expires=${new Date(Date.now() + expire * 1000).toUTCString()};` : ''}path=/;`;
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
                
                refreshToken(cookie.get("token")).then(j => {
                    cookie.set("token", j, j.expires_in * 9 / 10);
    
                    console.log(json);
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

                    // getGuilds(token).then(json => {
                    //     console.log(json);
                    //     const guilds = json.filter(guild => guild.owner || (guild.permissions & 0x8) === 0x8);
                    //     console.log(guilds);
                    //     // const display = guilds.map(guild => `<div class="guild"><img src="https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png" alt="Icon" class="icon"><h2>${guild.name}</h2></div>`);
                    //     // $(".guilds").html(display.join(""));
                    // })
                    // .fail((e) => console.error(e));
                    
    
                }).fail(() => cookie.delete("token"));
            })
            .fail(() => cookie.delete("token"))
        } else console.log("No token")
    
        
    });

    function getFromToken(token) {
        console.log("first:", token);
        const deferred = $.Deferred();

        fetch('https://discordapp.com/api/users/@me', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => response.json())
        .then(json => {
            if (!json.error) deferred.resolve(json);
                else deferred.reject(json);
        })

        return deferred.promise();
    }

    function refreshToken(json) {
        const deferred = $.Deferred();
        fetch('https://discordapp.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${json.refresh_token}`
        })
        .then(response => response.json())
        .then(json => {
            if (!json.error) deferred.resolve(json);
                else deferred.reject(json);
        });

        return deferred.promise();
    }

    function getGuilds(token) {
        console.log("first:", token);
        const deferred = $.Deferred();

        fetch('https://discordapp.com/api/users/@me/guilds', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => response.json())
        .then(json => {
            if (!json.error) deferred.resolve(json);
                else deferred.reject(json);
        })

        return deferred.promise();
    }
});