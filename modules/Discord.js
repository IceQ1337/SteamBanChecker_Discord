const Discord = require("discord.js");
const Events = require('events');
const Path = require('path');

const authorImageURL = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/75/753bd236bb93a2484807ba75a3dbb916441825bc_full.jpg';

module.exports = function(Config) {
    this.client = new Discord.Client();
    this.events = new Events.EventEmitter();

    this.login = () => {
        const _this = this;
        _this.client.login(Config.Discord.botToken);
    };

    this.client.on('error', (err) => {
        const _this = this;
        _this.events.emit('error', 'error_event', err);
    });

    this.client.on('ready', () => {
        const _this = this;
        _this.events.emit('ready');
    });

    this.client.on('message', (message) => {
        const _this = this;

        if (!Config.Discord.allowBotCommands && message.author.bot) return;
        if (message.content.indexOf(Config.Discord.botCommandPrefix) !== 0) return;

        const channelType = message.channel.type;
        const channelName = message.channel.name;
        const channelID = message.channel.id;

        const inputChannel = Config.Discord.botChannelInput;
        if (channelType != 'text' || !channelName || (!Array.isArray(inputChannel) && channelID != inputChannel) || (Array.isArray(inputChannel) && !inputChannel.includes(channelID))) return;

        if (!Config.Discord.accessRole || message.member.roles.cache.some(role => role.name === Config.Discord.accessRole)) {
            const arguments = message.content.slice(Config.Discord.botCommandPrefix.length).trim().split(/ +/g);
            const command = arguments.shift().toLowerCase();

            const addCommand = Config.Discord.botCommand ? Config.Discord.botCommand : 'add';
            if (command === addCommand) {
                const argument = arguments.join(' ');
                _this.events.emit('add', argument, message);
            }

            if (command === 'stats') {
                _this.events.emit('stats', message);
            }
        } else {
            return message.reply(`You don't have permissions to use this command!`);
        }
    });

    this.createBanMessage = (messageTitle, profileField, userField, dateField, imagePath) => {
		var messageEmbed = new Discord.MessageEmbed()
		.setColor('#ff0000')
		.setTitle(messageTitle)
		.addFields(profileField, userField, dateField)
		.setTimestamp()
		.setFooter('SteamBanChecker by IceQ1337', authorImageURL);
			
        if (imagePath) {
			messageEmbed.attachFiles([imagePath]);
            messageEmbed.setImage('attachment://' + Path.parse(imagePath).base);
		}
		
		return messageEmbed;
    };

    this.createStatsMessage = (messageTitle, totalProfilesField, bannedProfilesField, percentageField, totalProfilesUserField, bannedProfilesUserField, percentageUserField) => {
        return new Discord.MessageEmbed()
        .setTitle(messageTitle)
        .addFields(totalProfilesField, bannedProfilesField, percentageField, { name: '\u200B', value: '\u200B' }, totalProfilesUserField, bannedProfilesUserField, percentageUserField)
        .setTimestamp()
        .setFooter('SteamBanChecker by IceQ1337', authorImageURL);
    };

    this.sendReply = (message, messageText) => {
        message.reply(messageText);
    };

    this.sendMessage = (messageText) => {
        const _this = this;
        const targetChannel = (Config.Discord.botChannelOutput ? Config.Discord.botChannelOutput : Config.Discord.botChannelInput);

        if (Array.isArray(targetChannel)) {
            targetChannel.forEach((channel) => {
                _this.client.channels.cache.get(channel).send(messageText).catch((err) => _this.events.emit('error', 'sendMessage', err));
            });
        } else {
            _this.client.channels.cache.get(targetChannel).send(messageText).catch((err) => _this.events.emit('error', 'sendMessage', err));
        }
    };
}