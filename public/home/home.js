"use strict";
console.log(window.innerWidth, window.innerHeight);

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
    navbar.empty();
    if (window.innerWidth >= window.innerHeight) {
        navbar.append(`<div class="gradient-text">bhop</div>`);
    } else {
        navbar.append(
            `<div class="gradient-text"><div id="navbar-home-button"></div></div>`,
        );
    }
    navbarItems = items;
    let i = 0;
    items.forEach((item) => {
        let hr = $("<hr />");
        if (item.multiple) {
            console.log("multiple items");
            let element = $("<div class='navbar-item navbar-item-top'></div>");
            element.text(item.text);
            element.attr("onclick", `openDropdown(${items.indexOf(item)})`);
            let dropdown = $("<div class='dropdown hidden'></div>");
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

    $("#center").removeClass("title-preload");
    $("#carousel").removeClass("carousel-preload");
    $("body").addClass("bg-fadein");
}

$(document).ready(function () {
    const navbarData = JSON.parse(getPreloadedValue("navbar"));
    displayNavbar(navbarData);
});

$("body").css("display", "flex");
$("#navbar").on("click", ".gradient-text", function () {
    window.open("/home", "_self");
});

// Replace your current window.open override with this version
const oldOpen = window.open;
const fadeTime = 600;

window.open = function (url, target, features) {
    if (target !== "_self") {
        oldOpen(url, target, features);
        return;
    }

    // Add a class to the body to indicate fading out
    $("body").addClass("fade-out");
    $("body").fadeOut(fadeTime / 2);

    // Store navigation state in sessionStorage
    // This can help when returning via back button
    sessionStorage.setItem("navigatingAway", "true");

    setTimeout(() => {
        oldOpen(url, target, features);
    }, fadeTime / 2);
};

if (window.opener) {
    $("body").fadeOut(0);
}
$("body").fadeIn(fadeTime / 2);

function scrollToElement($container, $element) {
    if ($container.length === 0 || $element.length === 0) {
        console.error("Invalid container or element");
        return;
    }

    const containerTop = $container.offset().top;
    const elementTop = $element.offset().top;
    const relativeTop = elementTop - containerTop + $container.scrollTop();

    $container.animate(
        {
            scrollTop: relativeTop,
        },
        300,
    );
}
