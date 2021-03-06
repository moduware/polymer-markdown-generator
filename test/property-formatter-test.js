const propertyFormatter = require('../js/property-formatter');
const chai = require('chai');
const expect = chai.expect;

describe('propertyFormatter', function () {
  let propertyMap = new Map();

  propertyMap.set('big', { 
    name: 'big',
    type: 'boolean',
    description: 'Common for iOS and Android Platform'
  });

  let morphButton = {
    properties: propertyMap
  };
  context('When given a polymer element json object', function () {
    it('formats property inside element into markdown', function() {
      let markdownOutput = propertyFormatter(morphButton);
  
      expect(markdownOutput).to.be.a('string').that.includes('**big**: _boolean_');
      expect(markdownOutput).to.include('Common for iOS and Android Platform');
    });
  });
});
