const fs = require('fs');

async function getMustacheTemplate(branch, callback) {
    function getMustacheTemplateRecursive(path, templateDict) {
        let results = fs.readdirSync(path);
        for (let i in results) {
            if (!fs.lstatSync(path + results[i]).isDirectory()) {
                let content = fs.readFileSync(path+results[i], {encoding:'utf-8'});
                templateDict[results[i].replace('.tpl', '')] = content;
            } else {
                templateDict[results[i]] = {};
                getMustacheTemplateRecursive(path + results[i] + '/', templateDict[results[i]])
            }
        }
    }
    window.ALL_TEMPLATE = {}
    getMustacheTemplateRecursive(`./view/client/`, window.ALL_TEMPLATE);
    let result = window.ALL_TEMPLATE[branch]
    if (callback != undefined) callback(result);
    return result;
}

async function getMustacheIcon(callback) {
	let result = await getMustacheTemplate('icon');
    window.ICON = result;
    if (callback != undefined) callback(result);
    return result;
}

async function GET_TEMPLATE(name, isExtension) {
    let template = undefined;
    for (let branch in window.ALL_TEMPLATE) {
        if (window.ALL_TEMPLATE[branch][name] == undefined) continue;
        template = window.ALL_TEMPLATE[branch][name];
        break;
    }
    return template;
}

async function START_APP() {
    window.location.reload();
}

function BACK(){
	history.back();
}