import { fs } from "../index.js"

function parsePosts() {
    let files = fs.readdirSync(process.cwd()+"/website/posts")
    let result = ""

    for (let x in files) {
        if (files[x].endsWith(".html") === false && files[x].endsWith(".md") === false ) { break } // If file/dir is not .html or .md then ignore

        let date = files[x].split("-")[0]
        if (date < 10000000 || date > 99999999) { break } // If date does not fit ISO8601 format then ignore

        date = date.replace(/.{2}/g,"$&-").replace("-","").slice(0,-1) // Insert a dash every 2 characters, remove the first dash, remove the last character

        let name = files[x].slice(9).replace(/-/g," ").replace(".html","").replace(".md","") // Strip Date, replace seperator with space & remove file extension

        result = `<li>${date} <a href="/posts/${files[x]}">${name}</a></li>`+result
    }

    return result
}

function parseKbas() {
    let files = fs.readdirSync(process.cwd()+"/website/helpdesk/kbas")
    let pages = {}
    let result = ""

    for (let x in files) {
        if (files[x].endsWith(".html") === false && files[x].endsWith(".md") === false ) { break } // If file/dir is not .html or .md then ignore

        if (!Array.isArray(pages[files[x].split("-")[0]])) { // check if category array does not exist
            pages[files[x].split("-")[0]] = [] // create it
        }

        pages[files[x].split("-")[0]].push(files[x]) 
    }

    for (let y in pages) {
        result += `<h1>${y}</h1><div class="linkColumn">`
        for (let z in pages[y]) {
            result += `<a href="/helpdesk/articles/${pages[y][z]}"><img src="/dynamic/icon/post/366FFF">${pages[y][z].split("-")[1].split(".")[0].replace(/_/g," ")}</a>`
        }
        result += `</div>`
    }

    return result
}

export { parseKbas, parsePosts}