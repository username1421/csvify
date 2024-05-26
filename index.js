import { hideSplash, transitionRedirect } from "./utils.js";

hideSplash();
const links = document.querySelectorAll("a[href]");

links.forEach((link) => {
  link.onclick = transitionRedirect;
});
