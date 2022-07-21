const rest=require("./rest.js");
const fs=require("fs");
const path=require("path");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const wombo_rest=new rest("app.wombo.art",100);

const r=wombo_rest.get("")
function extractContent(element, selector) {
    // console.log(element)
    const dom=new JSDOM(element).window.document.body;
    const el=dom.querySelector(selector);
    if (el){
        return el.textContent;
    } else {
        console.error("No element found for selector:",selector);
        return "";
        }
}

// r.then(res=>{
//     let body=extractContent(res,"#__NEXT_DATA__");
//     let data=JSON.parse(body);
//     let styles=data.props.pageProps.artStyles
//     let filtst=filterStyles(styles);
//     fs.writeFileSync(path.join(__dirname,"styles.json"),JSON.stringify(filtst));    
// })
function filterStyles(styles){
    let filtered=[];
    for (let style of styles){
        filtered.push({'id':style.id,'name':style.name,'photo':style.photo_url})
    }
    filtered=filtered.sort((a,b)=>{b.id-a.id});
    filtered={'styles':filtered,'updated':new Date().getDay()};
    return filtered;
}
function checkForUpdate(){
    let styles=JSON.parse(fs.readFileSync(path.join(__dirname,"styles.json")));
    let lastUpdate=styles.updated;
    let today=new Date().getDay();
    return today!=lastUpdate;
}
function updateStyles(){
    
    const wombo_rest=new rest("app.wombo.art",100);

    const r=wombo_rest.get("");
    r.then(res=>{
        let body=extractContent(res,"#__NEXT_DATA__");
        let data=JSON.parse(body);
        let styles=data.props.pageProps.artStyles
        let filtst=filterStyles(styles);
        fs.writeFileSync(path.join(__dirname,"styles.json"),JSON.stringify(filtst));    
    })}
function reload(){
    if (checkForUpdate()){
        updateStyles();
        return true;
    }
    return false;
}
function updatestylesjs(){
    reload()
    let styles=JSON.parse(fs.readFileSync(path.join(__dirname,"styles.json")));
    let s='let styles = new Map();\n';
    for (let style of styles.styles){
        s+='styles.set('+style.id+',"'+style.name+'");\n';
    }
    s+='let steps = new Map();steps.set(1, 23);\nsteps.set(2, 21);\nsteps.set(3, 23);\nsteps.set(4, 23);\nsteps.set(5, 19);\nsteps.set(6, 20);\nsteps.set(7, 21);\nsteps.set(8, 21);\nsteps.set(9, 21);\nsteps.set(10, 20);\nsteps.set(11, 20);\nsteps.set(12, 32);\nsteps.set(13, 20);\nsteps.set(14, 20);\nsteps.set(15, 20);\nsteps.set(16, 20);\nsteps.set(17, 19);\nsteps.set(18, 19);\nsteps.set(19, 20);\nsteps.set(20, 20);\nsteps.set(21, 20);\nsteps.set(22, 20);\nsteps.set(23, 20);\nsteps.set(24, 19);\nsteps.set(25, 19);\nsteps.set(26, 19);\nsteps.set(27, 19);\nsteps.set(28, 19);'
    s+='module.exports = styles;';
    s+='module.exports.steps = steps;';
    fs.writeFileSync(path.join(__dirname,"styles.js"),s);
}
updatestylesjs();