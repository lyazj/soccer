"use strict"

function loadResource() {
  var xhr = new XMLHttpRequest()
  xhr.open("get", "?mode=list", "true")
  xhr.send()
  xhr.onload = function () {
    if(this.status == 200)
    {
      var resource = JSON.parse(this.responseText)
      document.title = document.getElementsByTagName("h1")[0].innerHTML =
        resource.title
      loadText(resource.text)
      console.log(resource.image)
      if(resource.image.length)
        resource.image.forEach(function (image) {
          loadImage(image)
        })
      else
        imageContainer.innerHTML += "(empty)"
      loadLink("/", "Home")
      resource.link.forEach(function (link) {
        loadLink(link)
      })
    }
  }
}

function addText(elem, text) {
  elem.innerHTML += text.replace(/ /g, "&nbsp;").replace(/\n/g, "<br>")
}

function loadText(text) {
  for(var title in text)
  {
    var h2 = document.createElement("h2")
    h2.innerHTML = title
    textContainer.appendChild(h2)
    addText(textContainer, text[title])
  }
}

function loadImage(image) {
  var h3 = document.createElement("h3")
  var title = image
  var dotIndex = title.lastIndexOf(".")
  if(dotIndex > -1)
    title = title.slice(0, dotIndex)
  h3.innerHTML = title
  imageContainer.appendChild(h3)

  var img = document.createElement("img")
  img.name = title
  img.className = "list"
  img.alt = "Failed loading image " + image + "."
  img.src = image
  imageContainer.appendChild(img)
}

function loadLink(link, text) {
  if(!text)
  {
    text = link
    if(text[text.length - 1] == "/")
      text = text.slice(0, -1)
  }
  var a = document.createElement("a")
  a.href = link
  a.innerHTML = text
  linkContainer.appendChild(a)
  a.innerHTML += "<br>"
}
