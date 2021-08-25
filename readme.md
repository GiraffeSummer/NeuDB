# NeuDB
## A simple in-memory database

NeuDb is a simple in-memory database package I made as I needed it in some of my projects, it works very well with Electron, but it also works in any other application, it would not be ideal as a proper database, most likely just as local storage alternative.

I released it publicly for feedback, and for fun. hope helps!

documentation is WIP   
read  [`example.js`](./example.js) for specifics.

<br>

## Basic example
### Setup
```js
const NeuDB = require('neudb');

const template = {
    name: "",
    last_name: "Doe",//set default value
    age: 0,
    location: {
        continent: "",
        house_number: 0
    },
    notes: []
};

const db = new NeuDB({
    data: template, //set up template data for expected data
});

//OR
const db = new NeuDB({
    data: {//shorten version for readability
        name: "",
        last_name: "Doe",
        notes: []
    },
});
``` 
### Get Data
```js
db.get('name');
```

### Set Data
```js
db.set('name','John');
```

### Chaining Data
you can also chain most basic functions (get, set, put)
ex.
```js
db.get('location').set('house_number', 5);
//or
db.get('location').get('house_number');
```
When chaining you will (should) receive the last object accessed.


<br>

## Constructor Properties
#### `data`
- **required**
- default: `{}`
- Data is a required property used to set the base data for the database, this is useful if you always expect a certain dataset for your database.
#### `autoSave`
- default: `true`
- Autosave is if it automatically saves the database on any change.
#### `asBinary`
- default: `false`
- asBinary is if it will save as a readable json file. or unreadable (sortof) binary file.
#### `filePath`
- default: ` __dirname + "/db"` (+ file extension) //not ideal path, but it works
- filepath is the path of the data file it will write the data to (without the file extension).
- #### `cache`
- default: `false` 
- with cache set to true, the data will never be stored to disk (unless you call `db.save()`), it can still load the data if the file exists
  this will overwrite the value for autoSave to false. 

<br>

## Functions

### Get 
Get is the basic function to get data from the database.
you can use it very straight forward like:
```js
db.get('property_name');
```
This function is chainable to get embedded property values.

### Set 
Set is the basic function to set data on the database.
you can use it like:
```js
db.set('property_name', property_value);
```
This function is also chainable to set embedded property values.

### Put (previously `push`)
Put is the basic function to put data into an array property.
If a property is an array, you can put an object onto it using `put`
ex.
```js
db.put('notes', "make readme file");
```
Put is also chainable to put onto embedded properties.
ex.
```js
//template: {user: {name: "John", notes: []}}

db.get('user').put('notes', "Make readme file")
```
put does not allow duplicates by default, you can force put a value into the array using the 3rd property `force`, like so:
```js
db.put('notes', "make readme file", true);
```
Force is false by default.

### Save
Save is needed to save the data, this will be done automatically if you enable autosave, so in that case you don't need to worry about this.
Otherwise, you can call it like this:
```js
db.save(); //returns db object (for chaining)
```

### Load 
Load is used to load the data on initialization, you can always call it. This could be useful if you want to undo changes and you haven't saved the changes yet (with autosave off).

You use it like:
```js
db.load(); //returns db object for chaining
```
This will automatically set the data to the loaded data, and return the db object.

### Reset 
Reset is an advanced function to reset the database structure

You use it like:
```js
db.load(template);
```
it needs the parameter to be an object with the same properties as the original, otherwise it will throw an error
you can overwrite this with a second parameter like this:
```js
db.load({newObject: "this is an example"}, true);
```
this would overwrite the template to the new structure.

you can do an unsafe reset using:
```js
db.load(db.get());
```
but this is not recommended