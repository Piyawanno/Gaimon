const StockProtocol = function(main) {

    this.getAllUnitMapper = async function(callback) {
        let results = []
        let response = await GET('stock/unit/mapper/get/all');
        if (response == undefined) { 
            if (callback != undefined) callback(results);
            return results;
        }
        if (response.isSuccess) {
            if (callback != undefined) callback(response.results);
            return response.results;
        }
        return results;
    }

    this.getUnitMapper = async function(itemType, callback) {
        let results = []
        let response = await GET(`stock/unit/mapper/get/${itemType}`);
        if (response == undefined) { 
            if (callback != undefined) callback(results);
            return results;
        }
        if (response.isSuccess) {
            if (callback != undefined) callback(response.results);
            return response.results;
        }
        return results;
    }

    this.setUnitMapper = async function(data, callback) {
        let results = {}
        let response = await POST('stock/unit/mapper/set', data);
        if (response == undefined) { 
            if (callback != undefined) callback(results);
            return results;
        }
        if (response.isSuccess) {
            if (callback != undefined) callback(response.results);
            return response.results;
        }
        return results;
    }

    this.dropUnitMapper = async function(id, callback) {
        let data = {id}
        let response = await POST('stock/unit/mapper/drop', data);
        if (response == undefined) { 
            if (callback != undefined) callback();
            return;
        }
        if (response.isSuccess) {
            if (callback != undefined) callback();
            return;
        }
        return;
    }
}