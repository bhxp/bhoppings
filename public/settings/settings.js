function setCursor(number) {
  window.localStorage.setItem("cursor", JSON.stringify(number));
  cursor.setAttribute(
    "src",
    `/images/cursor/${window.localStorage.cursor}.svg`,
  );
  updateCursorSettings();
}

function updateCursorSettings() {
  $("#cursor-sidebar-button img").attr(
    "src",
    `/images/cursor/${window.localStorage.cursor}.svg`,
  );
  $("#settings-container .option").removeClass("active-cursor");
  $("#settings-container .option")
    .eq(JSON.parse(window.localStorage.cursor))
    .addClass("active-cursor");
}

function cursorSettings() {
  $("#settings-container button").click(function () {
    setCursor($("#settings-container button").index(this));
  });
  updateCursorSettings();
}

cursorSettings();
