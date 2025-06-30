function cloneXmlHtml(xmlNode) {
  if (xmlNode.nodeType === 3) {
    // https://stackoverflow.com/questions/12286975/when-working-with-text-nodes-should-i-use-the-data-nodevalue-textcontent
    return document.createTextNode(xmlNode.textContent);
  }
  const htmlNode = document.createElement(xmlNode.nodeName.toLowerCase());
  for (let i = xmlNode.attributes.length - 1; i >= 0; --i) {
    const attr = xmlNode.attributes[i];
    htmlNode.setAttribute(attr.name, attr.value);
  }

  htmlNode.innerHTML = removeSelfClosingTags(xmlNode.innerHTML);

  return htmlNode;
}

export default cloneXmlHtml;

function removeSelfClosingTags(xml) {
  const selfClosingNodes = [
    'area ',
    'base ',
    'br ',
    'col ',
    'embed ',
    'hr ',
    'img ',
    'input ',
    'link ',
    'meta ',
    'param ',
    'source ',
    'track ',
    'wbr '
  ];
  // return xml;
  const split = xml.split('/>');
  let newXml = '';
  for (let i = 0; i < split.length - 1; i++) {
    const edsplit = split[i].split('<');
    const localName = edsplit[edsplit.length - 1].split(' ')[0];
    if (!selfClosingNodes.includes(localName)) {
      newXml += split[i] + '></' + localName + '>';
    } else {
      newXml += split[i] + localName + '/>';
    }
  }
  return newXml + split[split.length - 1];
}
