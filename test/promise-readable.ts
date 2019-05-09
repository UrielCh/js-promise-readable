import {expect} from 'chai'
import semver from 'semver'
import {PassThrough} from 'stream'

import {And, Feature, Given, Scenario, Then, When} from './lib/steps'

import {MockPromiseDuplex} from './lib/mock-promise-duplex'
import {MockStreamReadable} from './lib/mock-stream-readable'

import {PromiseReadable} from '../src/promise-readable'

Feature('Test promise-readable module with stream2 API', () => {
  Scenario('Read chunks from stream', () => {
    let chunk: string | Buffer | undefined
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('stream contains some data', () => {
      stream.append(Buffer.from('chunk1'))
    })

    And('I call read method', async () => {
      chunk = await promiseReadable.read()
    })

    Then('promise returns chunk', () => {
      return expect(chunk).to.deep.equal(Buffer.from('chunk1'))
    })

    When('stream contains some another data', () => {
      stream.append(Buffer.from('chunk2'))
    })

    And('I call read method again', async () => {
      chunk = await promiseReadable.read()
    })

    Then('promise returns another chunk', () => {
      return expect(chunk).to.deep.equal(Buffer.from('chunk2'))
    })

    And('PromiseReadable object can be destroyed', () => {
      promiseReadable.destroy()
    })

    And('PromiseReadable object can be destroyed', () => {
      promiseReadable.destroy()
    })
  })

  Scenario('Read chunks from stream with encoding', () => {
    let chunk: string | Buffer | undefined
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('stream contains some data', () => {
      stream.append(Buffer.from('chunk1'))
    })

    And('I set encoding', () => {
      promiseReadable.setEncoding('utf8')
    })

    And('I call read method', async () => {
      chunk = await promiseReadable.read()
    })

    Then('promise returns chunk', () => {
      return expect(chunk).to.deep.equal('chunk1')
    })

    When('stream contains some another data', () => {
      stream.append(Buffer.from('chunk2'))
    })

    And('I call read method again', async () => {
      chunk = await promiseReadable.read()
    })

    Then('promise returns another chunk', () => {
      return expect(chunk).to.deep.equal('chunk2')
    })
  })

  Scenario('Read empty stream', () => {
    let chunk: string | Buffer | undefined
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call read method', async () => {
      chunk = await promiseReadable.read()
    })

    Then('promise returns undefined value', () => {
      return expect(chunk).to.be.undefined
    })
  })

  Scenario('Read closed stream', () => {
    let chunk: string | Buffer | undefined
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    And('stream is closed', () => {
      return stream.close()
    })

    When('I call read method', async () => {
      chunk = await promiseReadable.read()
    })

    Then('promise returns undefined value', () => {
      return expect(chunk).to.be.undefined
    })
  })

  Scenario('Read destroyed stream', () => {
    let chunk: string | Buffer | undefined
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('stream is destroyed', () => {
      stream.destroy()
    })

    And('I call read method', async () => {
      chunk = await promiseReadable.read()
    })

    Then('promise returns undefined value', () => {
      return expect(chunk).to.be.undefined
    })

    And('PromiseReadable object can be destroyed', () => {
      promiseReadable.destroy()
    })

    And('PromiseReadable object can be destroyed', () => {
      promiseReadable.destroy()
    })
  })

  Scenario('Read stream with error', () => {
    let error: Error
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('stream will emit an error" event', () => {
      stream.setError(new Error('boom'))
    })

    And('I call read method', () => {
      promiseReadable.read().catch(err => {
        error = err
      })
    })

    Then('promise is rejected', () => {
      return expect(error)
        .to.be.an('error')
        .with.property('message', 'boom')
    })

    And('PromiseReadable object can be destroyed', () => {
      promiseReadable.destroy()
    })

    And('PromiseReadable object can be destroyed', () => {
      promiseReadable.destroy()
    })
  })

  Scenario('Read stream with emitted error', () => {
    let error: Error
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('stream emitted an error" event', () => {
      stream.emit('error', new Error('boom'))
    })

    And('I call read method', async () => {
      try {
        await promiseReadable.read()
      } catch (e) {
        error = e
      }
    })

    Then('promise is rejected', () => {
      return expect(error)
        .to.be.an('error')
        .with.property('message', 'boom')
    })
  })

  Scenario('Read all from stream', () => {
    let content: string | Buffer | undefined
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call readAll method', () => {
      promiseReadable.readAll().then(argument => {
        content = argument
      })
    })

    And('"data" event is emitted', () => {
      if (!stream.paused) {
        stream.emit('data', Buffer.from('chunk1'))
      }
    })

    And('another "data" event is emitted', () => {
      if (!stream.paused) {
        stream.emit('data', Buffer.from('chunk2'))
      }
    })

    And('"close" event is emitted', () => {
      stream.emit('end')
    })

    Then('promise returns all chunks in one buffer', () => {
      return expect(content).to.deep.equal(Buffer.from('chunk1chunk2'))
    })
  })

  Scenario('Read all from paused stream', () => {
    let content: string | Buffer | undefined
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I pause stream', () => {
      stream.pause()
    })

    And('I call readAll method', () => {
      promiseReadable.readAll().then(argument => {
        content = argument
      })
    })

    And('"data" event is emitted', () => {
      if (!stream.paused) {
        stream.emit('data', Buffer.from('chunk1'))
      }
    })

    And('another "data" event is emitted', () => {
      if (!stream.paused) {
        stream.emit('data', Buffer.from('chunk2'))
      }
    })

    And('"close" event is emitted', () => {
      stream.emit('end')
    })

    Then('promise returns all chunks in one buffer', () => {
      return expect(content).to.deep.equal(Buffer.from('chunk1chunk2'))
    })
  })

  Scenario('Read all from closed stream', () => {
    let content: string | Buffer | undefined
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('stream is closed', () => {
      stream.close()
    })

    And('I call readAll method', async () => {
      content = await promiseReadable.readAll()
    })

    Then('promise returns undefined value', () => {
      return expect(content).to.be.undefined
    })
  })

  Scenario('Read all from destroyed stream', () => {
    let content: string | Buffer | undefined
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('stream is destroyed', () => {
      stream.destroy()
    })

    And('I call readAll method', async () => {
      content = await promiseReadable.readAll()
    })

    Then('promise returns undefined value', () => {
      return expect(content).to.be.undefined
    })
  })

  Scenario('Read all from stream with error', () => {
    let error: Error
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call readAll method', () => {
      promiseReadable.readAll().catch(err => {
        error = err
      })
    })

    And('"data" event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    And('"error" event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    Then('promise is rejected', () => {
      return expect(error)
        .to.be.an('error')
        .with.property('message', 'boom')
    })
  })

  Scenario('Read all from stream with emitted error', () => {
    let error: Error
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    And('"error" event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    When('I call readAll method', () => {
      promiseReadable.readAll().catch(err => {
        error = err
      })
    })

    And('"data" event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    Then('promise is rejected', () => {
      return expect(error)
        .to.be.an('error')
        .with.property('message', 'boom')
    })
  })

  Scenario('Wait for open from stream', () => {
    let fd: number
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I wait for "open" event', () => {
      promiseReadable.once('open').then(argument => {
        fd = argument
      })
    })

    And('open event is emitted', () => {
      stream.emit('open', 42)
    })

    Then('promise returns result with fd argument', () => {
      return expect(fd).to.equal(42)
    })
  })

  Scenario('Wait for open from closed stream', () => {
    let error: Error
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('stream is closed', () => {
      stream.close()
    })

    And('I wait for "open" event', () => {
      promiseReadable.once('open').catch(err => {
        error = err
      })
    })

    Then('promise is rejected', () => {
      return expect(error)
        .to.be.an('error')
        .with.property('message', 'once open after close')
    })
  })

  Scenario('Wait for open from destroyed stream', () => {
    let error: Error
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('stream is destroyed', () => {
      stream.destroy()
    })

    And('I wait for "open" event', () => {
      promiseReadable.once('open').catch(err => {
        error = err
      })
    })

    Then('promise is rejected', () => {
      return expect(error)
        .to.be.an('error')
        .with.property('message', 'once open after destroy')
    })
  })

  Scenario('Wait for open from stream with error', () => {
    let error: Error
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I wait for "open" event', () => {
      promiseReadable.once('open').catch(err => {
        error = err
      })
    })

    And('"error" event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    Then('promise is rejected', () => {
      return expect(error)
        .to.be.an('error')
        .with.property('message', 'boom')
    })
  })

  Scenario('Wait for open from stream with emitted error', () => {
    let error: Error
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    And('"error" event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    When('I wait for "open" event', () => {
      promiseReadable.once('open').catch(err => {
        error = err
      })
    })

    Then('promise is rejected', () => {
      return expect(error)
        .to.be.an('error')
        .with.property('message', 'boom')
    })
  })

  Scenario('Wait for close from stream', () => {
    let closed = false
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I wait for "close" event', () => {
      promiseReadable.once('close').then(() => {
        closed = true
      })
    })

    And('"close" event is emitted', () => {
      stream.emit('close')
    })

    Then('promise is fullfiled', () => {
      return expect(closed).to.be.true
    })
  })

  Scenario('Wait for close from stream with error', () => {
    let error: Error
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I wait for "close" event', () => {
      promiseReadable.once('close').catch(err => {
        error = err
      })
    })

    And('"error" event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    Then('promise is rejected', () => {
      return expect(error)
        .to.be.an('error')
        .with.property('message', 'boom')
    })
  })

  Scenario('Wait for close from stream with emitted error', () => {
    let error: Error
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    And('"error" event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    When('I wait for "close" event', () => {
      promiseReadable.once('close').catch(err => {
        error = err
      })
    })

    Then('promise is rejected', () => {
      return expect(error)
        .to.be.an('error')
        .with.property('message', 'boom')
    })
  })

  Scenario('Wait for end from stream', () => {
    let ended = false
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I wait for "end" event', () => {
      promiseReadable.once('end').then(() => {
        ended = true
      })
    })

    And('"data" event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    And('another "data" event is emitted', () => {
      stream.emit('data', Buffer.from('chunk2'))
    })

    And('"close" event is emitted', () => {
      stream.emit('end')
    })

    Then('promise returns no result', () => {
      return expect(ended).to.be.true
    })
  })

  Scenario('Wait for end from stream with error', () => {
    let error: Error
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I wait for "end" event', () => {
      promiseReadable.once('end').catch(err => {
        error = err
      })
    })

    And('"data" event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    And('"error" event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    Then('promise is rejected', () => {
      return expect(error)
        .to.be.an('error')
        .with.property('message', 'boom')
    })
  })

  Scenario('Wait for end from stream with emitted error', () => {
    let error: Error
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    And('"data" event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    When('I wait for "end" event', () => {
      promiseReadable.once('end').catch(err => {
        error = err
      })
    })

    And('"error" event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    Then('promise is rejected', () => {
      return expect(error)
        .to.be.an('error')
        .with.property('message', 'boom')
    })
  })

  Scenario('Wait for error from stream without error', () => {
    let promiseFulfilled = false
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I wait for "error" event', () => {
      promiseReadable.once('error').then(() => {
        promiseFulfilled = true
      })
    })

    And('"data" event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    And('another "data" event is emitted', () => {
      stream.emit('data', Buffer.from('chunk2'))
    })

    And('"close" event is emitted', () => {
      stream.emit('end')
    })

    Then('promise returns no result', () => {
      return expect(promiseFulfilled).to.be.true
    })
  })

  Scenario('Wait for error from stream with error', () => {
    let error: Error
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I wait for "error" event', () => {
      promiseReadable.once('error').catch(err => {
        error = err
      })
    })

    And('"data" event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    And('"error" event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    Then('promise is rejected', () => {
      return expect(error)
        .to.be.an('error')
        .with.property('message', 'boom')
    })
  })

  Scenario('Wait for error from stream with emitted error', () => {
    let error: Error
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Readable object', () => {
      stream = new MockStreamReadable()
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    And('"data" event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    When('I wait for "error" event', () => {
      promiseReadable.once('error').catch(err => {
        error = err
      })
    })

    And('"error" event is emitted', () => {
      stream.emit('error', new Error('boom'))
    })

    Then('promise is rejected', () => {
      return expect(error)
        .to.be.an('error')
        .with.property('message', 'boom')
    })
  })

  Scenario('Read non-Readable stream', () => {
    let chunk: string | Buffer | undefined
    let promiseReadable: PromiseReadable<MockStreamReadable>
    let stream: MockStreamReadable

    Given('Non-Readable object', () => {
      stream = new MockStreamReadable()
      stream.readable = false
    })

    And('PromiseReadable object', () => {
      promiseReadable = new PromiseReadable(stream)
    })

    When('I call read method', async () => {
      chunk = await promiseReadable.read()
    })

    And('"data" event is emitted', () => {
      stream.emit('data', Buffer.from('chunk1'))
    })

    Then('promise returns undefined value', () => {
      return expect(chunk).to.be.undefined
    })
  })

  if (semver.gte(process.version, '6.11.3')) {
    Scenario('instanceof operator with MockStreamReadable class', () => {
      let stream: MockStreamReadable

      Given('Readable object', () => {
        stream = new MockStreamReadable()
      })

      Then('other object is not an instance of PromiseReadable class', () => {
        expect(stream).to.be.not.an.instanceof(PromiseReadable)
      })
    })

    Scenario('instanceof operator with PromiseWritable class', () => {
      let promiseReadable: PromiseReadable<MockStreamReadable>
      let stream: MockStreamReadable

      Given('Readable object', () => {
        stream = new MockStreamReadable()
      })

      And('PromiseReadable object', () => {
        promiseReadable = new PromiseReadable(stream)
      })

      Then('PromiseReadable object is an instance of PromiseReadable class', () => {
        expect(promiseReadable).to.be.an.instanceof(PromiseReadable)
      })
    })

    Scenario('instanceof operator with PromiseDuplex class', () => {
      let promiseDuplex: MockPromiseDuplex<PassThrough>
      let stream: PassThrough

      Given('Writable object', () => {
        stream = new PassThrough()
      })

      And('PromiseWritable object', () => {
        promiseDuplex = new MockPromiseDuplex(stream)
      })

      Then('PromiseDuplex object is an instance of PromiseReadable class', () => {
        expect(promiseDuplex).to.be.an.instanceof(PromiseReadable)
      })
    })
  }
})
