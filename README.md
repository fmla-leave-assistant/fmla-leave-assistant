
The name of the project  # fmla-leave-assistant
Names of the team members
-Jonny Graybill
-Lee-Roy King
-Austin Wood
-Adrienne Easton
-Peter Murphy


A description of the project
-FMLA software designed to assist employees and administrators to provide accurate tracking of FMLA protected leave. 

The overall problem domain and how the project solves those problems

-Currently, operators have no idea what their usage of FMLA is. Without this knowledge they do not know when they can or cannot take leave. This app is designed to provide employees peace of mind for getting their leave approved. From the administration side, pay adjustments for fmla leave are encoded by individuals on a biweekly basis equating to roughly 10% of their work week. This project will address these issues by, reducing the amount of time administrators spend organizing and annotating leave. Additionally this will give operators, visibility into and control of their FMLA leave.


A list of any libraries, frameworks, or packages that your application requires in order to properly function

Instructions that the user may need to follow in order to get your application up and running on their own computer

Clearly defined API endpoints with sample responses

Clearly defined database schemas







User Stories

Users
As a user I want a clean interface  so that I understand what I need to do 
As a user I want to be able to select my language preference so that I can better understand the content
As a user I want to be able to clear access to clear accurate knowledge  so that I can plan my FMLA
As a user I want easily navigate my pages so that I don't frustrated
As a user I want my username to bring up my data so that I can track my data an ensure its accurate
As a user I want to be able to view my remaining FMLA so that I can plan my FMLA

Developers
As a developer I want clean easily readable code so that I can understand what's happening without depending on comments
As a developer I want a well organized clear file tree so that I can easily navigate and connect all of the code 
As a developer I want to make a functional intuitive front end so that I don't look like a joke
As a developer I want a well structured database so that I can easily retrieve and update the data within it.

Admin 
As a admin I want be able to calculate accrued leave so that I can ensure they are properly paid
As a admin I want an easy to use interface so that the product actually gets used
As a admin I want to have multiple views so that I can see single employees or whole organizations data
As a admin I want to be able to see an employees data so that I can ensure complaince 


Management
As a manager I want to see data rendered in an easy to understand view so that I can track patterns in that data.
As a manager I want a product that reduces operational burden so that we save time as an organization


Conflict plan

Try to get conflicting parties to self remediate, if that fails then bring in a third member of the group to mediate. 
If there is full on chaos we will delete the repo and then beg the instructor for mercy. 

If you are pissed you should play a game.

Anyone can tell anyone else to take five. 

Remember first and foremost we are all on the same team and we should maintain that good will and shared vision.

No one is here trying to break stuff, we are all here working towards the same goal. 

If Lee is trying to boss everyone around, tell him to take five and chill tf out. (~Lee wrote this)

To address members who may not be contributing we will in a non-accusatory manor inform that member that more work is expected of them and then encourage and support them in order to make that happen.

Communication plan 

Cell phones / slack 
-text to check slack but most information should be passed through slack
after hours communication is okay but there is no expectation of checking slack or phones outside of specified hours.
6:30 - 9:30 pm working hours (regular class hours) 
Safe environment - reference conflict plan
Everyone will talk everyday

Scope 
*MVP*
----------------
--Front end--
Customer page w/ week view
Login

--API--
translate
google sheets

--Database--
Spreadsheet imported
users exist
schema 

--Server--
Send what the front end needs 


*Stretch Goals*
---------------

--Front end--
Administrator view
drop spreadsheet in admin view either link or paste in
password works (md5 hash thangs)
adjustable view (week month year etc)

--APIS --
google calendar
mock data api

--Database--
actually validates log in


------------Set up instructions-----------

You need an excel style sheet following the format like the one linked in this repo
https://docs.google.com/spreadsheets/d/1xTi2w8NV6QqRjoZDyMrfwbSpBjjakBFJrIpPkCZ5UgI/edit#gid=0

Which you will have to provide in the link on line 58 of server.js

The proper Database schema is located in data/schema.sql

You will also need API keys for google (enabled for sheets as well as translate) in the .env as 
GOOGLE_API_KEY
GOOGLE_SHEETS_API

As well as link the database with the following env variable name 
DATABASE_URL

npm i will take care of the rest of the dependancies


Dev notes:
Per instructor request I am drawing your attention to the difference between the SQL on line 155 as compares to lines 250/260, 
lines 250/260 were written earlier in the project while we were less experienced with SQL and we would refactor the code to look more like line 155 (and save the lines of code that line does) if we had more time but we didn't think we would have time to debug that if we were to have implemented it as a general solution rather than where we did use line 155 as a solution to a specific bug.



------Frameworks------
jquery
fontawesome
google fonts
select2

------API endpoints----------

google translate 
${text} = 'text you want to translate'
${target} = 'two letter abbreviation for language examples can be found 'fullLanguageList.json' (this was populated with api calls but doing this programatically was out of scope)

POST::https://translation.googleapis.com/language/translate/v2?q=${text}&key=${process.env.GOOGLE_API_KEY}&source=en&target=${target}

sample response:

response.body
{
    "data": {
        "translations": [
            {
                "translatedText": "Domingo Lunes Martes Miércoles Jueves Viernes Sábado"
            }
        ]
    }
}