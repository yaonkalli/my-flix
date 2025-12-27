@echo off
set GIT_PATH="C:\Program Files\Git\mingw64\bin\git.exe"
echo [1/6] Initialisation du depot Git...
%GIT_PATH% init

echo [2/6] Ajout des fichiers...
%GIT_PATH% add .

echo [3/6] Premier commit...
%GIT_PATH% commit -m "Initial commit"

echo [4/6] Configuration de la branche principale...
%GIT_PATH% branch -M main

echo [5/6] Configuration du lien GitHub...
%GIT_PATH% remote add origin https://github.com/yaonkalli/my-flix.git

echo [6/6] Envoi vers GitHub...
%GIT_PATH% push -u origin main

echo.
echo Operation terminee ! Verifiez votre depot sur GitHub.
pause
