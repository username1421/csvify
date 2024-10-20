import {
  CHARS_THAT_SHOULD_BE_ENCLOSED_REGEX,
  COMMA,
  TWO_DOUBLE_QUOTES,
  DOUBLE_QUOTE,
  DOUBLE_QUOTES_ENCLOSED_REGEX,
  CRLF,
  LF,
  CR,
} from "./constants.js";

function parseCsvLine(line) {
  let char = "";
  let result = [];
  let field = [];
  let quoteSeries = [];
  let inEnclosedField = false;

  for (let i = 0; i < line.length; i++) {
    char = line.charAt(i);

    if (i === line.length - 1) {
      if (char !== COMMA) {
        if (char !== CR && char !== LF) {
          field.push(char);
        }
        result.push(field.join(""));
      } else {
        result.push(field.join(""));
        result.push("");
      }

      continue;
    }

    if (inEnclosedField) {
      if (char === DOUBLE_QUOTE) {
        quoteSeries.push(char);

        continue;
      }

      if (quoteSeries.length > 0) {
        inEnclosedField = quoteSeries.length % 2 === 0;

        if (!inEnclosedField && char !== COMMA) {
          return {
            ok: false,
            payload: `Quotes escaping error at index ${i}.\nHere's a slice of 20 closest characters ${line.slice(
              Math.max(0, i - 10),
              Math.min(i + 10, line.length - 1)
            )}`,
          };
        }

        field.push(quoteSeries.join(""));
        quoteSeries = [];

        if (!inEnclosedField) {
          result.push(field.join(""));
          field = [];

          continue;
        }
      }

      field.push(char);

      continue;
    }

    if (char === COMMA) {
      result.push(field.join(""));
      field = [];

      continue;
    }

    if ((char === CR || char === LF) && i < line.length - 1) {
      return {
        ok: false,
        payload: `CRLF error at index ${i}.\nHere's a slice of 20 closest characters ${line.slice(
          Math.max(0, i - 10),
          Math.min(i + 10, line.length - 1)
        )}`,
      };
    }

    inEnclosedField = char === DOUBLE_QUOTE;
    field.push(char);
  }

  return {
    ok: true,
    payload: result,
  };
}

export function toArray(csvStr) {
  const result = [];
  const lines = csvStr.split(LF);

  if (lines.length === 0) {
    return result;
  }

  const header = lines[0];

  const keys = header.split(COMMA);

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    const values = parseCsvLine(line).payload;

    if (values.length !== keys.length) {
      console.error(
        `Count of values in the line #${i} conflicts with CSV header!`,
        keys,
        values
      );

      toast({
        message: `Count of values in the line #${i} conflicts with CSV header!`,
        type: ToastType.Error,
      });

      continue;
    }

    const item = {};

    for (let j = 0; j < keys.length; j++) {
      item[keys[j]] = values[j];
    }

    result.push(item);
  }

  return result;
}

function csvifyStr(str) {
  const enclosedInDoubleQuotes = str.match(DOUBLE_QUOTES_ENCLOSED_REGEX);

  if (enclosedInDoubleQuotes) {
    str = str.slice(1, -1);
  }

  const shouldBeEnclosed = str.match(CHARS_THAT_SHOULD_BE_ENCLOSED_REGEX);

  // https://www.ietf.org/rfc/rfc4180.txt - 2.7
  if (shouldBeEnclosed) {
    return `"${str.replaceAll(DOUBLE_QUOTE, TWO_DOUBLE_QUOTES)}"`;
  }

  return str;
}

function canBeCSVified(item) {
  return typeof item !== "object" && !Array.isArray(item);
}

const data = {
  keys: [],
  result: [],
  line: [],
};

function pushToLine(elem) {
  if (typeof elem === "string") {
    data.line.push(csvifyStr(elem));
    return;
  }

  data.line.push(elem);
}

export function toCSV(arr = []) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return "";
  }

  data.keys = [];
  data.result = [];
  data.line = [];

  for (let i = 0; i < arr.length; i++) {
    const elem = arr[i];

    if (typeof elem !== "object" || elem === null) {
      continue;
    }

    data.line = [];

    // first object declares keys
    if (data.keys.length === 0) {
      for (const key in elem) {
        if (canBeCSVified(elem[key])) {
          data.keys.push(key);
          pushToLine(elem[key]);
        }
      }
    } else {
      data.keys.forEach((key) => {
        if (canBeCSVified(elem[key])) {
          pushToLine(elem[key]);
        } else {
          data.line.push(undefined);
        }
      });
    }

    data.result.push(data.line.join(COMMA));
  }

  return [data.keys.join(COMMA), data.result.join(CRLF)].join(CRLF);
}

export function init(nodes) {
  for (const key in nodes) {
    nodes[key].node = document.querySelector(nodes[key].selector);

    if (!nodes[key].node) {
      return {
        ok: false,
        payload: `Failed to find ${nodes[key].selector} node`,
      };
    }
  }

  return {
    ok: true,
    payload: undefined,
  };
}

export function downloadBlob(blob, filename = "data.csv") {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function tryBase(callback, check = () => true, checkFailPayload = "") {
  try {
    const result = callback();

    if (!check(result)) {
      return {
        ok: false,
        payload: checkFailPayload,
      };
    }

    return {
      ok: true,
      payload: result,
    };
  } catch (error) {
    console.error(error);

    toast({
      message: error,
      type: ToastType.Error,
    });

    return {
      ok: false,
      payload: error,
    };
  }
}

export function hideSplash(afterHid = () => {}) {
  const splash = document.querySelector(".splash");

  if (!splash) {
    return;
  }

  splash.style.transform = "translateY(-100%)";
  splash.addEventListener("transitionend", afterHid);
}

export function showSplash(afterShowed = () => {}) {
  const splash = document.querySelector(".splash");

  if (!splash) {
    return;
  }

  splash.style.transform = "translateY(0%)";
  splash.addEventListener("transitionend", afterShowed);
}

export function transitionRedirect(e) {
  e.preventDefault();
  showSplash(() => {
    location.href = e.target.closest("a[href]").href;
  });
}

export function getFunctionBodyString(func) {
  try {
    const funcStr = func.toString();
    const funcBodyStr = funcStr.slice(
      funcStr.indexOf("{") + 1,
      funcStr.lastIndexOf("}")
    );

    return funcBodyStr.trim();
  } catch (error) {
    console.error(error);

    toast({
      message: error,
      type: ToastType.Error,
    });

    return;
  }
}

const ToastType = {
  Info: "info",
  Warning: "warning",
  Error: "error",
};

export function toast({ message = "", type = ToastType.Info }) {
  if (message === "") {
    return;
  }

  const toastElem = document.createElement("div");

  toastElem.classList.add("toast");
  toastElem.dataset.toastType = type;
  toastElem.textContent = message;

  document.body.appendChild(toastElem);

  const lifetime = Math.max(2000, message.length * 100);

  requestAnimationFrame(() => toastElem.classList.add("appear"));

  setTimeout(() => {
    toastElem.classList.toggle("disappear");
    toastElem.classList.remove("appear");
    toastElem.addEventListener("transitionend", () => {
      toastElem.remove();
    });
  }, lifetime);
}
