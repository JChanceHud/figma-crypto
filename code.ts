import checksum from 'eth-checksum'
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
  if (msg.type === 'create-rectangles') {
    const nodes: SceneNode[] = [];
    for (let i = 0; i < msg.count; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  } else if (msg.type === 'create-address') {
    // make sure we have a text field selected
    for (const node of figma.currentPage.selection) {
      if (node.type === 'TEXT') {
        await figma.loadFontAsync(node.fontName as FontName)
        const text = node.characters
        node.deleteCharacters(0, text.length)
        if (msg.addressType === 'ethereum') {
          node.insertCharacters(0, generateEthAddress())
        } else {
          throw new Error(`Unsupported address type: ${msg.addressType}`)
        }
      }
    }
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};

function generateEthAddress() {
  const charset = '0123456789abcdef'
  const chars = [] as string[]
  for (let x = 0; x < 40; x++) {
    chars.push(charset[Math.floor(Math.random() * 16)])
  }
  return checksum.encode(`0x${chars.join('')}`)
  // return `0x${chars.join('')}`
}
