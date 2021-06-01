import checksum from 'eth-checksum'
import * as bitcoin from 'bitcoinjs-lib'
import createKeccak from 'keccak'
import base58 from 'bs58'

// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'create-address') {
    // make sure we have a text field selected
    const generateAddress = () => {
      if (msg.addressType === 'ethereum') {
        return generateEthAddress()
      } else if (msg.addressType === 'bitcoin') {
        return generateBtcAddress()
      } else if (msg.addressType === 'zkopru') {
        return generateZkopruAddress()
      } else {
        throw new Error(`Unsupported address type: ${msg.addressType}`)
      }
    }
    let address: string
    for (const node of figma.currentPage.selection) {
      if (node.type === 'TEXT') {
        await figma.loadFontAsync(node.fontName as FontName)
        const text = node.characters
        node.deleteCharacters(0, text.length)
        if (msg.singleAddress) {
          address = address || generateAddress()
          node.insertCharacters(0, address)
        } else {
          node.insertCharacters(0, generateAddress())
        }
      }
    }
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};

/**
 * This is not cryptographically secure
 **/
function randomHexString(length: number) {
  const hexcharset = '0123456789abcdef'
  const chars = [] as string[]
  for (let x = 0; x < length; x++) {
    chars.push(hexcharset[Math.floor(Math.random() * hexcharset.length)])
  }
  return chars.join('')
}

function generateEthAddress() {
  return checksum.encode(`0x${randomHexString(40)}`)
}

function generateBtcAddress() {
  // generate an insecure random key
  const privateKey = randomHexString(64)
  const keyPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'));
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
  return address
}

function generateZkopruAddress() {
  // generate a 64 byte payload (128 hex characters)
  const payload = Buffer.from(randomHexString(128), 'hex')
  if (payload.length !== 64) throw new Error(`Invalid payload length: ${payload.length}`)
  const checksum = createKeccak('keccak256')
    .update(payload)
    .digest()
    .slice(0, 4)
  const address = base58.encode(Buffer.concat([payload, checksum]))
  return address
}
