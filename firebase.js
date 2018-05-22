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
    var todayMatches = [];
    var z, i, elmnt, nextMatchElmnt, allMatchesElmnt, todaysMatchesElmnt;
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
      else if (elmnt.getAttribute("sbk-all-matches")) {
        allMatchesElmnt = elmnt;
      }
    }
  
    snapshot.forEach(function(match) {
      var isTodayMatch = false;
      var _class = null;
      var date = null;
      var team1 = null;
      var team2 = null;
      var startTime = null;
      var place = null;
      var hasScore = false;
      var score1 = 0;
      var score2 = 0;
      var pieces = match.ref_.path.pieces_;
      var id = pieces[pieces.length-1];
      match.forEach(function(child) {
        if (child.key == 'date') {
          date = child.val();
          if (date == today) {
            isTodayMatch = true; 
          }
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
      var matchData = { id, date, place, _class, team1, team2, startTime, hasScore, score1, score2 };
      matches.push(matchData);
      if (isTodayMatch) {
        todayMatches.push(matchData);
      }
    });

    if (nextMatchElmnt) {
      nextMatchElmnt.innerHTML = '';
      todayMatches.forEach(match => {
        var opponent = match.team1 == 'SBK' ? match.team2 : match.team1;
        var innerText =  '<div class="_class">' + match._class + '</div>' +
        '<div class="teams">' + match.team1 + ' - ' + match.team2 + '</div>' +
        '<div class="whenWhere"> kl ' + match.startTime + ' på ' + match.place + '</div>';
        var score = match.hasScore ? match.score1 + '-' + match.score2 : '&nbsp; &nbsp; &nbsp; &nbsp;';
        var text = 
          '<a class="nextMatchLink" href="kampe.html#' + match.id + '"><div class="nextMatch">'+
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
        '</div></a>';

        nextMatchElmnt.innerHTML += text;
      });
    }

    if (todaysMatchesElmnt) {
      todaysMatchesElmnt.innerHTML = '';
      var text = '';
      todayMatches.forEach(function(match) {
        var opponent = match.team1 == 'SBK' ? match.team2 : match.team1;
        text += '<a href="kampe.html#'+match.id+'">'+ match._class + ' mod ' + opponent + ' kl ' + match.startTime + ' (' + match.place + ')</a></br>';
      });
      todaysMatchesElmnt.innerHTML = text;
    }

    if (allMatchesElmnt) {
      allMatchesElmnt.innerHTML = '';
      // get datest
      var allDates = [];
      matches.forEach(match => {
        if (allDates.indexOf(match.date) == -1) {
          allDates.push(match.date);
        }
      });
      allDates.sort();

      var text = "";
      allDates.forEach(date => {
        text += '<h2>'+date+'</h2>';
        var matchText = "";
        matches.forEach(function(match) {
          if (match.date == date) {
            matchText += '<div class="reportMatch"><button>Indraporter scoring</button> &nbsp;' + match._class + ', ' + match.team1 +' mod ' + match.team2 + ' kl ' + match.startTime + ' (' + match.place + ')</div>';
          }
        });
        text += matchText;
      })
      allMatchesElmnt.innerHTML = text;
    }
  });
}

$(document).ready(function () {
  firebase.initializeApp(config);
  
  getMatchInfo();  
});
