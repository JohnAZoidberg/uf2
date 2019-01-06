"use strict";

function savePatch(ev) {
    let text = document.getElementById("patch")
    localStorage["UF2_PATCH"] = text.value
}

function restorePatch() {
    let text = document.getElementById("patch")
    text.value = localStorage["UF2_PATCH"]
    document.getElementById("apply").onclick = applyPatch
}

let currUF2 = null
let currUF2Name = ""

function showMSG() {
    if (infoMsg)
        document.getElementById("currconfig").textContent = infoMsg
}

function wrap(f) {
    try {
        infoMsg = ""
        f()
        showMSG()
    } catch (e) {
        log("Exception: " + e.message)
        showMSG()
    }

}

function applyPatch() {
    wrap(() => {
        let text = document.getElementById("patch")
        let newcfg = text.value.trim()
        if (!currUF2)
            log("You have to drop a UF2 file with bootloader above before applying patches.")
        else if (!newcfg)
            log("You didn't give any patch to apply.")
        else {
            let buf = currUF2.slice()
            let changes = patchConfig(buf, newcfg)
            if (!changes) {
                log("No changes.")
            } else {
                log("\nChanges:\n" + changes)
                log("Downloading " + currUF2Name)

                let blob = new Blob([buf], {
                    type: "application/x-uf2"
                });
                let url = URL.createObjectURL(blob);

                let a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = url;
                a.download = currUF2Name
                a.click();
                window.URL.revokeObjectURL(url);
            }
        }
    })
}

function dropHandler(ev) {
    ev.preventDefault();

    for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        if (ev.dataTransfer.items[i].kind === 'file') {
            let file = ev.dataTransfer.items[i].getAsFile();
            let reader = new FileReader();
            reader.onload = e => {
                wrap(() => {
                    let buf = new Uint8Array(reader.result)
                    let cfg = readConfig(buf)
                    currUF2 = buf
                    infoMsg = ""
                    currUF2Name = file.name
                    document.getElementById("currconfig").textContent = cfg
                })
            }
            reader.readAsArrayBuffer(file);
            break
        }
    }
}

function dragOverHandler(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'copy';
}