$(() => {
    let showingXuid = undefined;
    const clicking = () => {
        const show = (name = undefined, xuid = undefined) => {
            const player = GBan.find(item =>
                xuid ? item.xuid === xuid : item.name === name
            );

            $("#name").text(player.name);
            $("#number").text(`No. ${GBan.indexOf(player) + 1}`);
            $(`#reason`).text(`Banned for ${player.reason}`);
            Object.entries(player).forEach(([key, value]) => {
                $(`#${key} p`).text(String(value));
            });
            $(".details-display").fadeIn();
        };

        if (window.location.search) {
            const params = new URLSearchParams(window.location.search);
            xuid = params.get("xuid");
            show(undefined, xuid);
        }

        $(".player h2").click(function () {
            const name = $(this).text();
            show(name);
        });

        $("#proof-btn").click(() => {
            const url = window.location.href.split("?")[0];
            const xuid = $("#xuid p").text();
            const params = new URLSearchParams({ xuid });
            window.location.href = `${url.replace(
                "/index.html",
                ""
            )}proof.html?${params.toString()}`;
        });

        $("#share").click(() => {
            const url = window.location.href.split("?")[0];
            const xuid = $("#xuid p").text();
            const params = new URLSearchParams({ xuid });
            navigator.clipboard.writeText(
                `${url.replace("/index.html", "")}?${params.toString()}`
            );
            const text = $("#share").text();
            $("#share").text("Copied!");
            setTimeout(() => $("#share").text(text), 1000);
        });
    };

    let GBan = [];

    fetch("https://gban.un-known.xyz/list.json")
        .then(response => response.json())
        .then(json => {
            GBan = json;

            const display = GBan.map(
                item => `<div class="player"><h2>${item.name}</h2></div>`
            );
            $(".players").html(display.join(""));

            clicking();
        })
        .catch(console.error);

    $("input[type='search']").on("keyup change blur", function () {
        $("input[type='search']").each(function () {
            if ($(this).val()) {
                const words = $(this).val().split(" ");

                const display = GBan.filter(item =>
                    words.every(word => 
                        Object.values(item).some((value, i) =>
                            i !== 6 ? String(value).match(new RegExp(word, "gi")) : false
                        )
                    )
                ).map(
                    item => `<div class="player"><h2>${item.name}</h2></div>`
                );
                $(".players").html(display.join(""));
            } else {
                const display = GBan.map(
                    item => `<div class="player"><h2>${item.name}</h2></div>`
                );
                $(".players").html(display.join(""));
            }
            clicking();
        });
    });

    $(".cancel-btn").click(() => {
        $(".details-display").fadeOut();
        if (window.location.search) window.location.search = "";
    });
});
