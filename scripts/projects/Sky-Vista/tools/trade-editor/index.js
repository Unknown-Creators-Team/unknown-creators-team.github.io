$(document).ready(function () {
    var enchantsList = [
        'protection',
        'fire_protection',
        'feather_falling',
        'blast_protection',
        'projectile_protection',
        'thorns',
        'respiration',
        'depth_strider',
        'aqua_affinity',
        'sharpness',
        'smite',
        'bane_of_arthropods',
        'knockback',
        'fire_aspect',
        'looting',
        'efficiency',
        'silk_touch',
        'unbreaking',
        'fortune',
        'power',
        'punch',
        'flame',
        'infinity',
        'luck_of_the_sea',
        'lure',
        'frost_walker',
        'mending',
        'binding_curse',
        'vanishing_curse',
        'impaling',
        'riptide',
        'loyalty',
        'channeling',
        'sweeping',
        'multishot',
        'piercing',
        'quick_charge',
        'soul_speed'
    ];

    let tradeData = {
        name: "",
        content: {
            prices: [],
            outputs: [],
        },
    };

    $("#add-price").click(function () {
        tradeData.content.prices.push({
            typeId: "",
            amount: 0,
            nameTag: undefined,
            lore: [],
            lockMode: "none",
            canDestroy: [],
            canPlaceOn: [],
            enchants: [],
            display: undefined,
        });
        updateEditor();
    });

    $("#add-output").click(function () {
        tradeData.content.outputs.push({
            typeId: "",
            amount: 0,
            nameTag: undefined,
            lore: [],
            lockMode: "none",
            canDestroy: [],
            canPlaceOn: [],
            enchants: [],
            display: undefined,
        });
        updateEditor();
    });

    $("#export-json").click(function () {
        function replacer(key, value) {
            return value === undefined ? null : value;
        }
        
        let json = JSON.stringify(tradeData, replacer, 4).replace(/null/g, 'undefined');
        $("#json-output").val(json);
        
        let lineCount = json.split('\n').length;
        $("#json-output").css('height', `${lineCount}em`);
    });

    $("#import-json").click(function () {
        try {
            const json = JSON.parse($("#json-output").val().replace(/undefined/g, 'null'));
            tradeData = json;
            updateEditor();
        } catch (error) {
            console.error(error);
            alert('Invalid JSON');
            // Optionally, display an error message to the user
        }
    });

    function updateEditor() {
        // Clear the editor
        $("#edit-panel").empty();

        // Add name field
        $("#edit-panel").append('<label for="name">Name:</label>');
        $("#edit-panel").append('<input type="text" id="name" name="name" value="' + tradeData.name + '">');

        // Add prices array
        $('#edit-panel').append('<div id="prices"></div>');
        $('#prices').append('<button id="add-price">Add Price</button>');
        tradeData.content.prices.forEach(function(price, index) {
            $('#prices').append('<div id="price-' + index + '"></div>');
            $('#price-' + index).append('<label for="typeId">Type ID:</label>');
            $('#price-' + index).append('<input type="text" id="typeId" name="typeId" value="' + price.typeId + '">');
            $('#price-' + index).append('<label for="amount">Amount:</label>');
            $('#price-' + index).append('<input type="number" id="amount" name="amount" value="' + price.amount + '">');
            $('#price-' + index).append('<label for="nameTag">Name Tag:</label>');
            $('#price-' + index).append('<input type="text" id="nameTag" name="nameTag" value="' + (price.nameTag || '') + '">');
            $('#price-' + index).append('<label for="lockMode">Lock Mode:</label>');
            $('#price-' + index).append('<select id="lockMode" name="lockMode"><option value="none">None</option><option value="slot">Slot</option><option value="inventory">Inventory</option></select>');
            $('#price-' + index).append('<label for="display">Display:</label>');
            $('#price-' + index).append('<input type="text" id="display" name="display" value="' + (price.display || '') + '">');
            $('#price-' + index).append('<label for="lore">Lore:</label>');
            $('#price-' + index).append('<textarea id="lore" name="lore" maxlength="420">' + (price.lore.join('\n') || '') + '</textarea>');
            $('#price-' + index).append('<label for="canDestroy">Can Destroy:</label>');
            $('#price-' + index).append('<input type="text" id="canDestroy" name="canDestroy" value="' + (price.canDestroy.join(',') || '') + '">');
            $('#price-' + index).append('<label for="canPlaceOn">Can Place On:</label>');
            $('#price-' + index).append('<input type="text" id="canPlaceOn" name="canPlaceOn" value="' + (price.canPlaceOn.join(',') || '') + '">');
            $('#price-' + index).append('<div id="enchants-' + index + '"></div>');
            price.enchants.forEach(function(enchant, enchantIndex) {
                $('#enchants-' + index).append('<div id="enchant-' + enchantIndex + '"></div>');
                $('#enchant-' + enchantIndex).append('<select id="enchantName" name="enchantName"></select>');
                enchantsList.forEach(function(enchantName) {
                    $('#enchant-' + enchantIndex + ' select[name="enchantName"]').append('<option value="' + enchantName + '">' + enchantName + '</option>');
                });
                $('#enchant-' + enchantIndex + ' select[name="enchantName"]').val(enchant.name);
                $('#enchant-' + enchantIndex).append('<input type="number" id="enchantLevel" name="enchantLevel" value="' + enchant.level + '">');
                $('#enchant-' + enchantIndex).append('<button class="delete-enchant" data-index="' + enchantIndex + '">Delete Enchant</button>');
            });
            $('#price-' + index).append('<button class="add-enchant" data-index="' + index + '">Add Enchant</button>');
            // Add other fields...
            $('#price-' + index).append('<button class="delete-price" data-index="' + index + '">Delete Price</button>');
        });

        // Add outputs array
        $('#edit-panel').append('<div id="outputs"></div>');
        $('#outputs').append('<button id="add-output">Add Output</button>');
        tradeData.content.outputs.forEach(function(output, index) {
            $('#outputs').append('<div id="output-' + index + '"></div>');
            $('#output-' + index).append('<label for="typeId">Type ID:</label>');
            $('#output-' + index).append('<input type="text" id="typeId" name="typeId" value="' + output.typeId + '">');
            $('#output-' + index).append('<label for="amount">Amount:</label>');
            $('#output-' + index).append('<input type="number" id="amount" name="amount" value="' + output.amount + '">');
            $('#output-' + index).append('<label for="nameTag">Name Tag:</label>');
            $('#output-' + index).append('<input type="text" id="nameTag" name="nameTag" value="' + (output.nameTag || '') + '">');
            $('#output-' + index).append('<label for="lockMode">Lock Mode:</label>');
            $('#output-' + index).append('<select id="lockMode" name="lockMode"><option value="none">None</option><option value="slot">Slot</option><option value="inventory">Inventory</option></select>');
            $('#output-' + index).append('<label for="display">Display:</label>');
            $('#output-' + index).append('<input type="text" id="display" name="display" value="' + (output.display || '') + '">');
            $('#output-' + index).append('<label for="lore">Lore:</label>');
            $('#output-' + index).append('<textarea id="lore" name="lore" maxlength="420">' + (output.lore.join('\n') || '') + '</textarea>');
            $('#output-' + index).append('<label for="canDestroy">Can Destroy:</label>');
            $('#output-' + index).append('<input type="text" id="canDestroy" name="canDestroy" value="' + (output.canDestroy.join(',') || '') + '">');
            $('#output-' + index).append('<label for="canPlaceOn">Can Place On:</label>');
            $('#output-' + index).append('<input type="text" id="canPlaceOn" name="canPlaceOn" value="' + (output.canPlaceOn.join(',') || '') + '">');
            $('#output-' + index).append('<div id="enchants-' + index + '"></div>');
            output.enchants.forEach(function(enchant, enchantIndex) {
                $('#enchants-' + index).append('<div id="enchant-' + enchantIndex + '"></div>');
                $('#enchant-' + enchantIndex).append('<select id="enchantName" name="enchantName"></select>');
                enchantsList.forEach(function(enchantName) {
                    $('#enchant-' + enchantIndex + ' select[name="enchantName"]').append('<option value="' + enchantName + '">' + enchantName + '</option>');
                });
                $('#enchant-' + enchantIndex + ' select[name="enchantName"]').val(enchant.name);
                $('#enchant-' + enchantIndex).append('<input type="number" id="enchantLevel" name="enchantLevel" value="' + enchant.level + '">');
                $('#enchant-' + enchantIndex).append('<button class="delete-enchant" data-index="' + enchantIndex + '">Delete Enchant</button>');
            });
            $('#output-' + index).append('<button class="add-enchant" data-index="' + index + '">Add Enchant</button>');
            // Add other fields...
            $('#output-' + index).append('<button class="delete-output" data-index="' + index + '">Delete Output</button>');
        });

        // Add event handlers for delete buttons
        $(".delete-price").click(function () {
            let index = $(this).data("index");
            tradeData.content.prices.splice(index, 1);
            updateEditor();
        });

        $(".delete-output").click(function () {
            let index = $(this).data("index");
            tradeData.content.outputs.splice(index, 1);
            updateEditor();
        });

        // Add event handlers for input fields
        $("#name").change(function () {
            tradeData.name = $(this).val();
        });

        // Add event handlers for typeId, amount, nameTag, lockMode, display fields
        $(
            'input[name="typeId"], input[name="amount"], input[name="nameTag"], select[name="lockMode"], input[name="display"]'
        ).change(function () {
            let index = $(this).parent().attr("id").split("-")[1];
            let parent = $(this).parent().parent().attr("id");
            let field = $(this).attr("name");
            if (parent === "prices") {
                tradeData.content.prices[index][field] = $(this).val();
            } else if (parent === "outputs") {
                tradeData.content.outputs[index][field] = $(this).val();
            }
        });

        // Add event handlers for typeId, amount, nameTag, lockMode, display, lore, canDestroy, canPlaceOn fields
        $('input[name="typeId"], input[name="amount"], input[name="nameTag"], select[name="lockMode"], input[name="display"], textarea[name="lore"], input[name="canDestroy"], input[name="canPlaceOn"]').change(function() {
            let index = $(this).parent().attr('id').split('-')[1];
            let parent = $(this).parent().parent().attr('id');
            let field = $(this).attr('name');
            if (parent === 'prices') {
                if (field === 'lore' || field === 'canDestroy' || field === 'canPlaceOn') {
                    tradeData.content.prices[index][field] = $(this).val().split(',');
                } else {
                    tradeData.content.prices[index][field] = $(this).val();
                }
            } else if (parent === 'outputs') {
                if (field === 'lore' || field === 'canDestroy' || field === 'canPlaceOn') {
                    tradeData.content.outputs[index][field] = $(this).val().split(',');
                } else {
                    tradeData.content.outputs[index][field] = $(this).val();
                }
            }
        });

        $('textarea[name="lore"]').change(function() {
            let index = $(this).parent().attr('id').split('-')[1];
            let parent = $(this).parent().parent().attr('id');
            let field = $(this).attr('name');
            let values = $(this).val().split('\n').slice(0, 20).map(function(value) { return value.slice(0, 20); });
            if (parent === 'prices') {
                tradeData.content.prices[index][field] = values;
            } else if (parent === 'outputs') {
                tradeData.content.outputs[index][field] = values;
            }
        });

        $('textarea[name="lore"]').on('keyup', function() {
            let text = $(this).val();
            let lineCount = text.split('\n').length;
            $(this).css('height', `${lineCount + 3}em`);
        }).trigger('keyup');

        // Add event handlers for enchants field
        $('select[name="enchantName"], input[name="enchantLevel"]').change(function() {
            let enchantIndex = $(this).parent().attr('id').split('-')[1];
            let priceIndex = $(this).parent().parent().attr('id').split('-')[1];
            let field = $(this).attr('name');
            if (field === 'enchantName') {
                tradeData.content.prices[priceIndex].enchants[enchantIndex].name = $(this).val();
            } else if (field === 'enchantLevel') {
                tradeData.content.prices[priceIndex].enchants[enchantIndex].level = parseInt($(this).val());
            }
        });

        $('.delete-enchant').click(function() {
            let enchantIndex = $(this).data('index');
            let priceIndex = $(this).parent().parent().attr('id').split('-')[1];
            tradeData.content.prices[priceIndex].enchants.splice(enchantIndex, 1);
            updateEditor();
        });

        $('.add-enchant').click(function() {
            let priceIndex = $(this).data('index');
            tradeData.content.prices[priceIndex].enchants.push({ name: 'protection', level: 1 });
            updateEditor();
        });

        // Add event handlers for add buttons
        $("#add-price").click(function () {
            tradeData.content.prices.push({
                typeId: "",
                amount: 0,
                nameTag: undefined,
                lore: [],
                lockMode: "none",
                canDestroy: [],
                canPlaceOn: [],
                enchants: [],
                display: undefined,
            });
            updateEditor();
        });

        $("#add-output").click(function () {
            tradeData.content.outputs.push({
                typeId: "",
                amount: 0,
                nameTag: undefined,
                lore: [],
                lockMode: "none",
                canDestroy: [],
                canPlaceOn: [],
                enchants: [],
                display: undefined,
            });
            updateEditor();
        });

        $("#add-price").text("価格を追加");
        $(".delete-price").text("価格を削除");
        $("#add-output").text("出力を追加");
        $(".delete-output").text("出力を削除");
        $(".add-enchant").text("エンチャントを追加");
        $(".delete-enchant").text("エンチャントを削除");
        $("#export-json").text("JSONをエクスポート");
        $("#import-json").text("JSONをインポート");
    }

    // Initialize the editor
    updateEditor();
});
