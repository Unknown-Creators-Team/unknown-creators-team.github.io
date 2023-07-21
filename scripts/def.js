$(function() {
    const lang = window.navigator.language || window.navigator.userLanguage || window.navigator.browserLanguage;
    const path = window.location.pathname.split('/');
    if (["ja"].includes(lang)) {
        if (lang !== path[1]) window.location.href = `/${lang}/${path.slice(2)}`;
    }
    

    $(".menu").click(function() {
        $("#nav-mobile").slideToggle();
    });
});