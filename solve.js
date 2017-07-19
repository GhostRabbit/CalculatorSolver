if (process.argv.length < 4) {
  console.log("Usage: node solve.js start goal operation...")
  process.exit()
}

const LIMIT = 10
var start = parseInt(process.argv[2])
var goal = parseInt(process.argv[3])
var operations = makeIntoOperations(process.argv.splice(4))
var solutions = new Array()

function makeIntoOperations(ops) {
  var operations = new Array()
  for (var i = 0; i < ops.length; i++) {
    operations.push(operationOf(ops[i]))
  }
  return operations
}

function operationOf(op) {
  switch (op[0]) {
    case '+':
      return new Adder(parseInt(op.substring(1)))

    case '-':
      return new Subtract(parseInt(op.substring(1)))
      
    case 'x':
      return new Multiplier(parseInt(op.substring(1)))
      
    case '/':
      return new Divider(parseInt(op.substring(1)))

    case '<':
      if (op == '<<') return new ShiftOut()
      else errorOperation()

    default:
      if (isNumber(op)) return new ShiftIn(parseInt(op))
      errorOperation()
  }
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function errorOperation(op) {
  console.log('Unknown operation: ', op[0])
  process.exit()
}

var root = nodeOf(start, new Start())

function nodeOf(value, operation, parent) {
  return {
    value: value,
    operation: operation,
    parent: parent
  }
}

function solutionOf(node) {
  var steps = 0
  var n = node
  while (n.parent) {
    steps++
    n = n.parent
  }
  return {
    node: node,
    moves: steps
  }
  
}

function search(root, operations, d) {
  if (d == LIMIT) return;
  operations.forEach((o) => {
    var result = o.apply(root.value)
    if (!isNaN(result)) {
      var child = nodeOf(result, o, root)
      if (result == goal) {
        solutions.push(solutionOf(child))
      } else {
        search(child, operations, d +1)
      }
    } 
  })
}

function printSolution(node) {
  if (node.parent) printSolution(node.parent)
  console.log(node.operation.name, node.value)
}

search(root, operations, 0)
if (solutions.length > 0) {
  solutions.sort((a, b) => a.moves - b.moves)
  console.log('Best solutions')
  console.log('---')
  var best = solutions[0].moves
  solutions
    .filter((n) => n.moves == best)
    .forEach((n) => {
      console.log('in ' + n.moves + ' moves')
      printSolution(n.node)
      console.log('---')
    })
}
else {
  console.log('No solutions found')
  console.log(start, goal, operations) 
}

// Operations

function Start() {
  this.name = '  '
}
  
function Adder(v) {
  this.value = v
  this.name = '+' + v
  
  this.apply = (x) => {
    return x + this.value
  }
}

function Subtract(v) {
  this.value = v
  this.name = '-' + v
  
  this.apply = (x) => {
    return x - this.value
  }
}

function Multiplier(v) {
  this.value = v
  this.name = 'x' + v
  
  this.apply = (x) => {
    return x * this.value
  }
}

function Divider(v) {
  this.value = v
  this.name = '/' + v
  
  this.apply = (x) => {
    var result = x / this.value
    if (result % 1 == 0) return result
    else return undefined
  }
}

function ShiftOut() {
  this.name = '<<'
  
  this.apply = (x) => {
    return Math.floor(x / 10)
  }
}

function ShiftIn(v) {
  this.value = v
  this.name = ' ' + v
  
  this.apply = (x) => {
    return x * 10 + this.value
  }
}

