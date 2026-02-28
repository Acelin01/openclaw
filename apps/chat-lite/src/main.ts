import "./components/app";

// 注册所有 Web Components
import "./artifacts/project-requirement/element";
import "./artifacts/viewer";

// 应用样式
const styles = document.createElement("style");
styles.textContent = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;
document.head.appendChild(styles);
