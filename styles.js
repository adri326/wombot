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
styles.set(13, "Baroque");
styles.set(14, "Etching");
styles.set(15, "S. Dali"); // Note: The website didn't put a space in it
styles.set(16, "Wuhtercuhler");

// Counts the number of GANs in the chain, used for debugging
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
steps.set(13, 20);
steps.set(14, 20);
steps.set(15, 20);
steps.set(16, 20);

module.exports = styles;
module.exports.steps = steps;
