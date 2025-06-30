import assert from './lib/assert';
import clone from './lib/clone-xml-html';
import { isEqualNode } from './lib/is-equal-node';
import morph from './lib/morph';

const TEXT_NODE = 3;

// Morph one tree into another tree
//
// no parent
//   -> same: diff and walk children
//   -> not same: replace and return
// old node doesn't exist
//   -> insert new node
// new node doesn't exist
//   -> delete old node
// nodes are not the same
//   -> diff nodes and apply patch to old node
// nodes are the same
//   -> walk all child nodes and append to old node
function nanomorph(oldTree, newTree, options) {
  assert.equal(typeof oldTree, 'object', 'nanomorph: oldTree should be an object');
  assert.equal(typeof newTree, 'object', 'nanomorph: newTree should be an object');

  if (options && options.childrenOnly) {
    updateChildren(newTree, oldTree);
    return oldTree;
  }

  assert.notEqual(
    newTree.nodeType,
    11,
    'nanomorph: newTree should have one root node (which is not a DocumentFragment)'
  );

  return walk(newTree, oldTree);
}

// Walk and morph a dom tree
function walk(newNode, oldNode) {
  if (!oldNode) {
    return newNode;
  } else if (!newNode) {
    return null;
  } else if (isEqualNode(newNode, oldNode)) {
    return oldNode;
  } else if (newNode.localName !== oldNode.localName || getComponentId(newNode) !== getComponentId(oldNode)) {
    return newNode;
  } else {
    morph(newNode, oldNode);
    updateChildren(newNode, oldNode);
    return oldNode;
  }
}

function getComponentId(node) {
  return node.nodeType == 1 ? node.getAttribute('data-morph-id') : undefined;
}

// Update the children of elements
// (obj, obj) -> null
function updateChildren(newNode, oldNode) {
  let oldChild, newChild, morphed, oldMatch;

  for (let i = 0; ; i++) {
    oldChild = oldNode.childNodes[i];
    newChild = newNode.childNodes[i];

    // Both nodes are empty, do nothing
    if (!oldChild && !newChild) {
      break;

      // There is no new child, remove old
    } else if (!newChild) {
      oldNode.removeChild(oldChild);
      i--;

      // There is no old child, add new
    } else if (!oldChild) {
      oldNode.appendChild(clone(newChild));

      // Both nodes are the same, morph
    } else if (same(newChild, oldChild)) {
      morphed = walk(newChild, oldChild);
      if (morphed !== oldChild) {
        oldNode.replaceChild(clone(morphed), oldChild);
      }

      // Both nodes do not share an ID or a placeholder, try reorder
    } else {
      oldMatch = null;

      // Try and find a similar node somewhere in the tree
      for (let j = i; j < oldNode.childNodes.length; j++) {
        if (same(oldNode.childNodes[j], newChild)) {
          oldMatch = oldNode.childNodes[j];
          break;
        }
      }

      // If there was a node with the same ID or placeholder in the old list
      if (oldMatch) {
        morphed = walk(newChild, oldMatch);
        oldNode.insertBefore(clone(morphed), oldChild);

        // It's safe to morph two nodes in-place if neither has an ID
      } else if (!getComponentId(newChild) && !getComponentId(oldChild)) {
        morphed = walk(newChild, oldChild);
        if (morphed !== oldChild) {
          oldNode.replaceChild(clone(morphed), oldChild);
        }

        // Insert the node at the index if we couldn't morph or find a matching node
      } else {
        oldNode.insertBefore(clone(newChild), oldChild);
      }
    }
  }
}

function same(a, b) {
  if (getComponentId(a)) return getComponentId(a) === getComponentId(b);
  if (a.isEqualNode) return isEqualNode(a, b);
  if (a.tagName !== b.tagName) return false;
  if (a.type === TEXT_NODE) return a.nodeValue === b.nodeValue;
  return false;
}

export default nanomorph;
