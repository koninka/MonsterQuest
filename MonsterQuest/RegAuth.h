#pragma once

#include <Wt/WApplication>
#include <Wt/WBreak>
#include <Wt/WContainerWidget>
#include <Wt/WLineEdit>
#include <Wt/WPushButton>
#include <Wt/WText>
#include <Wt/WLineEdit>
#include <Wt/WLabel>
#include <Wt/Dbo/backend/MySQL>
#include <Wt/WEnvironment>
#include <Wt/Json/Object>
#include <Wt/Json/Serializer>
#include <Wt/Http/Client>
#include <Wt/Http/Message>
#include <Wt/Http/Response>
#include <Wt/WResource>

class LoginForm: public Wt::WContainerWidget  {
	Wt::WLabel label;
	Wt::WLineEdit usernameTextEdit;
	Wt::WLineEdit passwordTextEdit;
	Wt::WPushButton submitButton;
	Wt::Http::Client client;
	void SendLogInRequest();
	void ReceiveJSONresponse(boost::system::error_code, const Wt::Http::Message&);
public:
	LoginForm(WContainerWidget* = 0);
};

struct JsonHandlerResource : public Wt::WResource {
	void handleRequest(const Wt::Http::Request&, Wt::Http::Response&);
};