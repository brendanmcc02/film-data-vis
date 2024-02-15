# *FILM DATA VIS*
*A project to fetch and visualise the film data on my IMDB account.*

### Project motivation

I love films, so it was clear to me that if I was going to do a programming project, 
it would be about cinema. I am also interested in Data Analytics, so I wanted to something in this area. 
It then became clear to me that I wanted to do some project that involved 
visualising the data from my IMDB account.

### How it works

#### Backend

The backend is run entirely within Node.js. My film data is fetched
by web scraping (using cheerio.js) and put into a .json file. I have a script
(updateDB.sh) that runs every day at a specific time (cron-job): the function
of this script is to check if I have added any new films to my account, 
changed my ratings of certain films, or if the film data (e.g. IMDB rating) 
has changed.

<img src="misc/node.png" width="110px" alt=""></img>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="misc/cheerio.png" width="70px"></img>

There is a heavy amount of error handling built into my update script. I have a file 
called metadata.json that reports if the daily update went ok, what time it ran at, etc.
If there was an error, it will write the error to this file.

#### Frontend

For the graphs I used chart.js, mainly for it's ease of use. All of my graphs 
were presented on a simple yet slick website developed with HTML & CSS. To view 
the website, either clone the repository then navigate to web/index.html, or view the 
demonstration here: https://youtu.be/rDdA2xyiqk8.

<img src="misc/chartjs.png" width="274x" alt=""></img>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="misc/html-css.png" width="150px"></img>

### Project Duration

This was a project I technically started in early 2022, however I have dropped it 
and stopped working on it for many months. Over the two years, I would say that I worked consistently on 
the project for about four or five months.
