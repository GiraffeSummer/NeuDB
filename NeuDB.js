const fs = require('fs');
const path = require('path');
const DefaultPath = __dirname + "/db"


const baseConfig = {
    data: {},
    autoSave: true,
    asBinary: false,
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
    constructor(config = baseConfig) {
        if (typeof config !== 'object') return new Error('Config has to be an object');

console.log(__dirname )

        let { data, autoSave, asBinary, filePath } = MakeValid(config, baseConfig);

        this.config = config;

        this.asBinary = asBinary;
        this.path = filePath + ((asBinary) ? ".NDB" : ".json");
        this.autoSave = autoSave;

        const folder = this.path.replace(path.basename(this.path), "");
        if (!fs.existsSync(folder)) fs.mkdirSync(folder);

        if (!fs.existsSync(this.path)) {
            this.saveData = data;
            this.save();
        } else {
            this.load();
            //fix potential missing fields
            this.saveData = MakeValid(this.saveData, data);
            this.save();
        }
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
     * @memberof NeuDB
     */
    set(property, value) {
        if (property.trim() == "") return new Error("Invalid key");

        /*
        const props = property.split(".");
        console.log(props)
        if (props.length > 1)
            for (let i = 0; i < props.length; i++) {
                if (i == props.length - 1) {
                    console.log(props[i], this.saveData[props[i]])
                    this.saveData[props[i]] = value;
                } else {
                    this.set(props[i], this.get(props[i]));
                }
            } else {*/
        this.saveData[property] = value;
        //}


        if (this.autoSave)
            this.save();
    }
    /**
     *
     * Get value of property
     * @param {*} property property you want to get (ex. "name", or "user.name")
     * @returns value of property
     * @memberof NeuDB
     */
    get(property) {
        if (property == undefined || property == "")
            return this.saveData;
        else if (this.saveData.hasOwnProperty(property) || property in this.saveData || this.saveData[property] !== undefined)
            return this.saveData[property]
        else
            return new Error("Invalid key")
    }
    /**
     *
     * push item to array property (no duplicates)
     * @param {*} property property you want to push to (ex. "name", or "user.name")
     * @param {*} value value to add to list
     * @param {boolean} [force=false] if true always add, even if it already exists
     * @memberof NeuDB
     */
    push(property, value, force = false) {
        if (Array.isArray(this.saveData[property])) {
            if (!this.saveData[property].includes(value) || force) {
                this.saveData[property].push(value);

                if (this.autoSave)
                    this.save();
            }
        }
        else {
            console.log("push", property, this.saveData[property])
            throw new Error("not an array")
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
        } else
            SaveJson(this.saveData, this.path);
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
        } else
            this.saveData = LoadJson(this.path);
    }
}
module.exports = NeuDB;
function MakeValid(ob, compare) {
    let newob = {};
    for (let prop in compare) newob[prop] = (!(ob[prop] == null || ob[prop] == undefined)) ? ob[prop] : compare[prop];
    return newob;
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
    return JSON.parse(raw);
}