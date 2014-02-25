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

using namespace Wt;

#include <fstream>
std::ofstream out("log.log");

class LoginForm : public WContainerWidget
{
private:
	WLabel label;
	WLineEdit usernameTextEdit;
	WLineEdit passwordTextEdit;
	WPushButton submitButton;
	Http::Client client;
	void sendLogInRequest();
	void receiveJSONresponse(boost::system::error_code err, const Http::Message& response);
public:
	LoginForm(WContainerWidget* parent = 0);
};

LoginForm::LoginForm(WContainerWidget* parent) 
	: WContainerWidget(parent), 
	label("Login", this), 
	usernameTextEdit(this),
	passwordTextEdit(this),
	submitButton("Log in", this),
	client()
{
	passwordTextEdit.setEchoMode(WLineEdit::Password);
	submitButton.clicked().connect(this, &LoginForm::sendLogInRequest);
	client.done().connect(this, &LoginForm::receiveJSONresponse);
}

void LoginForm::sendLogInRequest()
{
	Json::Object data;
	data["action"] = "login";
	data["username"] = usernameTextEdit.text();
	data["password"] = passwordTextEdit.text();	
	Http::Message msg;
	msg.addHeader("Content-Type", "application/json");
	msg.addHeader("Accept", "application/json");
	msg.addBodyText(Json::serialize(data));
	client.request(Http::Post, "http://localhost", msg);
}

void LoginForm::receiveJSONresponse(boost::system::error_code err, const Http::Message& response)
{
	if (!err && response.status() == 200)
	{
		doJavaScript("alert(" + response.body() + ");");
	}
}

class MainApplication : public WApplication
{
private:
	LoginForm* form;
public:
	MainApplication(const WEnvironment& env);
};

MainApplication::MainApplication(const WEnvironment& env) 
	: WApplication(env), form(new LoginForm(root())) 
{}


class JsonHandlerApplication : public WApplication
{
public:
	JsonHandlerApplication(const WEnvironment& env): WApplication(env) {} 
};

WApplication* createApplication(const WEnvironment& env)
{
	return new MainApplication(env);
}

int main(int argc, char** argv)
{
    return WRun(argc, argv, &createApplication);
}