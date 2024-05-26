import {
  downloadBlob,
  hideSplash,
  init,
  transitionRedirect,
  toArray,
  tryBase,
} from "./utils.js";

const nodes = {
  inputCsv: {
    selector: "#input-csv",
    node: undefined,
  },
  inputTransformer: {
    selector: "#input-transformer",
    node: undefined,
  },
  outputArray: {
    selector: "#output-array",
    node: undefined,
  },
  outputJson: {
    selector: "#output-json",
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
};

const state = {
  jsonStr: "",
};

function tryParseInputCsv() {
  return tryBase(() => {
    const rawCsv = nodes.inputCsv.node.value;
    const array = toArray(rawCsv);

    nodes.outputArray.node.value = JSON.stringify(array);

    return array;
  });
}

function tryExecuteTransformer() {
  const callback = () => {
    const csvParseResult = tryParseInputCsv();

    if (!csvParseResult.ok) {
      return;
    }

    const transformerFunctionBody = nodes.inputTransformer.node.value;
    const transformerFunction = new Function("data", transformerFunctionBody);

    return transformerFunction(csvParseResult.payload);
  };

  const check = (callbackResult) => {
    return callbackResult;
  };

  return tryBase(callback, check, "Unable to parse JSON data");
}

function trySetJsonOutput() {
  return tryBase(() => {
    nodes.outputJson.node.value = state.jsonStr;
    nodes.buttonDownload.node.disabled = !state.jsonStr;
  });
}

function transform() {
  const transformerResult = tryExecuteTransformer();

  if (!transformerResult.ok) {
    return transformerResult;
  }

  state.jsonStr = JSON.stringify(transformerResult.payload).toWellFormed();
  trySetJsonOutput();
}

function download() {
  if (!state.jsonStr) {
    return;
  }

  downloadBlob(
    new Blob([state.jsonStr], { type: "application/json" }),
    "data.json"
  );
}

if (init(nodes).ok) {
  nodes.buttonTransform.node.onclick = transform;
  nodes.buttonDownload.node.onclick = download;
  nodes.modeSwitch.node.onclick = transitionRedirect;

  setTimeout(hideSplash, 100);
}
