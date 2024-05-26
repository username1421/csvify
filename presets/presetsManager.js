const presetsModal = document.querySelector(".modal");
const presetsContainer = document.querySelector(".presets-container");
const modalCloseButton = document.querySelector(".modal button.close");
const openPresetsButton = document.querySelector("button.open-presets");
const transformerInput = document.querySelector("#input-transformer");

function openPresetsModal() {
  presetsModal.classList.remove("closed");
}

function closePresetsModal() {
  presetsModal.classList.add("closed");
}

function applyPreset(presetCode) {
  transformerInput.value = presetCode;
}

function createPresetItemFragment({ value, classname }) {
  const fragmentElem = document.createElement("div");
  fragmentElem.classList.add(classname);
  fragmentElem.innerHTML = value;

  return fragmentElem;
}

function createPresetItem({ name, description, code }) {
  const itemElem = document.createElement("div");
  itemElem.classList.add("preset-item");

  const nameElem = createPresetItemFragment({ value: name, classname: "name" });
  const descriptionElem = createPresetItemFragment({
    value: description,
    classname: "description",
  });
  const codeElem = createPresetItemFragment({
    value: code,
    classname: "code",
  });

  itemElem.appendChild(nameElem);
  itemElem.appendChild(descriptionElem);
  itemElem.appendChild(codeElem);

  itemElem.addEventListener("click", () => {
    applyPreset(code);
    closePresetsModal();
  });

  return itemElem;
}

function initPresets() {
  window.presets.forEach((preset) => {
    const presetItem = createPresetItem(preset);
    presetsContainer.appendChild(presetItem);
  });
}

modalCloseButton.addEventListener("click", closePresetsModal);
openPresetsButton.addEventListener("click", openPresetsModal);

initPresets();
