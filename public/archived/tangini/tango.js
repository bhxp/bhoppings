function createItemElem(item) {
    let price = item.price.toString();
    if (item.price == Math.ceil(item.price)) {
        price += ".00";
    }
    return `<div class="item">
      <img src="/images/tango/${item.image}" class="item-img" />
      <div class="item-name">${item.name}</div>
      <div class="item-price">$${price}</div>
      <div class="add-to-cart-container">
        <div>
            <button class="add-to-cart" onclick='addToCartHandler("${item.name}");'>ADD TO CART</button>
        </div>
      </div>
  </div>`;
}

function appendItemElem(html) {
    $("#items").append(html);
}

function generateItems(data) {
    $("#items").empty();
    data.forEach(item => {
        appendItem(item);
    });
    return;
}

const appendItem = (item) => appendItemElem(createItemElem(item));

var items = [];

$(document).ready(() => {
    fetch("/config/tango_store.json")
        .then(response => response.json())
        .then(data => {
            items = data;
            console.log(data);
            generateItems(data)
        });
});

$("#search-input").on("input", () => {
    search($("#search-input").val());
});

function search(query) {
    let data = [];
    items.forEach(item => {
        // Check if the item name contains the query or is within a Levenshtein distance of 4
        if (item.name.toLowerCase().includes(query.toLowerCase()) || levenshteinDistance(item.name.toLowerCase(), query.toLowerCase()) <= 4) {
            data.push(item);
        }
    });
    generateItems(data);
}

// Helper function to calculate Levenshtein distance
function levenshteinDistance(a, b) {
    const matrix = [];

    // Initialize the first row and column of the matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Populate the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,     // Deletion
                    matrix[i][j - 1] + 1,     // Insertion
                    matrix[i - 1][j - 1] + 1  // Substitution
                );
            }
        }
    }

    return matrix[b.length][a.length];
}



const localStorage = window.localStorage;

function addToCart(name) {
    let cartContents = JSON.parse(localStorage.getItem("cart")) || {};
    cartContents[name] = (cartContents[name] + 1) || 1;
    const cartContentString = JSON.stringify(cartContents);
    localStorage.setItem("cart", cartContentString);
    console.log(`"${name}" was added to the cart.`);
}

function addToCartHandler(name) {
    addToCart(name);
    window.open("/tangini/cart", "_self");
}

$("#search-input").on("input", () => {
    search($("#search-input").val());
});

$(".view-switch-item .view-switch-click-hitbox").click(function(event) {
    $(".view-switch-item").attr("id", "");
    $(this).parent().attr("id", "active-view-switch-item");
    if ($(this).parent().is(':last-child')) {
        $("#items").addClass("list-view");
        console.log($("#items"))
    } else {
        $("#items").removeClass("list-view");
    }
});