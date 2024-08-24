import * as nn from "../modules/canvas SOM/canvasSOM.js"


// Best function ever (by me) :)  ||  ! this version is modified for this page !
function activateCollapsibles() {
    const collaps = document.getElementsByClassName("collapsible");
    for (let coll of collaps) {
        coll.addEventListener("click", function() {
            this.classList.toggle("active");  // not needed, just in case you want to detetct if a coll is open with js
            const content = this.nextElementSibling;

            if (content.style.maxHeight){
                content.style.maxHeight = null;
                // document.querySelector("a").children[0].style.height = "auto"
                let parentDiv = this.parentElement;
                while (parentDiv.classList.contains("content")) {
                    parentDiv.style.maxHeight = (parentDiv.scrollHeight - content.scrollHeight) + "px";
                    parentDiv = parentDiv.parentElement;
                }
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                let parentDiv = this.parentElement;
                while (parentDiv.classList.contains("content")) {
                    parentDiv.style.maxHeight = (parentDiv.scrollHeight + content.scrollHeight) + "px";
                    parentDiv = parentDiv.parentElement;
                }
            }
        });
    }
}

function getParameters() {
    const size = document.querySelector("#size").value
    const ils = document.querySelector("#ils").value
    const epochs = document.querySelector("#epochs").value
    let alg = document.querySelector("#alg").value
    const ccolors = document.querySelector("#ccolors").checked


    if (alg == "trad") {
        alg = true
    } else {
        alg = false
    }

    return [parseInt(size), parseInt(ils), parseInt(epochs), alg, ccolors]
}

function createColorLegend(dict) {
    let element = ""
    const entries = Object.entries(dict).sort()
    for (const [className, color] of entries) {
        // possible bug/vulnerability in these values being inserted into html without sanitization
        element += `<div><svg viewBox="0 0 1 1" height="1rem" fill="${color}">
            <rect x="0" y="0" width="1" height="1" /></svg>${className}</div>`
    }
    document.querySelector("aside").innerHTML = element
}

function trainNetwork() {
    if (window.somTrFile === undefined) {
        return;
    }

    const [size, ils, nEpochs, alg, ccolors] = getParameters()

    window.som = new nn.SOM(size)

    const colorDict = som.train(window.somTrFile, ils, nEpochs, alg, ccolors)
    colorDict.then((result) => {
        document.querySelector("#nEpochs").textContent += " (end)"
        createColorLegend(result)
    })
}

async function mapObjects() {
    const testFile = await eAPI.openDataFile()
    if (testFile === undefined) {return null}
    const accuracy = som.test(testFile, "black")

    document.querySelectorAll("#accuracy").forEach((value) => {value.remove()})
    document.querySelector(".legend").insertAdjacentHTML("beforeend", 
    `<span id="accuracy"><b>Accuracy of Model:</b> ${accuracy}%</span>`)
}

function addListeners() {
    // train a network based on loaded data
    document.querySelector("#train").addEventListener("click", () => {
        trainNetwork()

        document.querySelector("#map").removeAttribute("disabled")
        document.querySelector("#save").removeAttribute("disabled")
        document.querySelector("#paint").removeAttribute("disabled")
    });

    // map objects to a network (or test)
    document.querySelector("#map").addEventListener("click", async () => {
        await mapObjects()
    });

    // select a file to get the training data from
    document.querySelector("#opendata").addEventListener("click", async () => {
        window.somTrFile = await eAPI.openDataFile()

        document.querySelector("#train").removeAttribute("disabled")
    });

    // save the current network in a file
    document.querySelector("#save").addEventListener("click", async () => {
        const str = som.toJson()
        eAPI.saveNetworkFile(str)
    });

    // load a previously trained network from a file
    document.querySelector("#load").addEventListener("click", async () => {
        const jsn = await eAPI.openNetworkFile()
        if (jsn === undefined) return;
        window.som = nn.SOM.fromJson(jsn)
        createColorLegend(som.colorDict)

        document.querySelector("#map").removeAttribute("disabled")
        document.querySelector("#save").removeAttribute("disabled")
        document.querySelector("#paint").removeAttribute("disabled")
    });

    // paint the network by infering the colors [IDK IF IM GONNA KEEP IT - DEBUGGING ONLY]
    document.querySelector("#paint").addEventListener("click", async () => {
        if (som.inferColors() === null) {alert("Error: Network already painted");}
    });
}


function main() {
    addListeners()
    activateCollapsibles()
}

main();
