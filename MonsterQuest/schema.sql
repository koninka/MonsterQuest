CREATE DATABASE monsterquest;

use monsterquest;

GRANT ALL
ON `camerapeople`.*
TO `monsterquest_user`@localhost IDENTIFIED BY 'qwerty';

CREATE TABLE users (
	id       INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
	login    VARCHAR(10) NOT NULL,
	password VARCHAR(10) NOT NULL
);

CREATE TABLE securityId (
	id      INT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
	user_id INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	sid     TEXT NOT NULL
);