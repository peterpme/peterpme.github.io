// Inline, blocking, and free of external imports so the first paint
// already has the resolved theme. localStorage is written only by the toggle.
export const THEME_BOOT = `(function () {
  var storageKey = "theme";
  var root = document.documentElement;
  var colors = {
    dark: { bg: "#09090b", text: "#e4e4e7" },
    light: { bg: "#f4f2ec", text: "#1c1c21" }
  };

  function paint(theme) {
    var tone = colors[theme];
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    root.style.backgroundColor = tone.bg;
    root.style.color = tone.text;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", tone.bg);
  }

  function labelFor(theme) {
    return theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  }

  var stored = null;
  try {
    stored = localStorage.getItem(storageKey);
  } catch (error) {
    stored = null;
  }

  var theme;
  if (stored === "light" || stored === "dark") {
    theme = stored;
  } else {
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    if (prefersDark) theme = "dark";
    else if (prefersLight) theme = "light";
    else {
      var hour = new Date().getHours();
      theme = hour >= 19 || hour < 7 ? "dark" : "light";
    }
  }

  paint(theme);

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("theme-toggle");
    if (!button) return;
    button.setAttribute("aria-label", labelFor(root.getAttribute("data-theme")));
  });

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var button = target.closest("#theme-toggle");
    if (!button) return;
    var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    var next = current === "dark" ? "light" : "dark";
    root.classList.add("theme-ready");
    paint(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch (error) {
      /* private mode */
    }
    button.setAttribute("aria-label", labelFor(next));
  });
})();`;
