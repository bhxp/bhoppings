var cursorSvgText = "";
async function cursorMain() {
  await fetch("/images/cursor.svg")
    .then((response) => response.text())
    .then((data) => {
      let cursorPos = null;
      if ($(".custom-cursor").length) {
        cursorPos = {
          x: $(".custom-cursor").offset().left,
          y: $(".custom-cursor").offset().top,
        };
      }
      $(".custom-cursor").remove();
      const theme = JSON.parse(localStorage.getItem("theme"));
      console.log(theme);
      // Modify the SVG to add the class
      cursorSvgText = data;
      let cursorSvg = data
        .replace("<svg", `<svg class="custom-cursor"`)
        .replace(/stop-color="#fff"/g, `stop-color="${theme.cursor1}"`)
        .replace(/stop-color="#000"/g, `stop-color="${theme.cursor2}"`);

      if (cursorPos) {
        cursorSvg = cursorSvg.replace(
          "<svg ",
          `<svg style="left: ${cursorPos.x}px; top: ${cursorPos.y}px;" `,
        );
      }

      // Create and append the style element
      const styleElem = document.createElement("style");
      styleElem.innerHTML = `
      body, html {
      cursor: none !important;
      }
      * {
        cursor: none !important;
      }
      .custom-cursor {
        position: fixed;
        width: 48px;
        height: 48px;
        pointer-events: none;
        z-index: 9999;
        display: block;
        top: -100%;
        left: -100%;
      }
      @media (orientation: portrait) {
        .custom-cursor {
          display: none !important;
        }
      }
    `;
      if (window.localStorage.getItem("disableCursor") !== "true") {
        // Append the SVG to the body while preserving existing content
        document.body.insertAdjacentHTML("beforeend", cursorSvg);

        document.head.appendChild(styleElem);

        // Select the cursor after it's added to the DOM
        const cursor = document.querySelector(".custom-cursor");

        // Add mousemove event listener to update cursor position
        document.addEventListener("mousemove", (e) => {
          cursor.style.left = `${e.pageX}px`;
          cursor.style.top = `${e.pageY}px`;
        });

        // Hide cursor when leaving document
        $(document).mouseleave(function () {
          $(".custom-cursor").css("display", "none");
        });

        // Show cursor when entering document
        $(document).mouseenter(function () {
          $(".custom-cursor").css("display", "block");
        });
      }
    })
    .catch((error) => console.error("Error fetching SVG:", error));
}

cursorMain();
