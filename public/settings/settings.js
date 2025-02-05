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
  updateCursorSettings();
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
/*
function scrollToChildByIndex(parent, index) {
  let $child = $(parent).children().eq(index); // Get the child element at the specified index
  let childOffset = $child.offset().top; // Get the offset of the child element relative to the document
  let parentOffset = $(parent).offset().top; // Get the offset of the parent container relative to the document
  let parentHeight = $(parent).height(); // Get the height of the parent container
  let childHeight = $child.outerHeight(); // Get the height of the child element

  // Calculate the scroll position so that the child is centered in the parent
  let scrollPosition =
    childOffset - parentOffset - parentHeight / 2 + childHeight / 2;

  // Animate the scrollTop of the parent container to the calculated scroll position
  $(parent).animate(
    {
      scrollTop: scrollPosition,
    },
    500,
  ); // 500ms for the scroll animation duration
}

$("#sidebar button").on("click", function (e) {
  let index = $(this).index();
  scrollToChildByIndex($("#settings-container"), index);
});
*/