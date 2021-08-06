"use strict"

var http = require("http")
var url = require("url")
var fs = require("fs")
var querystring = require("querystring")

var textMIME = {
  txt:   "text/plain;charset=utf-8",
}
var imageMIME = JSON.parse(fs.readFileSync("ImageMIME.json"))
var fileTypes = Object.assign({
  html:  "text/html;charset=utf-8",
  js:    "text/javascript",
  css:   "text/css",
  json:  "application/json"
}, textMIME, imageMIME)
delete imageMIME.ico

http.createServer(function (request, response) {

  var requestURL = url.parse(request.url)
  var pathname = "." + requestURL.pathname.replace(/"/g, "")

    console.log(new Date().toLocaleString() + "  "
      + request.method + ": " + request.url + " -> " + pathname)

    fs.stat(pathname, function (err, stats) {
      if(err)
      {
        if(err.code == "ENOENT")
        {
          response.writeHead(
            404, {"Content-Type": fileTypes.txt}
          )
          response.end("404 Not Found")
        }
        else
        {
          response.writeHead(
            500, {"Content-Type": fileTypes.json}
          )
          response.end(JSON.stringify(err))
        }
        return
      }

      var lastModified = stats.mtime.toUTCString()
      var ims = request.headers["if-modified-since"]
      if(ims && new Date(lastModified) <= new Date(ims))
      {
        response.writeHead(304)
        return response.end()
      }

      if(stats.isDirectory())
      {
        var query = querystring.parse(requestURL.query)

        if(query.mode == "list")
        {
          return fs.readdir(pathname, function (err, files) {
            if(err)
            {
              response.writeHead(
                500, {"Content-Type": fileTypes.json}
              )
              return response.end(JSON.stringify(err))
            }
            if(pathname[pathname.length - 1] == "/")
              pathname = pathname.slice(0, -1)
            response.writeHead(200, {
              "Content-Type": fileTypes.json,
              "Cache-Control": "nocache",
              "Last-Modified": lastModified,
            })
            var result = {
              title: pathname.replace(/.*\//, ""),
                text: { }, image: [], link: [],
              }
            if(result.title == ".")
              result.title = "Home"
            files.forEach(function (file) {
              if(file[0] == ".")
                return
              if(fs.statSync(pathname + "/" + file).isDirectory())
                return result.link.push(file + "/")
              for(var type in textMIME)
              {
                var ext = RegExp("\\." + type + "$")
                var base = file.replace(ext, "")
                if(base && base != file)
                  result.text[base] = fs.readFileSync(
                    pathname + "/" + file
                  ).toString()
              }
              for(var type in imageMIME)
                if(RegExp("\\." + type + "$").exec(file))
                  result.image.push(file)
            })
            response.end(JSON.stringify(result))
          })
        }

        if(pathname[pathname.length - 1] != "/")
        {
          response.writeHead(302, {Location: pathname.slice(1) + "/"})
          return response.end()
        }

        response.writeHead(200, {
          "Content-Type": fileTypes.html,
          "Cache-Control": "nocache",
          "Last-Modified": lastModified,
        })
        return fs.createReadStream("index.html").pipe(response)
      }

      for(var type in fileTypes)
        if(RegExp("\\." + type + "$").exec(pathname))
        {
          response.writeHead(200, {
            "Content-Type": fileTypes[type],
            "Cache-Control": "nocache",
            "Last-Modified": lastModified,
          })
          return fs.createReadStream(pathname).pipe(response)
        }
    })

}).listen(8080)
