@echo off

set "beginComment=goto :endComment"
%beginComment%
----------------------------------------------------------------------------------
Filename: project-downloader.bat
Author: lucid_layers
Version: 1.0
----------------------------------------------------------------------------------
This script is for easy batch downloading from Wombo Dream.

You create a project, multiple textprompts and select multiple styles.
The script then downloads images for each style for each prompt.
Downloads are then organized in the following structure:

wombot \ <project_name> \ <prompt-folder-name> \ <style-index> \ ...(images)...

You may like to visit our webpage with a collection of downloaded image sets:
https://github.com/edstoica/lucid_stylegan3_datasets_models
----------------------------------------------------------------------------------
All credits for the utilized "wombot" go to https://github.com/adri326/wombot
----------------------------------------------------------------------------------
:endComment


REM ----------------- configure this project: ------------------------------------

REM --  Set your Projects Name (will create a subfolder with this name) ----------
set "project_name=cars_flags_and_cats"

REM --  select your desired styles for each prompt. ------------------------------
set styles=2 8

REM --  enter desired prompts here: (you may add/remove entries)(note: promts are limited to 99 characters)
set "prompt[0]=a red car | sunset"
set "prompt[1]=a blue house | noon"
set "prompt[2]=green flag with stripes | glowing" 
set "prompt[3]=orange circle | detailed structure" 
set "prompt[4]=white cat with hat" 
set "prompt[5]=black demon | smiling happy"

REM --  Set handy folder names for each prompt: ---------------------------------
set "folder[0]=red_car"
set "folder[1]=blue_house"
set "folder[2]=green_flag" 
set "folder[3]=orange_circle" 
set "folder[4]=white_cat" 
set "folder[5]=black_demon"

REM --  Should we use all entries? -------------------------------------------------
set lastindex=5
REM --  how many parallel download:? (be careful with quota limits, 2 is a good value)
set times=2

REM --  how long delay between each step: (helps with quota, 11 is a good value) ----
set delay=11


%beginComment%
/* List of styles
1 -> Synthwave
2 -> Ukiyoe
3 -> No Style
4 -> Steampunk
5 -> Fantasy Art
6 -> Vibrant
7 -> HD
8 -> Pastel
9 -> Psychic
10 -> Dark Fantasy
11 -> Mystical
12 -> Festive
13 -> Baroque
14 -> Etching
15 -> S. Dali
16 -> Wuhtercuhler
17 -> Provenance
18 -> Rose Gold
*/
:endComment


REM -----------------------------------------------------------------------------------------------
REM ---------------- do not edit from here --------------------------------------------------------
REM -----------------------------------------------------------------------------------------------

ECHO -------------------------------------------------------------
ECHO Project: "%project_name%"
ECHO Selected Styles: %styles%
ECHO Number of Prompts: %lastindex%, Parallel Downloads: %times%, Delay: %delay%s
ECHO -------------------------------------------------------------

setlocal enabledelayedexpansion 
set "i=^|"

if not exist "%project_name%" mkdir "%project_name%" >> nul

:repeat
SETLOCAL ENABLEDELAYEDEXPANSION   
for /l %%n in (0,1,%lastindex%) do (   REM Loop Prompts 
	cd "%project_name%"
	if not exist "!folder[%%n]!" mkdir "!folder[%%n]!" >> nul
	cd ..

	(for %%a in (%styles%) do ( 
	   cd "%project_name%"
           cd "!folder[%%n]!"
	   if not exist %%a mkdir %%a >> nul
	   cd ..
	   cd..
	   node cli.js --times %times% "!prompt[%%n]!" %%a 
	   call move "generated\*" "%project_name%\!folder[%%n]!"\"%%a\"
	   timeout %delay%
	   ECHO -------------------------------------------------------
	   ECHO -------------------------------------------------------
	))

)

GOTO :repeat



