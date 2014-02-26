#include <Wt/WServer>
#include "MainApp.h"
#include "RegAuth.h"

using namespace Wt;

int main(int argc, char **argv)
{
  Wt::WServer server(argv[0]);
  server.addResource(new JsonHandlerResource(), "/json");

  server.setServerConfiguration(argc, argv, WTHTTP_CONFIGURATION);

  server.addEntryPoint(Application, CreateApplication);

  if (server.start()) 
  {
    int sig = WServer::waitForShutdown();
    std::cerr << "Shutting down: (signal = " << sig << ")" << std::endl;
    server.stop();
  }
}