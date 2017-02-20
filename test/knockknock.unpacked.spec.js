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

    it('should return promise for caller information', () => {
      return unpackaged(path.resolve(__dirname, '../'))
        .then((caller) => {
          expect(caller).to.deep.equal({
            column: 10,
            file: path.join(tempDirPath, 'src', 'unpackaged.js'),
            line: 28,
            name: 'unpackagedFunction',
            package: null
          })
        })
    })

    // TODO: #7 Add test covering use of "filterPackages" for unpackaged file
  })

  context('when synchronous', () => {
    before(() => knockknock.clearCache())

    it('should return caller information', () => {
      const caller = unpackaged.sync(path.resolve(__dirname, '../'))

      expect(caller).to.deep.equal({
        column: 14,
        file: path.join(tempDirPath, 'src', 'unpackaged.js'),
        line: 31,
        name: 'unpackagedSyncFunction',
        package: null
      })
    })

    // TODO: #7 Add test covering use of "filterPackages" for unpackaged file
  })
})
