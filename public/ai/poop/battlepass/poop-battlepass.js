function setSkin() {
    const skin = document.getElementById("skin").value;
    localStorage.setItem("skin", JSON.stringify(skin));
    window.location.reload();
}

function resetMoney() {
    money = 0;
    updateMoney();
}

var localStorage = window.localStorage;
var money = JSON.parse(localStorage.getItem('money')) || 0;
var skin = JSON.parse(localStorage.getItem('skin')) || 0;
var experience = JSON.parse(localStorage.getItem('experience')) || 0;
var unlocked = JSON.parse(localStorage.getItem('unlocked')) || 1;
if (!JSON.parse(localStorage.getItem('money'))) {
    localStorage.setItem("money", JSON.stringify(0));
}
if (!JSON.parse(localStorage.getItem('experience'))) {
    localStorage.setItem("experience", JSON.stringify(0));
}
if (!JSON.parse(localStorage.getItem('skin'))) {
    localStorage.setItem("skin", JSON.stringify(0));
}
if (!JSON.parse(localStorage.getItem('unlocked'))) {
    localStorage.setItem("unlocked", JSON.stringify(1));
}

const level = getLevelFromXp(experience);

function updateMoney() {
    localStorage.setItem("money", JSON.stringify(Math.floor(money)));
    localStorage.setItem("experience", JSON.stringify(Math.floor(experience)));

    return JSON.parse(localStorage.getItem("money"));
}

function addMoney(amount) {
    money += amount;
    experience += amount;
    updateMoney();
    return money;
}

function getLevelFromXp(xp) {
    const baseXp = 700;  // Base XP required for level 1 to 2
    const multiplier = 1.4;  // Exponential multiplier per level

    // If XP is less than or equal to 0, return level 0
    if (xp <= 0) {
        return 0;
    }

    // Calculate the level based on XP, but ensure it doesn't go below level 1
    const level = Math.floor(Math.log(xp / baseXp) / Math.log(multiplier)) + 1;

    return Math.max(0, level);
}


function getXpFromLevel(level) {
    const baseXp = 500;  // Base XP required for level 1 to 2
    const multiplier = 1.4;  // Exponential multiplier per level

    // If level is 0 or less, return 0 XP (since level 0 means no XP)
    if (level <= 0) {
        return 0;
    }

    // Calculate the XP required for the given level
    const xp = baseXp * Math.pow(multiplier, level - 1);

    return xp;
}



function createItem(index, name) {
    var chest = `<object type="image/svg+xml" data="/images/chest.svg" class="chest"></object>`;
    const itemElement = $(
        `<div class="item">
      <img class="connector" src="/images/battle-pass-connector.svg" />
      <img class="item-bg" src="/images/battle-pass-card.svg" />
      <img class="poop-icon" src="/images/poop/${index}.svg" />
      <span>${name}</span>
        ${chest}
        <span class="level">LEVEL ${index + 1}</span>
    </div>`
    );

    if (index > level) {
        itemElement.addClass("locked");
    }
    if (index == level) {
        itemElement.addClass("highest-unlocked");
    }

    if (index == unlocked && index <= level) {

        itemElement.addClass("locked");
        itemElement.addClass("new-unlocked");
        unlocked = index + 1;
        itemElement.on("click", "*", function(e) {
            console.log("Clicked!");
            //$(this).find("object.chest").attr("data", "/images/chest-animation.svg");

            const removeClasses = () => {
                $(this).removeClass("new-unlocked");
                $(this).removeClass("locked");
            };
            removeClasses();
            //setTimeout(removeClasses, 600); // Call `removeClasses` after 600ms

            const i = $(this).index(); // Get the index of the parent itemElement
            localStorage.setItem("unlocked", Math.max(localStorage.unlocked, i + 1));
        });
    }




    // Return the jQuery object
    return itemElement;
}
var chestAnimation;
fetch("images/chest-animation.svg").then(response => {
    chestAnimation = response;
})
$(document).ready(function() {
    fetch("/data/poop-names.json")
        .then(response => response.json())
        .then(data => {
            const container = $("#unlock-container");

            // Append items to the container
            for (let i = 0; i < data.length; i++) {
                const item = createItem(i, data[i]);
                container.append(item);
            }

            const items = container.children();

            let itemWidth;  // Declare itemWidth here to make it accessible in the keydown handler

            container.on('wheel', function(event) {
                if (event.originalEvent.deltaY !== 0) {
                    container.scrollLeft(container.scrollLeft() + event.originalEvent.deltaY);

                    event.preventDefault();  // Prevent the default vertical scroll behavior
                }
            });

            // Add active skin class
            $(".item-bg").eq(skin).addClass("active-skin");

            // Show the container if hidden
            $("#container").removeClass("hidden");

            // Add click event to items (attach this after items are appended)
            $(".item:not(.locked)").on("click", (e) => {
                const clickedItem = $(e.currentTarget);  // `e.currentTarget` is the element that triggered the event

                const index = clickedItem.index();  // Get the index of the clicked item
                if (index <= unlocked) {
                    localStorage.setItem("skin", index);  // Store the index in localStorage
                    $(".item-bg").removeClass("active-skin");
                    clickedItem.find(".item-bg").addClass("active-skin");
                }



            });
            $("#exit").on("click", (e) => {
                window.open('../', '_self');
            });
            $(".new-unlocked .chest").on("click", function(e) {
                $(this).parent().removeClass("new-unlocked");
                $(this).parent().removeClass("locked");
            });


        });
});