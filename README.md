# Kid Namer

Authors:
* Yvonne Jansen
* Pierre Dragicevic

License: GNU GPL v3.0

# Description

Kid Namer allows two people to find names they both like by independently and asynchronously rating name suggestions over a period of time. At any time, each of the two persons can open Kid Namer and suggest new names, or rate names chosen at random from a corpus. Each of the two persons could, for example, rate about ten names a day, over the course of a few weeks or months. Each time one of them opens Kid Namer, they will see the new names that the other person has rated and will be invited to rate them as well, though people don't see each other's ratings. They also do not know whether a name has been manually added by the other person or picked at random by the system. This secrecy is meant to allow independent rating, which for example can prevent situations where both people like a name but think the other person does not like it, and will thus never mention it. The two people are of course free to discuss at any time, especially about which criteria they think are important when choosing a name. Name ratings can be changed at any time, so people are free to change their minds.

Kid Namer is a web app that works on any platform and does not require to install anything, once the server has been set up (see below). However, **setting up and configuring this app currently requires solid computer knowledge**. Hopefully it won't be the case in the future.

# User interface

The basic idea of this app is to enable two people to vote independently and secretly on different name suggestions. Both can suggest new names, either by entering a name manually in the text field or by clicking the button. If a name already exists, the page will scroll to the location of the name. 

Names are scored on a scale between 0 and 20. Newly added names are assigned a score of 21 such that they always appear at the very top. Scores are entered using a slider control. For names on which one has not yet voted, the slider is not shown but it is nonetheless possible to click or tap anywhere in the corresponding area to quickly set a value. 

Clicking on a name opens a new tab loading background information on that name from the page [behindthename.com](behindthename.com).

The currently preferred name among those already voted on is shown at the top of the page. If multiple names have the same score, then they will all appear there.

# Setup

## Requirements

* PHP server
* SQL server

## Installation

This software is ready to run after setting a few basic parameters and assuming that the necessary database and the two tables have been set up.

```diff
- In its current version, there is no security to protect the server and
- especially its database against malicious attacks and data loss. 
- This is for a large part due to the use of a REST API to interact with the database.
- A future revision could instead send the changed data to the server who
- would then be the only one to access the database server-side.
```

### Database setup

Edit the file `credentials.php` such that the variables indicate valid values for the database name, a username and a password with read and write access to the database indicated.

You will need two tables in your database. 
1. A table named `ratings` to hold the ratings that you give to different names. This table needs to have four columns:
	1. name
	1. rank
	1. rating_a
	1. rating_b
1. A table named `name_table` which contains a list of names with a rank and a weight. The sum of the weights of all names should sum up to 1. Otherwise, the random choice of names based on weights won't work correctly. The higher the weight, the more likely a name will be suggested when using the `Get a suggestion` feature. This table can be omitted if the boolean `useRanks` defined in `variables.js` is set to `false`. However, the system is more useful if the table exists. If no data for ranks or weights are available, then a table just containing names works too if the weight and rank columns have all values set to 1. The table needs to have three columns:
	1. name
	1. weight
	1. rank

The `name_table` can be created by importing the csv holding the desired data. The following SQL instructions can be used to create the required table for the `ratings`
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
