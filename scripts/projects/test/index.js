$(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('name')) {
        params.set('name', prompt("What is your name?", `user${Math.floor(Math.random() * 1000)}`));
        window.location.search = params.toString();
    }
    const name = params.get('name');

    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
        ws.send(JSON.stringify({ message: name, sender: "system-join" }));
        ws.onmessage = (data) => {
            console.log(data.data)
            const { message: msg, sender } = JSON.parse(data.data);
            console.log(msg);

            if (!sender.startsWith("system")) {
                $("#messages").append(`<li>[${sender}]: ${msg}</li>`);
            } else {
                const process = sender.split("-")[1];
                switch (process) {
                    case "connection": {
                        $("#title").text(msg);
                        break;
                    }
                    case "join": {
                        $("#messages").append(`<li>${msg} is join the chat!</li>`);
                        break;
                    }
                }
            }

        };

        $("button[type='submit']").on('click', function() {
            const msg = $("input[type='text']").val().replace(/\n/g, "\\n");
            if (!msg.length) return;
            $("input[type='text']").val("");
            ws.send(JSON.stringify({ message: msg, sender: name }));
        });

    };

    
    
})