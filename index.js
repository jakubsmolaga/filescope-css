#!/usr/bin/env node
if (process.argv.length !== 4) {
  console.log('wrong number of arguments, correct usage:\nfilescope-css inputDir output.css')
  process.exit(0)
}
const fs = require('fs')
const inputDir = process.argv[2] || 'css'
const outputFile = process.argv[3] || 'compiled.css'
let output = ''

let fileNames = fs.readdirSync(inputDir)
for (let i = 0; i < fileNames.length; i++) {
  let fileName = fileNames[i]
  let data = fs.readFileSync(inputDir + '/' + fileName).toString()
  let prefix = fileName.slice(0, -4) + '__'
  let previousPos = 0
  let charPos = 0
  while (charPos < data.length - 1) {
    while (charPos < data.length - 1 && data[charPos] !== '.') charPos++
    if (charPos === data.length - 1) break
    output += data.slice(previousPos, charPos + 1) + prefix
    previousPos = charPos + 1
    while (data[charPos] !== '}') charPos++
  }
  output += data.slice(previousPos, charPos + 1) + '\n\n'
}
fs.writeFileSync(outputFile, output)
