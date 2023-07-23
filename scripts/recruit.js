$(() => {
    $(".form-button").click(() => {
        $("#recruit-form").fadeIn();
    });

    $(".cancel-btn").click(() => {
        $("#recruit-form").fadeOut();
    });
});