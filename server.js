const Config = require('./configs/config.json');

const Utility_Module = require('./modules/Utility');
const Utility = new Utility_Module();

const Database_Module = require('./modules/Database');
const Database = new Database_Module();

const SteamAPI_Module = require('./modules/SteamAPI');
const SteamAPI = new SteamAPI_Module(Config, Database);

const Discord_Module = require('./modules/Discord');
const Discord = new Discord_Module(Config);

const Screenshot_Module = require('./modules/Screenshot');
const Screenshot = new Screenshot_Module();

Discord.login();

Discord.events.on('error', (func, err) => {
    Utility.log('ERROR', 'Discord', func, err);
});

Discord.events.on('ready', () => {
    recursiveLoop();
    Utility.log('INFO', 'Discord', 'ready', 'Steam Ban Checker Initialized');
});

Discord.events.on('add', (argument, message) => {
    Utility.isValidSteamID(argument).then((validSteamID) => {
        if (validSteamID) {
            Database.getProfile(validSteamID).then((profile) => {
                if (profile) {
                    Discord.sendReply(message, 'This profile is already in the list!');
                } else {
                    SteamAPI.queryProfile(validSteamID, message);
                }
            }).catch((err) => {
                Utility.log('ERROR', 'Database', 'getProfile', err);
            });
        } else {
            Discord.sendReply(message, 'Invalid Argument.');
        }
    }).catch((err) => {
        Utility.log('ERROR', 'Utility', 'isValidSteamID', err);
    });
});

Discord.events.on('stats', (message) => {
    Database.getStats(message.author.tag).then((statistics) => {
        if (statistics) {
            const totalProfilesField = { name: 'Total Profiles', value: statistics.totalProfiles, inline: true};
            const bannedProfilesField = { name: 'Banned Profiles', value: statistics.bannedProfiles, inline: true };
            const percentageField = { name: 'Percentage', value: Math.round((statistics.bannedProfiles / statistics.totalProfiles) * 100) + '%', inline: true };
            const totalProfilesUserField = { name: 'Your Profiles', value: statistics.totalProfilesUser, inline: true };
            const bannedProfilesUserField = { name: 'Banned Profiles', value: statistics.bannedProfilesUser, inline: true };
            const percentageUserField = { name: 'Percentage', value: Math.round((statistics.bannedProfilesUser / statistics.totalProfilesUser) * 100) + '%', inline: true };
            Discord.sendReply(message, Discord.createStatsMessage('Steam Ban Checker Statistics', totalProfilesField, bannedProfilesField, percentageField, totalProfilesUserField, bannedProfilesUserField, percentageUserField));
        } else {
            Discord.sendReply(message, 'The database does not contain any profiles.');
        }
    }).catch((err) => {
        Utility.log('ERROR', 'Database', 'getStats', err);
    });
});

function recursiveLoop() {
    checkProfiles();
    setTimeout(recursiveLoop, ((1000 * 60) * (Config.General.checkInterval > 0 ? Config.General.checkInterval : 10)));
}

function checkProfiles() {
    Database.getTrackedProfiles().then((profiles) => {
        const queryChunks = Utility.chunkArray(profiles, 100);
        queryChunks.forEach((queryChunk) => {
            SteamAPI.queryProfileChunks(queryChunk);
        });
    }).catch((err) => {
        Utility.log('ERROR', 'INDEX', 'checkProfiles', err);
    });
}

SteamAPI.on('error', (func, err) => {
    Utility.log('ERROR', 'SteamAPI', func, err);
});

SteamAPI.on('info', (func, info) => {
    Utility.log('INFO', 'SteamAPI', func, info);
});

SteamAPI.on('ban', (type, player, user, date) => {
    Utility.log('INFO', 'SteamAPI', 'Ban', `Profile: ${player.SteamId} Type: ${type}`);

    const typeCommunity = (type == 'community') ? true : false;
    const updateData = { CommunityBanned: player.CommunityBanned, VACBanned: player.VACBanned, NumberOfVACBans: player.NumberOfVACBans, NumberOfGameBans: player.NumberOfGameBans, Tracked: typeCommunity };
    Database.updateProfile(player.SteamId, updateData);
    
    const profileURL = SteamAPI.profileURL + player.SteamId;

    const profileField = { name: 'Profile-URL', value: profileURL};
    if (!user.includes('#')) {
        let temp = user;
        user = `<@${temp}>`;
    }
    const userField = { name: 'Added By', value: user, inline: true };
    const dateField = { name: 'Added On', value: Utility.toUTC(date), inline: true };

    if (typeCommunity) {
        const messageEmbed = Discord.createBanMessage('A profile just got community banned!', profileField, userField, dateField);
        Discord.sendMessage(messageEmbed);
    } else {
        var message;
        if (type == 'vac') {
            message = 'A profile just got VAC banned!';
        } else if (type == 'vac_multiple') {
            message = 'A profile just got VAC banned again!';
        } else if (type == 'game') {
            message = 'A profile just got game banned!';
        } else if (type == 'game_multiple') {
            message = 'A profile just got game banned again!';
        }

        const messageEmbed = Discord.createBanMessage(message, profileField, userField, dateField);

        if (Config.Screenshot.saveScreenshot) {
            Screenshot.saveProfile(profileURL, player.SteamId).then((imagePath) => {
                if (imagePath && Config.Screenshot.sendScreenshot) {
                    const messageEmbedImage = Discord.createBanMessage(message, profileField, userField, dateField, imagePath);
                    Discord.sendMessage(messageEmbedImage);
                } else {
                    Discord.sendMessage(messageEmbed);
                }
            }).catch((err) => {
                Utility.log('ERROR', 'Screenshot', 'saveProfile', err);
                Discord.sendMessage(messageEmbed);
            });
        } else {
            Discord.sendMessage(messageEmbed);
        }
    }
});

SteamAPI.on('playerdata', (playerData, message) => {
    Database.addProfile(playerData).then(() => {
        Discord.sendReply(message, 'The profile was successfully added to the list!');
    }).catch((err) => {
        Utility.log('ERROR', 'Database', 'addProfile', err);
    });
});

Database.events.on('error', (func, err) => {
    Utility.log('ERROR', 'Database', func, err);
});