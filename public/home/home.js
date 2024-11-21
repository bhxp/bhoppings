const navbar = $("#navbar");
var navbarItems = null;
var cancelNavbarHide = true;
var hideTimeout = null; // track the hide timeout
var dropdownIndexes = [];

$(document).on("mousedown", e => {
    if (hideTimeout) {
        clearTimeout(hideTimeout);  // Clear any existing hide timeout
    }

    hideTimeout = setTimeout(() => {
        console.log("dropdown hidden");
        if (!cancelNavbarHide) {
            $("#navbar div.dropdown").addClass("hidden");
        }
    }, 50);
});

function openDropdown(index) {
    const dropdown = $("#navbar .navbar-item-top").eq(index).children(".dropdown");
    cancelNavbarHide = true;
    dropdown.removeClass("hidden");

    // Clear the hide timeout if the dropdown is opened
    if (hideTimeout) {
        clearTimeout(hideTimeout);
    }

    console.log(navbar.find("div.dropdown"));
    console.log($("#navbar .navbar-item-top").eq(index).children(".dropdown"))
    console.log("dropdown shown");

    // Reset cancelNavbarHide after a short delay to avoid conflict with hide logic
    setTimeout(() => {
        cancelNavbarHide = false;
    }, 100);  // Slightly longer than the hide delay to avoid conflicts
}

$(document).ready((e) => {
    fetch("/config/home_navbar.json")
        .then(response => response.json())
        .then(items => {
            navbarItems = items;
            let i = 0;
            items.forEach(item => {
                let hr = $("<hr />");
                if (item.multiple) {
                    console.log("multiple items");
                    let element = $("<div class='navbar-item navbar-item-top'></div>");
                    element.text(item.text);
                    element.attr("onclick", `openDropdown(${items.indexOf(item)})`);
                    let dropdown = $("<div class='dropdown hidden'><img class='notch' src='/images/dropdown-notch.svg' /></div>");
                    item.pages.forEach(page => {
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
                    let element = $("<div class='navbar-item navbar-item-top'></div>");
                    element.text(item.text);
                    element.attr("onclick", `window.open("${item.url}");`);
                    element.append(hr);
                    navbar.append(element);
                }
                i ++;
            });
        })
        .catch(error => {
            console.error(error);
        });
        $('#navbar .gradient-text').click(function() {
            window.open('/home', '_self');
        });
});

