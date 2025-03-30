# Kid Namer

Authors:
* Yvonne Jansen
* Pierre Dragicevic

License: GNU GPL v3.0

# Description

**Kid Namer** helps two people find kid names they both like by independently rating name suggestions over time. Each person can access Kid Namer on their phone or computer whenever they want to suggest new names or rate randomly selected ones from a corpus.

For example, each person might rate about ten names per day over several weeks or months. Whenever one of them opens Kid Namer, they'll see the names the other person has rated and be prompted to rate them too—without seeing each other's ratings. They also won’t know whether a name was manually added by their partner or randomly selected.

This anonymity ensures unbiased ratings and prevents situations where both like a name but assume the other doesn’t, so they never bring it up. Of course, the two can discuss criteria anytime. Ratings can be changed at any moment, allowing for flexibility and reconsideration.

Kid Namer is a web app that works on any platform and does not require to install anything on the client devices, once the server has been set up (see below). However, setting up and configuring the server currently requires good computer knowledge. Hopefully it won't be the case in future versions.

# User interface

*TODO: add screenshots.*

The basic idea of this app is to enable two people to vote independently and secretly on different name suggestions. Both can suggest new names, either by entering a name manually in the text field or by clicking the button. If you type a name that already exists, the page will scroll to that name to show you its rating. 

Names are scored on a scale between 0 and 20, and sorted from highest to lowest score. Newly added names are assigned a temporary score of 21 such that they always appear at the very top. Scores are entered using a slider control. For names on which one has not yet voted, the slider is not shown but it is nonetheless possible to click or tap anywhere in the corresponding area to quickly set a value. 

Clicking on a name opens a new tab loading background information on that name from the page [behindthename.com](behindthename.com). This shows, among other things, how popular a name is in different countries.

The system maintains an overall score for every name based on the average rating across the two people. If a name is among the top five among those already rated, it will be displayed in bold. In addition, the currently preferred name is shown at the top of the page. Multiple names will be displayed in case of ties. 

# Setup

## Requirements

* PHP server
* SQL server

## Installation

This software is ready to run after setting a few basic parameters and assuming that the necessary database and the two tables have been set up.

**In its current version, there is no security to protect the server and
especially its database against malicious attacks and data loss. 
This is for a large part due to the use of a REST API to interact with the database.
A future revision could instead send the changed data to the server who
would then be the only one to access the database server-side.**

To avoid data loss, do regular database dumps. You don't want to lose weeks worth of name ratings!

### Database setup

Edit the file `credentials.php` such that the variables indicate valid values for the database name, a username and a password with read and write access to the database indicated.

You will need two tables in your database.

**A table named `name_table`** which contains a corpus of candidate names with a weight and a rank:
1. name (type varchar)
1. weight (type float)
1. rank (type int)

The weight indicates the probability that the name will be suggested when clicking on `Get a suggestion`. All weights in the table **must sum up to 1**. You can derive weights the way you wish. In the provided example csv, weights are a function of the name's length (with a preference for short names) and the number of people who were given the name in the past few years (with a preference for popular names). Even if you are not seeking a popular name, it may make sense to give higher weight to popular names so that they are rated first. The rank column indicates the ranking of each name in terms of popularity, i.e., 1 is the most common name, 2 is the second most common name, etc. This value is just displayed in the user interface to provide guidance, and is not used in any calculation.

The table `name_table` can be omitted if the booleans `use_ranks` and `use_randomNames` defined in `variables.js` are set to `false`. However, the system is more useful if the table exists. If no data for ranks or weights are available, then a table just containing names works too if the weight and rank columns have all values set to 1.

The `name_table` can be created by importing the csv holding the desired data. A csv file is provided as an example.

**A table named `ratings`** to hold the ratings that the two persons give to different names. This table needs to have four columns:
1. name
1. rank
1. rating_a
1. rating_b

The following SQL instructions can be used to create the required table for the `ratings`
```SQL
-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 16, 2020 at 06:52 PM
-- Server version: 5.7.26
-- PHP Version: 7.3.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `names`
--

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `name` varchar(20) NOT NULL,
  `rank` int(11) NOT NULL,
  `rating_a` int(11) NOT NULL,
  `rating_b` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD UNIQUE KEY `name` (`name`);
```

You can check whether your database is set up correctly by going to the url `your_url.com/api.php/ratings`. You should see the following JSON code:
`{"ratings":{"columns":["name","rank","rating_a","rating_b"],"records":[]}}`

### PHP setup

The file `index.php` defines an array variable `$valid_users` which needs to be edited. In the current version only two people can vote, thus this array should only hold two strings.

### Javascript setup

All variables that may be edited are grouped together in the file `variables.js`. The strings at the top group all strings used in the app. 

The variable `login_options` keeps an array of valid user names. These HAVE to be the same as those indicated in the PHP variable `$valid_users`.
