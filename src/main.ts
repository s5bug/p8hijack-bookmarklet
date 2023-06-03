import defaultCover from './default-cover.png';
import UPNG from 'upng-js';
import {encode as bufferEncode} from 'base64-arraybuffer';

declare global {
    interface Window {
        _cartdat: number[] | undefined
    }
}

const footer = [
    0x00, // internal PICO-8 version
    0x00, 0x00, 0x00, // external PICO-8 version
    0x00, // PICO-8 edition
    0x00, // version suffix
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // SHA hash of cartridge content
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00 // padding
]

let p8Container = document.getElementById("p8_container")

if (p8Container == null) {
    alert("Error: Could not find a PICO-8 container in the current frame! If there is a PICO-8 game on this page, it" +
        " may be in an `iframe`: right-click the game, press \'View frame source\', and remove `view-source:` from" +
        " the resulting URL.")
} else {

    let possibleCartDat: number[] | undefined = window['_cartdat']

    if (possibleCartDat == undefined) {
        alert("Error: Cart data undefined! Are you sure the game is running?")
    } else if(possibleCartDat.length != 0x8000) {
        alert("Error: Cart data is not 0x8000 bytes! Are you sure this is a PICO-8 game?")
    } else {
        let cartDat: number[] = [possibleCartDat, footer].flat()

        let canvas = document.createElement('canvas')
        canvas.width = 160
        canvas.height = 205

        let context = canvas.getContext("2d")!

        let defaultCoverElem = document.createElement('img')
        defaultCoverElem.onload = () => {
            context.drawImage(defaultCoverElem, 0, 0)

            let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
            let pixelData = imageData.data
            for (let i = 0; i < 32800; i++) {
                let p = i * 4

                let byte: number = cartDat[i]
                let ba = (byte >>> 6) & 0b11
                let br = (byte >>> 4) & 0b11
                let bg = (byte >>> 2) & 0b11
                let bb = (byte >>> 0) & 0b11

                pixelData[p + 0] = (pixelData[p + 0] & 0xFC) | br
                pixelData[p + 1] = (pixelData[p + 1] & 0xFC) | bg
                pixelData[p + 2] = (pixelData[p + 2] & 0xFC) | bb
                pixelData[p + 3] = (pixelData[p + 3] & 0xFC) | ba
            }

            let data = UPNG.encode([pixelData.buffer], canvas.width, canvas.height, 0)
            let dataUrl = `data:image/png;base64,${bufferEncode(data)}`
            let dataLink = document.createElement('a')
            dataLink.href = dataUrl
            dataLink.download = 'p8hijack.p8.png'
            dataLink.click()
        }
        defaultCoverElem.src = defaultCover
    }
}

export {}
