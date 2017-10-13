@ECHO OFF

ECHO Uninstalling previous version of generator
CALL npm uninstall generator-ibi-appframework -G
ECHO Installing new version of generator
CALL npm install yo yeoman-generator yeoman-environment generator-ibi-appframework.tgz -G
