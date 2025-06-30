function sameThing(attr1, attr2) {
  if (attr1 == null) {
    attr1 = '';
  }
  if (attr2 == null) {
    attr2 = '';
  }
  return attr1 == attr2;
}

function isElement(e) {
  return e.nodeType == 1;
}

export function isEqualNode(a, b) {
  // if (typeof a.isEqualNode == 'function') {
  //   // Use the native version when available
  //   return a.isEqualNode(b);
  // }
  if (b.nodeType != a.nodeType) {
    return false;
  }
  if (!sameThing(b.localName, a.localName)) {
    return false;
  }
  // if (!sameThing(b.namespaceURI, a.namespaceURI)) {
  //   return false;
  // }
  if (!sameThing(b.nodeValue, a.nodeValue)) {
    return false;
  }

  if (a.hasChildNodes() != b.hasChildNodes()) {
    return false;
  }

  if (a.hasChildNodes()) {
    if (a.childNodes.length != b.childNodes.length) {
      return false;
    }

    for (let i = 0; i < a.childNodes.length; i++) {
      const childA = a.childNodes[i];
      const childB = b.childNodes[i];
      if (!isEqualNode(childA, childB)) {
        return false;
      }
    }
  }

  if (isElement(a) && isElement(b)) {
    if (!sameThing(b.localName, a.localName)) {
      return false;
    }
    if (!sameThing(b.prefix, a.prefix)) {
      return false;
    }

    /*
     * PK: WE DON't check if attribute length is same,
     * this is because webcomponents in the html add their own attributes,
     */

    // if (a.attributes.length != b.attributes.length) {
    //   return false;
    // }

    /*
     * PK: and if they do so, we want to ignore those attributes.
     * So we comment check on length, and only check on attributes which exists in the XML
     * if they are the same as in the real dom
     */

    for (let i = 0; i < b.attributes.length; i++) {
      const attrA = a.attributes.item(i);
      if (!attrA) break;
      const attrB = b.getAttribute(attrA.name);

      if (attrA.value != attrB) {
        return false;
      }
    }
  }

  return true;
}
