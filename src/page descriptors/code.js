function enableSubmit() {
    /**
     * enables the submit button only if there's text on the 'textarea' element
     */
    if(this.value==="") { 
           document.getElementById('sub').disabled = true; 
       } else { 
           document.getElementById('sub').disabled = false;
       }
}

function buildDescriptorSelector() {
    const descriptors = [
        "amw",
        "chi0n",
        "chi0v",
        "chi1n",
        "chi1v",
        "chi2n",
        "chi2v",
        "chi3n",
        "chi3v",
        "chi4n",
        "chi4v",
        "CrippenClogP",
        "CrippenMR",
        "exactmw",
        "FractionCSP3",
        "hallKierAlpha",
        "kappa1",
        "kappa2",
        "kappa3",
        "labuteASA",
        "lipinskiHBA",
        "lipinskiHBD",
        "NumAliphaticHeterocycles",
        "NumAliphaticRings",
        "NumAmideBonds",
        "NumAromaticHeterocycles",
        "NumAromaticRings",
        "NumAtoms",
        "NumAtomStereoCenters",
        "NumBridgeheadAtoms",
        "NumHBA",
        "NumHBD",
        "NumHeavyAtoms",
        "NumHeteroatoms",
        "NumHeterocycles",
        "NumRings",
        "NumRotatableBonds",
        "NumSaturatedHeterocycles",
        "NumSaturatedRings",
        "NumSpiroAtoms",
        "NumUnspecifiedAtomStereoCenters",
        "Phi",
        "tpsa",
    ]
    let content = `<div>
        <input type="checkbox" id="dc_ALL" value="ALL">
        <label for="dc_ALL">Select All</label></div>`
    for (const dcName of descriptors) {
        content += `<div>
        <input type="checkbox" id="dc_${dcName}" value="${dcName}">
        <label for="dc_${dcName}">${dcName}</label></div>`
    }
    document.querySelector("aside").innerHTML = content;
}

function main() {
    document.querySelector("textarea").addEventListener("keyup", enableSubmit);
    buildDescriptorSelector();
}

main();
