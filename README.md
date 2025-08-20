<h1 align='center'>FeedPlayer + Swiper - For Images, Video&nbsp;and&nbsp;Text</h1>

<!-- Image and link icon to https://video-player-sahilatahar.netlify.app

[![video-player](https://github.com/sahilatahar/Video-Player/assets/100127570/8315e5d3-9b16-4b37-a50c-141a96f2e72e)](https://video-player-sahilatahar.netlify.app/)
-->
<br>
Simple example of [embedding player](embed-player.html) and [Discord Placeholders](#members=discord)

Welcome to our FeedPlayer React Project! This project provides a modern and user-friendly interface for viewing a series of images and video pulled from RSS, JSON, CSV and YAML. The UI is built using Vite, ReactJS, HTML, CSS, and JavaScript. The Feed-Player is designed to be fully responsive and packed with a range of features to enhance your viewing experience with filmstrip navigation using [swiper](https://github.com/modelearth/swiper).

<!-- https://video-player-sahilatahar.netlify.app -->

<!-- [Check out the Live Preview](intro.html) -->
[Check out the FeedPlayer](https://dreamstudio.com/feed/) and [Swiper](https://dreamstudio.com/home/) on DreamStudio.com.

## Feed Samples

[Our FeedPlayer Google Sheet](https://docs.google.com/spreadsheets/d/1jQTlXWom-pXvyP9zuTcbdluyvpb43hu2h7anxhF5qlQ/edit?usp=sharing) provides the APIs loaded. 
[View the feed json directly](view) - The FeedPlayer is being designed to convert APIs, JSON and .CSV into video-like presentations.
[Bluesky RSS Feeds](view/#list=bsky) - Click "Turn on CORS passthrough". &nbsp;[About Bluesky RSS](https://bsky.app/profile/todex.bsky.social/post/3kj2xcufu5q2q).

<!-- [JSON for video, image and feed links](src/Data/data.js) -->


In a React app built with Vite (or similar tools like Webpack), the src folder itself is not copied to the dist folder. Instead:

✅ What Happens:
The src folder contains source files (e.g. .jsx, .tsx, .js, .ts, .css, etc.).

During the build process (vite build), these files are compiled, bundled, and optimized.

The output (e.g. minified JS, CSS, static assets) goes into the dist folder.

Only what is explicitly imported or referenced in the code gets included in dist.

We'll provide several displays (list, gallery) similar to the [team repo API pull](/team/projects/)

## Team Projects

Project Lead: Sagar <!-- Noon and 4pm -->

[Feed Player Projects](https://github.com/ModelEarth/feed/issues)  
[Active Projects](https://github.com/ModelEarth/projects/issues)

## Features

&#9658; &nbsp; Play/Pause: Easily start and pause the playback with a single click.  
&#9632; &nbsp; Stop: Stop the feed playback and reset it to the beginning.  
🔊 &nbsp; Volume Control: Adjust the volume level to your preference by increasing or decreasing the volume.  
🔇 &nbsp; Mute: Quickly mute or unmute the feed's audio with the mute button.  
&#9970; &nbsp; Full-Screen: Enjoy your videos in full-screen mode for an immersive viewing experience.  
&#9202; &nbsp; Remaining Time: The FeedPlayer will display the remaining time of the current feed.  
&#9654; &nbsp;Navigation: Seamlessly navigate to the next or previous item in the playlist.  
&#128250; &nbsp; Play by URL: Paste a feed URL to play any valid feed format directly from the web. (Coming soon)

## New UI and Controls

The Feed-Player interface that is both visually appealing and intuitive to use. The controls have been thoughtfully designed by to provide easy access to the various functionalities while keeping the user experience smooth and engaging.

## Getting Started

To contribute, fork these 3 repos (and sync often):
[localsite](https://github.com/ModelEarth/localsite)
[feed](https://github.com/ModelEarth/feed)
[swiper](https://github.com/ModelEarth/swiper)

Then clone into your website root using Github Desktop.

If you're NOT making code updates, you can clone without forking using these commands:

      git clone https://github.com/[your account]/localsite.git
      git clone https://github.com/[your account]/feed.git
      git clone https://github.com/[your account]/swiper.git

Run the [start site command](https://dreamstudio.com/localsite/start/steps/) in your website root to view locally at [http://localhost:8887/feed](http://localhost:8887/feed) 

      python -m http.server 8887

### The primary FeedPlayer pages will be visible here:

[FeedPlayer - localhost:8887/feed](http://localhost:8887/feed/)
[Feed API View - localhost:8887/feed/view](http://localhost:8887/feed/view/)

### Folders in your website root

```ini
website
├─ home
├─ localsite
├─ swiper
└─ feed
   ├─ README.md
   ├─ dist
   ├─ src
   ├─ view
   ├─ package.json
   ├─ vite.config.js
   └─ .gitignore
```

Also see the [MemberSense directory structure](membersense).

## Edit and build the "feed" project locally

### 1. Navigate into the feed directory:

```
cd feed
```

If you don't have yarn yet, install it with `npm install --global yarn`
You can check if you have yarn with `yarn --version`

### 2. Install the required dependencies:

Check if yarn is installed:

```
yarn --version
```

Install yarn if you don't have it yet:

```
npm install --global yarn
```

Install the required dependecies:

```
yarn
```

If the package-lock.json file change significantly, revert and
try this yarn install command:

```
yarn install --immutable --immutable-cache --check-cache
```

The command above requires yarn 2 and prevents third-parties from altering the checked-in packages before submitting them. [Source](https://stackoverflow.com/questions/58482655/what-is-the-closest-to-npm-ci-in-yarn).  
It's the equivalent to `npm ci` to avoid updating package-lock.json, which occurs with `npm install`.

### 3. Build the app to the dist folder

```
yarn build
```

Now refresh the current page locally to see the results.
If you haven't, [start a server in your webroot](https://model.earth/start/steps/) containing the feed folder. Use port 8887.

### 4. Start a development server (not recommended)

<!--Skip this step. Port 5173 does not currently work because the files are looking for a base path containing "feed".-->

```
yarn dev
```

Better to avoid "yarn dev" and instead view at [http://localhost:8887/feed/](http://localhost:8887/feed/) after building.

<!--
Since we might include /feed in the base path, the FeedPlayer may not always work at: [localhost:5173/dist](http://localhost:5173/dist/)
-->


You can view at either: [http://localhost:8887/feed](http://localhost:8887/feed/) or [http://localhost:8887/feed/dist](http://localhost:8887/feed/dist)


## Deploy for Review using Github Pages

Deploy to your fork on GitHub and turn on GitHub Pages for localsite and feed.

Your updates can now be reviewed at:

https://[your account].github.io/feed  
https://[your account].github.io/feed/dist

## About model.earth localsite navigation

We included [localsite navigation](https://model.earth/localsite/) using the following two lines. It's non-relative so changes to the base path won't break the nav. [Source](https://model.earth/localsite/start/).
Another option would be to add localsite as a [submodule](https://model.earth/localsite/start/submodules) or add the localsite github path to the package.json file.

      <link type="text/css" rel="stylesheet" href="https://model.earth/localsite/css/base.css" id="/localsite/css/base.css" />
      <script type="text/javascript" src="https://model.earth/localsite/js/localsite.js?showheader=true"></script>

## Technologies Used

- ReactJS: Building the user interface and managing component-based architecture.
- Vite: Fast and lightweight frontend tooling for development.
- HTML: Structuring the content and layout of the video player.
- CSS and SCSS: Styling the UI components and ensuring responsiveness.
- JavaScript: Adding interactivity and logic to the video player functionality.

Vite is preferable to Create React App (CRA) because Vite does not rebuild the whole app whenever changes are made. It splits the app into two categories: dependencies and source code. Dependencies do not change often during the development process, so they are not rebuilt each time thanks to Vite.

## Development

### Build Commands

- **`yarn build`** - Standard build (feed app only)
- **`yarn build:full`** - Build with LocalSite integration (pulls latest from GitHub)

### LocalSite Integration

The `yarn build:full` command pulls the entire [LocalSite repository](https://github.com/ModelEarth/localsite) into `dist/localsite/` for navigation integration. The LocalSite files are:
- ✅ **Not stored** in the feed repository 
- ✅ **Git-ignored** (`dist/localsite/` in `.gitignore`)
- ✅ **Always fresh** from the latest GitHub commit
- ✅ **Available at** `http://localhost:8887/dist/localsite/` after build

Use `yarn build:full` for production deployments that need LocalSite navigation components.

## Contributions

Contributions to the [Feed-Player Github Repo](https://github.com/modelearth/feed/) are welcome! If you have any improvements, bug fixes, or additional features in mind, feel free to fork this repository, make your changes, and submit a pull request.

## License

This project is licensed under the [MIT License](https://github.com/ModelEarth/feed/blob/main/LICENSE),  
which means you are free to use, modify, and distribute the code as you see fit.

---

We hope you enjoy using the Feed-Player!

If you have any questions, requests or feedback, please post an issue in our
[FeedPlayer repo](http://github.com/modelearth/feed) or the parent [Video Player repo](https://github.com/sahilatahar/Video-Player).

Happy feed viewing! 🎥🍿
