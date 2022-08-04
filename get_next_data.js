//@ts-check
const rest=require("./rest.js");
const fs=require("fs");
const path=require("path");

const style_rest=new rest("https://app.wombo.art",100);

function getNEXTdata(){
    let a=await style_rest.get("/api/styles")
}

function updatestylesjs(){
    reload()
    
    if (!fs.existsSync(path.join(__dirname,"styles.json"))){
        fs.openSync(path.join(__dirname,"styles.json"),"w");
        
    }
    let styles=JSON.parse(fs.readFileSync(path.join(__dirname,"styles.json")));        
    styles.styles=styles.styles.sort((a,b)=>{b.id-a.id});
    let s='let styles = new Map();\n';
    for (let style of styles.styles){
        s+='styles.set('+style.id+',"'+style.name+'");\n';
    }
    s+='let steps = new Map();steps.set(1, 23);\nsteps.set(2, 21);\nsteps.set(3, 23);\nsteps.set(4, 23);\nsteps.set(5, 19);\nsteps.set(6, 20);\nsteps.set(7, 21);\nsteps.set(8, 21);\nsteps.set(9, 21);\nsteps.set(10, 20);\nsteps.set(11, 20);\nsteps.set(12, 32);\nsteps.set(13, 20);\nsteps.set(14, 20);\nsteps.set(15, 20);\nsteps.set(16, 20);\nsteps.set(17, 19);\nsteps.set(18, 19);\nsteps.set(19, 20);\nsteps.set(20, 20);\nsteps.set(21, 20);\nsteps.set(22, 20);\nsteps.set(23, 20);\nsteps.set(24, 19);\nsteps.set(25, 19);\nsteps.set(26, 19);\nsteps.set(27, 19);\nsteps.set(28, 19);'
    s+='\nmodule.exports = styles;\n';
    s+='module.exports.steps = steps;';
    if (!fs.existsSync(path.join(__dirname,"styles.js"))){
        fs.openSync(path.join(__dirname,"styles.js"),"w");
    }
    fs.writeFileSync(path.join(__dirname,"styles.js"),s);
}
updateStyles();
updatestylesjs();