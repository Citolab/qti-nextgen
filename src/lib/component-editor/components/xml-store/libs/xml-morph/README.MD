Looked into:
https://github.com/fiduswriter/diffDOM
https://github.com/patrick-steele-idem/morphdom

https://github.com/choojs/nanomorph <-- we chose this

https://github.com/bigskysoftware/idiomorph <-- the new kid on the block

NANOMORPH

-- CHANGES ON THE ORIGINAL LIBRARY--

index.ts
Just comparing, when adding new html nodes a new html is now cloned, see clone-xml-html

assert.ts
just a lib I borrowed from nanoassert

clone-xml-html.ts
clones an XML (or HTML) node by creating an element is create with the same localname
the attributes are copied and the same innerhtml from the xml is set in the html node

is-equal-node.ts
since webcomponents add to their own attributes, god forbit alter the html we now ignore all added attributes in the dom html. This makes for a louse equal check
[ ] - filter specific tags on specific created attributes for better comparison
