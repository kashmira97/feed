[FeedPlayer](../)
# MemberSense Discord Integration

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white) ![SASS](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

DreamStudio's MemberSense Discord Integration is a modern, responsive web application that combines a video player with team member overviews and channel viewing capabilities. Our frontend-focused project showcases smooth transitions, fullscreen support, and interactive user interfaces.

Also see [Backend Setup](https://github.com/ModelEarth/members)

## Features

- 👥 Member Showcase with dynamic grid layout
- 💬 Discord-style Channel Viewer
- 🔐 Token-based authentication
- 🎥 Video Player / Swiper Integration
- 🖥️ Fullscreen mode with adaptive layout
- 🌓 Smooth transitions between views
- 🔍 Member search functionality
- 📱 Responsive design for various screen sizes
- 🔄 Demo/Production mode toggle

## Prerequisites for Users

To use the MemberSense Discord Integration in production mode, you need to set up your own Discord bot. Follow the steps below to create and configure your bot.

### Discord Bot Setup Guide

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click on "New Application" and give your application a name.
3. Click the "Bot" tab in the left sidebar. Click "Add Bot" if you don't have one yet.
4. Under the bot's username, click "Copy" to copy your bot token. Keep this token secret and secure.
5. Scroll down to the "Privileged Gateway Intents" section and enable all the checkboxes ("Presence Intent", "Server Members Intent" and "Message Content Intent").

Note: The OAuth2 URL generation is primarily for inviting the bot to a server. If you're adding the bot to your own server or have other means of adding it, you may skip steps 6-10.


<!--

Before Loren revised Aug 18, 2025

6. To invite the bot to your server, go to the "OAuth2" tab in the left sidebar.

7. In the "Scopes" section, select "bot" and you'll see these checkboxes:

8. In the "Bot Permissions" section under OAuth2, select the following permissions:
   - View Channels
   - View Server Insights
   - Send Messages
   - Read Message History
-->

6. Under left side nav "OAuth2 > OAuth2 URL Generator > Scopes", give the Bot these permissions:<!-- provided by claud.ai Aug 18, 2025 -->

guilds - Required to see which servers your bot/app has access to
guilds.members.read - Required to read member information from servers

<!-- Additional scopes you might need: -->
bot - If you're creating a bot application (most common for this use case)
messages.read  - If you need to read message history (though this requires additional permissions)


7. These "Bot Permissisons" checkboxes are REVEALED after checking the Scopes boxes above.

<!-- You can skip this and simply paste the integer 592896 -->

Copy the generated integer at the bottom of the page. 
The integer is generated from:

   - View Channels
   - View Server Insights
   - Send Messages
   - Read Message History


Probably leave as "Guide Install"

<!--
Also tried this without success:
In Discord, found the bot user, went to its profile, clicked Add App > Add to Server, selected the server and clicked Authorize.

If true (valid), include this text:
Additional base permissions might be needed depending on your specific use case.
-->



8. Open a new browser tab, paste the URL, and select the server <!-- model.earth for us --> where you want to add the bot.



For more detailed instructions, you can refer to the [official Discord.js guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html).


## Installation for Developers

To get started with the MemberSense Discord Integration frontend, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/ModelEarth/feed.git
   ```

2. Navigate to the project directory:
   ```
   cd feed
   ```

3. Install dependencies:
   ```
   yarn install
   ```

## Usage

To run the development server:

```
yarn dev
```

This will start the Vite development server, typically at `http://localhost:5173`.

To build the project for production:

```
yarn build
```

To preview the production build:

```
yarn preview
```

## Project Structure

The main components of the project are:

- `App.jsx`: The main application component that handles routing and view management.
- `MemberSense`: Handles authentication and provides access to member-related features.
- `MemberShowcase`: Displays member information in a grid layout with search functionality.
- `DiscordChannelViewer`: Simulates a Discord-like channel viewing experience.

## Directory Structure

Only main components for MemberSense are shown:

```
membersense/
├── src/
│   ├── components/          
│   │   └── MemberSenseComponents/       # Core MemberSense feature components
│   │       ├── DiscordChannelViewer/    # Channel and message viewing interface
│   │       │   ├── DiscordChannelViewer.jsx
│   │       │   └── DiscordChannelViewer.scss
│   │       │
│   │       ├── MemberSenseLogin/        # Authentication components
│   │       │   ├── MemberSense.jsx     # Main authentication component
│   │       │   └── MemberSense.scss    # Authentication styling
│   │       │
│   │       └── MemberShowcase/          # Member grid display
│   │           ├── MemberShowcase.jsx  # Member grid component
│   │           └── MemberShowcase.scss # Showcase styling
│   │
│   ├── services/           
│   │   └── DataService.js               # Unified data handling service
│   │       # Handles:
│   │       # - Production API calls
│   │       # - Mock data generation
│   │       # - Data transformation
│   │
│   └── App.jsx                         # Main application component
                                       # Integrates FeedPlayer and MemberSense
```
