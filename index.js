const task = require("./task.js");

let styles = new Map();
styles.set(1, "Synthwave");
styles.set(2, "Ukiyoe");
styles.set(3, "No Style");
styles.set(4, "Steampunk");
styles.set(5, "Fantasy Art");
styles.set(6, "Vibrant");
styles.set(7, "HD");
styles.set(8, "Pastel");
styles.set(9, "Psychic");
styles.set(10, "Dark Fantasy");
styles.set(11, "Mystical");
styles.set(12, "Festive");

(async () => {
    await task("Dark knight bearing sword", 0, console.log);
})();
