const fs = require("fs");

module.exports.processTweet = function processTweet(item, oldResults) {
    let ancienCandidat = oldResults.find(candidat => candidat.nom === item.nom);
    return ((item.nb >= 500) ? '✅ ' : '❌ ') + (ancienCandidat && ancienCandidat.username !== '' ? ancienCandidat.username : item.nom)
    + ' : ' + item.nb + augmentation(item, ancienCandidat) + '\n';
}

function augmentation(item, ancienCandidat) {
    return ' (+' + (item.nb - (ancienCandidat ? ancienCandidat.nb : item.nb)).toString() + ')';
}

module.exports.processCheckUpdate = function processCheckUpdate(newResults, oldResults) {
    let update = false;
    let tweetsUpdate = [];
    let currentIndex = 0;
    newResults.forEach(function(result) {
        let ancienCandidat = oldResults.find(candidat => candidat.nom === result.nom);
        if (ancienCandidat) {
            result.username = ancienCandidat.username;
            if (ancienCandidat.nb !== result.nb) {
                update = true;
                if (result.nb > 500 && ancienCandidat.nb <= 500) {
                    tweetsUpdate[currentIndex] = 'Suite à la mise à jour du fichier des parrainages par @Conseil_constit\n'
                    + result.nom + (ancienCandidat && ancienCandidat.username !== '' ? (' (' + ancienCandidat.username + ')') : '')
                    + ' a atteint la barre des 500 parrainages, c\'est désormais un.e candidat.e officiel.le à la présidentielle !\n';
                    currentIndex++;
                }
            }
        }
    });
    if (currentIndex > 0) {
        tweetsUpdate[currentIndex] = 'Sous réserve que les parrainages soient conformes et que la règle de répartition'
        + ' dans 30 départements ou collectivités d’outre-mer différents, sans que plus de 10% des parrainages ne proviennent'
        + ' d’un même département ou d\'une même collectivité.\nSource : https://t.co/N2x5pVR7O8';
    }
    fs.writeFile("lastResults.txt", JSON.stringify(newResults), (err) => {
        if (err) throw err;
    });
    if (update) {
        fs.writeFile("lastResults_"+ (new Date()).toDateString().replace(/\s/g,'_') +".txt", JSON.stringify(newResults), (err) => {
            if (err) throw err;
        });
    }
    return tweetsUpdate;
}
