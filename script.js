const buttons = {
  run: {
    node: undefined,
    selector: '#button-run'
  },
  download: {
    node: undefined,
    selector: '#button-download'
  }
};

const textareas = {
  inputs: {
    json: {
      node: undefined,
      selector: 'textarea#input-json'
    },
    migration: {
      node: undefined,
      selector: 'textarea#input-migration'
    }
  },
  outputs: {
    json: {
      node: undefined,
      selector: 'textarea#output-json'
    },
    csv: {
      node: undefined,
      selector: 'textarea#output-csv'
    }
  }
};

const data = {
  csv: ""
}

const newline = '\r\n';
const comma = ',';

function downloadBlob(blob, filename = 'data.csv') {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

function csvifyStr(str) {
  if (!str.includes(comma) || str.startsWith('\"') && str.endsWith('\"') || str.startsWith('\'') && str.endsWith('\'')) {
    return str;
  }

  return `"${str.replaceAll('\"', '\'')}"`;
}

function toCSV(arr = []) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return "";
  }

  let keys = [];
  let result = [];
  let line = [];

  const pushToLine = (elem) => {
    if (typeof elem === 'string') {
      line.push(csvifyStr(elem));
      return;
    }

    line.push(elem);
  };

  for (let i = 0; i < arr.length; i++) {
    const elem = arr[i];

    if (typeof elem !== 'object' || elem === null) {
      continue;
    }

    line = [];

    // first object declares keys
    if (keys.length === 0) {
      for (const key in elem) {
        if (typeof elem[key] !== "object" && !Array.isArray(elem[key])) {
          keys.push(key);
          pushToLine(elem[key]);
        }
      }
    } else {
      keys.forEach(key => {
        if (typeof elem[key] !== "object" && !Array.isArray(elem[key])) {
          pushToLine(elem[key]);
        } else {
          line.push(undefined);
        }
      });
    }

    result.push(line.join(comma));
  }

  return [keys.join(comma), result.join(newline)].join(newline);
}

function tryBase(callback, check = () => true, checkFailPayload = '') {
  try {
    const result = callback();

    if (!check(result)) {
      return {
        ok: false,
        payload: checkFailPayload
      }
    }

    return {
      ok: true,
      payload: result
    }
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      payload: error
    }
  }
}

function testTextarea(firstLevelKey, secondLevelKey) {
  const callback = () => {
    const textareaObject = textareas[firstLevelKey][secondLevelKey];

    if (!textareaObject.node) {
      textareaObject.node = document.querySelector(textareaObject.selector);
    }

    return textareaObject;
  };

  const check = (textareaObject) => {
    return textareaObject.node;
  };

  return tryBase(callback, check, `Unable to find ${firstLevelKey}.${secondLevelKey} textarea`);
}

function testButtons(key) {
  const callback = () => {
    const buttonObject = buttons[key];

    if (!buttonObject.node) {
      buttonObject.node = document.querySelector(buttonObject.selector);
    }

    return buttonObject;
  };

  const check = (buttonObject) => {
    return buttonObject.node;
  };

  return tryBase(callback, check, `Unable to find ${key} button`);
}

function tryParseInputJson() {
  const textareaTestResult = testTextarea('inputs', 'json');

  if (!textareaTestResult.ok) {
    return textareaTestResult;
  }

  return tryBase(() => {
    const uncheckedJson = textareas.inputs.json.node.value;
    return JSON.parse(uncheckedJson);
  });
}

function tryExecuteMigration() {
  const textareaTestResult = testTextarea('inputs', 'migration');

  if (!textareaTestResult.ok) {
    return textareaTestResult;
  }

  const callback = () => {
    const jsonParseResult = tryParseInputJson();

    if (!jsonParseResult.ok) {
      return;
    }

    const migrationBody = textareas.inputs.migration.node.value;
    const migrationFunction = new Function('data', migrationBody);

    return migrationFunction(jsonParseResult.payload);
  };

  const check = (callbackResult) => {
    return callbackResult;
  };

  return tryBase(callback, check, 'Unable to parse JSON data');
}

function trySetJsonOutput(rawValue) {
  const textareaTestResult = testTextarea('outputs', 'json');

  if (!textareaTestResult.ok) {
    return textareaTestResult;
  }

  return tryBase(() => {
    const value = JSON.stringify(rawValue);
    textareas.outputs.json.node.value = value;

    return value;
  });
}

function trySetCSVOutput() {
  const textareaTestResult = testTextarea('outputs', 'csv');

  if (!textareaTestResult.ok) {
    return textareaTestResult;
  }

  return tryBase(() => {
    textareas.outputs.csv.node.value = data.csv;
    if (testButtons('download').ok) {
      buttons.download.node.disabled = !data.csv;
    }
  });
}

function run() {
  const migrationResult = tryExecuteMigration();

  console.log(migrationResult);

  if (!migrationResult.ok) {
    return migrationResult;
  }

  trySetJsonOutput(migrationResult.payload);
  data.csv = toCSV(migrationResult.payload).toWellFormed();
  trySetCSVOutput();
}

function download() {
  if (!data.csv) {
    return;
  }

  downloadBlob(new Blob([data.csv], { type: "text/csv" }));
}