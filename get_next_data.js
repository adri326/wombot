//@ts-check
const rest=require("./rest.js");
const fs=require("fs");
const path=require("path");

const style_rest=new rest("www.wombo.art",100);

function getNEXTdata(force=false){
    let header=parseInt(String(fs.readFileSync("styles.js")).split("\n")[0].slice(2))
    if (force || header>(3600+Date.now())){
    style_rest.get("/api/styles","GET").then((result)=>{
        // console.log(result)
        result=result.sort((a,b)=>{
            return a.id-b.id;
        })
        result=result.filter((f)=>{
            return !f.is_premium;        
        });
        console.log(result);
        fs.writeFileSync('styles.json',JSON.stringify(result,['id','name'],"\t"))

    },
    (reason)=>{
        console.error('could not get next data')
        console.error(reason)
    })
    return force || header>(3600+Date.now())
}
}

function updateStylesDotJS(){
    let styles=JSON.parse(String(fs.readFileSync('styles.json')))
    
    let s=`//${Date.now()}\n`
    s+='let styles = new Map();\n';
    //@ts-ignore-errors
    for (let style of styles){
        s+='styles.set('+style.id+',"'+style.name+'");\n';
    }
    let style_tempate=fs.readFileSync("next_data_template.js");
    s+=String(style_tempate)
    s+="module.exports.default = styles;"
    // s+='\nlet steps = new Map();\nsteps.set(1, 23);\nsteps.set(2, 21);\nsteps.set(3, 23);\nsteps.set(4, 23);\nsteps.set(5, 19);\nsteps.set(6, 20);\nsteps.set(7, 21);\nsteps.set(8, 21);\nsteps.set(9, 21);\nsteps.set(10, 20);\nsteps.set(11, 20);\nsteps.set(12, 32);\nsteps.set(13, 20);\nsteps.set(14, 20);\nsteps.set(15, 20);\nsteps.set(16, 20);\nsteps.set(17, 19);\nsteps.set(18, 19);\nsteps.set(19, 20);\nsteps.set(20, 20);\nsteps.set(21, 20);\nsteps.set(22, 20);\nsteps.set(23, 20);\nsteps.set(24, 19);\nsteps.set(25, 19);\nsteps.set(26, 19);\nsteps.set(27, 19);\nsteps.set(28, 19);\nmodule.exports = styles;\nmodule.exports.steps = steps;';
    if (!fs.existsSync("styles.js")){
        fs.openSync("styles.js","w");
    }
    fs.writeFileSync("styles.js",s);
}
function update(force=false) {
    let udneeded=getNEXTdata(force)
    if (udneeded){
        updateStylesDotJS()
    }
    return udneeded
}
module.exports.update=update

if (require.main===module){
    update(true)
}
// updateStyles();
// updatestylesjs();
