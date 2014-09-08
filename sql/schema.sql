DROP DATABASE IF EXISTS monsterquest;
CREATE DATABASE monsterquest;

use monsterquest;

GRANT ALL
ON `monsterquest`.*
TO `monster_user`@localhost IDENTIFIED BY 'qwerty';

#CREATE TABLE classes (
#    id   INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
#    name VARCHAR(60) NOT NULL,
#    UNIQUE KEY(name)
#);

CREATE TABLE users (
	id       INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
	login    VARCHAR(36) NOT NULL,
	password VARCHAR(36) NOT NULL,
        class    INT         NOT NULL,
        #class_id int         not null references classes(id) on delete set null,
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

CREATE TABLE artifacts (
   id              INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
   name            VARCHAR(60) NOT NULL,
   atype           VARCHAR(15) NOT NULL,
   weight          INT         NOT NULL,
   allocation_info VARCHAR(20) NOT NULL,
   power_info      VARCHAR(20),
   flags           VARCHAR(150),
   effects         VARCHAR(60),
   bonus           VARCHAR(80),
   message         TEXT,
   description     TEXT,
   UNIQUE(name)
);

CREATE TABLE users_inventory (
   id      INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
   user_id INT NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
   item_id INT NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
   amount  INT NOT NULL DEFAULT 1 CHECK(amount > 0),
   place   INT NOT NULL CHECK (place >= 0),
   UNIQUE(user_id, place)
);

CREATE TABLE users_slots (
   id      INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
   user_id INT NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
   item_id INT NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
   amount  INT NOT NULL DEFAULT 1 CHECK(amount > 0),
   slot    INT NOT NULL CHECK (0 <= slot AND slot <= 9),
   UNIQUE(user_id, slot)
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

DROP PROCEDURE IF EXISTS `inc_user_item_amount` //
CREATE PROCEDURE `inc_user_item_amount`(IN `uid` INT, IN `iid` INT, IN `place_num` INT, IN `amnt` INT)
BEGIN
   IF (SELECT EXISTS (SELECT 1 FROM `users_inventory` WHERE `user_id` = uid AND `item_id` = iid AND `place` = place_num)) THEN
      UPDATE `users_inventory` SET `amount` = `amount` + amnt WHERE `user_id` = uid  AND `item_id` = iid AND `place` = place_num;
   ELSE
      INSERT INTO `users_inventory`(`user_id`, `item_id`, `place`, `amount`) VALUES(uid, iid, place_num, amnt);
   END IF;
END//

DROP PROCEDURE IF EXISTS `dec_user_item_amount` //
CREATE PROCEDURE `dec_user_item_amount`(IN `uid` INT, IN `iid` INT, IN `place_num` INT, IN `amnt` INT)
BEGIN
   DECLARE tbl_amnt INT;
   UPDATE `users_inventory` SET `amount` = `amount` - amnt WHERE `user_id` = uid  AND `item_id` = iid AND `place` = place_num;
   IF (SELECT EXISTS (SELECT 1 FROM `users_inventory` WHERE `user_id` = uid AND `item_id` = iid AND `place` = place_num)) THEN
      SELECT `amount` INTO tbl_amnt FROM `users_inventory` WHERE `user_id` = uid AND `item_id` = iid AND `place` = place_num;
      IF tbl_amnt <= 0 THEN
         DELETE FROM `users_inventory` WHERE `user_id` = uid  AND `item_id` = iid AND `place` = place_num;
      END IF;
   END IF;
END//

DROP PROCEDURE IF EXISTS `move_item` //
CREATE PROCEDURE `move_item`(IN `uid` INT, IN `from_place` INT,  IN `to_place` INT)
BEGIN
   UPDATE `users_inventory` SET `place` = -1 WHERE `user_id` = uid AND `place` = from_place;
   UPDATE `users_inventory` SET `place` = from_place WHERE `user_id` = uid AND `place` = to_place;
   UPDATE `users_inventory` SET `place` = to_place WHERE `user_id` = uid AND `place` = -1;
END//

DROP PROCEDURE IF EXISTS `equip_item` //
CREATE PROCEDURE `equip_item`(IN `uid` INT, IN `iid` INT, IN `place_num` INT, IN `slot_num` INT)
BEGIN
   DECLARE amnt INT;
   SELECT `amount` INTO amnt FROM `users_inventory` WHERE `user_id` = uid  AND `item_id` = iid AND `place` = place_num;
   DELETE FROM `users_slots` WHERE `user_id` = uid  AND `item_id` = iid AND `slot` = slot_num;
   INSERT INTO `users_slots`(`user_id`, `item_id`, `slot`, `amount`) VALUES(uid, iid, slot_num, amnt);
   CALL `dec_user_item_amount`(uid, iid, place_num, amnt);
END//

DROP PROCEDURE IF EXISTS `unequip_item` //
CREATE PROCEDURE `unequip_item`(IN `uid` INT, IN `iid` INT, IN `place_num` INT, IN `slot_num` INT)
BEGIN
   DECLARE amnt INT;
   SELECT `amount` INTO amnt FROM `users_slots` WHERE `user_id` = uid  AND `item_id` = iid AND `slot` = slot_num;
   DELETE FROM `users_slots` WHERE `user_id` = uid  AND `item_id` = iid AND `slot` = slot_num;
   DELETE FROM `users_inventory` WHERE `user_id` = uid  AND `item_id` = iid AND `place` = place_num;
   CALL `inc_user_item_amount`(uid, iid, place_num, amnt);
END//

DROP PROCEDURE IF EXISTS `dec_user_slot_amount` //
CREATE PROCEDURE `dec_user_slot_amount`(IN `uid` INT, IN `iid` INT, IN `slot_num` INT, IN `amnt` INT)
BEGIN
   UPDATE `users_slots` SET `amount` = `amount` - amnt WHERE `user_id` = uid  AND `item_id` = iid AND `slot` = slot_num;
   DELETE FROM `users_slots` WHERE `user_id` = uid  AND `item_id` = iid AND `slot` = slot_num AND `amount` <= 0;
END//

DROP PROCEDURE IF EXISTS `inc_user_slot_amount` //
CREATE PROCEDURE `inc_user_slot_amount`(IN `uid` INT, IN `iid` INT, IN `slot_num` INT, IN `amnt` INT)
BEGIN
   UPDATE `users_slots` SET `amount` = `amount` + amnt WHERE `user_id` = uid  AND `item_id` = iid AND `slot` = slot_num;
END//

DELIMITER ;