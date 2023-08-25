const IndexedDBConnector = function(dbName, version=1, models=[]) {
    const object = this;

    object.db;
    object.dbName = '';
    object.version = 1;
    object.modelDict = {};

    this.init = async function(dbName, version=1, models) {
        object.dbName = dbName;
        object.version = version
        object.models = models;
        for (let model of models) {
            if (model.priamryKey == undefined) model.priamryKey = "id";
            object.modelDict[model.name] = model;
        }
    }

    this.checkConnection = async function() {
        if (object.db == undefined) await object.connect();
    }

    this.connect = async function() {
        const request = indexedDB.open(object.dbName, object.version);
        return new Promise(function(resolve, reject) {
            request.onerror = (event) => {
                console.error("Why didn't you allow my web app to use IndexedDB?!");
                reject();
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                object.db = db;
                object.db.onerror = (event) => {
                };
                console.log(object.models);
                for (let model of object.models) {
                    if (model.priamryKey == undefined) model.priamryKey = "id";
                    const item = db.createObjectStore(model.name, {autoIncrement: true, keyPath: model.priamryKey});
                    for (let column of model.column) {
                        let unique = false;
                        if (column.unique) unique = unique = column.unique;
                        item.createIndex(column.name, column.name, {unique: unique})
                    }
                }
            };
            request.onsuccess = (event) => {
                object.db = event.target.result;
                resolve(object.db);
            };
        });
    }

    this.selectAll = async function(modelName) {
        await object.checkConnection();
        const transaction = object.db.transaction([modelName]);
        const objectStore = transaction.objectStore(modelName);
        return new Promise(function(resolve, reject) {
            const request = objectStore.getAll();
            request.onerror = (event) => {
                reject();
            };
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
        });
       
    }

    this.selectByID = async function(modelName, id) {
        await object.checkConnection();
        const transaction = object.db.transaction([modelName]);
        const objectStore = transaction.objectStore(modelName);
        return new Promise(function(resolve, reject) {
            const request = objectStore.get(id);
            request.onerror = (event) => {
                reject();
            };
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
        });
       
    }

    this.insert = async function(modelName, record) {
        await object.checkConnection();
        const transaction = object.db.transaction([modelName], "readwrite");
        const objectStore = transaction.objectStore(modelName);
        return new Promise(function(resolve, reject) {
            const request = objectStore.add(record);
            request.onerror = (event) => {
                reject();
            };
            request.onsuccess = (event) => {
                resolve();
            };
        });
    }

    this.insertMultiple = async function(modelName, records) {
        await object.checkConnection();
        const transaction = object.db.transaction([modelName], "readwrite");
        const objectStore = transaction.objectStore(modelName);
        async function insertEach(objectStore, record) {
            return new Promise(function(resolve, reject) {
                const request = objectStore.add(record);
                request.onerror = (event) => {
                    reject();
                };
                request.onsuccess = (event) => {
                    resolve();
                };
            });
        }
        for (let record of records) {
            await insertEach(objectStore, record);
        }
        return;
    }

    this.update = async function(modelName, data) {
        await object.checkConnection();
        const transaction = object.db.transaction([modelName]);
        const objectStore = transaction.objectStore(modelName);
        return new Promise(function(resolve, reject) {
            const request = objectStore.put(data);
            request.onerror = (event) => {
                reject();
            };
            request.onsuccess = (event) => {
                resolve();
            };
        });
    }

    this.drop = async function(modelName, data) {
        if (object.modelDict[modelName] == undefined) return;
        if (data[object.modelDict[modelName].primaryKey] == undefined) return;
        const id = data[object.modelDict[modelName].primaryKey];
        await object.checkConnection();
        const transaction = object.db.transaction([modelName], "readwrite");
        const objectStore = transaction.objectStore(modelName);
        return new Promise(function(resolve, reject) {
            const request = objectStore.delete(id);
            request.onerror = (event) => {
                reject();
            };
            request.onsuccess = (event) => {
                resolve();
            };
        });
    }

    this.dropByID = async function(modelName, id) {
        if (object.modelDict[modelName] == undefined) return;
        await object.checkConnection();
        const transaction = object.db.transaction([modelName], "readwrite");
        const objectStore = transaction.objectStore(modelName);
        return new Promise(function(resolve, reject) {
            const request = objectStore.delete(id);
            request.onerror = (event) => {
                reject();
            };
            request.onsuccess = (event) => {
                resolve();
            };
        });
    }

    this.clear = async function(modelName) {
        if (object.modelDict[modelName] == undefined) return;
        await object.checkConnection();
        const transaction = object.db.transaction([modelName], "readwrite");
        const objectStore = transaction.objectStore(modelName);
        return new Promise(function(resolve, reject) {
            const request = objectStore.clear();
            request.onerror = (event) => {
                reject();
            };
            request.onsuccess = (event) => {
                resolve();
            };
        });
    }
}

IndexedDBConnector.prototype.start = async function(dbName, version=1, models=[]) {
    let gaimonModels = [
        {
            name:"OfflineRequest", 
            column: [
                {
                    name: "id",
                    unique: true
                },
                {
                    name: "url",
                    unique: false
                },
                {
                    name: "data",
                    unique: false
                },
                {
                    name: "token",
                    unique: false
                }
            ]
        },
        {
            name:"OfflineRequestFile", 
            column: [
                {
                    name: "id",
                    unique: true
                },
                {
                    name: "name",
                    unique: false
                },
                {
                    name: "part",
                    unique: false
                },
                {
                    name: "total",
                    unique: false
                },
                {
                    name: "data",
                    unique: false
                }
            ]
        },
        {
            name:"Token", 
            column: [
                {
                    name: "id",
                    unique: true
                },
                {
                    name: "token",
                    unique: false
                }
            ]
        }

    ]
    gaimonModels.push(...models)
    GLOBAL.DB = new IndexedDBConnector();
    GLOBAL.DB.init(dbName, version, gaimonModels);
    await GLOBAL.DB.connect()
}