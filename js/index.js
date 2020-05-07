function getSpotifyData() {
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

function getCoffeerData() {
  var request = new XMLHttpRequest()

  request.open('GET', 'https://script.google.com/macros/s/AKfycbyLKXEwkTW8uUQMVrdf1hpBszzn-KYhwU5CMolZSYHn8JtTvFOP/exec', true)
  request.onload = function() {
    // Begin accessing JSON data here
    var data = JSON.parse(this.response)

    if (request.status >= 200 && request.status < 400) {
      var stats = document.getElementById("stats");
      var coffee_stats = document.getElementById("coffee_stats");
      var beer_stats = document.getElementById("beer_stats");
      coffee_stats.innerHTML = coffee_stats.innerHTML.replace("#", data.coffees);
      beer_stats.innerHTML = beer_stats.innerHTML.replace("#", data.beers);
      stats.style.display = "block";
      console.log(data);
    } else {
      console.log('error')
    }
  }
  request.send()
}

getSpotifyData();
getCoffeerData();
