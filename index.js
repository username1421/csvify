import { hideSplash, transitionRedirect } from "./utils.js";

setTimeout(hideSplash, 100);
const links = document.querySelectorAll("a[href]");

links.forEach((link) => {
  link.onclick = transitionRedirect;
});
