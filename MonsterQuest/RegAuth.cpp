#include "RegAuth.h"

using namespace Wt;

LoginForm::LoginForm(WContainerWidget* parent):
	WContainerWidget(parent), 
	label("Login", this), 
	usernameTextEdit(this),
	passwordTextEdit(this),
	submitButton("Log in", this),
	client()
{
	passwordTextEdit.setEchoMode(WLineEdit::Password);
	submitButton.clicked().connect(this, &LoginForm::SendLogInRequest);
	client.done().connect(this, &LoginForm::ReceiveJSONresponse);
}

void LoginForm::SendLogInRequest()
{
	Json::Object data;
	data["action"] = "login";
	data["username"] = usernameTextEdit.text();
	data["password"] = passwordTextEdit.text();	
	Http::Message msg;
	msg.addHeader("Content-Type", "application/json");
	msg.addHeader("Accept", "application/json");
	msg.addBodyText(Json::serialize(data));
	client.request(Http::Post, "http://localhost/json", msg);
}

void LoginForm::ReceiveJSONresponse(boost::system::error_code err, const Http::Message& response)
{

	if (!err && response.status() == 200)
	{
		doJavaScript("alert(" + response.body() + ");");
	}
}

void JsonHandlerResource::handleRequest(const Http::Request& request, Http::Response& response)
{
	response.setMimeType("application/json");
	std::string body;
	request.in() >> body;
	response.out() << body << std::endl;
}