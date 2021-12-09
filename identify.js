const Rest = require("./rest.js");
const secret = require("./secret.json");

const IDENTIFY_HOSTNAME = secret.identify_hostname ?? "identitytoolkit.googleapis.com";

let identify_rest = new Rest(IDENTIFY_HOSTNAME);

let identify_cache;
let identify_timeout = 0;
function identify() {
    if (new Date().getTime() >= identify_timeout) {
        return new Promise(async (resolve, reject) => {
            let res = await identify_rest.post("/v1/accounts:signUp?key=" + secret.identify_key, {
                key: secret.identify_key
            });
            identify_cache = res.idToken;
            identify_timeout = new Date().getTime() + 1000 * +res.expiresIn - 30000;
            resolve(identify_cache);
        });
    } else {
        return new Promise((resolve) => {
            resolve(identify_cache);
        });
    }
}

module.exports = identify;
