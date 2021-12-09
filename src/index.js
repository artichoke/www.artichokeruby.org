import "bootstrap";
import "./bootstrap-slim.scss";

// marketing hero
import "./index.scss";

// install snippets styles
import "highlight.js/styles/default.css";

window.onload = () => {
  const localeSeletor = document.getElementById("localeSelector");
  localeSeletor.innerHTML = isZhCN() ? 'English' : "中文";
  localeSeletor.addEventListener("click", onLocaleChange);
};

const onLocaleChange = () => {
  const currentProtocol = `${window.location.protocol}//`;
  const currentHref = window.location.href.substr(currentProtocol.length);
  const pathname = window.location.pathname;

  window.location.href =
    currentProtocol +
    currentHref.replace(pathname, getLocalizedPathname(pathname));
};

const getLocalizedPathname = (pathname) => {
  let newPath;
  if (isZhCN()) {
    newPath = /\/?index-cn/.test(pathname) ? "/" : pathname.replace("-cn", "");
  } else if (pathname === "/") {
    newPath = "/index-cn";
  } else if (pathname.endsWith("/")) {
    newPath = pathname.replace(/\/$/, "-cn/");
  } else {
    newPath = `${pathname}-cn`;
  }
  return newPath;
};

const isZhCN = () => {
  return /-cn\/?$/.test(window.location.pathname);
};
