import assert from 'assert';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

describe('Home page', function () {
  before(function () {
    chai.use(chaiAsPromised);
    var expect = chai.expect;
    chai.Should();

    browser.url('http://localhost:9000/index.html');
  });

  it('tests the page title', function () {
    return browser
      .getTitle().should.eventually.be.equal('<%= appname %>');
  })
})
