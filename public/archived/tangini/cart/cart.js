"use strict";

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
  .then((response) => response.json())
  .then((data) => {
    itemList = data;
    displayCartItems();
  });

function getCartItems() {
  let cartItemList = {};
  for (let name in items) {
    let item = itemList.find((item) => item.name == name);
    if (item && items[name] > 0) {
      console.log(item);
      cartItemList[item.name] = {
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: items[name],
      };
    }
  }
  return cartItemList;
}

function deleteItemFromCart(name) {
  let cartItemsStored = JSON.parse(localStorage.cart);
  delete cartItemsStored[name];
  localStorage.setItem("cart", JSON.stringify(cartItemsStored));
}

function displayCartItems() {
  var cartItemList = getCartItems();
  $("#item-count").text(
    `You have ${Object.keys(cartItemList).length} item(s) in your shopping cart.`,
  );
  cartElement.empty();
  var total = 0;
  for (let item in items) {
    var itemElement = $("<div class='item'></div>");
    var itemImgElement = $("<img class='item-img' />");
    var itemNameElement = $("<div class='item-name'></div>");
    var itemQuantityElement = $("<div class='item-quantity'></div>");
    var itemQuantityContainer = $(
      "<div class='item-quantity-container'></div>",
    );
    var itemPriceElement = $("<div class='item-price'></div>");
    var itemDeleteElement = $(
      "<div class='item-delete'><img src='/images/trash.svg' /></div>",
    );
    itemDeleteElement.click(function () {
      deleteItemFromCart(item);
      window.location.reload();
    });
    console.log(cartItemList);
    itemImgElement.attr("src", `/images/tango/${cartItemList[item].image}`);
    itemNameElement.text(cartItemList[item].name);
    itemQuantityElement.text(cartItemList[item].quantity);
    itemPriceElement.text(
      "$" + cartItemList[item].price * cartItemList[item].quantity,
    );
    itemQuantityContainer.append(itemQuantityElement);
    itemElement.append(
      itemImgElement,
      itemNameElement,
      itemQuantityContainer,
      itemPriceElement,
      itemDeleteElement,
    );
    cartElement.append(itemElement);
  }
}

function getItemDetails(name) {
  // Find the item in the itemList array
  const item = itemList.find((i) => i.name === name);

  // If item is found, return the object with item details and count
  if (item) {
    return {
      item: item,
      count: items[name] || 0, // Default to 0 if item is not in the cart
    };
  } else {
    return null; // Return null if the item is not found in itemList
  }
}
