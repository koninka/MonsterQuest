#include "MainApp.h"

using namespace Wt;

WApplication* CreateApplication(const WEnvironment& env)
{
	return new MainApplication(env);
}

MainApplication::MainApplication(const WEnvironment& env):
	WApplication(env),
	form(new LoginForm(root())) 
{}