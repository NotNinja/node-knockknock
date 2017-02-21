/*
 * Copyright (C) 2017 Alasdair Mercer, Skelp
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

'use strict'

const expect = require('chai').expect
const ncp = require('ncp').ncp
const path = require('path')
const tmp = require('tmp')

const helpers = require('./helpers')
const knockknock = require('../src/knockknock')

describe('knockknock:fixture:unpackaged', () => {
  let tempDirPath
  let unpackaged

  before((done) => {
    tmp.setGracefulCleanup()

    tmp.dir((error, dirPath) => {
      if (error) {
        return done(error)
      }

      tempDirPath = dirPath

      return done()
    })
  })

  before((done) => {
    ncp(path.join(__dirname, 'fixtures', 'unpackaged'), tempDirPath, (error) => {
      if (error) {
        return done(error)
      }

      unpackaged = require(path.join(tempDirPath, 'src', 'unpackaged'))

      return done()
    })
  })

  context('when asynchronous', () => {
    before(() => knockknock.clearCache())

    it('should return promise for callers (excl. packages) before "knocking" file', () => {
      return unpackaged(path.resolve(__dirname, '../'), helpers.createOptions())
        .then((callers) => {
          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal({
            column: 10,
            file: path.join(tempDirPath, 'src', 'unpackaged.js'),
            line: 28,
            name: 'unpackagedFunction',
            package: null
          })
        })
    })

    context('and limited to a single caller via "limit"', () => {
      it('should return promise for only caller (excl. package) before "knocking" file', () => {
        return unpackaged(path.resolve(__dirname, '../'), helpers.createOptions({ limit: 1 }))
          .then((callers) => {
            expect(callers).to.have.lengthOf(1)
            expect(callers[0]).to.deep.equal({
              column: 10,
              file: path.join(tempDirPath, 'src', 'unpackaged.js'),
              line: 28,
              name: 'unpackagedFunction',
              package: null
            })
          })
      })
    })

    context('and file before "knocking" file is excluded via "filterFiles"', () => {
      it('should return promise for empty array', () => {
        return unpackaged(path.resolve(__dirname, '../'), helpers.createOptions({
          filterFiles: (filePath) => {
            return path.basename(filePath) !== 'unpackaged.js'
          }
        }))
          .then((callers) => {
            expect(callers).to.be.empty
          })
      })
    })

    context('and all files are excluded via "filterFiles"', () => {
      it('should return promise for empty array', () => {
        return unpackaged(path.resolve(__dirname, '../'), helpers.createOptions({ filterFiles: () => false }))
          .then((callers) => {
            expect(callers).to.be.empty
          })
      })
    })

    context('and unpackaged files are excluded via "filterPackages"', () => {
      it('should return promise for empty array', () => {
        return unpackaged(path.resolve(__dirname, '../'), helpers.createOptions({
          filterPackages: (pkg) => {
            return pkg != null
          }
        }))
          .then((callers) => {
            expect(callers).to.be.empty
          })
      })
    })
  })

  context('when synchronous', () => {
    before(() => knockknock.clearCache())

    it('should return callers (excl. packages) before "knocking" file', () => {
      const callers = unpackaged.sync(path.resolve(__dirname, '../'), helpers.createOptions())

      expect(callers).to.have.lengthOf(1)
      expect(callers[0]).to.deep.equal({
        column: 14,
        file: path.join(tempDirPath, 'src', 'unpackaged.js'),
        line: 31,
        name: 'unpackagedSyncFunction',
        package: null
      })
    })

    context('and limited to a single caller via "limit"', () => {
      it('should return only caller (excl. package) before "knocking" file', () => {
        const callers = unpackaged.sync(path.resolve(__dirname, '../'), helpers.createOptions({ limit: 1 }))

        expect(callers).to.have.lengthOf(1)
        expect(callers[0]).to.deep.equal({
          column: 14,
          file: path.join(tempDirPath, 'src', 'unpackaged.js'),
          line: 31,
          name: 'unpackagedSyncFunction',
          package: null
        })
      })
    })

    context('and file before "knocking" file is excluded via "filterFiles"', () => {
      it('should return empty array', () => {
        const callers = unpackaged.sync(path.resolve(__dirname, '../'), helpers.createOptions({
          filterFiles: (filePath) => {
            return path.basename(filePath) !== 'unpackaged.js'
          }
        }))

        expect(callers).to.be.empty
      })
    })

    context('and all files are excluded via "filterFiles"', () => {
      it('should return empty array', () => {
        const callers = unpackaged.sync(path.resolve(__dirname, '../'), helpers.createOptions({
          filterFiles: () => {
            return false
          }
        }))

        expect(callers).to.be.empty
      })
    })

    context('and unpackaged files are excluded via "filterPackages"', () => {
      it('should return empty array', () => {
        const callers = unpackaged.sync(path.resolve(__dirname, '../'), helpers.createOptions({
          filterPackages: (pkg) => {
            return pkg != null
          }
        }))

        expect(callers).to.be.empty
      })
    })
  })
})
