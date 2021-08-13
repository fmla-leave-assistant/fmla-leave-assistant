
# FMLA Leave Assistant
### Team Members
* Jonny Graybill
* Lee-Roy King
* Austin Wood
* Adrienne Easton

### Description
* FMLA software designed to assist employees and administrators to provide accurate tracking of FMLA protected leave. 

### Problem Domain and Approach

* Currently, operators have no idea what their usage of FMLA is. Without this knowledge they do not know when they can or cannot take leave. This app is designed to provide employees peace of mind for getting their leave approved. From the administration side, pay adjustments for fmla leave are encoded by individuals on a biweekly basis equating to roughly 10% of their work week. This project will address these issues by, reducing the amount of time administrators spend organizing and annotating leave. Additionally this will give operators, visibility into and control of their FMLA leave.



### User Stories

#### Users
* As a user I want a clean interface  so that I understand what I need to do 
* As a user I want to be able to select my language preference so that I can better understand the content
* As a user I want to be able to clear access to clear accurate knowledge  so that I can plan my FMLA
* As a user I want easily navigate my pages so that I don't frustrated
* As a user I want my username to bring up my data so that I can track my data an ensure its accurate
* As a user I want to be able to view my remaining FMLA so that I can plan my FMLA

#### Developers
* As a developer I want clean easily readable code so that I can understand what's happening without depending on comments
* As a developer I want a well organized clear file tree so that I can easily navigate and connect all of the code 
* As a developer I want to make a functional intuitive front end so that I don't look like a joke
* As a developer I want a well structured database so that I can easily retrieve and update the data within it.

#### Admin 
As a admin I want be able to calculate accrued leave so that I can ensure they are properly paid
As a admin I want an easy to use interface so that the product actually gets used
As a admin I want to have multiple views so that I can see single employees or whole organizations data
As a admin I want to be able to see an employees data so that I can ensure complaince 


#### Management
* As a manager I want to see data rendered in an easy to understand view so that I can track patterns in that data.
* As a manager I want a product that reduces operational burden so that we save time as an organization


#### Conflict Resolution Plan

* Remember first and foremost we are all on the same team and we should maintain that good will and shared vision.
* Try to get conflicting parties to self remediate, if that fails then bring in a third member of the group to mediate. 
* If there is full on chaos we will delete the repo and then beg the instructor for mercy. 

## Scope: 
*MVP*
----------------
--Front end--
Customer page with week view
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


*Set up instructions*
---------------
* You need an excel style sheet following the format like the one linked in this repo
https://docs.google.com/spreadsheets/d/1xTi2w8NV6QqRjoZDyMrfwbSpBjjakBFJrIpPkCZ5UgI/edit#gid=0

* Which you will have to provide in the link on line 58 of server.js

* *The proper Database schema is located in data/schema.sql

* You will also need API keys for google (enabled for sheets as well as translate) in the .env as 
GOOGLE_API_KEY
GOOGLE_SHEETS_API

* As well as link the database with the following env variable name 
DATABASE_URL

* npm i will take care of the rest of the dependancies


* line 82 getSpreadSheet() will handle initial database population for the base_hours table but to avoid creating duplicate entries it should only be run once. 

*Dev notes:*
---------------
Per instructor request I am drawing your attention to the difference between the SQL on line 155 as compares to lines 250/260, 
lines 250/260 were written earlier in the project while we were less experienced with SQL and we would refactor the code to look more like line 155 (and save the lines of code that line does) if we had more time but we didn't think we would have time to debug that if we were to have implemented it as a general solution rather than where we did use line 155 as a solution to a specific bug.



*Frameworks*
---------------
* jquery
* fontawesome
* google fonts
* select2

*API endpoints*
---------------

* google translate 
* ${text} = 'text you want to translate'
* ${target} = 'two letter abbreviation for language examples can be found 'fullLanguageList.json' (this was populated with api calls but doing this programatically was out of scope)

* POST::https://translation.googleapis.com/language/translate/v2?q=${text}&key=${process.env.GOOGLE_API_KEY}&source=en&target=${target}
```
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
```
* working badge numbers in current live demo site:
```
88191
21931
94331
87385
24635
27093
42830
94548
98889
85061
97400
22503
14654
79797
64464
72853
78236
61112
17125
57176
81484
93824
47001
11016
53234
30400
57403
84171
10773
79548
27457
58180
72022
39875
4074
47802
71334
71509
15199
29401
95335
49815
4917
87438
26546
44295
75097
1222
24774
54783
59412
55640
27261
31973
60120
19418
49752
38987
26840
4945
80789
45465
63603
24764
9695
90751
77342
97733
956
11103
98581
```
