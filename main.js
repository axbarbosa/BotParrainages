var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const JSON = require("JSON");
const path = require("path");
const dotenv = require('dotenv').config( {
  path: path.join(__dirname, '.env')
} );
const tweet = require("./tweet").tweet;
const utils = require("./utils");
const fs = require("fs");
const cron = require('node-cron');

cron.schedule('* 16 * * 2,4', function() {
    console.log('=============================================');
    console.log('Il est 11h, c\'est l\'heure de la patéééééééé');
    let xmlHttpReq = new XMLHttpRequest();
    // Récupération des parrainages
    xmlHttpReq.open("GET", 'https://presidentielle2022.conseil-constitutionnel.fr/telechargement/parrainagestotal.json', false);
    xmlHttpReq.send(null);
    let parrainages = JSON.parse(xmlHttpReq.responseText.trim());
    let resultats = [];
    let updated = false;
    // Comptage des parrainages
    parrainages.forEach(function(item, index) {
      if(!updated && (new Date(item.DatePublication)).toDateString() == (new Date()).toDateString()) {
          updated = true;
      }
      let candidat = resultats.find(el => el.nom == item.Candidat);
      if (candidat) {
        candidat.nb = candidat.nb+1;
      } else {
        resultats.push({
          nom: item.Candidat,
          nb: 1,
        });
      }
    });
    if (updated) {
        updated = false;
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

        let oldResults = JSON.parse(fs.readFileSync("lastResults.txt", "utf8"));
        // Mise en forme des tweets (en faire plusieurs car limite 280 caractères)
        let tweets = ['Nouveau décompte du jour : \n'];
        let currentIndex = 0;
        resultats.forEach(function(item) {
            item.username = '';
            let tweetText = utils.processTweet(item, oldResults);
            if (!updated && !tweetText.includes('+0')) {
                updated = true;
            }
            if (currentIndex == 0 && tweets[currentIndex].length+tweetText.length > 250) {
              currentIndex++;
              tweets[currentIndex] = '';
          } else if (tweets[currentIndex].length+tweetText.length > 270) {
              currentIndex++;
              tweets[currentIndex] = '';
            }
            tweets[currentIndex] += tweetText;
        });
        if (updated) {
            let lastStatusId = undefined;
            let options = { status: tweets[0], in_reply_to_status_id: lastStatusId };
            let tweetsUpdate = utils.processCheckUpdate(resultats, oldResults);
            // Tweet
            tweet(options, 0, tweets);
            if (tweetsUpdate.length > 0) {
                let optionsUpdate = { status: tweetsUpdate[0], in_reply_to_status_id: lastStatusId };
                tweet(optionsUpdate, 0, tweetsUpdate);
            }
        }
        // console.log(tweets);
        // console.log(tweetsUpdate);
    }
});
