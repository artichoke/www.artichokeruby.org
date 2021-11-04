const hljs = require("highlight.js");
const { marked } = require("marked");

marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: (code, language) => {
    const highlighted = hljs.highlight(code, {
      language,
      ignoreIllegals: true,
    });
    const html = highlighted.value;
    return html;
  },
  langPrefix: "hljs artichoke-highlight language-",
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false,
});

module.exports = function markedLoader(source) {
  this.cacheable(true);
  const callback = this.callback;

  let result;
  try {
    result = marked(source);
  } catch (error) {
    if (error instanceof Error) {
      callback(error);
      return;
    }
    callback(new Error(error));
    return;
  }

  callback(null, result);
  return;
};
