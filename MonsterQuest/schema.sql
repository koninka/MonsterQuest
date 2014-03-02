create database monsterquest;

use monsterquest;

GRANT ALL
ON `camerapeople`.*
TO `monsterquest_user`@localhost IDENTIFIED BY 'qwerty';

create table users(
	id integer not null auto_increment primary key,
	login varchar(10) not null,
	password varchar(10) not null
);

create table securityId(
	id integer not null auto_increment primary key,
	user_id integer not null references users(id) on delete cascade,
	sid text not null
);