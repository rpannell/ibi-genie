!macro customInstall
	IfFileExists $INSTDIR\extrainstall.bat 0 +2
		ExecWait '"$INSTDIR\extrainstall.bat"'
!macroend