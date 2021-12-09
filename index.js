const task = require("./task.js");
const styles = require("./styles.js");


(async () => {
    await task(process.argv[2], process.argv[3] || 3, console.log);
})();
