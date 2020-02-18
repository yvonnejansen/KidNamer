/*********************************************************************************
/* File:          load.js
/* Authors:       Yvonne Jansen and Pierre Dragicevic <py@dataphys.org>
/* Description:   This file is part of Kid Namer. It loads a database table
                  containing the current set of ratings and displays them as a
                  list ordered by scores averaged across two votes.
*********************************************************************************/

var allNames = [];
var login;
var base_uri = location.href.replace('index.php', '');
var db_tb_ratings = "ratings"; 
var db_uri = base_uri + "api.php/" + db_tb_ratings;
var name_table;
var db_tb_name = "name_table";
var name_tb_uri = base_uri + "api.php/" + db_tb_name;
var wait_counter = 0;


console.log(base_uri);
function initialize() {

  startWait();

  // set the preferred name string
  document.getElementById("preferred_name_string").innerHTML = preferred_name_string;
  
  // set the button string
  document.getElementById("addname").value = suggestion_string

  // Change submit button depending on whether first name is empty or exists
  document.getElementById("firstname").oninput = function() {
    if (this.value.length == 0) {
      document.getElementById("addname").value = suggestion_string;
    } else {
      if (nameExists(this.value)) {
        document.getElementById("addname").value = scroll_string;
      } else {
        document.getElementById("addname").value = add_string;
      }
    }
  };

  // -------- Create list of names and rating sliders

  // Get login for dataset
  login = document.getElementById("login").value;
  if (login === login_options[0]) {
    login = "a";
  } else if (login === login_options[1]) {
    login = "b";
  } else {
    login = "error";
  }
  console.log("user " + login);
  if (login === "error"){

  }
  var xhttp = new XMLHttpRequest();

  uri = base_uri + "api.php/" + db_tb_ratings;
  xhttp.open("GET", uri);
  xhttp.send();
  console.log("status " + xhttp.status);
  xhttp.onloadend = function() {
    if(xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200)
    {    
      json = xhttp.responseText;
      if (json.length > 0) {
        var ratings = JSON.parse(json).ratings;
        var name_index = ratings.columns.indexOf("name");
        var rank_index = ratings.columns.indexOf("rank");
        var rating_index = ratings.columns.indexOf("rating_" + login);
       if (ratings.records.length > 0) {
          var out = document.getElementById("result");
          while (out.firstChild) {
            out.removeChild(out.firstChild);
          }
          allNames = []; 

          for (var i = 0, len = ratings.records.length; i < len; i++) {
            addNameUI(ratings.records[i][name_index], ratings.records[i][rank_index], ratings.records[i][rating_index], i);
          }

          if (allNames.length > 1) reorder();

          // -------- Update best names

          // compute average scores
          var rating_indices = [];
          for (var i = 0, len = ratings.columns.length; i < len; i++) {
            if (ratings.columns[i].includes("rating_")) {
              rating_indices.push(i);
            }
          }
          var n_ratings = rating_indices.length;
          var names_scores = [];
          for (var i = 0, len = ratings.records.length; i < len; i++) {
            var firstname = ratings.records[i][name_index];
            var sum = 0;
            for (var j = 0; j < n_ratings; j++) {
              rating = ratings.records[i][rating_indices[j]];
              if (rating == 21) rating = -100;
              sum += rating;
            }
            names_scores.push({name:firstname, score:sum});
          }

          // sort
          var sorted_names_scores = names_scores.sort(function (a, b) {
            if(a.score < b.score) {
              return 1;
            } else {
              return -1;
            }
          });

          // show top name
          var best_score = sorted_names_scores[0].score;
          var best_names = sorted_names_scores[0].name;
          // include ties
          for (var i = 1, len = sorted_names_scores.length; i < len; i++) {
            if (sorted_names_scores[i].score == best_score) {
              best_names += ", " + sorted_names_scores[i].name;
            } else {
              break;
            }
          }
          document.getElementById("bestName").innerHTML = best_names;
          if (allNames.length > nbest) {
            // show top N names
            var bestN = [];
            for (var i = 0, len = Math.min(nbest, sorted_names_scores.length); i < len; i++) {
              bestN.push(simplifyName(sorted_names_scores[i].name));
            }
            // include ties
            n_best_score = sorted_names_scores[nbest-1].score;
            for (var i = nbest, len = sorted_names_scores.length; i < len; i++) {
              if (sorted_names_scores[i].score == n_best_score) {
                bestN.push(sorted_names_scores[i].name);
              } else {
                break;
              }
            }
          
            divs = Array.from(out.childNodes);  
            for (var i = 0, len = divs.length; i < len; i++) {
              name = divs[i].getElementsByTagName('span')[1].innerHTML;
              if (bestN.includes(simplifyName(name))) {
                divs[i].getElementsByTagName('span')[1].style.fontWeight = 'bold';
              }
            }
          }
        }
      }
    }
    // load the list of weighted names to add randomly from our database
    if(use_randomNames) getListOfNames();

    stopWait();
  }
}

function simplifyName(name) {
  return removeAccents(name).toLowerCase().trim();
}

function nameExists(name) {
  return allNames.includes(simplifyName(name));
}

function addNameUI(name, rank, rating, otherrating, index = -1) {

  if (nameExists(name))
    return;

  if (index == -1) {
    index = allNames.length;
  }

  allNames.push(simplifyName(name));

  var div = document.createElement("div");
  div.className = "rating_group";
  div.entryIndex = index;

  var e_rank = document.createElement("span");
  e_rank.id = "rank" + index;
  e_rank.className = "rank";
  if (rank == 0) {
    e_rank.innerHTML = " ";
    e_rank.style.backgroundColor = "#eeeeee";
  } else {
    e_rank.innerHTML = rank;
    e_rank.style.backgroundColor = "#cccccc";
  }

  var label = document.createElement("span");
  label.id = "label" + index;
  label.innerHTML = name;
  label.onclick = function() {
    var win = window.open("https://www.behindthename.com/names/search.php?terms=" + this.innerHTML, '_blank');
    win.focus();
  }

  var score = document.createElement("span");
  score.id = "score" + index;
  score.className = "score";
  score.innerHTML = rating;

  var slider = document.createElement("input");
  slider.entryIndex = index;
  slider.id = "slider" + index;
  slider.type = "range";
  slider.min = 0;
  slider.max = 21;
  slider.step = 1;
  slider.firstname = name;
  slider.value = rating;

  var out = document.getElementById("result");
  out.appendChild(div);
  div.appendChild(e_rank);
  div.appendChild(label);
  div.appendChild(score);
  div.appendChild(slider);

  sliderChanged(slider);
  slider.oninput = function() {sliderChanged(this)};
  slider.onchange = function() {updateDB(login, this.firstname, this.value); reorder();};

}

function sliderChanged(slider) {
  if (slider.value < 21) {
    document.getElementById("score" + slider.entryIndex).style.borderStyle = "solid";
    document.getElementById("score" + slider.entryIndex).innerHTML = slider.value;
    slider.className = "set";
    document.getElementById("label" + slider.entryIndex).className = "name_label_set";
  } else {
    document.getElementById("score" + slider.entryIndex).style.borderStyle = "none";
    document.getElementById("score" + slider.entryIndex).innerHTML = "";
    slider.className = "unset";
    document.getElementById("label" + slider.entryIndex).className = "name_label_unset";
  }
}

function reorder() {
  var out = document.getElementById("result");
  if (out.childNodes.length > 1){
    divs = Array.from(out.childNodes);  

    sorted_divs = divs.sort(function (a, b) {
      var av = Number(a.getElementsByTagName('input')[0].value);
      var bv = Number(b.getElementsByTagName('input')[0].value);
      if(av < bv) {
        return 1;
      } else if (av > bv) {
        return -1;
      } else {
        if (a.entryIndex > b.entryIndex) {
          return 1;
        } else {
          return -1;
        }
      }
    });

    while (out.firstChild) {
      out.removeChild(out.firstChild);
    }

    for (var i = 0, len = sorted_divs.length; i < len; i++) {
      out.appendChild(divs[i]);
    }
  }
}

function scrollTo(name) {
  var index = allNames.indexOf(simplifyName(name));
  if (index == -1) return;
  var divs = Array.from(document.getElementById("result").childNodes);  
  for (var i = 0, len = divs.length; i < len; i++) {
    if (divs[i].entryIndex == index) {
      var id = setInterval(frame, 20);
      var t = 0;
      function frame() {
        if (t >= 1) {
          divs[i].style.boxShadow = "";
          divs[i].children[1].style.boxShadow = "";
          clearInterval(id);
          return;
        }
        opacity = Math.floor(256 * (1-t));
        divs[i].style.boxShadow = "inset 0px 0px 0px 24px #00ff00" + opacity.toString(16);
        divs[i].children[1].style.boxShadow = "inset 0px 0px 0px 24px #00dd00" + opacity.toString(16);
        t += 0.02;
      }
      document.activeElement.blur();
      divs[i].scrollIntoView();
      return;
    }
  }
}

// function changeShowAll() {
//   if (this.value) {
//     minAvg = 0;
//     initialize();
//   } else {
//     minAvg = 13;
//     initialize();
//   }
// }
