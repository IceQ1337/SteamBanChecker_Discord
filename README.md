# [Steam Ban Checker](https://github.com/IceQ1337/SteamBanChecker) for Discord
[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/uses-js.svg)](https://forthebadge.com)  

As requested by many people, the [Steam Ban Checker](https://github.com/IceQ1337/SteamBanChecker) is now also available with Discord integration.

## [Telegram Version](https://github.com/IceQ1337/SteamBanChecker) | [Discord Version](https://github.com/IceQ1337/SteamBanChecker_Discord)

## Requirements
In order to use this script, you need the following dependencies and tokens:

- Node.js: https://nodejs.org/en/ 
  - Compatible with Version 12 and 13
- Steam API Key: https://steamcommunity.com/dev/apikey
- Discord Bot Token: https://discordapp.com/developers/applications
- Discord Channel ID: [Retrieve your Discord Channel ID](#retrieve-your-discord-channel-id)

### Dependencies
- Linux: `fontconfig` or `libfontconfig`, depending on the distribution  
  - If you don't get any screenshots, try `apt install phantomjs` instead

## Installation
- Make sure you have the latest version of [Node.js](https://nodejs.org/) installed.
- Download this repository as [ZIP](https://github.com/IceQ1337/SteamBanChecker_Discord/archive/master.zip) and unpack it wherever you like.
- Go into the `configs` folder and rename `config.json.example` to `config.json`
- Edit `config.json` and fill in your **Steam API Key**, **Discord Bot Token** and **Discord Channel ID**
- Type `npm install` into your console of choice to install all necessary Node.js dependencies
- Type `npm start` or `node server.js` to start the script.
  - To find out how to run the script permanently on a server you should check out [forever](https://github.com/foreversd/forever).

**Make sure you have everything set up properly and your config is valid without missing information!**  

## Updating
In most cases, files only need to be overwritten, renamed or moved, but this project has **no guaranteed backward compatibility** and if the file structure changes during an update, a local installation must be manually adjusted. The only files that will remain compatible at all times are database files if not otherwise stated.

## Configuration
```Javascript
{
	"General": {
		"checkInterval": 10 // Check-Interval in Minutes
	},
	"Steam": {
		"apiKey": "STEAM API KEY"
	},
	"Discord": {
		"botToken": "DISCORD BOT TOKEN",
		"botChannelInput": "DISCORD CHANNEL ID",
		"botChannelOutput": "",
		"botCommandPrefix": "!",
		"allowBotCommands": false,
		"accessRole": ""
	},
	"Screenshot": {
		"saveScreenshot": true, // Take & Save Screenshots of Banned Profiles
		"sendScreenshot": true // Embed Screenshots in Discord Messages
	}
}
```

- `botChannelInput` can be an array of multiple channels.
- `botChannelOutput` is optional. If empty, messages will be sent to the Input Channel.
- `accessRole` is optional. If empty, everybody is allowed to use commands.

## Usage
#### Adding Profiles
- Use `/add <steamID64|profileURL>` to add profiles to the list.
  - Examples:
    - `/add 12345678912345678`
	- `/add http://steamcommunity.com/profiles/12345678912345678`
    - `/add https://steamcommunity.com/id/customURL`

To get the steamID64 or URL of a profile you can use websites like [STEAMID I/O](https://steamid.io/).  

#### View Statistics
Type `/stats` to view global and personal statistics.

## Additional Information
### Retrieve your Discord Channel ID
In order to retrieve a unique Discord Channel ID, do as follows:
- Open your Discord Settings and click on the **Appearance** tab.
- In this tab, enable `Developer Mode`.
- Go into your Discord Server and right-click the channel to copy its id.
  - The context menu item will not be visible if Developer Mode is disabled.

### Contributing
There are currently no contributing guidelines, but I am open to any kind of improvements.  
In order to contribute to the project, please follow the **GitHub Standard Fork & Pull Request Workflow**

- **Fork** this repository on GitHub.
- **Clone** the project to your own machine.
- **Commit** changes to your own branch.
- **Push** your work to your own fork.
- Submit a **Pull Request** so I can review your changes

### Used Node.js Modules
- [Discord.js](https://github.com/discordjs/discord.js/)
- [NeDB](https://github.com/louischatriot/nedb)
- [Request](https://github.com/request/request)
- [Webshot (Fixed Version)](https://github.com/architjn/node-webshot)
- [XML2JS](https://github.com/Leonidas-from-XIV/node-xml2js)
- [SteamID](https://github.com/DoctorMcKay/node-steamid)

### Donating
If you find this script useful, you can support me by donating items via steam.  
[Steam Trade Link](https://steamcommunity.com/tradeoffer/new/?partner=169517256&token=77MTawmP)

### License
[MIT](https://github.com/IceQ1337/SteamBanChecker_Discord/blob/master/LICENSE)
