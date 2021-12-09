let styles = new Map();
styles.set(1, "Synthwave"); // 23 steps
styles.set(2, "Ukiyoe");
styles.set(3, "No Style");
styles.set(4, "Steampunk"); // 24 steps
styles.set(5, "Fantasy Art");
styles.set(6, "Vibrant");
styles.set(7, "HD");
styles.set(8, "Pastel");
styles.set(9, "Psychic");
styles.set(10, "Dark Fantasy");
styles.set(11, "Mystical");
styles.set(12, "Festive");

// Does not include the "final" image!
let steps = new Map();
steps.set(1, 23);
steps.set(2, 21);
steps.set(3, 23);
steps.set(4, 23);
steps.set(5, 19);
steps.set(6, 20);
steps.set(7, 21);
steps.set(8, 21);
steps.set(9, 21);
steps.set(10, 20);
steps.set(11, 20);
steps.set(12, 32);

module.exports = styles;
module.exports.steps = steps;
