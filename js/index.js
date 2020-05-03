function getData() {
  var request = new XMLHttpRequest()

  request.open('GET', 'https://script.google.com/macros/s/AKfycbzQv0lNf7YmGithwv_nVeK9EwODvXyjaZTth6iw5mpC-vqvR94E/exec', true)
  request.onload = function() {
    // Begin accessing JSON data here
    var data = JSON.parse(this.response)

    if (request.status >= 200 && request.status < 400) {
      var stats = document.getElementById("stats");
      var spotify_stats = document.getElementById("spotify_stats");
      var icon_spotify = document.getElementById("spotify_link");
      var icon_playing = document.getElementById("icon_playing");
      icon_spotify.setAttribute("href", data.link);
      if (data.playing) {
        icon_playing.setAttribute("src", "icons/pause.svg");
      } else {
        icon_playing.setAttribute("src", "icons/play.svg");
      }
      spotify_stats.innerHTML += data.track + " - " + data.artist;
      stats.style.display = "block";
      console.log(data);
    } else {
      console.log('error')
    }
  }
  request.send()
}

/*function openNav() {
  document.getElementById("menu").style.width = "20%";
  document.getElementById("about").style.display = "block";
  document.getElementById("calendar").style.display = "block";
  document.getElementById("stats").style.width = "15%";
  document.getElementById("main").style.left = "20%";
  document.getElementById("education").style.left = "500px";
  document.getElementById("livevent").style.left = "1200px";
  document.getElementById("htb").style.left = "500px";
  document.getElementById("coffeer").style.left = "1200px";
  document.getElementById("footer").style.left = "20%";
  document.getElementById("openbtn").style.display = "none";
  document.getElementById("closebtn").style.display = "block";
}

function closeNav() {
  document.getElementById("menu").style.width = "0%";
  document.getElementById("about").style.display = "none";
  document.getElementById("calendar").style.display = "none";
  document.getElementById("stats").style.width = "0%";
  document.getElementById("main").style.left = "0%";
  document.getElementById("education").style.left = "100px";
  document.getElementById("livevent").style.left = "800px";
  document.getElementById("htb").style.left = "100px";
  document.getElementById("coffeer").style.left = "800px";
  document.getElementById("footer").style.left = "0px";
  document.getElementById("openbtn").style.display = "block";
  document.getElementById("closebtn").style.display = "none";
}

var openbtn = document.getElementById("openbtn");
openbtn.addEventListener("click", openNav);
var closebtn = document.getElementById("closebtn");
closebtn.addEventListener("click", closeNav);*/


getData();
