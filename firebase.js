var config = {
  apiKey: "AIzaSyCnxIMRiaLlmFpKsHC6W1ttdF9U0SccyGQ",
  authDomain: "sbk-vildbjerg.firebaseapp.com",
  databaseURL: "https://sbk-vildbjerg.firebaseio.com",
  projectId: "sbk-vildbjerg",
  storageBucket: "sbk-vildbjerg.appspot.com",
  messagingSenderId: "575906605246"
};

var timeNow = new Date();
var timeNow_month = '' + (timeNow.getMonth() + 1),
  timeNow_day = '' + timeNow.getDate(),
  timeNow_year = timeNow.getFullYear();
if (timeNow_month.length < 2) timeNow_month = '0' + timeNow_month;
if (timeNow_day.length < 2) timeNow_day = '0' + timeNow_day;
var year = timeNow_year;
var todayString = timeNow_year+'-'+timeNow_month+'-'+timeNow_day;
var nextMatchElmnt, todaysMatchesElmnt, allMatchesElmnt, adminElmnt;

function findElements() {
  var z, i, elmnt;
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
    else if (elmnt.getAttribute("sbk-admin")) {
      adminElmnt = elmnt;
    }
  }
}

function watchMatchInfo() {
  firebase.database().ref('/primary/' + year + '/matches').on('value', function(snapshot) {
    var matches = [];
    var todaysMatches = [];
    snapshot.forEach(function(match) {
      var isTodaysMatch = false;
      var _class = null;
      var date = null;
      var team1 = null;
      var team2 = null;
      var startTime = null;
      var place = null;
      var hasScore = false;
      var score1 = 0;
      var score2 = 0;
      var finalized = false;
      var pieces = match.ref_.path.pieces_;
      var id = pieces[pieces.length-1];
      match.forEach(function(child) {
        if (child.key == 'date') {
          date = child.val();
          if (date == todayString) {
            isTodaysMatch = true; 
          }
        }
        else if (child.key == 'finalized') {
          finalized = child.val();
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
      var startDate = null;
      var startDateDelayed = null;
      var endDateDelayed = null;
      if (date && startTime) {
        var dateSplit = date.split('-').map(function(v) { return v|0});
        var timeSplit = startTime.split(':').map(function(v) { return v|0});
        startDate = new Date(dateSplit[0],dateSplit[1]-1,dateSplit[2],timeSplit[0],timeSplit[1],0);
        startDateDelayed = new Date(dateSplit[0],dateSplit[1]-1,dateSplit[2],timeSplit[0],timeSplit[1]-10,0);
        endDateDelayed = new Date(dateSplit[0],dateSplit[1]-1,dateSplit[2],timeSplit[0],timeSplit[1]+60,0);
      }
      var matchData = { id, date, place, _class, team1, team2, startTime, hasScore, 
        score1, score2, startDate, startDateDelayed, endDateDelayed, finalized };
      matches.push(matchData);
      if (isTodaysMatch) {
        todaysMatches.push(matchData);
      }
    });

    if (nextMatchElmnt) {
      var text = '';
      todaysMatches.forEach(function(match) {
        var isOngoing = match.startDateDelayed <= timeNow && match.endDateDelayed >= timeNow;
        if (isOngoing) {
          var innerText =  '<div class="_class">' + match._class + '</div>' +
          '<div class="teams">' + match.team1 + ' - ' + match.team2 + '</div>' +
          '<div class="whenWhere"> kl ' + match.startTime + ' på bane ' + match.place + '</div>';
          var score = match.hasScore || match.finalized ? match.score1 + '&nbsp;-&nbsp;' + match.score2 : '&nbsp; &nbsp; &nbsp; &nbsp;';
          text += 
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
        }
      });
      nextMatchElmnt.innerHTML = '';
      nextMatchElmnt.innerHTML = text.length == 0 ? 'Der er ingen kampe i dag' : text;
    }

    if (todaysMatchesElmnt) {
      var text = '';
      todaysMatches.forEach(function(match) {
        var opponent = match.team1 == 'SBK' ? match.team2 : match.team1;
        var isOngoing = match.startDateDelayed <= timeNow;
        if (!isOngoing) {
          text += '<a href="kampe.html#'+match.id+'">'+ match._class + ' <i>mod</i> ' + opponent + ' kl ' + match.startTime + ' (bane ' + match.place + ')</a></br>';
        }
      });

      todaysMatchesElmnt.innerHTML = '';
      todaysMatchesElmnt.innerHTML = text.length > 0 ? '<div class="matchesHeader">Resten af dagens kampe</div>' + text : '';
    }

    if (allMatchesElmnt || adminElmnt) {
      if (adminElmnt)
        adminElmnt.innerHTML = '';
      else
        allMatchesElmnt.innerHTML = '';

      // get datest
      var allDates = [];
      matches.forEach(function (match) {
        if (allDates.indexOf(match.date) == -1) {
          allDates.push(match.date);
        }
      });
      allDates.sort();

      var text = '';
      allDates.forEach(function(date) {
        text += '<tr><td colspan="2"><h2>'+date+'</h2></td></tr>';
        var matchText = "";
        var matchesToShow = [];
        matches.forEach(function(match) {
          if (match.date == date) {
            matchesToShow.push(match);
          }
        });
        matchesToShow.sort(function(a, b){
          return (a.startDate < b.startDate ? -1 : (a.startDate > b.startDate ? 1 : 0));
        });
        matchesToShow.forEach(function(match) {
          var first = '<td><a name="'+match.id+'" id="'+match.id+'">' + match.startTime +'&nbsp;&nbsp; <strong>' + match._class + '</strong></a>, ' + 
          match.team1 +' <i>mod</i> ' + match.team2 + ' (bane ' + match.place + ')</td>';

          var second = '';
          var third = '';
          var isOngoing = match.startDateDelayed <= timeNow;

          if ((isOngoing && !match.finalized) || adminElmnt) {
            second = '<td></td>';
            if (adminElmnt) {
              third = '<td colspan="2" style="text-align:right"><button onClick="reportScore('+match.id+','+match.score1+'+1,'+match.score2+')">'+match.team1+' '+match.score1+'</button> &nbsp; <button onClick="reportScore('+match.id+','+match.score1+'-1,'+match.score2+')">-</button> &nbsp; <button onClick="reportScore('+match.id+','+match.score1+','+match.score2+'+1)">'+match.team2+' '+match.score2+'</button> &nbsp; <button onClick="reportScore('+match.id+','+match.score1+','+match.score2+'-1)">-</button> &nbsp; <button onClick="finalizeScore('+match.id+', true)">Fin</button> &nbsp; <button onClick="finalizeScore('+match.id+', false)">Act</button></td>';
            }
            else {
              third = '<td colspan="2" style="text-align:right"><button onClick="reportScore('+match.id+','+match.score1+'+1,'+match.score2+')">'+match.team1+' '+match.score1+'</button> &nbsp; <button onClick="reportScore('+match.id+','+match.score1+','+match.score2+'+1)">'+match.team2+' '+match.score2+'</button></td>';
            }
          }
          else if (match.hasScore || match.finalized) {
            second = '<td style="text-align:right"><div class="score"><span style="white-space: nowrap;">'+match.score1+'&nbsp;-&nbsp;'+match.score2+'</span></div></td>';
          }
          else {
            second = '<td></td>';
          }

          if (third != '') {
            matchText += '<tr class="oneMatch-nodots">'+first+second+'</tr>';
            matchText += '<tr class="oneMatch">'+third+'</tr>';
          }
          else {
            matchText += '<tr class="oneMatch">'+first+second+'</tr>';
          }
        });
        text += matchText;
      })
      text = text.length == 0 ? '<p>Der er ikke registreret nogen kampe endnu' : '<table>' + text + '</table>';

      if (adminElmnt)
        adminElmnt.innerHTML = text;
      else
        allMatchesElmnt.innerHTML = text;
    }
  });
}

function reportScore(id, score1, score2) {
  var result = confirm('Kampens stilling er nu: '+score1+' - '+score2+'. Er det korrekt?');
  if (result) {
    if (score1 == 0 && score2 == 0) {
      score1 = null;
      score2 = null;
    }
    firebase.database().ref('/primary/' + year + '/matches/' + id).update({
      score1: score1,
      score2: score2
    });
  }
}

function finalizeScore(id, final) {
  if (final) {
    var result = confirm('Kampen vil blive finalized. Er det korrekt?');
    if (result) {
      firebase.database().ref('/primary/' + year + '/matches/' + id).update({
        finalized: true
      });
    }
  }
  else {
    var result = confirm('Kampen vil blive activated. Er det korrekt?');
    if (result) {
      firebase.database().ref('/primary/' + year + '/matches/' + id).update({
        finalized: false
      });
    }
  }
}

$(document).ready(function () {
  firebase.initializeApp(config);

  findElements();
  watchMatchInfo();  
});
