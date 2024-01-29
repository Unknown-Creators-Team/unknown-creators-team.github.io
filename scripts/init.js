export const CLIENT_ID = "1134773310127878274";
export const CLIENT_SECRET = "mq-4uMfHlixM0rTaODV4Cfq92B2gfxrh";

export class Cookie extends Map {
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

export const cookie = new Cookie();

export function getFromToken(token) {
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

export function refreshToken(json) {
    const deferred = $.Deferred();
    console.log("join:", json)
    fetch("https://discordapp.com/api/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${json.refresh_token}`,
    })
        .then((response) => response.json())
        .then((json) => {
            console.log("get:", json);
            if (!json.error) deferred.resolve(json);
            else deferred.reject(json);
        });

    return deferred.promise();
}

export function getGuilds(token) {
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