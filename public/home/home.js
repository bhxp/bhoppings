"use strict";

const navbar = $("#navbar");
var navbarItems = null;
var cancelNavbarHide = true;
var hideTimeout = null; // track the hide timeout
var dropdownIndexes = [];

$(document).on("mousedown", (e) => {
    if (hideTimeout) {
        clearTimeout(hideTimeout); // Clear any existing hide timeout
    }

    hideTimeout = setTimeout(() => {
        console.log("dropdown hidden");
        if (!cancelNavbarHide) {
            $("#navbar div.dropdown").addClass("hidden");
        }
    }, 50);
});

function openDropdown(index) {
    const dropdown = $("#navbar .navbar-item-top")
        .eq(index)
        .children(".dropdown");
    cancelNavbarHide = true;
    dropdown.removeClass("hidden");

    // Clear the hide timeout if the dropdown is opened
    if (hideTimeout) {
        clearTimeout(hideTimeout);
    }

    console.log(navbar.find("div.dropdown"));
    console.log($("#navbar .navbar-item-top").eq(index).children(".dropdown"));
    console.log("dropdown shown");

    // Reset cancelNavbarHide after a short delay to avoid conflict with hide logic
    setTimeout(() => {
        cancelNavbarHide = false;
    }, 100); // Slightly longer than the hide delay to avoid conflicts
}

function displayNavbar(items) {
    navbarItems = items;
    let i = 0;
    items.forEach((item) => {
        let hr = $("<hr />");
        if (item.multiple) {
            console.log("multiple items");
            let element = $("<div class='navbar-item navbar-item-top'></div>");
            element.text(item.text);
            element.attr("onclick", `openDropdown(${items.indexOf(item)})`);
            let dropdown = $(
                "<div class='dropdown hidden'><img class='notch' src='/images/dropdown-notch.svg' /></div>",
            );
            item.pages.forEach((page) => {
                let elem = $("<div>");
                elem.addClass("navbar-item");
                elem.text(page.text);
                elem.attr("onclick", `window.open("${page.url}");`);
                dropdown.append(elem);
            });
            element.append(dropdown);
            element.append(hr);
            navbar.append(element);
            dropdownIndexes.push(i);
        } else {
            let element = $(`<div class='navbar-item navbar-item-top'></div>`);

            const elementText = $(`<span>${item.text}</span>`);
            if (item.image) {
                console.log("image");
                const imageElement = $("<img>")
                    .attr("src", `/images/${item.image}`)
                    .addClass("navbar-item-image");
                element.append(imageElement);
            }
            element.append(elementText);
            element.attr("onclick", `window.open("${item.url}");`);
            element.append(hr);
            navbar.append(element);
        }
        i++;
    });

    navbar.removeClass("navbar-preload");

    $("#center *").removeClass("title-preload");
    $("#carousel").removeClass("carousel-preload");
    $("body").addClass("bg-fadein");
}

$(document).ready(function () {
    const navbarData = JSON.parse(getPreloadedValue("navbar"));
    displayNavbar(navbarData);
});
$("#navbar .gradient-text").click(function () {
    window.open("/home", "_self");
});

const oldOpen = window.open;
const fadeTime = 600;

window.open = function (url, target, features) {
    if (target !== "_self") {
        oldOpen(url, target, features);
        return;
    }
    $("body").fadeOut(fadeTime / 2);
    setTimeout(() => {
        oldOpen(url, target, features);
    }, fadeTime / 2);
};

if (window.opener) {
    $("body").fadeOut(0);
    $("body").fadeIn(fadeTime / 2);
}

const scrollToElement = ($parent, $target) => {
    $parent.animate({ scrollTop: $target.offset().top }, 500);
};
localStorage.setItem("skipBio", localStorage.getItem("skipBio") || false);
const devMenu = $(`
<div id="dev-menu">
<button onclick="window.localStorage.setItem('skipBio', JSON.stringify(!JSON.parse(localStorage.getItem('skipBio'))));$('#dev-menu button').eq(0).html('Skip Bio [' + localStorage.getItem('skipBio') + ']');">Skip Bio [${localStorage.getItem("skipBio")}]</button>
<button onclick="window.localStorage.clear()">
  Clear window.LocalStorage
</button>
</div>
`);
devMenu.appendTo("body");

$(document).on("keydown", function (e) {
    if (e.ctrlKey && e.key === ".") {
        devMenu.toggleClass("open");
    }
});

$("head").append(`
<style>

#dev-menu.open {
    transform: translateX(-24px) !important;
}
#dev-menu {
    display: flex;
    flex-direction: column;
    position: fixed;
    right: 0%;
    top: 120px;
    background: rgba(0, 0, 0, 0.5);
    padding: 12px;
    color: #000;
    z-index: 9998;
    border-radius: 24px;
    border: solid 1px rgba(255, 255, 255, 0.2);
    transition: all 0.5s ease-in-out;
    transform: translateX(+100%);
}
#dev-menu button:hover {
    filter: invert(1);
}
#dev-menu button:first-child {
    margin-top: 0px;
}
#dev-menu button {
    font-size: 18px;
    padding: 24px;
    margin-top: 12px;
    color: #fff;
    background-color: #000;
    outline: 0px;
    border-radius: 12px;
    outline: 0px;
    transition: all 0.5s ease-in-out;
    border: 0px;
}
</style>`);
