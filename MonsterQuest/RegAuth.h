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
#include <Wt/Json/Parser>
#include <Wt/Http/Client>
#include <Wt/Http/Message>
#include <Wt/Http/Response>
#include <Wt/WResource>

using namespace Wt;

class LoginForm: public WContainerWidget  {
	WLabel label;
	WLineEdit usernameTextEdit;
	WLineEdit passwordTextEdit;
	WPushButton submitButton;
	Http::Client client;
	void SendLogInRequest();
	void ReceiveJSONresponse(boost::system::error_code, const Http::Message&);
public:
	LoginForm(WContainerWidget* = 0);
};

class JsonHandlerResource : public WResource {
private:
    std::string handleLogin(Json::Object& data);
    std::string handleRegister(Json::Object& data);
    std::string handleLogout(Json::Object& data);
public:
	void handleRequest(const Http::Request&, Http::Response&);
};