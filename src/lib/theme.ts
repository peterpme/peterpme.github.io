// Inline and blocking so the first paint matches the resolved theme.
// A stored choice sets data-theme. With no stored choice the attribute
// stays unset and CSS light-dark() follows prefers-color-scheme, including
// live system changes.
export const THEME_BOOT = `(function () {
  var storageKey = "theme";
  var root = document.documentElement;
  var colors = { dark: "#09090b", light: "#f4f2ec" };
  var text = { dark: "#e4e4e7", light: "#1c1c21" };

  function storedTheme() {
    try {
      var value = localStorage.getItem(storageKey);
      return value === "light" || value === "dark" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function effective() {
    return root.getAttribute("data-theme") || systemTheme();
  }

  function paintMeta(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", colors[theme]);
  }

  function labelFor(theme) {
    return theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  }

  var stored = storedTheme();
  if (stored) {
    root.setAttribute("data-theme", stored);
    root.style.colorScheme = stored;
    root.style.backgroundColor = colors[stored];
    root.style.color = text[stored];
    paintMeta(stored);
  } else {
    var system = systemTheme();
    root.style.backgroundColor = colors[system];
    root.style.color = text[system];
    paintMeta(system);
  }

  function syncButton() {
    var button = document.getElementById("theme-toggle");
    if (button) button.setAttribute("aria-label", labelFor(effective()));
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!storedTheme()) {
      root.style.backgroundColor = "";
      root.style.color = "";
      root.style.colorScheme = "";
    }
    syncButton();
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    if (storedTheme()) return;
    paintMeta(systemTheme());
    syncButton();
    document.dispatchEvent(new CustomEvent("themechange"));
  });

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var button = target.closest("#theme-toggle");
    if (!button) return;
    var next = effective() === "dark" ? "light" : "dark";
    root.classList.add("theme-ready");
    root.setAttribute("data-theme", next);
    root.style.colorScheme = next;
    root.style.backgroundColor = colors[next];
    root.style.color = text[next];
    paintMeta(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch (error) {
      /* private mode */
    }
    button.setAttribute("aria-label", labelFor(next));
    document.dispatchEvent(new CustomEvent("themechange"));
  });
})();`;
