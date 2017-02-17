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

const helpers = require('./helpers')
const internal = require('./fixtures/internal/src/internal')
const knockknock = require('../src/knockknock')

describe('knockknock:fixture:internal', () => {
  context('when asynchronous', () => {
    before(() => knockknock.clearCache())

    it('should return promise for caller & package information for fixture file', () => {
      return internal(helpers.createOptions())
        .then((caller) => {
          expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
            file: 'internal/src/internal.js',
            line: 30,
            name: '<anonymous>',
            package: {
              directory: 'internal',
              main: 'internal/src/internal',
              name: 'internal',
              version: '2.0.1'
            }
          }))
        })
    })

    context('and package is excluded', () => {
      it('should return promise for null', () => {
        return internal(helpers.createOptions({ excludes: 'internal' }))
          .then((caller) => {
            expect(caller).to.be.null
          })
      })
    })
  })

  context('when synchronous', () => {
    before(() => knockknock.clearCache())

    it('should return caller & package information for fixture file', () => {
      const caller = internal.sync(helpers.createOptions())

      expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
        file: 'internal/src/internal.js',
        line: 34,
        name: '<anonymous>',
        package: {
          directory: 'internal',
          main: 'internal/src/internal',
          name: 'internal',
          version: '2.0.1'
        }
      }))
    })

    context('and package is excluded', () => {
      it('should return null', () => {
        const caller = internal.sync(helpers.createOptions({ excludes: 'internal' }))

        expect(caller).to.be.null
      })
    })
  })
})
