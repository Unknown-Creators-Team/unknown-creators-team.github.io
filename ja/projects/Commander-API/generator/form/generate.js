function generate() {
    const output = document.getElementById("output");
    const title = document.getElementById("title").value;
    const body = document.getElementById("body").value;
    const buttons = getButtons();

    const outputJson = JSON.stringify({
        "title": title,
        "body": body
    }, null, 4);

    output.innerHTML = outputJson;
}

function addButton() {
    const buttons = getButtons();
    const buttonsLength = buttons.querySelectorAll("div").length;

    const add = document.getElementById(`add0`);

    if(add) add.hidden = true;

    if(buttonsLength > 0) {
        const add = document.getElementById(`add${buttonsLength}`);

        if(add) add.hidden = true;
    }

    buttons.insertAdjacentHTML("beforeend", `<br id="btnbr${buttonsLength+1}">` + createButtonElement(buttonsLength+1));
}

function removeButton(id) {
    const buttons = getButtons();
    const button = document.getElementById(`button${id}`);
    const btnbr = document.getElementById(`btnbr${id}`);
    const buttonsLength = buttons.querySelectorAll("div").length;

    if(button) {
        button.remove();
        btnbr.remove();

        if(buttonsLength <= 1) {
            
        }
    }
}

function createButtonElement(id) {
    return (`
        <div id="button${id}" class="inline">
            <div>
                <textarea id="body"></textarea>
            </div>
            ${id !== 0 ? `<input type="button" onclick="removeButton(${id})" value="Remove" id="remove${id}">` : ""}
            ${id !== 0 ? `<input type="button" onclick="addButton()" value="Add" id="add${id}">` : ""}
        </div>
        `
    );
}

function getButtons() {
    return document.getElementById("buttons");
}