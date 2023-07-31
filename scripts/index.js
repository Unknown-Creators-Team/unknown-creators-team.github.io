$(() => {
    const format = '<div class="project">'
        + '<div class="project-icon circle-img">'
        + '<img src="$IMAGE$" alt="$NAME$">'
        + '<div class="project-button">'
        + '<p>$NAME$</p>'
        + '<a href="$LINK.URL$" target="$LINK.TARGET$">$LINK.TEXT$</a>'
        + '</div>'
        + '</div>'
        + '<p class="txt-contents">$DESCRIPTION$</p>'
        + '</div>';

    $.getJSON("/data/projects.json", (Projects) => {
        const display = [];
        const projects = new Map(Projects);
        for (const [name, value] of projects.entries()) {
            let text = format;
            console.log(JSON.stringify(value, null, 4));
                
            text = text.replace(/\$name\$/gi, name);
            text = text.replace(/\$description\$/gi, value.description);
            text = text.replace(/\$link\.url\$/gi, value.link.url);
            text = text.replace(/\$link\.target\$/gi, value.link.target);
            text = text.replace(/\$link\.text\$/gi, value.link.text);
            text = text.replace(/\$image\$/gi, value.image.url);
            if (!value.image.circle) text = text.replace(/ circle-img/g, "");
            display.push(text);
        }
        display.push('<div class="clear"></div>');
        $(".projects").html(display.join(""));
    });
})