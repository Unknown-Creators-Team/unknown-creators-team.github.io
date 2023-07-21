$(() => {
    $.getJSON("format.json" , (format) => {
        $.getJSON("users.json" , (USERS) => {
            const users = new Map(USERS);
            const display = ["<div class=\"spinner\"></div>"];
            for (const [_, value] of users) {
                let text = [];
                for (const f of format.texts) {
                    if (f === "$SOCIAL$") {
                        const social = Object.entries(value.social);
                        for (const [k, v] of social) 
                            if (v) text.push((format.social[k].replace(`$${k.toUpperCase()}$`, v)));
                    } else text.push(f);
                }
                text.map((t, i, a) => a[i] = t.replace(/(\$POSITION\$)/g, value.position).replace(/(\$NAME\$)/g, value.name).replace(/(\$IMAGE\$)/g, value.image).replace(/(\$DESCRIPTION\$)/g, value.description));
                display.push(text.join(""));
                $(".users").text(display.join(""));
            }
            display.shift();
            $(".users").html(display.join(""));
        });
    });
});