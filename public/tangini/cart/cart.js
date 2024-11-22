const localStorage = window.localStorage;
const cartElement = $("#cart-items");
var itemList = [];
var items = {};
if (JSON.parse(localStorage.cart)) {
  items = JSON.parse(localStorage.cart);
} else {
  localStorage.setItem("cart", JSON.stringify({}));
}

fetch("/config/tango_store.json")
  .then(response => response.json())
  .then(data => {
    itemList = data;
  });

function getCartItems() {
  let cartItemList = [];
  for (let name in items) {
    let item = itemList.find(item => item.name == name);
    if (item && cart[name] > 0) {
      cartItemList.push({
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: cart[name]
      });
    }
  }
  return cartItemList;
}

function displayCartItems() {
  var cartItemList = getCartItems();
  cartElement.empty();
  var total = 0;
  for (let item in items) {
    var itemElement = $("<div class='item'></div>");
    var itemImgElement = $("<img class='item-img' />");
    var itemNameElement = $("<div class='item-name'></div>");
    var itemQuantityElement = $("<div class='item-quantity'></div>");
    var itemPriceElement = $("<div class='item-price'></div>");
    itemImgElement.attr("src", cartItemList[item].image);
    itemNameElement.text(cartItemList[item].name);
  }
}

function getItemDetails(name) {
  // Find the item in the itemList array
  const item = itemList.find(i => i.name === name);

  // If item is found, return the object with item details and count
  if (item) {
    return {
      item: item,
      count: items[name] || 0 // Default to 0 if item is not in the cart
    };
  } else {
    return null; // Return null if the item is not found in itemList
  }
}