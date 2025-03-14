"use strict";

var userTheme;
var themeOptions = {};

function defaultTheme() {
  return JSON.parse(`{
    "primary": "#fff",
    "dark-background": "#12151c",
    "cursor1": "#3AC4FF",
    "cursor2": "#3AC4FF",
    "color1": "#D185FF",
    "color2": "#0ff",
    "bg1": "#669",
    "bg2": "#669"
  }`);
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

function setupTheme(reload = false) {
  if (Account.getValue("theme")) {
    userTheme = Account.getValue("theme");
  } else {
    Account.mergeWithDefaults();
    userTheme = Account.getValue("theme");
  }

  userThemeStyleElement(userTheme).appendTo("head");
}

$(document).ready(async function () {
  if (!Account.getValue("theme")) {
    setupTheme(); // Wait for the initialization to complete
    //window.location.reload();
    cursorMain();
  } else {
    setupTheme();
  }
});

function setUserStyle(key, value) {
  // Get the theme and update the key
  const theme = Account.getValue("theme");
  theme[key] = value;
  
  Account.setValue(`theme.${key}`, value);

  // Now that the theme is updated, update the cursor if needed
  if (key === "cursor1" || key === "cursor2") {
    cursorMain();
    settingsCursorUpdate();
  }

  setupTheme();
  userThemeStyleElement(userTheme).appendTo("head");
}
