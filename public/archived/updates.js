"use strict";

const toastContainer = $("<div id='toasts'></div>");
const localStorage = window.localStorage;
var toasts = {};
var seenToasts = {};
var toastsToDisplay = [];

if (window.localStorage.toasts) {
  seenToasts = JSON.parse(window.localStorage.getItem("toasts"));
} else {
  localStorage.setItem("toasts", "{}");
}

function toastElement(toast) {
  const elem = $("<div class='toast toast-hidden'></div>");
  const img = $("<img class='toast-img' />");
  const title = $("<div class='toast-title'></div>");
  const description = $("<div class='toast-description'></div>");
  const cont = $("<div class='toast-container'></div>");
  title.text(toast.title);
  description.text(toast.description);
  img.attr("src", `/images/toasts/${toast.type}.svg`);
  cont.append(title);
  cont.append(description);
  console.log(description);
  elem.append(img);
  elem.append(cont);
  return elem;
}

function displayToasts() {
  toastContainer.empty();
  let index = 0;
  toastsToDisplay.forEach((toast) => {
    console.log(toast);
    const elem = toastElement(toast);
    setTimeout(
      function (e) {
        e.removeClass("toast-hidden");
      },
      1 + index * 100,
      elem,
    );
    toastContainer.append(elem);
    index++;
  });
  $("body").append(toastContainer);
}

$(document).ready((e) => {
  $.getJSON("/config/updates.json", function (data) {
    toasts = data;
    for (const key of Object.keys(toasts)) {
      if (!seenToasts[key]) {
        console.log(toasts, key);
        toastsToDisplay.push(toasts[key]);
      }
      seenToasts[key] = true;
    }
    displayToasts();
    localStorage.setItem("toasts", JSON.stringify(seenToasts));
  });
});