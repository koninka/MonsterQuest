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
	data["action"] = WString("login");
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
        Json::Object data;
        Json::parse(response.body(), data);
       // if (data.get("result") == "ok")
           // doJavaScript("alert('ur sid is " + data.get("sid") + "');");
    } else 
        doJavaScript("alert('error has occured during connection to server');");
	
}

std::string JsonHandlerResource::handleLogin(Json::Object& data)
{
    return "a";
}

std::string JsonHandlerResource::handleLogout(Json::Object& data)
{
    return "a";
}

std::string JsonHandlerResource::handleRegister(Json::Object& data)
{
    return "a";
}

void JsonHandlerResource::handleRequest(const Http::Request& request, Http::Response& response)
{
	response.setMimeType("application/json");
	Json::Object data;
	std::string body;
	while (!request.in().eof())
	{
		std::string str;
		request.in() >> str;
		body += str;
	}
    Json::parse(body, data);
    if (!data.contains("action"))
    {
        Json::Object err;
        err["result"] = "error";
        err["message"] = "invalid operation";
        response.out() << Json::serialize(err);
    } else {
        std::string responseBody;
        std::string action = data.get("action");
        if (action == "login")
            responseBody = handleLogin(data);
        else if (action == "logout")
            responseBody = handleLogout(data);
        else if (action == "register")
            responseBody = handleRegister(data);
        response.out() << responseBody;
    }
}