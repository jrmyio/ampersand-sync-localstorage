function guid() {
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
}
module.exports = function (name) {
    return function (method, model, options) {

        var store = localStorage.getItem(name),
            records = (store && store.split(',')) || [];

        var result;
        if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
            model = options.attrs || model.toJSON(options);
        }
        try {
            switch(method) {
                case 'create':
                    if (!model.id) model.id = guid();
                    records.push(model.id.toString());
                case 'update':
                    if(records.indexOf(model.id.toString()) === -1) records.push(model.id.toString());
                    localStorage.setItem(name + '-' + model.id, JSON.stringify(model));
                    break;
                case 'patch':
                    result = localStorage.getItem(name + '-' + model.id);
                    result = result === null ? {} : JSON.parse(result);
                    for (var attrname in model) { result[attrname] = model[attrname]; }
                    localStorage.setItem(name + '-' + model.id, JSON.stringify(model));
                    break;
                case 'delete':
                    records.splice(records.indexOf(model.id.toString()), 1);
                    localStorage.removeItem(name + '-' + model.id);
                    break;
                case 'read':
                    if(!model.id) {
                        result = records
                            .map(function (id) { return JSON.parse(localStorage.getItem(name + '-' + id)); })
                            .filter(function (r) { return r !== null });
                    } else {
                        result = JSON.parse(localStorage.getItem(name + '-' + model.id));
                    }
                    break;
            }
            localStorage.setItem(name, records.join(','));
        } catch (ex) {
            if (options && options.error) options.error(result, 'error', ex.message)
            else throw ex;
        }
        if (options && options.success) options.success(result, 'success');
    };
};