function setCursor(number) {
    window.localStorage.setItem("cursor", JSON.stringify(number));
    cursor.setAttribute(
      "src",
      `/images/cursor/${window.localStorage.cursor}.svg`,
    );
  }
  
  function cursorSettings() {
    $("#settings-container button").click(function () {
      setCursor($("#settings-container button").index(this));
    });
  }
  
  cursorSettings();  