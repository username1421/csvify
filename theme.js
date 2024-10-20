const THEME_TONE_ATTRIBUTE = "themeTone";
const THEME_MAPPING_ATTRIBUTE = "themeMapping";

const ThemeTones = {
  Default: { attributeValue: "default", color: "hsl(300, 50%, 50%)" },
  Peach: { attributeValue: "peach", color: "hsl(10, 50%, 50%)" },
  Plum: { attributeValue: "plum", color: "hsl(240, 50%, 50%)" },
  Ocean: { attributeValue: "ocean", color: "hsl(190, 50%, 50%)" },
};

const ThemeMappings = {
  Light: "light",
  Dark: "dark",
};

const savedThemeTone = localStorage.getItem(THEME_TONE_ATTRIBUTE);
const savedThemeMapping = localStorage.getItem(THEME_MAPPING_ATTRIBUTE);

if (savedThemeTone) {
  document.documentElement.dataset[THEME_TONE_ATTRIBUTE] = savedThemeTone;
}

if (savedThemeMapping) {
  document.documentElement.dataset[THEME_MAPPING_ATTRIBUTE] = savedThemeMapping;
}

function setThemeMapping(mappingValue) {
  document.documentElement.dataset[THEME_MAPPING_ATTRIBUTE] = mappingValue;
  localStorage.setItem(THEME_MAPPING_ATTRIBUTE, mappingValue);
}

function toggleThemeMapping() {
  const currentThemeMapping =
    document.documentElement.dataset[THEME_MAPPING_ATTRIBUTE];

  if (currentThemeMapping === ThemeMappings.Dark) {
    setThemeMapping(ThemeMappings.Light);
  } else if (currentThemeMapping === ThemeMappings.Light) {
    setThemeMapping(ThemeMappings.Dark);
  }
}

const themeMappingToggle = document.querySelector(".mapping-selector");

if (themeMappingToggle) {
  themeMappingToggle.addEventListener("click", toggleThemeMapping);
}

const toneSelectorElements = [];

function setThemeTone(toneValue) {
  document.documentElement.dataset[THEME_TONE_ATTRIBUTE] = toneValue;
  localStorage.setItem(THEME_TONE_ATTRIBUTE, toneValue);

  toneSelectorElements.forEach((toneElem) => {
    const toneValue = toneElem.dataset[THEME_TONE_ATTRIBUTE];

    if (toneValue === document.documentElement.dataset[THEME_TONE_ATTRIBUTE]) {
      toneElem.classList.add("selected");
    } else {
      toneElem.classList.remove("selected");
    }
  });
}

function createToneSelectorElement(toneValue, toneColor) {
  const toneElem = document.createElement("div");
  const toneIndicatorElem = document.createElement("div");
  const toneLabelElem = document.createElement("div");

  toneElem.classList.add("tone-entry");
  toneElem.dataset[THEME_TONE_ATTRIBUTE] = toneValue;

  toneIndicatorElem.classList.add("tone-indicator");
  toneIndicatorElem.style.backgroundColor = toneColor;

  toneLabelElem.classList.add("tone-label");
  toneLabelElem.innerText = toneValue;

  toneElem.appendChild(toneIndicatorElem);
  toneElem.appendChild(toneLabelElem);

  if (toneValue === document.documentElement.dataset[THEME_TONE_ATTRIBUTE]) {
    toneElem.classList.add("selected");
  }

  toneElem.addEventListener("click", () => {
    setThemeTone(toneValue);
  });

  return toneElem;
}

function setupThemeToneSelector(toneSelectorRoot) {
  const tonesKeys = Object.keys(ThemeTones);

  tonesKeys.forEach((toneKey) => {
    const toneData = ThemeTones[toneKey];
    const toneElem = createToneSelectorElement(
      toneData.attributeValue,
      toneData.color
    );

    toneSelectorElements.push(toneElem);
    toneSelectorRoot.appendChild(toneElem);
  });
}

const themeToneSelector = document.querySelector(".tone-selector");

if (themeToneSelector) {
  setupThemeToneSelector(themeToneSelector);
}

const themeSelectorOpenButton = document.querySelector(
  "button.open-theme-selector"
);

const themeSelector = document.querySelector(".theme-selector");

if (themeSelectorOpenButton) {
  themeSelectorOpenButton.addEventListener("click", () => {
    themeSelector.classList.toggle("hidden");
    themeSelectorOpenButton.classList.toggle("hidden");
  });
}

const themeSelectorCloseButton = document.querySelector(
  ".theme-selector button.close"
);

if (themeSelectorCloseButton) {
  themeSelectorCloseButton.addEventListener("click", () => {
    themeSelector.classList.toggle("hidden");
    themeSelectorOpenButton.classList.toggle("hidden");
  });
}
