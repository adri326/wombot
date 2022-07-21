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

r.then(res=>{
    let body=extractContent(res,"#__NEXT_DATA__");
    let data=JSON.parse(body);
    let styles=data.props.pageProps.artStyles
    let filtst=filterStyles(styles);
    fs.writeFileSync(path.join(__dirname,"styles.json"),JSON.stringify(filtst));    
})
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
    }
}