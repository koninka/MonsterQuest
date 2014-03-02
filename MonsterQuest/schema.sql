
create database monsterquest;

use monsterquest;

create table users(
	id integer not null auto_increment primary key,
	login varchar(36) not null,
	password varchar(36) not null
);

create table securityId(
	id integer not null auto_increment primary key,
	user_id integer not null references users(id) on delete cascade,
	sid text not null
);