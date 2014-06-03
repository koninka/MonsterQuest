DROP DATABASE IF EXISTS monsterquest;
CREATE DATABASE monsterquest;

use monsterquest;

GRANT ALL
ON `monsterquest`.*
TO `monster_user`@localhost IDENTIFIED BY 'qwerty';

CREATE TABLE users (
	id       INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
	login    VARCHAR(36) NOT NULL,
	password VARCHAR(36) NOT NULL,
   UNIQUE KEY(login)
);

CREATE TABLE sessions (
	id      INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
	user_id INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	sid     VARCHAR(50) NOT NULL,
   UNIQUE KEY(sid)
);

CREATE TABLE users_position (
   id       INT    NOT NULL AUTO_INCREMENT PRIMARY KEY,
   user_id  INT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
   X        FLOAT  NOT NULL,
   Y        FLOAT  NOT NULL,
   UNIQUE KEY(user_id)
);

CREATE TABLE mobs_types (
   id          INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
   symbol      VARCHAR(2)  NOT NULL,
   name        VARCHAR(30) NOT NULL,
   base_hp     INT         NOT NULL,
   hp_inc      VARCHAR(4)  NOT NULL,
   flags       TEXT,
   info        VARCHAR(40) NOT NULL,
   color       VARCHAR(3)  NOT NULL,
   spells      TEXT,
   description TEXT,
   level_info  VARCHAR(15) NOT NULL,
   blow_method TEXT        NOT NULL,
   UNIQUE(name)
);

CREATE TABLE items_types (
	id          INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name        VARCHAR(20) NOT NULL,
	description TEXT,
	itemType    INT NOT NULL
);

DELIMITER //

DROP PROCEDURE IF EXISTS `add_user_session` //
CREATE PROCEDURE `add_user_session`(IN `ulogin` VARCHAR(36), IN `uuid` VARCHAR(50))
BEGIN
   DECLARE uuser_id INT;
   SELECT `id` INTO uuser_id FROM `users` WHERE `login` = ulogin;
   DELETE FROM `sessions` WHERE `user_id` = uuser_id;
   IF uuser_id is NOT NULL THEN
      INSERT INTO `sessions`(`user_id`, `sid`) VALUES(uuser_id, uuid);
   END IF;
END//

DELIMITER ;