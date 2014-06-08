@echo off
for %%i in (*.png) do (
    
    echo "%%~ni_slot" :  "/imgs/slots/%%i",
)