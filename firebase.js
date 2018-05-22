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

// function setdata() {
//   var z, i, elmnt, nextMatchElmnt, todaysMatchesElmnt;
//   /*loop through a collection of all HTML elements:*/
//   z = document.getElementsByTagName("*");
//   for (i = 0; i < z.length; i++) {
//     elmnt = z[i];
//     if (elmnt.getAttribute("sbk-next-match")) {
//       nextMatchElmnt = elmnt;
//     }
//     else if (elmnt.getAttribute("sbk-todays-matches")) {
//       todaysMatchesElmnt = elmnt;
//     }
//   }
//   getMatchInfo(nextMatchElmnt, todaysMatchesElmnt);
// }

function getMatchInfo() {
  firebase.database().ref('/primary/' + year + '/matches').on('value', function(snapshot) {
    var matches = [];
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
  
    snapshot.forEach(function(match) {
      var addMatch = false;
      var _class = null;
      var team1 = null;
      var team2 = null;
      var startTime = null;
      var place = null;
      var hasScore = false;
      var score1 = 0;
      var score2 = 0;
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
        else if (child.key == 'score1') {
          score1 = child.val();
          hasScore = true;
        }
        else if (child.key == 'score2') {
          score2 = child.val();
          hasScore = true;
        }
      });
      if (addMatch) {
        matches.push({ place, _class, team1, team2, startTime, hasScore, score1, score2 });
      }
    });

    if (nextMatchElmnt) {
      nextMatchElmnt.innerHTML = '';
      matches.forEach(match => {
        var opponent = match.team1 == 'SBK' ? match.team2 : match.team1;
        var innerText =  '<div class="_class">' + match._class + '</div>' +
        '<div class="teams">' + match.team1 + ' - ' + match.team2 + '</div>' +
        '<div class="whenWhere"> kl ' + match.startTime + ' på ' + match.place + '</div>';
        var score = match.hasScore ? match.score1 + '-' + match.score2 : '&nbsp; &nbsp; &nbsp; &nbsp;';
        var text = 
          '<div class="nextMatch">'+
          '<table>'+
            '<tr>'+
              '<td>'+
                '<div class="nextMatchText" >'+innerText+'</div>'+
              '</td>'+
              '<td style="vertical-align: middle">'+
                '<div class="nextMatchScore">'+score+'</div>'+
              '</td>'+
            '</tr>'+
          '</table>'+
        '</div>';

        nextMatchElmnt.innerHTML += text;
      });
    }
    if (todaysMatchesElmnt) {
      todaysMatchesElmnt.innerHTML = '';
      var text = '';
      matches.forEach(function(match) {
        text += match._class + ' mod ' + opponent + ' kl ' + match.startTime + ' (' + match.place + ')</br>';
      });
      todaysMatchesElmnt.innerHTML = text;
    }
  });
}

$(document).ready(function () {
  firebase.initializeApp(config);
  
  getMatchInfo();  
});
