#!/usr/bin/env node
if (process.argv.length !== 4) {
  console.log('wrong number of arguments, correct usage:\nfilescope-css inputDir output.css')
  process.exit(0)
}
const fs = require('fs')
const inputDir = process.argv[2]
const outputFile = process.argv[3]

let output = ''
let data, prefix, charPos, previousPos

const currentChar = () => data[charPos]
const isWhitespace = c => (c === ' ') || (c === '\n') || (c === '\t')
const consumeWhitespace = () => consumeWhile(isWhitespace)

const consumeComment = () => {
  consumeWhile(() => data.substr(charPos, 2) !== '*/')
  consumeChar()
  consumeChar()
}

const skipWhile = (condition) => {
  while (condition(currentChar())) charPos++
}

const consumeWhile = (condition) => {
  skipWhile(condition)
  consume()
}

const consume = () => {
  output += data.slice(previousPos, charPos)
  previousPos = charPos
}

const consumeChar = () => {
  charPos++
  consume()
}

const consumeClassBlock = () => {
  consumeChar() // eat the dot
  output += prefix
  consumeWhile(c => c !== '}')
  consumeChar() // eat the "}"
}

const consumeMediaBlock = () => {
  consumeWhile(c => c !== '{')
  consumeChar()
  parseUntil(c => c === '}')
  consumeChar()
}

const consumeTagBlock = () => {
  consumeWhile(c => c !== '}')
  consumeChar()
}

const parseUntil = (condition) => {
  consumeWhitespace()
  if (condition(currentChar())) return undefined
  if (currentChar() === '/') consumeComment()
  else if (currentChar() === '.') consumeClassBlock()
  else if (currentChar() === '@') consumeMediaBlock()
  else consumeTagBlock()
  parseUntil(condition)
}

const setup = (filename) => {
  data = fs.readFileSync(inputDir + '/' + filename).toString()
  prefix = filename.slice(0, -4) + '__'
  previousPos = 0
  charPos = 0
}

fs.readdirSync(inputDir).forEach(filename => {
  setup(filename)
  parseUntil(c => typeof c === 'undefined')
  output += '\n\n'
})

fs.writeFileSync(outputFile, output.trimRight())
