const cursor = document.createElement("img");
cursor.classList.add("custom-cursor");

cursor.setAttribute("src", "/images/cursor.png")

const styleElem = document.createElement("style");
styleElem.innerHTML = `
* {
  cursor: none !important;
}
.custom-cursor {
  position: fixed;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 9999;
  display: block;
}`

document.getElementsByTagName("head")[0].appendChild(styleElem);
document.getElementsByTagName("body")[0].appendChild(cursor);

document.addEventListener('mousemove', e => {
    cursor.style.left = e.pageX + 'px';
    cursor.style.top = e.pageY + 'px';
    mouseX = e.pageX;
    mouseY = e.pageY;
  });

  $(document).mouseleave(function() {
    $(".custom-cursor").css("display", "none");
});

$(document).mouseenter(function() {
    $(".custom-cursor").css("display", "block")
});
