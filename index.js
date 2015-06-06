var dust
var PassThrough = require('stream').PassThrough

try {
  dust = require('dustjs-linkedin')
  try { require('dustjs-helpers') }
  catch (ex) {}
}
catch (ex) {
  try { dust = require('dust') }
  catch (ex) {}
}

if (!dust) throw new Error('"dustjs-linkedin" or "dust" module not found')

var getBaseDir = function(options) {
  if (options && options.baseDir)
    return options.baseDir
  return ''
}

var getTemplateExt = function(options) {
  if (options && options.defaultExt && options.defaultExt.length > 0)
    return '.' + options.defaultExt
  return '.dust'
}

module.exports = {
  module: {
    compile: function(template, options, callback) {
      dust.onLoad = function(name, callback) {
        callback(null, template)
      }
      var compiled = dust.compileFn(template, options && options.filename)
      var templateName = options.filename
      process.nextTick(function() {
        callback(null, function(context, options, callback) {
          var dustStream = dust.stream(templateName, context)
          var stream = new PassThrough()

          dustStream.on('data', function(data) {
            stream.push(data)
          })
          dustStream.on('end', function() {
            stream.push(null)
          })
          callback(null, stream)
        })
      })
    }
  },
  compileMode: 'async'
}
