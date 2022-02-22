var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const JSON = require("JSON");
const path = require("path");
const dotenv = require('dotenv').config( {
  path: path.join(__dirname, '.env')
} );
const tweet = require("./tweet").tweet;

let xmlHttpReq = new XMLHttpRequest();
// Récupération des parrainages
xmlHttpReq.open("GET", 'https://presidentielle2022.conseil-constitutionnel.fr/telechargement/parrainagestotal.json', false);
xmlHttpReq.send(null);
let parrainages = JSON.parse(xmlHttpReq.responseText.trim());
let resultats = [];
// Comptage des parrainages
parrainages.forEach(function(item, index) {
  let candidat = resultats.find(el => el.nom == item.Candidat);
  if (candidat) {
    candidat.nb = candidat.nb+1;
  } else {
    resultats.push({
      nom: item.Candidat,
      nb: 1
    });
  }
});
// Tri selon le nombre de parrainages
resultats.sort(function(a, b) {
    if (a.nb < b.nb) {
      return 1;
    }
    if (a.nb > b.nb) {
      return -1;
    }
    return 0;
});

// Mise en forme des tweets (en faire plusieurs car limite 280 caractères)
let tweets = ['Nouveau décompte du jour : \n'];
let currentIndex = 0;
resultats.forEach(function(item, index) {
  let emoji = '';
  if (item.nb >= 500) {
    emoji = '✅';
  } else {
    emoji = '❌';
  }
  if (currentIndex == 0 && tweets[currentIndex].length+item.nom.length > 240) {
    currentIndex++;
    tweets[currentIndex] = '';
} else if (tweets[currentIndex].length+item.nom.length > 260) {
    currentIndex++;
    tweets[currentIndex] = '';
  }
  tweets[currentIndex] += emoji + ' ' + item.nom + ' : ' + item.nb + '\n';
});
currentIndex = 0;
let lastStatusId = undefined;
let options = { status: tweets[currentIndex], in_reply_to_status_id: lastStatusId };
// Tweet
tweet(options, currentIndex, tweets);
