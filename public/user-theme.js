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

async function lsInit(reload = false) {
  if (localStorage.getItem("theme")) {
    userTheme = JSON.parse(localStorage.getItem("theme"));
  } else {
    userTheme = defaultTheme();
    localStorage.setItem("theme", JSON.stringify(userTheme));
  }

  userThemeStyleElement(userTheme).appendTo("head");
}

$(document).ready(async function () {
  if (!window.localStorage.theme) {
    await lsInit(); // Wait for the initialization to complete
    //window.location.reload();
    cursorMain();
  } else {
    lsInit();
  }
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