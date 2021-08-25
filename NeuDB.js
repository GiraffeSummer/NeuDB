const fs = require('fs');
const path = require('path');
const DefaultPath = __dirname + "/db"


const baseConfig = {
    data: {},
    autoSave: true,
    asBinary: false,
    cache: false,
    filePath: DefaultPath
}


class NeuDB {
    /**
     *Creates an instance of NeuDB.
     * @param {*} [data={}] default data, even old save files will be updated automatically
     * @param {boolean} [autoSave=true] should it automatically save on push/set
     * @param {*} [path=DefaultPath] path the savefile is in default = "__dirname/settings.json"
     * @memberof NeuDB
     */
    #template
    constructor(config = baseConfig) {
        if (typeof config !== 'object') throw new Error('Config has to be an object');

        let { data, autoSave, asBinary, filePath, cache } = MakeValid(config, baseConfig);

        this.config = config;

        this.#template = JSON.parse(JSON.stringify(data));

        this.asBinary = asBinary;
        this.path = filePath + ((asBinary) ? ".NDB" : ".json");
        this.autoSave = autoSave;

        this.cache = cache;
        if (cache) this.autoSave = false;

        const folder = this.path.replace(path.basename(this.path), "");
        if (this.cache) {
            if (fs.existsSync(this.path)) {
                this.load();
            } else { this.saveData = {}; }
            this.saveData = MakeValid(this.saveData, data);
        } else {
            if (!fs.existsSync(folder)) fs.mkdirSync(folder);

            if (!fs.existsSync(this.path)) {
                this.saveData = data;
            } else {
                this.load();
                //fix potential missing fields
                this.saveData = MakeValid(this.saveData, data);
            }
            this.save();
        }
        return this;
    }
    /**
     *
     *Change filename of save file to: "__dirname/${filename}" don't forget to put .json
     * @memberof NeuDB
     */
    set filename(filename) {
        this.path = __dirname + "/" + filename;
    }

    /**
     *
     * sets value of property
     * @param {*} property property you want to set (ex. "name", or "user.name")
     * @param {*} value value you want to set it to
     * @returns db object instance
     * @memberof NeuDB
     */
    set(property, value) {
        const val = this.#setToObject(this.saveData, property, value);
        if (this.autoSave)
            this.save();
        return val;
    }

    #setToObject(object, property, value) {
        if (property.trim() == "") throw new Error("Invalid key");

        object[property] = value;

        return object;
    }
    /**
     *
     * Get value of property
     * @param {*} property property you want to get (ex. "name", or "user.name")
     * @returns value of property
     * @memberof NeuDB
     */
    get(property) {
        return this.#getFromObject(this.saveData, property);
    }

    #getFromObject(object, property) {
        if (property == undefined || property == "")
            return object;
        else if (object.hasOwnProperty(property) || property in object || object[property] !== undefined) {
            if (typeof object[property] == 'object') {
                object[property].get = (prop) => { return this.#getFromObject(object[property], prop) };
                object[property].set = (prop, val) => {
                    const v = this.#setToObject(object[property], prop, val);
                    if (this.autoSave) this.save();
                    return v;
                };
                object[property].push = (prop, val, force = false) => {
                    const v = this.#pushToArray(object[property], prop, val, force);
                    if (this.autoSave) this.save();
                    return v;
                };
            }

            /* if (Array.isArray(object[property])) {
                 object[property].push = (val, force = false) => {
                     //this.#pushToArray(object, property, val, force);
                     return object.push(property, val, force);;
                 };
             }*/
            return object[property];
        }
        else throw new Error("Invalid key")
    }
    /**
     *
     * push item to array property (no duplicates)
     * @param {*} property property you want to push to (ex. "name", or "user.name")
     * @param {*} value value to add to list
     * @param {boolean} [force=false] if true always add, even if it already exists
     * @returns db object instance
     * @memberof NeuDB
     */
    push(property, value, force = false) {
        const val = this.#pushToArray(this.saveData, property, value, force)
        if (this.autoSave)
            this.save();
        return val;
    }

    #pushToArray(object, property, value, force) {
        if (Array.isArray(object[property])) {
            let canPush = false;

            if (typeof value === "object") {
                canPush = !containsObject(value, object[property]);
            } else {
                canPush = !object[property].includes(value);
            }
            if (canPush || force)
                object[property].push(value);
        }
        else {
            console.log("push", property, object[property])
            throw new Error("not an array")
        }
        return this;
    }

    //delete method at some point


    //reset method
    /**
     * WIP
     * resets the database, overWrite true, will reset the template, off will 
     * @param {*} data data to reset to
     * @param {boolean} [overWrite=false] true, will set back to the template, false will reset the template to data
     * @returns db object instance
     * @memberof NeuDB
     */
    reset(data, overWrite = false) {
        //data needs to be the same as template data,
        //if overWrite is true, then it will change the db to the new data instead
        if (overWrite) {
            this.#template = data;
            this.saveData = data;
            return this;
        } else {
            //const isSame = //JSON.stringify(data) == JSON.stringify(this.#template);

            if (isSame(this.#template, data)) {
                this.saveData = JSON.parse(JSON.stringify(this.#template));
                return this;
            }
            else {
                console.error("Data is not the same as template, make sure this is the same!")
                throw new Error("Data is not the same as template, make sure this is the same!");
            }
        }
    }

    /**
     * Save data to database
     *
     * @memberof NeuDB
     */
    save() {
        if (this.asBinary) {
            let buffer = JSON.stringify(
                Buffer.from(
                    JSON.stringify(this.saveData)
                )
            );

            buffer = JSON.parse(buffer).data;

            SaveRaw(JSON.stringify(buffer), this.path);
        } else {
            SaveJson(this.saveData, this.path);
        }
        return this;
    }
    /**
     * Load data from database
     * called Locally
     * @memberof NeuDB
     */
    load() {
        if (this.asBinary) {
            this.saveData = JSON.parse(
                Buffer.from(
                    JSON.parse(
                        LoadRaw(this.path)
                    )
                ).toString('utf8')
            );
        } else {
            this.saveData = LoadJson(this.path);
        }

        return this;
    }
}
module.exports = NeuDB;
function MakeValid(ob, compare) {
    let newob = {};
    for (let prop in compare) newob[prop] = (!(ob[prop] == null || ob[prop] == undefined)) ? ob[prop] : compare[prop];
    return newob;
}

function isSame(ob, compare) {
    for (let prop in compare) {
        if ((ob[prop] == null || ob[prop] == undefined))
            return false;
    }
    return true;
}

//needs improvement/optimization
function containsObject(obj, list) {
    return list.some((item) => {
        let valueList = []
        for (let key in obj) {
            if (key in item)
                valueList.push(obj[key] == item[key]);
            else return false;
        }
        return valueList.every(x => x);
    })
}

function SaveRaw(data, location) {
    fs.writeFileSync(location, data);
}

function LoadRaw(location) {
    return fs.readFileSync(location);
}

function SaveJson(json, location) {
    let data = JSON.stringify(json, null, 4);
    fs.writeFileSync(location, data);
}

function LoadJson(location) {
    let raw = fs.readFileSync(location);
    //protect if json file is empty
    if (raw.length < 1) return {};
    return JSON.parse(raw);
}