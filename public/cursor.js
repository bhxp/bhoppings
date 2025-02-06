const cursor = document.createElement("img");
cursor.classList.add("custom-cursor");

if (window.localStorage.cursor) {
  cursor.setAttribute(
    "src",
    `/images/cursor/${window.localStorage.cursor}.svg`,
  );
} else {
  cursor.setAttribute("src", "/images/cursor/0.svg");
  localStorage.setItem("cursor", "0");
}

const styleElem = document.createElement("style");
styleElem.innerHTML = `* {
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
}`;

document.getElementsByTagName("head")[0].appendChild(styleElem);
document.getElementsByTagName("body")[0].appendChild(cursor);

document.addEventListener("mousemove", (e) => {
  cursor.style.left = e.pageX + "px";
  cursor.style.top = e.pageY + "px";
  mouseX = e.pageX;
  mouseY = e.pageY;
});

$(document).mouseleave(function () {
  $(".custom-cursor").css("display", "none");
});

$(document).mouseenter(function () {
  $(".custom-cursor").css("display", "block");
});
