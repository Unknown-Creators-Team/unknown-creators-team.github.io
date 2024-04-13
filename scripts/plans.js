import { cookie, getFromToken } from "./init.js";



$(function () {
    $("#login").on("click", function () {
        window.location.href = "/login.html?redirect=" + window.location.href;
    });

    if (cookie.has("token")) {
        console.log("token:", cookie.get("token"));
        let token = cookie.get("token")?.access_token;
        getFromToken(token)
        .then((json) => {
            console.log("user:", json);

            $("#plans stripe-pricing-table").attr("client-reference-id", json.id);
            $("#plans stripe-pricing-table").attr("customer-email", json.email);

            $("#process").hide();
            $("#plans").show();
        })
        .fail(() => {
            console.log("no user");
            $("#process").hide();
            $("#login").show();
        });
        
    } else {
        console.log("no token");
        $("#process").hide();
        $("#login").show();
    }
});
