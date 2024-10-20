import { getFunctionBodyString } from "../utils.js";
import { removeAndExportEvents } from "./jtjc-ec/removeAndExportEvents.js";

// The json-to-json-and-csv transformer must take an object as its input argument
// and should return a array of two elements:
// 1. A JSON-like object that can be stringified,
// 2. An array of objects following the same data structure,
// allowing it to be converted into a CSV format.
// Can optionally return array of three elements with third element being object {message: string, type: ToastType} for toast to appear 
function TRANSFORMER_EXAMPLE(data) {
  data.records.push({
    name: "John",
    age: 25,
    employed: true,
  });

  return [data, data.records];
}

window.presets = [
  {
    name: "Event Calendar: удалить события с датами в заданном диапазоне и выгрузить удалённые в CSV ",
    description:
      "Удаляет события с датами в заданном диапазоне и выгружает удалённые события в CSV. Событие удаляется, если дата начала события больше заданной даты начала диапазона, а дата конца события меньше заданной даты конца диапазона. Необходимый диапазон для удаления задаётся в константе DATES_OF_EVENTS_TO_DELETE.",
    code: getFunctionBodyString(removeAndExportEvents),
  },
];
