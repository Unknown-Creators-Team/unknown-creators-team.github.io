$(function () {
    if (window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const xuid = params.get("xuid");
        
        fetch("https://gban.un-known.xyz/list.json")
            .then(response => response.json())
            .then(GBan => {
                const player = GBan.find(item => item.xuid === xuid);
                
                // proofが画像か動画かで分岐
                if (player.proof.endsWith(".mp4")) {
                    $(".proof").html(`<video src="${player.proof}" controls></video><p id="open-new-tab">新しいタブで開く</p>`);
                } else {
                    $(".proof").html(`<img src="${player.proof}" alt="Proof"><p id="open-new-tab">新しいタブで開く</p>`);
                }
                $("#open-new-tab").click(() => window.open(player.proof));
                // fetch(player.proof, { mode: "no-cors" })
                // .then(response => response.formData())
                // .then(json => {
                //     console.log(json)
                // })
                // .catch(console.error);
            })
            .catch(console.error);

        $("#back-btn").click(() => {
            window.location.href = `./${window.location.search}`;
        });
    } else window.location.href = "./";
});
