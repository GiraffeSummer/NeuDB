//const NeuDB = require('neudb');//use this if you download the package
const NeuDB = require('./NeuDB');//for testing raw file

//data supposed to be saved
const data = {
    name: "John",
    last_name: "Doe",
    age: 36,
    location: {
        continent: "Europe",
        house_number: 5
    },
    notes: ["note 1", "note 2", "note 2"]
};


//template for data
const templateData = {
    name: "",
    last_name: "Doe",//you can also set default values
    age: 0,
    location: {
        continent: "",
        house_number: 0
    },
    notes: []
}

//setup the db object
const db = new NeuDB({
    data: templateData, //set up template data for expected data
    autoSave: true,//auto save (save after any update)
    asBinary: false, //save as binary (false saves as json)
    //cache: true, cache set to true will never save to a file (unless you call db.save())
    //filePath: "path to file"
});

//this db is in memory, and does not need any callbacks, or async/await
//it is also automatically loaded when you create the object

console.log(db.get()); //db.get() returns all saved data

console.log(db.get('name')); // gets the name property of object

console.log(db.get('location')) //gets the location object

//you can use .get chain functions to get embedded properties
db.get('location').get('house_number');  //returns 5 as it's set to 5 above

//you can also set a sub element like this,
db.get('location').set('house_number', 10);



//setting data:
//setting is pretty straight forward

db.set('name', "John")
    //chaining is possible (only with the set and put functions)
    .set('age', 36);

//even with setting objects it's pretty straight forward

db.set('location', {
    continent: "Europe",
    house_number: 5
});



//arrays:

//you can easily add items to an array:
db.put('notes', "note 1");
//put will not allow you to add duplicates
db.put('notes', "note 1");
db.put('notes', "note 2");
//but if you really want to, you can force it with:
db.put('notes', "note 2", true);


//Manual saving:
//if you disable auto save, you'll manually need to call the save function
db.save();



//You can reset the database using db.reset()

db.reset(templateData); // the parameter needs to be an object with the same stucture as the original

//you can overwrite the template object using:
db.reset({ newobject: true }, true);

//without the second parameter set to true, this would throw an error as the object is not the same as templateData
// you can however use a different object that has values filled in, example : data
//you can also do an unsafe reset using:
db.reset(db.get());
//this will always have the correct object, but this would be more unsafe