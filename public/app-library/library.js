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
          ${(function () {
            const $tagElement = $("<div class='item-tags'></div>");

            if (item.tags) {
              item.tags.forEach((tag) => {
                $tagElement.append(
                  `<span class='item-tag item-tag-${tag}'></span>`,
                );
              });
            }
            return $tagElement.prop("outerHTML");
          })()}
          ${item.new ? '<div class="item-new">NEW!</div>' : ""}
        </div>`,
    );
  });
  $("#item-count").text(`${storeItems.length} apps(s)`);
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

function search(inputText) {
  const searchInput = $("#search-input").val().toLowerCase().replace(" ", "");
  const $container = $("#container");
  const $items = $container.find(".item");
  let itemCount = 0;
  let itemIndex = 0;

  $items.each(function () {
    const $item = $(this);
    $item.addClass("hidden");
    const itemName = $item
      .find(".item-name")
      .text()
      .toLowerCase()
      .replace(" ", "");

    if (
      levenshteinDistance(searchInput, itemName) <= 3 ||
      itemName.includes(searchInput)
    ) {
      $item.removeClass("hidden");
      itemCount++;
    } else {
      $item.addClass("hidden");
    }
  });

  $("#item-count").text(`${itemCount} apps(s)`);
  $(document).ready(function () {
    // Reset margin-top for all .item elements
    $(".item").css("margin-top", "");

    // Get the first 5 visible .item elements and apply margin-top
    $(".item:not(.hidden)").slice(0, 5).css("margin-top", "120px");
  });
}
$(document).ready(function () {
  $("#search-input").on("input", function () {
    search($(this).val());
  });
});
