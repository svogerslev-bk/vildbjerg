var config = {
  apiKey: "AIzaSyCnxIMRiaLlmFpKsHC6W1ttdF9U0SccyGQ",
  authDomain: "sbk-vildbjerg.firebaseapp.com",
  databaseURL: "https://sbk-vildbjerg.firebaseio.com",
  projectId: "sbk-vildbjerg",
  storageBucket: "sbk-vildbjerg.appspot.com",
  messagingSenderId: "575906605246"
};

var year = 2008;
var today = '2018-08-03'

function setdata() {
  var z, i, elmnt, nextMatchElmnt, todaysMatchesElmnt;
  /*loop through a collection of all HTML elements:*/
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    if (elmnt.getAttribute("sbk-next-match")) {
      nextMatchElmnt = elmnt;
    }
    else if (elmnt.getAttribute("sbk-todays-matches")) {
      todaysMatchesElmnt = elmnt;
    }
  }
  getMatchInfo(nextMatchElmnt, todaysMatchesElmnt);
}

function getMatchInfo(nextMatchElmnt, todaysMatchesElmnt) {
  var result = "";  
  var matches = [];
  firebase.database().ref('/primary/' + year + '/matches').once('value').then(function(snapshot) {
    snapshot.forEach(function(match) {
      var addMatch = false;
      var _class = null;
      var team1 = null;
      var team2 = null;
      var startTime = null;
      var place = null;
      match.forEach(function(child) {
        if (child.key == 'date' && child.val() == today) {
          addMatch = true;
        }
        else if (child.key == 'start-time') {
          startTime = child.val();
        }
        else if (child.key == 'team1') {
          team1 = child.val();
        }
        else if (child.key == 'team2') {
          team2 = child.val();
        }
        else if (child.key == 'place') {
          place = child.val();
        }
        else if (child.key == 'class') {
          _class = child.val();
        }
      });
      if (addMatch) {
        matches.push({ place, _class, team1, team2, startTime });
      }
    });

    if (nextMatchElmnt) {
      if (matches.length > 0) {
        var match = matches[0];
        var opponent = match.team1 == 'SBK' ? match.team2 : match.team1;
        nextMatchElmnt.innerHTML = 'Næste kamp er ' + match._class + '<br/>' +
          match.team1 + ' - ' + match.team2 + '<br/>' +
           ' kl ' + match.startTime + ' på ' + match.place;
      }
    }
    if (todaysMatchesElmnt) {
      var result = '';
      matches.forEach(function(match) {
        result += match._class + ' mod ' + opponent + ' kl ' + match.startTime + ' (' + match.place + ')</br>';
      });
      todaysMatchesElmnt.innerHTML = result;
    }
  });
}

function todayRemainingMatches() {

}


$(document).ready(function () {
  firebase.initializeApp(config);
  
  setdata();  
});
