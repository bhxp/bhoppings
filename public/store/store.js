var localStorage = window.localStorage;

function levenshteinDistance(str1, str2) {
  // Create a matrix of dimensions (str1.length + 1) x (str2.length + 1)
  const matrix = Array(str1.length + 1)
    .fill()
    .map(() => Array(str2.length + 1).fill(0));

  // Fill the first row and column
  for (let i = 0; i <= str1.length; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= str2.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + 1, // substitution
        );
      }
    }
  }

  // Return the bottom-right value of the matrix
  return matrix[str1.length][str2.length];
}

function getUrlByName(objectsArray, targetName) {
  const foundObject = objectsArray.find((obj) => obj.name === targetName);
  console.log(foundObject);
  if (foundObject) {
    if (foundObject.fromRoot) {
      return foundObject.url;
    } else {
      "/ai/" + foundObject.url;
    }
  } else {
    return null;
  }
}
var purchasedItems = [];
if (localStorage.getItem("purchased-items")) {
  purchasedItems = JSON.parse(localStorage.getItem("purchased-items"));
} else {
  localStorage.setItem("purchased-items", "[]");
}
var storeItems = [];
$(document).ready(function () {
  console.log(getPreloadedValue("store"));
  storeItems = JSON.parse(getPreloadedValue("store"));
  storeItems.forEach((item) => {
    console.log(item);
    $("#container").append(
      `<div class="item">
          <div class="item-img">
            <img src="/images/store/${item.image}" />
            <button class="item-open" data-url-to="${(function () {
              if (item.fromRoot) {
                return item.url;
              } else {
                return "/ai/" + item.url;
              }
            })()}">Open</button>
          </div>
          <span class="item-name">${item.name}</span>
        </div>`,
    );
  });

  search("");
});

$("#container").on("click", ".item-open", function () {
  window.open($(this).data("url-to"));
});

function levenshteinDistance(str1, str2) {
  // Create a matrix of dimensions (str1.length + 1) x (str2.length + 1)
  const matrix = Array(str1.length + 1)
    .fill()
    .map(() => Array(str2.length + 1).fill(0));

  // Fill the first row and column
  for (let i = 0; i <= str1.length; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= str2.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + 1, // substitution
        );
      }
    }
  }

  // Return the bottom-right value of the matrix
  return matrix[str1.length][str2.length];
}

function search(input) {
  console.log("search", input);
  const searchInput = $("#search-input").val().toLowerCase();
  const $container = $("#container");
  const $items = $container.find(".item");
  let itemCount = 0;
  let itemIndex = 0;

  $items.each(function () {
    const $item = $(this);
    $item.hide();
    const itemName = $item.find(".item-name").text().toLowerCase();

    if (
      levenshteinDistance(searchInput, itemName) <= 3 ||
      itemName.includes(searchInput)
    ) {
      $item.show();
      itemCount++;
    } else {
      $item.hide();
    }
  });

  $("#item-count").text(`${itemCount} apps(s)`);
}
$(document).ready(function () {
  $("#search-input").on("input", function () {
    search($(this).val());
  });
});
