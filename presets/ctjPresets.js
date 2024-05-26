import { getFunctionBodyString } from "../utils.js";

// csv-to-json transformer must take an array of objects with the same data structure as its input argument 
// and should return an JSON-like object that could be stringified, 
// allowing it to be converted into a JSON format
function TRANSFORMER_EXAMPLE(data) {
  data.push({
    name: 'Bob',
    age: 24,
    employed: false
  });

  return { data };
}

window.presets = [];
