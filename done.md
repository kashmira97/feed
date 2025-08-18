
Place your name here if you're working on an update.

A.) Have swiper load the first row from the Google Sheet since NASA feed only loads a few times.

B.) Add a quick fade between slides, about half a second.

1.) DONE: Provide the specific error than "No media available" for the second SeeClickFix link and others that don't load.  Add a CORS passthrough like we have in the view folder. - by snehit

2.) DONE: Pull the image and video links from a Google Sheet by implementing the Content/ContextGoogle.jsx page which pulls from this [Google Sheet](https://docs.google.com/spreadsheets/d/1jQTlXWom-pXvyP9zuTcbdluyvpb43hu2h7anxhF5qlQ/edit?usp=sharing) - By Gary

<!--
DONE: Add columns for Title and Description in the Google Sheet - Matt B
-->

3.) DONE: New swiper control and text that scrolls in player. - Shreyas

4.) DONE: When an image is narrower than the player, span 100% while retaining the image's ratio. Have the image slowly pan from the top to bottom when portions of it exceed the player height. - Karthik

5.) DONE: Show the progress bar for the feed images. Update the progress bar to include multiple clickable sections when there are sequences of images. We could tap Matt B. who worked with the progress bar previously. - Shreyas

6.) DONE: Membersense development and initial implementation using Discord API - Yunbo

<!-- 
Let's revisit this for a modile orienation.
DONE: Aspect ratio of video remains the same when showing landscape image.--><!--To prevent the video height from jumping short briefly: When setCurrentVideoSrc is called to advance the video, insert the current height until the next video loads. Remove the inserted height once the new slide video/image loads into the DOM. (The last video is an example with a different aspect ratio.)-->

7.) DONE: When reloading retain feed's hash in the URL, and display that feed.
To see bug, hit refresh for the following or load the link directly: 
[Hash example for SeeClickFix](#list=seeclickfix-311) - the hash values currently disappear when reloading. - [Rodrigo](https://github.com/devrodrigorpm)

8.) DONE: Load images into the FeedPlayer from our [pull from Github](../home/repo/). - Chethan

9.) DONE: Pull NASA feed into React FeedPlayer and show images. - Noopur

10a.) DONE: In Javascript feed/view page, pull in multiple Bluesky RSS feed links by passing in a pipe | separated list of feed urls. Add loop when pipes found in the url value in both JQuery feed/view - Noopur

10b.) TO DO: Check if pipeseperated works for any multi-feed pull [from our Google Sheet](https://docs.google.com/spreadsheets/d/e/2PACX-1vSxfv7lxikjrmro3EJYGE_134vm5HdDszZKt4uKswHhsNJ_-afSaG9RoA4oeNV656r4mTuG3wTu38pM/pub?gid=889452679&single=true&output=csv) splits on pipes in the React FeedPlayer to append multiple APIs. Update code if need and update documentation.

11.) IN PROGRESS: Pull the replies for each Bluesky post in the feed. Use the screen-grab technique that we use to grab images from news sites that are listed in the feed. Scrape the posts from the Bluesky website. Grab replies for the top 3 posts. If the process doesn't work, leave the attempt commented out. <!-- Noopur initially. This process worked initially on view page. Maybe Bluesky changed something? -->

12.) DONE: List of feeds on right of player with links to /feed/view/#list= - Kalyan

13.) DONE: Hide the "link icon" in the upper right unless a video is being viewed. - Jashwanth<!-- confirm-->

14.) DONE: Update Vite to make the player an embeddable widget. - Loren

In the existing code, we tried to automate copying the index-xxxxxxxx.js and index-xxxxxxxx.css files to feedplayer.js and feedplayer.css within [dist/assets](https://github.com/ModelEarth/feed/tree/main/dist/assets).  We replaced vite.config.js with vite.config-upcoming.js, but it's not working yet (the copy might run before the build completes).  Once generating a consistant .js and .css file name, edit feed/intro.html to use feedplayer.js and feedplayer.css (or whatever .js file name is standard for a Vite widget).  Also adjust so the widget can be played on the main feed/index.html page. Marco shared a link to [How to copy images in DIST folder from assets in Vite js](https://stackoverflow.com/questions/78076268/how-to-copy-images-in-dist-folder-from-assets-in-vite-js)

