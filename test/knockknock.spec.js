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

const knockknock = require('../src/knockknock')
const helpers = require('./helpers')
const internal = require('./fixtures/internal/src/internal')
const version = require('../package.json').version

describe('knockknock', () => {
  context('when asynchronous', () => {
    before(() => knockknock.clearCache())

    it('should return promise for caller containing a copy of cached package information (#2)', () => {
      let package1
      let package2

      return internal(helpers.createOptions())
        .then((caller) => {
          package1 = caller.package

          return internal(helpers.createOptions())
        })
        .then((caller) => {
          package2 = caller.package

          expect(package1).to.not.equal(package2)
          expect(package1).to.deep.equal(package2)
        })
    })
  })

  context('when synchronous', () => {
    before(() => knockknock.clearCache())

    it('should return caller containing a copy of cached package information (#2)', () => {
      const package1 = internal.sync(helpers.createOptions()).package
      const package2 = internal.sync(helpers.createOptions()).package

      expect(package1).to.not.equal(package2)
      expect(package1).to.deep.equal(package2)
    })
  })

  describe('.version', () => {
    it('should match package version', () => {
      expect(knockknock.version).to.equal(version)
    })
  })
})
