import "bootstrap";
import "./bootstrap-slim.scss";

import hljs from "highlight.js/lib/core";
import "highlight.js/styles/default.css";
import bash from "highlight.js/lib/languages/bash";
import shell from "highlight.js/lib/languages/shell";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("console", shell);
hljs.registerLanguage("shell", shell);

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightBlock(block);
  });
});
