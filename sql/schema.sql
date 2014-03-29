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
   name        VARCHAR(30) NOT NULL,
   description TEXT        NOT NULL,
   flags       TEXT        NOT NULL,
   UNIQUE(name)
);

INSERT INTO mobs_types(name, description, flags) VALUES(
   'Grey mold',
   'A small strange grey growth.',
   'NEVER_MOVE|IM_POIS|HURT_FIRE|NO_FEAR|NO_CONF|NO_SLEEP'
);

INSERT INTO mobs_types(name, description, flags) VALUES(
   'Grey mushroom patch',
   'Yum!  It looks quite tasty.',
   'IM_POIS|NEVER_MOVE|HURT_FIRE|NO_FEAR|NO_CONF|NO_SLEEP'
);

INSERT INTO mobs_types(name, description, flags) VALUES(
   'Small kobold',
   'It is a squat and ugly humanoid figure with a canine face.',
   'DROP_60|EVIL|IM_POIS'
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