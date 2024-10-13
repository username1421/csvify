import { getFunctionBodyString } from "../utils.js";

// The json-to-json-and-csv transformer must take an object as its input argument 
// and should return a tuple of two elements:
// 1. A JSON-like object that can be stringified,
// 2. An array of objects following the same data structure,
// allowing it to be converted into a CSV format.
function TRANSFORMER_EXAMPLE(data) {
  data.records.push({
    name: "John",
    age: 25,
    employed: true,
  });

  return [data, data.records];
}

function deleteLastRecordAndExportEmploymentStatus(data) {
  data.records = data.records.slice(0, -1);

  const empStatus = data.records.map(({ name, employed }) => ({
    name,
    employed,
  }));

  return [data, empStatus];
}

window.presets = [
  {
    name: "Удалить последнюю запись и выгрузить статусы о работе",
    description: "Бонк!",
    code: getFunctionBodyString(deleteLastRecordAndExportEmploymentStatus),
  },
];
