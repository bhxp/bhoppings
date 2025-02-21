function setCursor(number) {
  window.localStorage.setItem("cursor", JSON.stringify(number));
  cursor.setAttribute(
    "src",
    `/images/cursor/${window.localStorage.cursor}.svg`,
  );
  updateCursorSettings();
}

function updateCursorSettings() {}

function cursorSettings() {
  updateCursorSettings();
}

function idToName(input) {
  return (
    input
      // Replace the first letter and any letter after "_" with the uppercase equivalent
      .replace(
        /(?:^|\_)([a-z])/g,
        (match, letter) => `_${letter.toUpperCase()}`,
      )

      // Replace underscores with spaces
      .replace(/_/g, " ")

      // Replace groups of digits with "#<digits>"
      .replace(/\d+/g, (match) => ` #${match}`)
  );
}

cursorSettings();

function getClosestElementIndex($container) {
  let closestIndex = -1;
  let minDistance = Infinity;

  $container.children().each(function (index) {
    let $child = $(this);
    let middle = $child.offset().top + $child.height() / 2; // Middle of the element
    let containerMiddle = $container.offset().top + $container.height() / 2; // Middle of the container
    let distance = Math.abs(middle - containerMiddle); // Distance between element middle and container middle

    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

// Usage
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
  scrollToElement(
    $("#settings-container"),
    $("#settings-container>.settings-container-row").eq($(this).index()),
  );
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
  const theme = JSON.parse(localStorage.getItem("theme"));
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

