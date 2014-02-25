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

using namespace Wt;

class LoginForm : public WContainerWidget 
{
private:
	WLabel* label;
	WLineEdit* usernameTextEdit;
	WLineEdit* passwordTextEdit;
	WPushButton* submitButton;
	void sendLogInRequest();
public:
	LoginForm(WContainerWidget* parent = 0);
};

LoginForm::LoginForm(WContainerWidget* parent) 
	: WContainerWidget(parent)
{
	label = new WLabel("Login", this);

	usernameTextEdit = new WLineEdit(this);
	
	passwordTextEdit = new WLineEdit(this);
	passwordTextEdit->setEchoMode(WLineEdit::Password);

	submitButton = new WPushButton("Log in", this);
	submitButton->clicked().connect(this, &LoginForm::sendLogInRequest);
}

void LoginForm::sendLogInRequest()
{
	Json::Object data;
	data["username"] = usernameTextEdit->text();
	data["password"] = passwordTextEdit->text();
	
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

WApplication* createApplication(const WEnvironment& env)
{
    return new MainApplication(env);
}

int main(int argc, char **argv)
{
    return WRun(argc, argv, &createApplication);
}