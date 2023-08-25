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

async function GET_TEMPLATE(name, isExtension) {
    return eval(`ALL_TEMPLATE.${name}`);
}

async function START_APP() {
    window.location.reload();
}