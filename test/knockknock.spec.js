/*
 * Copyright (C) 2017 Alasdair Mercer, !ninja
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

const expect = require('chai').expect;

const knockknock = require('../src/knockknock');
const helpers = require('./helpers');
const internal = require('./fixtures/internal/src/internal');
const version = require('../package.json').version;

describe('knockknock', () => {
  context('when asynchronous', () => {
    before(() => knockknock.clearCache());

    it('should return promise for callers containing copies of cached packages (#2)', () => {
      let package1;
      let package2;

      return internal(helpers.createOptions())
        .then((callers) => {
          package1 = callers[0].package;

          return internal(helpers.createOptions());
        })
        .then((callers) => {
          package2 = callers[0].package;

          expect(package1).to.not.equal(package2);
          expect(package1).to.deep.equal(package2);
        });
    });

    context('and no options are provided', () => {
      it('should use default options', () => {
        return internal()
          .then((callers) => {
            // mocha modules are only excluded by helpers.createOptions, so will now be included
            expect(callers).to.have.length.above(2);
          });
      });
    });

    context('and "limit" is greater than number of callers', () => {
      it('should return promise for only available callers', () => {
        return internal(helpers.createOptions({ limit: 10 }))
          .then((callers) => {
            expect(callers).to.have.lengthOf(2);
          });
      });
    });

    context('and "limit" is negative', () => {
      it('should return promise for empty array', () => {
        return internal(helpers.createOptions({ limit: -1 }))
          .then((callers) => {
            expect(callers).to.be.empty;
          });
      });
    });

    context('and "limit" is zero', () => {
      it('should return promise for empty array', () => {
        return internal(helpers.createOptions({ limit: 0 }))
          .then((callers) => {
            expect(callers).to.be.empty;
          });
      });
    });

    context('and "offset" is negative', () => {
      it('should not apply an offset', () => {
        return internal(helpers.createOptions({ offset: -1 }))
          .then((callers) => {
            expect(callers).to.have.lengthOf(2);
          });
      });
    });

    context('and "offset" is greater than size of call stack', () => {
      it('should return promise for empty array', () => {
        return internal(helpers.createOptions({ offset: 100 }))
          .then((callers) => {
            expect(callers).to.be.empty;
          });
      });
    });

    context('and "filterPackages" option modifies package', () => {
      it('should have no affect on contained package (#5)', () => {
        return internal(helpers.createOptions({
          filterPackages: (pkg) => {
            pkg.name = 'bad';

            return true;
          }
        }))
          .then((callers) => {
            expect(callers[0].package.name).to.equal('internal');
          });
      });
    });
  });

  context('when synchronous', () => {
    before(() => knockknock.clearCache());

    it('should return callers containing copies of cached packages (#2)', () => {
      const package1 = internal.sync(helpers.createOptions())[0].package;
      const package2 = internal.sync(helpers.createOptions())[0].package;

      expect(package1).to.not.equal(package2);
      expect(package1).to.deep.equal(package2);
    });

    context('and no options are provided', () => {
      it('should use default options', () => {
        const callers = internal.sync();

        // mocha modules are only excluded by helpers.createOptions, so will now be included
        expect(callers).to.have.length.above(2);
      });
    });

    context('and "limit" is greater than number of callers', () => {
      it('should return only available callers', () => {
        const callers = internal.sync(helpers.createOptions({ limit: 10 }));

        expect(callers).to.have.lengthOf(2);
      });
    });

    context('and "limit" is negative', () => {
      it('should return empty array', () => {
        const callers = internal.sync(helpers.createOptions({ limit: -1 }));

        expect(callers).to.be.empty;
      });
    });

    context('and "limit" is zero', () => {
      it('should return empty array', () => {
        const callers = internal.sync(helpers.createOptions({ limit: 0 }));

        expect(callers).to.be.empty;
      });
    });

    context('and "offset" is negative', () => {
      it('should not apply an offset', () => {
        const callers = internal.sync(helpers.createOptions({ offset: -1 }));

        expect(callers).to.have.lengthOf(2);
      });
    });

    context('and "offset" is greater than size of call stack', () => {
      it('should return empty array', () => {
        const callers = internal.sync(helpers.createOptions({ offset: 100 }));

        expect(callers).to.be.empty;
      });
    });

    context('and "filterPackages" option modifies package information', () => {
      it('should have no affect on contained package (#5)', () => {
        const callers = internal.sync(helpers.createOptions({
          filterPackages: (pkg) => {
            pkg.name = 'bad';

            return true;
          }
        }));

        expect(callers[0].package.name).to.equal('internal');
      });
    });
  });

  describe('.version', () => {
    it('should match package version', () => {
      expect(knockknock.version).to.equal(version);
    });
  });
});
