/*********************************************************************************
/* File:          write.js
/* Authors:       Yvonne Jansen and Pierre Dragicevic <py@dataphys.org>
/* Description:   This file is part of Kid Namer. It deals with all writing
                  to the database.
*********************************************************************************/


// Show a spinner while writing is going on
function startWait() {
  wait_counter++;
  document.getElementById("spinner").style.visibility='visible'
}

// Stop the spinner
function stopWait() {
  wait_counter--;
  if (wait_counter == 0) {
    document.getElementById("spinner").style.visibility='hidden'
  }
}


// Write a new value for avote by login for a name already in the database
function updateDB(login, name, value) {
  startWait();
  try {
  	var xhttp = new XMLHttpRequest();
  	var ascii_name = removeAccents(name);
  	console.log("user " + login + " " + " is editing name " + ascii_name + " to new value " + value + " with URI " + db_uri + '/' + ascii_name);
  	// ascii_name.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  	xhttp.open("PUT", db_uri + '/' + ascii_name, true);
  	xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  	xhttp.send('{"name": "' + name + '", "rating_' + login + '": ' + value + '}');
  } catch (error) {
    stopWait();
    window.alert(error.message);
  }
  xhttp.onreadystatechange = function() {//Call a function when the state changes.
      if(xhttp.readyState == XMLHttpRequest.DONE && xhttp.status == 200) {
          console.log("done editing.");
          stopWait();
      } else if (xhttp.status >= 400) {
          stopWait();
          window.alert(xhttp.status + " Error.");
      }
  }
}

// utility function
function removeAccents(str) {
  var accents    = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
  var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
  str = str.split('');
  var strLen = str.length;
  var i, x;
  for (i = 0; i < strLen; i++) {
    if ((x = accents.indexOf(str[i])) != -1) {
      str[i] = accentsOut[x];
    }
  }
  return str.join('');
}

// Adds a new name to the database if it doesn't exist there yet. By default, both
// votes are set to 21 such that new names always show up at the top.
function addName(){
	var nameInput = document.getElementById("firstname");
  var newName = nameInput.value;

  // Copy name in clipboard   
  nameInput.select();
  document.execCommand("Copy");
  // Delete field
  nameInput.value = "";
  document.getElementById("addname").value = suggestion_string;
  // Remove focus
  document.activeElement.blur();

  if (allNames.includes(simplifyName(newName))) {

    // -- Scroll to name
    scrollTo(newName);

  } else {
    var rank = 0;
    if (newName.length == 0) {

      // -- Add random name
      newName = getRandomName();
      // check if string contains numbers (rank) and if so, extract it and use the number as rank.
      if (hasNumber(newName)){
        rank = newName.match(/\d+/g);
        newName = newName.replace(rank, "");
        rank = rank.map(Number);
      }
    } 
    if (newName.length != 0){
      // -- Add name to database
      startWait();
    	var xhttp = new XMLHttpRequest();
    	xhttp.open("POST", db_uri, true);
    	xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    	xhttp.send('{"name": "' + newName + '", "rating_a": 21, "rating_b": 21, "rank": ' + rank + '}');
    	xhttp.onreadystatechange = function() {//Call a function when the state changes.
        	if(xhttp.readyState == XMLHttpRequest.DONE && xhttp.status == 200) {
            	addNameUI(newName, rank, 21);
              reorder();
              stopWait();
          }
      }
    }

  }

  // utility function that tests if a name ends in a number
  function hasNumber(myString) {
    return /\d/.test(myString);
  }
}