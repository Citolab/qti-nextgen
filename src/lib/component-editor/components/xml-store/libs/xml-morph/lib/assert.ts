

function equal (a, b, m) {
  assert(a == b, m) 
}

function notEqual (a, b, m) {
  assert(a != b, m) 
}

function notOk (t, m) {
  assert(!t, m)
}

function assert (t, m) {
  if (!t) throw new Error(m || 'AssertionError')
}

assert.notEqual = notEqual
assert.notOk = notOk
assert.equal = equal
assert.ok = assert

export default assert;