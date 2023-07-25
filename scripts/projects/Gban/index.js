$(() => {
    const clicking = () => {
        $(".player h2").click(function() {
            const name = $(this).text();
            const player = GBan.find(item => item.name === name);
            $("#name").text(player.name);
            $(`#reason`).text(`Banned for ${player.reason}`);
            Object.entries(player).forEach(([key, value]) => {
                $(`#${key} p`).text(String(value));
            });
            $(".details-display").fadeIn();
        })
    }

    let GBan = [];

    fetch("https://gban.un-known.xyz/list.json")
    .then(response => response.json())
    .then(json => {
        GBan = json;
        
        const display = GBan.map(item => `<div class="player"><h2>${item.name}</h2></div>`);
        $(".players").html(display.join(""));
        
        clicking();
    })
    .catch(console.error);

    $("input[type='search']").on('keyup change blur',function(){
        $("input[type='search']").each(function(){
            if($(this).val()){
                const words = $(this).val().split(" ");
                
                const display = GBan.filter(item => words.every(word => item.name.match(new RegExp(word, "gi")))).map(item => `<div class="player"><h2>${item.name}</h2></div>`);
                $(".players").html(display.join(""));
            } else {
                const display = GBan.map(item => `<div class="player"><h2>${item.name}</h2></div>`);
                $(".players").html(display.join(""));
            }
            clicking();
        });
    });

    $(".cancel-btn").click(() => {
        console.log("cancel")
        $(".details-display").fadeOut();
    })
})