<!--------------------------------------------------------------------------------
-- File:          index.php
-- Authors:       Yvonne Jansen and Pierre Dragicevic <py@dataphys.org>
-- Description:   This file is part of Kid Namer. It provides the main loading page
                  and a very basic security measure. The variable php $valid_users
                  indicates an array of strings of acceptable login names. Only people
                  providing a correct name will be able to load the javascript files,
                  see the data and vote on names.
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

<?php 
$cookie_name = "names_user";
$valid_users = ["test", "test2"];
$cookie_value = "";
$cookie_present = FALSE;
$show_login = FALSE;
// The variable all_good below is used to keep track of whether a valid login was attempted.
// Only if a login is valid (and all_good is set to true), will the javascript be loaded.
// This is a (very low) security measure since the javascript indicates the list of valid logins.
// TODO: add more serious security
$all_good = FALSE;

// check if we already find a cookie and know a user
if(isset($_COOKIE[$cookie_name])) {
    $cookie_value = $_COOKIE[$cookie_name];
    if (in_array($cookie_value, $valid_users)){
      $cookie_present = TRUE;
      // set a hidden input field that contains the login name
      echo '<form><input id="login" type="hidden" name="login" value="' . $cookie_value . '"></form>';
      $all_good = TRUE;
    } else {
      $show_login = TRUE;
    }

} else if(!isset($_COOKIE[$cookie_name]) && isset($_POST['login']) && !empty($_POST['login'])) {
// there is no cookie yet, but a user has entered a login --> set a cookie
  
  if (in_array($_POST['login'], $valid_users)){
    setcookie($cookie_name, $_POST["login"], time() + (86400 * 30 * 12), "/"); // 86400 = 1 day
    $cookie_value = $_POST["login"];
    $cookie_present = TRUE;
    // set a hidden input field that contains the login name
    echo '<form><input id="login" type="hidden" name="login" value="' . $cookie_value . '"></form>';
    $all_good = TRUE;
  } else {
    $show_login = TRUE;
  }

} else {
  $show_login = TRUE;
}

// do we need to show a login dialog?
if ($show_login){
?>

<form id="login_form" action="index.php" method="post">
Login <input id="login" type="text" name="login" value ="<?php echo $cookie_value;?>">
<input type="submit" name="">
</form>
<?php
}
?>


<?php // only show the fields below if we have a cookie
if($cookie_present && $all_good) { 
  // load the javascript?>
  <script type="text/javascript" src="js/variables.js?<?php echo time();?>"></script>
  <script type="text/javascript" src="js/load.js?<?php echo time();?>"></script>
  <script type="text/javascript" src="js/write.js?<?php echo time();?>"></script>
  <script type="text/javascript" src="js/randomNames.js?<?php echo time();?>"></script>


<div class="spinner" id="spinner"><img src="loader.gif"/></div>

<div class="best"><span><span id="preferred_name_string"></span>: <b><span id="bestName"></span></b></span>
  <!--<span style="float:right"><input id="showAll" type="checkbox" onchange="changeShowAll();"/></span>-->
</div>
<hr/>
<form id="newname" onsubmit="addName()" autocomplete="off" action="javascript:void(0);">
  <input type="text" name="firstname" id="firstname" autocomplete="off"/>
  <input type="submit" id="addname" value="" onclick="document.activeElement.blur();"/>
</form>

<form id="result"></form>


<script type="text/javascript">
  if (document.getElementById("login").type == "hidden"){
    initialize();
  }
</script>
<?php }?>
</body>
</html>
