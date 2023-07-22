$(() => {
    const path = new Map(window.location.search.split('?').slice(1).join('?').split('&').map((v) => v.split('=')));
    $("#url").text(path.get("url"));
})