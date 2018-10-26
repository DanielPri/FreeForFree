// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const extend = require('lodash').assign;
const mysql = require('mysql');
const config = require('../config');

const options = {
  user: config.get('MYSQL_USER'),
  password: config.get('MYSQL_PASSWORD'),
  database: 'bookshelf'
};

if (config.get('INSTANCE_CONNECTION_NAME') && config.get('NODE_ENV') === 'production') {
  options.socketPath = `/cloudsql/${config.get('INSTANCE_CONNECTION_NAME')}`;
}

const connection = mysql.createConnection(options);

// [Start active users list]
function list (isActive, limit, token, cb) {
  isActive = isActive ? parseInt(isActive, 10) : 0;
  token = token ? parseInt(token, 10) : 0;
  connection.query(
    'SELECT * FROM `user` WHERE `isActive` = ? LIMIT ? OFFSET ?', [isActive, limit, token],
    (err, results) => {
      if (err) {
        cb(err);
        return;
      }
      const hasMore = results.length === limit ? token + results.length : false;
      cb(null, results, hasMore);
    }
  );
}
// [END active users list]

// [Start create user]
function createUser (data, profileName, limit, cb) {
  connection.query(
    'INSERT INTO `user` SET ? ON DUPLICATE KEY UPDATE `profileName` = ?', [data, profileName, limit],
    (err, result) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, result);
    });
}
// [End create user]

// [Find unregistered users]
function findUnregisteredUser (userType, cb) {
  // var i=0;
  // for(i=0; i<userType.length; i++){
    connection.query(
      // 'UPDATE `user` SET `userType`= ? where `profileID` = ?' , [3, userType[i]],
      'SELECT * FROM `user` WHERE `userType` = ?', [userType],
      (err, result) => {
        if (err) {
          cb(err);
          return;
        }
        cb(null, result);
    });
  // }
  
}
// [End find unregistered users]

function chooseUserType (userType, cb) {
  var i=0;
  var userTypeValue;
  var id;
  var query =""
  console.log("-----------------DATABASE---------------");
  for(i=1; i<userType.length; i++){
    console.log("userType[i]");
    console.log(userType[i][0]);
    console.log("userType[i].substr(5)");
    console.log(userType[i].substr(5));

    userTypeValue = userType[i][0];
    id = userType[i].substr(5);
    console.log(userTypeValue);
    console.log(id); 
    query+= 'UPDATE user SET userType= '+userTypeValue+' where profileID = '+id+';';

    console.log(query);
    connection.query(
      // UPDATE user SET userType= 3 where profileID = 111595700919556005339
      // 'UPDATE `user` SET `userType`= ? where `profileID` = ?' , [userTypeValue, id],
      // 'SELECT * FROM `user` WHERE `userType` = ?', [userType],
      query,
      (err, result) => {
        if (err) {
          cb(err);
          return;
        }
        cb(null, result);
    });
  }
  
}

// [Start verify admin]
function verifyAdmin (profileID, userType, cb) {
  connection.query(
    'SELECT `profileName` FROM `user` WHERE `profileID` = ? AND `userType` = ?', [profileID, userType],
    (err, result) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, result);
  });
}
// [End verify admin]

// [Start set user's activity state]
function setIsActive (tiny, userID, cb) {
  tiny = tiny ? parseInt(tiny, 10) : 0;
  connection.query(
    'UPDATE `user` SET `isActive` = ? WHERE `profileID` = ?', [tiny, userID],
    (err, result) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, result);
    });
}
// [End set user's activity state]


// [Change user's type]
function changeUserType (data, cb) {
  connection.query(
    'UPDATE `user` SET `userType` = ? WHERE `profileID` = ?', [userType, userID],
    (err, result) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, result);
    });
}
// [End of submit to change user's type]
module.exports = {
  createSchema: createSchema,
  list: list,
  createUser: createUser,
  setIsActive: setIsActive,
  verifyAdmin: verifyAdmin,
  findUnregisteredUser: findUnregisteredUser,
  chooseUserType: chooseUserType
};

if (module === require.main) {
  const prompt = require('prompt');
  prompt.start();

  console.log(
    `Running this script directly will allow you to initialize your mysql database.
    This script will not modify any existing tables.`);

  prompt.get(['user', 'password'], (err, result) => {
    if (err) {
      return;
    }
    createSchema(result);
  });
}

function createSchema (config) {
  const connection = mysql.createConnection(extend({
    multipleStatements: true
  }, config));

  connection.query(
    `CREATE DATABASE IF NOT EXISTS \`bookshelf\`
      DEFAULT CHARACTER SET = 'utf8'
      DEFAULT COLLATE 'utf8_general_ci';
    USE \`bookshelf\`;
    CREATE TABLE IF NOT EXISTS \`bookshelf\`.\`books\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`title\` VARCHAR(255) NULL,
      \`author\` VARCHAR(255) NULL,
      \`publishedDate\` VARCHAR(255) NULL,
      \`imageUrl\` VARCHAR(255) NULL,
      \`description\` TEXT NULL,
      \`createdBy\` VARCHAR(255) NULL,
      \`createdById\` VARCHAR(255) NULL,
    PRIMARY KEY (\`id\`));`,
    (err) => {
      if (err) {
        throw err;
      }
      console.log('Successfully created schema');
      connection.end();
    }
  );
}
