import {
  downloadBlob,
  hideSplash,
  init,
  transitionRedirect,
  toCSV,
  tryBase,
  processFilename,
} from "./utils.js";

const nodes = {
  inputJson: {
    selector: "#input-json",
    node: undefined,
  },
  inputTransformer: {
    selector: "#input-transformer",
    node: undefined,
  },
  outputJson: {
    selector: "#output-json",
    node: undefined,
  },
  outputCsv: {
    selector: "#output-csv",
    node: undefined,
  },
  buttonTransform: {
    selector: "#button-transform",
    node: undefined,
  },
  buttonDownload: {
    selector: "#button-download",
    node: undefined,
  },
  modeSwitch: {
    selector: ".mode-switch",
    node: undefined,
  },
  filenameInput: {
    selector: "#filename",
    node: undefined,
  },
};

const state = {
  csv: "",
};

function tryParseInputJson() {
  return tryBase(() => {
    const uncheckedJson = nodes.inputJson.node.value;
    return JSON.parse(uncheckedJson);
  });
}

function tryExecuteTransformer() {
  const callback = () => {
    const jsonParseResult = tryParseInputJson();

    if (!jsonParseResult.ok) {
      return;
    }

    const transformerFunctionBody = nodes.inputTransformer.node.value;
    const transformerFunction = new Function("data", transformerFunctionBody);

    return transformerFunction(jsonParseResult.payload);
  };

  const check = (callbackResult) => {
    return callbackResult;
  };

  return tryBase(callback, check, "Unable to parse JSON data");
}

function trySetJsonOutput(rawValue) {
  return tryBase(() => {
    const value = JSON.stringify(rawValue);
    nodes.outputJson.node.value = value;

    return value;
  });
}

function trySetCSVOutput() {
  return tryBase(() => {
    nodes.outputCsv.node.value = state.csv;
    nodes.buttonDownload.node.disabled = !state.csv;
  });
}

function transform() {
  const transformerResult = tryExecuteTransformer();

  if (!transformerResult.ok) {
    return transformerResult;
  }

  trySetJsonOutput(transformerResult.payload);
  state.csv = toCSV(transformerResult.payload).toWellFormed();
  trySetCSVOutput();
}

function download() {
  if (!state.csv) {
    return;
  }

  const filename = processFilename(
    nodes.filenameInput.node?.value,
    "data",
    "csv"
  );

  downloadBlob(new Blob([state.csv], { type: "text/csv" }), filename);
}

if (init(nodes).ok) {
  nodes.buttonTransform.node.onclick = transform;
  nodes.buttonDownload.node.onclick = download;
  nodes.modeSwitch.node.onclick = transitionRedirect;

  setTimeout(hideSplash, 100);
}
