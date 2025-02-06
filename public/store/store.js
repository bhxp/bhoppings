var localStorage = window.localStorage;

function loadingPulse() {
  $("#loading-container").addClass("loading-container-pulse");
  setTimeout(function () {
    $("#loading-container").removeClass("loading-container-pulse");
  }, 4000);
}

function getUrlByName(objectsArray, targetName) {
  const foundObject = objectsArray.find((obj) => obj.name === targetName);
  return foundObject ? foundObject.url : null;
}
var purchasedItems = [];
if (localStorage.getItem("purchased-items")) {
  purchasedItems = JSON.parse(localStorage.getItem("purchased-items"));
} else {
  localStorage.setItem("purchased-items", "[]");
}
var storeItems = [];
fetch("/config/store.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    storeItems = data;
    data.forEach((item) => {
      $("#container").append(
        `<div class="item">
            <img src="/images/store/${item.image}" />
            <button class="item-button">${item.name}</button>
          </div>`,
      );
    });
  })
  .catch((error) => {
    console.error("Error fetching or processing the data:", error);
  });

// Attach hover in event
$("#container").on("mouseenter", ".item .item-button", function () {
  // Store the original text in a data attribute
  const originalText = $(this).text();
  $(this).data("original-text", originalText);
  if (purchasedItems.includes($(this).data("original-text"))) {
    $(this).text("Open");
  } else {
    $(this).text("Install");
  }
});

// Attach hover out event
$("#container").on("mouseleave", ".item .item-button", function () {
  // Retrieve the original text from the data attribute
  const originalText = $(this).data("original-text");

  // Restore the original button text
  $(this).text(originalText);
});

$("#container").on("click", ".item .item-button", function () {
  if (purchasedItems.includes($(this).data("original-text"))) {
    window.open(
      "/ai/" + getUrlByName(storeItems, $(this).data("original-text")),
    );
  } else {
    purchasedItems.push($(this).data("original-text"));
    localStorage.setItem("purchased-items", JSON.stringify(purchasedItems));
    loadingPulse();
    setTimeout(function () {
      $(this).text("Open");
      console.log($(this));
    }, 2000);
  }
});