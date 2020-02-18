<!--------------------------------------------------------------------------------
-- File:          top10.php
-- Authors:       Yvonne Jansen and Pierre Dragicevic <py@dataphys.org>
-- Description:   This file is part of Kid Namer. It generates a page showing the
                  top 10 names combined with a last name. The last name has to be 
                  set in the variable "lastName".
---------------------------------------------------------------------------------->
<!DOCTYPE html>
<html>

<head>
  <meta name="viewport" content="initial-scale=1.2, maximum-scale=1.2, minimum-scale=1.2, user-scalable=no, minimal-ui">
  <meta name="google" value="notranslate">
 <link rel="stylesheet" type="text/css" href="css/style.css">
  <link href='https://fonts.googleapis.com/css?family=Open+Sans:600,400' rel='stylesheet' type='text/css'>

</head>

<?php header("Cache-Control: max-age=1"); ?>
<body>






<script type="text/javascript">
 
showTop(10);

function showTop(nbest) {

  // Indicate the last name
  var lastName = "Doe";


  // Get login for dataset
  var xhttp = new XMLHttpRequest();

  var base_uri = location.href.replace('top10.php', '');
  var db_tb_ratings = "ratings"; 
  var uri = base_uri + "api.php/" + db_tb_ratings;




  xhttp.open("GET", uri, false);
  xhttp.send();
  json = xhttp.responseText;



  var ratings = JSON.parse(json).ratings;
  var name_index = ratings.columns.indexOf("name");

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

  // show top N names
  var bestN = [];
  for (var i = 0, len = Math.min(nbest, sorted_names_scores.length); i < len; i++) {
    bestN.push(sorted_names_scores[i].name);
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

  var root = document.getElementsByTagName("BODY")[0];
  var rank = 1;
  var lastScore = 0;
  var newScore;
  for (var i = 0; i < bestN.length; i++){
    newScore = sorted_names_scores[i].score;
    if (newScore < lastScore) {
      rank = (i+1);
    }
    lastScore = newScore;
     var p = document.createElement("p");
     p.innerHTML = rank + " - " + bestN[i] + " " + lastName;
     p.style.fontWeight="bold";
     root.appendChild(p);
  }

}

function simplifyName(name) {
  return removeAccents(name).toLowerCase().trim();
}

</script>
</body>
</html>
