function setCursor(number) {
  Account.setValue("cursor", number);
  cursor.setAttribute("src", `/images/cursor/${number}.svg`);
  updateCursorSettings();
}

function updateCursorSettings() {}

function cursorSettings() {
  updateCursorSettings();
}

cursorSettings();

function getClosestElementIndex($container) {
  let closestIndex = -1;
  let minDistance = Infinity;

  let containerRect = $container[0].getBoundingClientRect();
  let containerMiddle = containerRect.top + containerRect.height / 2;

  $container.children().each(function (index) {
    let childRect = this.getBoundingClientRect();
    let middle = childRect.top + childRect.height / 2;
    let distance = Math.abs(middle - containerMiddle);

    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

let $scrollContainer = $("#settings-container");

let activeIndex = 0;

$scrollContainer.on("scroll", function () {
  let closestIndex = getClosestElementIndex($scrollContainer);
  console.log("Closest element index:", closestIndex);
  if (closestIndex !== activeIndex) {
    $(".active-sidebar-button").removeAttr("class");
    $("#sidebar>button").eq(closestIndex).addClass("active-sidebar-button");
  }
  activeIndex = closestIndex;
});

$("#sidebar button").on("click", function (e) {
  // Prevent default behavior and stop propagation
  e.preventDefault();
  e.stopPropagation();

  // Get the index of the clicked button
  const buttonIndex = $(this).index();

  // Log to verify correct index
  console.log("Button index:", buttonIndex);

  // Get the corresponding element to scroll to
  const targetElement = $("#settings-container>.settings-container-row").eq(
    buttonIndex,
  );

  // Log to verify element exists
  console.log("Target element:", targetElement.length ? "found" : "not found");

  // Scroll to the element
  scrollToElement($("#settings-container"), targetElement);

  // Update active button UI without waiting for scroll event
  $("#sidebar button").removeClass("active-sidebar-button");
  $(this).addClass("active-sidebar-button");
  activeIndex = buttonIndex;
});

var cursorSvgDoc;
var cursorSvg;

const cursorPromise = $.get("/images/cursor.svg");
cursorPromise.then(function (data) {
  cursorSvgDoc = data;
  cursorSvg = new XMLSerializer().serializeToString(cursorSvgDoc);
  settingsCursorUpdate();
});

function settingsCursorUpdate() {
  const theme = Account.getValue("theme");
  console.log(theme);

  console.log(cursorSvg);

  // Modify the SVG string
  let modifiedSvg = cursorSvg
    .replace("<svg", `<svg id="cursor-sidebar-img"`)
    .replace(/stop-color="#fff"/g, `stop-color="${theme.cursor1}"`)
    .replace(/stop-color="#000"/g, `stop-color="${theme.cursor2}"`);

  console.log("Modified SVG:", modifiedSvg);

  $("#cursor-sidebar-img").replaceWith($(modifiedSvg));
}
