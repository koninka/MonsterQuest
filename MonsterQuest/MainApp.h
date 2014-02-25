#pragma once

#include <Wt/WApplication>
#include <Wt/WEnvironment>
#include "RegAuth.h"

class MainApplication: public Wt::WApplication {
	LoginForm* form;
public:
	MainApplication(const Wt::WEnvironment&);
};

Wt::WApplication* CreateApplication(const Wt::WEnvironment&);