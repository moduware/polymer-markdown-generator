#! /usr/bin/env node
const VERSION = '1.0.0';
const {Analyzer, FSUrlLoader} = require('polymer-analyzer');
const program = require('commander');
const fs = require('fs');
const baseUrl = process.cwd(); // gets the path of the current directory

module.exports = {
  _methodFormatter: methodFormatter,
  _propertyFormatter: propertyFormatter,
  _createStringOfArgumentNames: createStringOfArgumentNames
};

program
.version(VERSION)
.usage('[options] <file>')
.option('-e, --element-name <name>', 'Element tag name if different from filename')
.option('-o, --output-file <file>', 'Filename to save result')
.parse(process.argv);

if (program.args.length != 1) {
  console.log('Single file to process must be specified');
  return;
}

const targetFile = program.args[0];
const targetFileBaseName = targetFile.replace(/^.*[\\\/]/, '');
const targetFileDir = targetFile.replace(targetFileBaseName, '');
const elementId = program.elementName || targetFileBaseName.substr(0, targetFileBaseName.lastIndexOf('.'));
const outputName = program.outputFile || 'REFERENCE.md';

// This is the top part of our md file
console.log(`Markdown Generator ????? ${VERSION}\n`);
console.log(`Processing <${targetFile}>\n`);

const analyzer = new Analyzer({
  urlLoader: new FSUrlLoader(targetFileDir),
});


analyzer.analyze([targetFileBaseName]).then((analysis) => {
  let markdownOutput = '';
  const [ElementClass, ] = analysis.getFeatures(
    { kind: 'element', id: elementId, externalPackages: true});
  
  if (!ElementClass) {
    console.log(`File don't define or import ${elementId}.`);
    return;
  }

  markdownOutput += propertyFormatter(ElementClass);
  markdownOutput += methodFormatter(ElementClass);
  fs.writeFileSync(outputName, markdownOutput);
  console.log(`Markdown saved to ${outputName}.`);

});

function methodFormatter(element) {
  let markdown = '';
  markdown += '## Methods\n\n';

  for(const [name, method] of element.methods) {
    let argumentNames = createStringOfArgumentNames(method.params);
    markdown += `**${method.name}(${argumentNames})**: _${method.return.type}_ \n\n${method.description}\n\n\n`;
  }
  return markdown;
}

function propertyFormatter(element) {
  let markdown = '';
  markdown += '## Properties\n\n';

  for (const [name, property] of element.properties) {
    markdown += `**${property.name}**: _${property.type}_ ${typeof (property.default) == 'undefined' ? '' : ' = \`\`' + property.default + '\`\`'}\n\n${property.description}\n\n`;
  }
  return markdown;
}

function createStringOfArgumentNames(argumentsArray) {
  let argumentNames = [];
  for(let argument of argumentsArray) {
    argumentNames.push(argument.name);
  }
  let argumentsString = argumentNames.join(', ');
  return argumentsString;
}
