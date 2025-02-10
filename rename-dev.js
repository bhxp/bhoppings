const fs = require("fs");
const path = require("path");
const stringSimilarity = require("string-similarity");

const aiPath = path.join(__dirname, "public/ai");
const imagesPath = path.join(__dirname, "public/images/store");

// Get list of folders in /public/ai/
const folders = fs
    .readdirSync(aiPath)
    .filter((name) => fs.statSync(path.join(aiPath, name)).isDirectory());

// Get list of images in /images/store/
const images = fs
    .readdirSync(imagesPath)
    .filter((name) => name.endsWith(".png"));

images.forEach((image) => {
    const imageName = path.basename(image, ".png");
    const matches = stringSimilarity.findBestMatch(imageName, folders);
    const bestMatch = matches.bestMatch.target;

    if (matches.bestMatch.rating > 0.5) {
        // Only rename if similarity is above threshold
        const oldPath = path.join(imagesPath, image);
        const newPath = path.join(imagesPath, bestMatch + ".png");

        fs.renameSync(oldPath, newPath);
        console.log(`Renamed: ${image} -> ${bestMatch}.png`);
    } else {
        console.log(`No good match for: ${image}`);
    }
});