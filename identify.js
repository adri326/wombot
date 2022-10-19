const Rest = require("./rest.js");
const fs = require("fs");
const path = require("path");

const SECRET_PATH = path.join(path.dirname(__filename), "secret.json");

let identify_hostname = "identitytoolkit.googleapis.com";
let identify_secret_key = "AIzaSyDCvp5MTJLUdtBYEKYWXJrlLzu1zuKM6Xw";

if (fs.existsSync(SECRET_PATH)) {
    let secret = JSON.parse(fs.readFileSync(SECRET_PATH, "utf8"));
	

    if (secret.identify_key) identify_secret_key = secret.identify_key;
    if (secret.identify_hostname) identify_hostname = secret.identify_hostname;
}

let identify_rest = new Rest(identify_hostname);

let identify_cache;
let identify_timeout = 0;
function identify(identify_key) {
    if (!identify_key) {
        if (identify_secret_key) {
            identify_key = identify_secret_key;
        } else {
            throw new Error("No identify key provided and no secret.json found!");
        }
    }
	let d;
	if (fs.existsSync("./identityToolkit.json")){
	d=JSON.parse(fs.readFileSync("./identityToolkit.json"))
	}
	else{
		d={timeout:0}
	}
    if (d.timeout<new Date().getTime()){
        return new Promise(async (resolve, reject) => {
            let res = await identify_rest.post("/v1/accounts:signUp?key=" + identify_key, {
                key: identify_key
            });
            identify_cache = res.idToken;
            identify_timeout = new Date().getTime() + 1000 * +res.expiresIn;
            fs.writeFileSync("./identityToolkit.json",JSON.stringify({"id":res.idToken,"timeout":identify_timeout}))
		resolve(identify_cache);
        });
    } else {
	identify_cache=d.id;
        return new Promise((resolve) => {
            resolve(identify_cache);
        });
    }
}

module.exports = identify;
