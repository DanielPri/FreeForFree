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
    database: 'bookshelf',
    multipleStatements: true
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
function createUser (data, profileName, cb) {
  connection.query(
    'INSERT INTO `user` SET ? ON DUPLICATE KEY UPDATE `profileName` = ?', [data, profileName],
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
    connection.query(
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

// [Find Users Information]
function findUserInfo (cb) {
    connection.query(
      'SELECT * FROM `user` ',
      (err, result) => {
        if (err) {
          cb(err);
          return;
        }
        cb(null, result);
    });

}
// [End find Users Information]

// [Find Users Information]
function editUserInfo (userInfo, cb) {
  connection.query(
    'UPDATE `user` Set ? where profileID= ?', [userInfo, userInfo.profileID],
    // 'SELECT * FROM `user` ',
    (err, result) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, result);
  });

}
// [End find Users Information]

function chooseUserType (userType, cb) {
  var i=0;
  var userTypeValue= userType[0];
  var id= userType.substr(5);
  var query = 'UPDATE user SET userType= '+userTypeValue+' where profileID = '+id+'; ';
    connection.query(
      query,
      (err, result) => {
        if (err) {
          cb(err);
          return;
        }
        cb(null, result);
    });


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


// [Start Change user's type]
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
// [END Change user's type]

// [End set user's activity state]

// [Start set listBooks]
function listBooks (limit, token, cb) {
  token = token ? parseInt(token, 10) : 0;
  connection.query(
    'SELECT * FROM `books` LIMIT ? OFFSET ?', [limit, token],
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
//[End set listBooks]

// [Start set listMagazines]
function listMagazines (limit, token, cb) {
  token = token ? parseInt(token, 10) : 0;
  connection.query(
    'SELECT * FROM `magazines` LIMIT ? OFFSET ?', [limit, token],
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
//[End set listMagazines]

// [Start set listMovies]
function listMovies (limit, token, cb) {
  token = token ? parseInt(token, 10) : 0;
  connection.query(
    'SELECT * FROM `movies` LIMIT ? OFFSET ?', [limit, token],
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
//[End set listMovies]

// [Start set listMusics]
function listMusics (limit, token, cb) {
  token = token ? parseInt(token, 10) : 0;
  connection.query(
    'SELECT * FROM `musics` LIMIT ? OFFSET ?', [limit, token],
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
//[End set listMusics]

//-------------------------------------------- START  CREATE ------------------------------------------------------------------//

// [START createBook]
function createBook (data, cb) {
  connection.query(
    'INSERT INTO `inventory` SET type=?;INSERT INTO `books` SET ?, id=LAST_INSERT_ID()', ['book', data],
    (err, result) => {
      if (err) {
        cb(err);
        return;
      }
      readBook(result[0].insertId, cb);
    });
}
// [END createBook]


// [START createMagazines]
function createMagazine (data, cb) {
  connection.query(
    'INSERT INTO `inventory` SET type=?;INSERT INTO `magazines` SET ?, id=LAST_INSERT_ID()', ['magazine', data],
    (err, result) => {
      if (err) {
        cb(err);
        return;
      }
      readMagazine(result[0].insertId, cb);
    });
}


// [END createMagazines]

// [START createMovies]
function createMovie (data, cb) {
  connection.query(
    'INSERT INTO `inventory` SET type=?;INSERT INTO `movies` SET ?, id=LAST_INSERT_ID()', ['movie', data],
    (err, result) => {
      if (err) {
        cb(err);
        return;
      }
      readMovie(result[0].insertId, cb);
    });
}
// [END createMovies]

// [START createMusic]
function createMusic (data, cb) {
  connection.query(
    'INSERT INTO `inventory` SET type=?;INSERT INTO `musics` SET ?, id=LAST_INSERT_ID()', ['music', data],
    (err, result) => {
      if (err) {
        cb(err);
        return;
      }
      readMusic(result[0].insertId, cb);
    });
}
// [END createMusic]
//-----------------------------------------------------------------------------------------------------------------------------//



//-------------------------------------------- START  READ --------------------------------------------------------------------//
// [START read]
function readBook (id, cb) {
  connection.query(
    'SELECT * FROM `books` WHERE `id` = ?', id, (err, results) => {
      if (!err && !results.length) {
        err = {
          code: 404,
          message: 'Not found!!'
        };
      }
      if (err) {
        cb(err);
        return;
      }
      cb(null, results[0]);
    });
}
// [END read]


// [START read]
function readMagazine (id, cb) {
  connection.query(
    'SELECT * FROM `magazines` WHERE `id` = ?', id, (err, results) => {
      if (!err && !results.length) {
        err = {
          code: 404,
          message: 'Not found!!'
        };
      }
      if (err) {
        cb(err);
        return;
      }
      cb(null, results[0]);
    });
}
// [END read]

// [START read]
function readMusic (id, cb) {
  connection.query(
    'SELECT * FROM `musics` WHERE `id` = ?', id, (err, results) => {
      if (!err && !results.length) {
        err = {
          code: 404,
          message: 'Not found!!'
        };
      }
      if (err) {
        cb(err);
        return;
      }
      cb(null, results[0]);
    });
}
// [END read]

// [START read]
function readMovie (id, cb) {
  connection.query(
    'SELECT * FROM `movies` WHERE `id` = ?', id, (err, results) => {
      if (!err && !results.length) {
        err = {
          code: 404,
          message: 'Not found!!'
        };
      }
      if (err) {
        cb(err);
        return;
      }
      cb(null, results[0]);
    });
}
// [END read]

//-----------------------------------------------------------------------------------------------------------------------------//



//-------------------------------------------- START  UPDATE ------------------------------------------------------------------//

// [START update]
function updateBook (id, data, cb) {
  connection.query(
    'UPDATE `books` SET ? WHERE `id` = ?', [data, id], (err) => {
      if (err) {
        cb(err);
        return;
      }
      readBook(id, cb);
    });
}
// [END update]

// [START update]
function updateMagazine (id, data, cb) {
  connection.query(
    'UPDATE `magazines` SET ? WHERE `id` = ?', [data, id], (err) => {
      if (err) {
        cb(err);
        return;
      }
      readMagazine(id, cb);
    });
}
// [END update]

// [START update]
function updateMusic (id, data, cb) {
  connection.query(
    'UPDATE `musics` SET ? WHERE `id` = ?', [data, id], (err) => {
      if (err) {
        cb(err);
        return;
      }
      readMusic(id, cb);
    });
}
// [END update]

// [START update]
function updateMovie (id, data, cb) {
  connection.query(
    'UPDATE `movies` SET ? WHERE `id` = ?', [data, id], (err) => {
      if (err) {
        cb(err);
        return;
      }
      readMovie(id, cb);
    });
}
// [END update]


//------------------------------------------------Search-------------------------------------------------------------------------//

function findItem(columnValue, cb) {

    var columnPartial = "%" + columnValue + "%";
    connection.query(
        'SELECT * FROM `books` WHERE `title` LIKE ? ;' +
        'SELECT * FROM `movies` WHERE `title` LIKE ? ;' +
        'SELECT * FROM `magazines` WHERE `title` LIKE ? ;' +
        'SELECT * FROM `musics` WHERE `title` LIKE ? ;'
        , [columnPartial, columnPartial, columnPartial, columnPartial],
        (err, results) => {
            if (err) {
                cb(err);
                return;
            }
            console.log(results);
            cb(null, results);
        });
}


function findByAttribute(itemType, column, columnValue, orderBy, sortUpDown, cb) {

    const columnPartial = "%" + columnValue + "%";
    if (sortUpDown === 'ASC') { // Sort Ascending
        if (columnValue == 1)
            var mysql = 'SELECT * FROM ?? WHERE ? LIKE ? ORDER BY ?? ASC'
        else
            var mysql = 'SELECT * FROM ?? WHERE ?? LIKE ? ORDER BY ?? ASC'
    }
    else if (sortUpDown === 'DESC') { // Sort Descending
        if (columnValue == 1)
            var mysql = 'SELECT * FROM ?? WHERE ? LIKE ? ORDER BY ?? DESC'

        else
            var mysql = 'SELECT * FROM ?? WHERE ?? LIKE ? ORDER BY ?? DESC'
    }

    connection.query(
        mysql, [itemType, column, columnPartial, orderBy],
        (err, results) => {
            if (err) {
                cb(err);
                return;
            }
            cb(null, results);
        });
}

//-------------------------------------------- START  DELETE ------------------------------------------------------------------//
//[START delete]
function _delete (id, cb) {
  connection.query('DELETE FROM `inventory` WHERE `id` = ?', id, cb);
}
//[END delete]
//---------------------------------------------- END  DELETE ------------------------------------------------------------------//

//-------------------------------------------- START  EDITING ------------------------------------------------------------------//
//[START startEditing]
function startEditing(id, itemID, cb) {
  connection.query(
    'INSERT INTO `editing` SET `id`=?, `itemID`=?', [id, itemID],
    (err, result) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, result);
    });
}
//[END startEditing]

//[START stopEditing]
function stopEditing(id, itemID, cb) {
  connection.query('DELETE FROM `editing` WHERE `id` = ? AND `itemID` = ?', [id, itemID], cb);
}
//[END stopEditing]

//[START verifyEditing]
function verifyEditing(itemID, cb) {
  connection.query(
    'SELECT * FROM `editing` WHERE `itemID` = ?', itemID,
    (err, result) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, result);
    });
}
//[END verifyEditing]
//---------------------------------------------- END  EDITING ------------------------------------------------------------------//

//----------------------------------------------- START  CART ------------------------------------------------------------------//
// [Start listCartItems]
function listCartItems (id, cb) {
    connection.query(
        'SELECT * FROM ((SELECT `title`, `id`, `imageURL` FROM books UNION SELECT `title`, `id`, `imageURL` FROM `musics` UNION SELECT `title`, `id`, `imageURL` FROM `movies`) AS q JOIN cart AS c) JOIN inventory AS i WHERE c.id = ? AND c.itemID = q.id AND i.id = q.id', id,
        (err, results) => {
            if (err) {
                cb(err);
                return;
            }
            cb(null, results);
        }
    );
}
//[End listCartItems]

//[START addCart]
function addCart(id, itemID, cb) {
  connection.query(
    'INSERT INTO `cart` SET `id`=?, `itemID`=?', [id, itemID],
    (err, result) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, result);
    });
}
//[END addCart]

//[START removeCart]
function removeCart(itemID, cb) {
  connection.query('DELETE FROM `cart` WHERE `itemID` = ?', itemID, cb);
}
//[END removeCart]

//[START removeAllCart]
function removeAllCart(userID, cb) {
  connection.query('DELETE FROM `cart` WHERE `id` = ?', userID, cb);
}
//[END removeAllCart]
//------------------------------------------------- END  CART ------------------------------------------------------------------//

//-------------------------------------------------- START  LOAN ---------------------------------------------------------------//
//[START loan]
function loan(id, itemID, cb) {
  connection.query(
    'INSERT INTO `loans` SET `userID`=?, `itemID`=?', [id, itemID],
    (err, result) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, result);
    });
}
//[END loan]

//[START listLoans]
function listLoans (id, cb) {
    connection.query(
        'SELECT * FROM ((SELECT `title`, `id`, `imageURL` FROM books UNION SELECT `title`, `id`, `imageURL` FROM `musics` UNION SELECT `title`, `id`, `imageURL` FROM `movies`) AS q JOIN loans AS l) JOIN inventory AS i WHERE l.userID = ? AND l.itemID = q.id AND i.id = q.id', id,
        (err, results) => {
            if (err) {
                cb(err);
                return;
            }
            cb(null, results);
        }
    );
}
//[END listLoans]

//[START listReturns]
function listReturns (id, cb) {
    connection.query(
        'SELECT * FROM ((SELECT `title`, `id`, `imageURL` FROM books UNION SELECT `title`, `id`, `imageURL` FROM `musics` UNION SELECT `title`, `id`, `imageURL` FROM `movies`) AS q JOIN returns AS r) JOIN inventory AS i WHERE r.userID = ? AND r.itemID = q.id AND i.id = q.id', id,
        (err, results) => {
            if (err) {
                cb(err);
                return;
            }
            cb(null, results);
        }
    );
}
//[END listReturns]

//[START returnLoan]
function returnLoan (userID, itemID, cb) {
  connection.query('INSERT INTO `returns` SET `userID` = ?, `itemID` = ?;DELETE FROM `loans` WHERE `userID` = ? AND `itemID` = ?', [userID, itemID, userID, itemID],
  (err, result) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, result);
    });
}
//[END returnLoan]
//--------------------------------------------------- END  LOAN ----------------------------------------------------------------//

module.exports = {
  createSchema: createSchema,
  list: list,
  createUser: createUser,
  setIsActive: setIsActive,
  verifyAdmin: verifyAdmin,
  findUnregisteredUser: findUnregisteredUser,
  chooseUserType: chooseUserType,
  listBooks: listBooks,
  listMagazines: listMagazines,
  listMovies: listMovies,
  listMusics: listMusics,
  createBook: createBook,
  createMagazine: createMagazine,
  createMovie: createMovie,
  createMusic: createMusic,
  readBook: readBook,
  readMagazine: readMagazine,
  readMusic: readMusic,
  readMovie: readMovie,
  delete: _delete,
  updateBook: updateBook,
  updateMagazine: updateMagazine,
  updateMusic: updateMusic,
  updateMovie: updateMovie,
  findItem: findItem,
  findByAttribute: findByAttribute,
  startEditing: startEditing,
  stopEditing: stopEditing,
  verifyEditing: verifyEditing,
  findUserInfo: findUserInfo,
  editUserInfo: editUserInfo,
  addCart: addCart,
  removeCart: removeCart,
  removeAllCart: removeAllCart,
  listCartItems: listCartItems,
  listLoans: listLoans,
  listReturns: listReturns,
  loan: loan,
  returnLoan: returnLoan
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
      \`language\` TEXT NULL,
      \`createdBy\` VARCHAR(255) NULL,
      \`createdById\` VARCHAR(255) NULL,
      \`format\` TEXT NULL,
      \`pages\` INT(10) NULL,
      \`ISBN10\` TEXT NULL,
      \`ISBN10\` TEXT NULL,
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
