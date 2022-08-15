import createProperties from "./createProperties.js"

let properties = [];

for (let i = 0; i< 100; i++) {
	const newProperty = createProperties()
	properties = [...properties, newProperty]
}

console.log(properties);

