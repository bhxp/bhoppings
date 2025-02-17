"use strict";

var userTheme;
var themeOptions = {};

function defaultTheme(themeSettings) {
  const theme = {};
  Object.keys(themeSettings).forEach((key) => {
    theme[key] = themeSettings[key][0];
  });
  return theme;
}

function userThemeStyleElement(theme) {
  $("#user-theme").remove();
  const styleElement = document.createElement("style");
  styleElement.type = "text/css";
  styleElement.innerHTML = ":root {\n";
  Object.keys(theme).forEach((key) => {
    styleElement.innerHTML += `--${key}: ${theme[key]};\n`;
  });
  styleElement.innerHTML += "}";
  styleElement.setAttribute("id", "user-theme");
  return $(styleElement);
}

async function lsInit() {
  if (localStorage.getItem("theme")) {
    userTheme = JSON.parse(localStorage.getItem("theme"));
  } else {
    await $.getJSON("/config/theme-colors.json").then((data) => {
      themeOptions = data;
    });
    userTheme = defaultTheme(themeOptions);
    localStorage.setItem("theme", JSON.stringify(userTheme));
  }

  userThemeStyleElement(userTheme).appendTo("head");
}

$(document).ready(function () {
  lsInit();
});

function setUserStyle(key, value) {
  // Get the theme and update the key
  const theme = JSON.parse(localStorage.getItem("theme"));
  theme[key] = value;
  localStorage.setItem("theme", JSON.stringify(theme));

  // Now that the theme is updated, update the cursor if needed
  if (key === "cursor1" || key === "cursor2") {
    cursorMain();
    settingsCursorUpdate();
  }

  lsInit();
  userThemeStyleElement(userTheme).appendTo("head");
}
