import "bootstrap";
import "./bootstrap-slim.scss";

// marketing hero
import "./index.scss";

// install snippets styles
import "highlight.js/styles/default.css";

const onLocaleChange = () => {
  window.location.assign(getLocalizedPathname(window.location.pathname));
};

const getLocalizedPathname = (pathname) => {
  let newPath;
  if (isZhCN()) {
    newPath = pathname.replace("zh-hans/", "");
  } else {
    newPath = `/zh-hans${pathname}`;
  }
  return newPath;
};

const isZhCN = () => {
  return /zh-hans/.test(window.location.pathname);
};

const localeSeletor = document.getElementById("localeSelector");
localeSeletor.setAttribute("role", "button");
localeSeletor.textContent = isZhCN() ? "English" : "中文";
localeSeletor.addEventListener("click", onLocaleChange);
