const { bold, italic } = require('@discordjs/builders');
const { Client, Message } = require('discord.js');
const templates = require('../templates');
const { getRandomGif } = require('../utils');

/**
 *
 * @param {Client} client
 */
module.exports = function(client) {
  /**
	 * Render Action Thread Message
	 *
	 * @param {import('../helpers/types').ActionMessage} actionMessage
	 */
  return async function(actionMessage) {
    try {
      // Get all members of role
      const guild = client.guilds.cache.get(actionMessage.guildId);
      await guild.members.fetch();
      const role = await guild.roles.fetch(actionMessage.roleId);

      const channel = guild.channels.cache.get(actionMessage.channelId);
      const thread = channel.threads.cache.get(actionMessage.actionMessageId);

      const usersInRole = role.members.map(m => m.user).filter(u => !u.bot);
      /** @type {Collection<Snowflake, Message>} */
      const messagesInThread = await thread.messages.fetch({ limit: 100 });
      const userIdsResponded = messagesInThread.map(m => m.author.id);

      // Get users who are yet to respond
      const usersPending = usersInRole.filter(u => !userIdsResponded.includes(u.id));

      const template = templates[actionMessage.templateId] ?? '\n';
      const today = new Date();
      const yyyy = today.getFullYear();
      let mm = today.getMonth() + 1; // Months start at 0!
      let dd = today.getDate();
      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;
      const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      let day = weekday[today.getDay()];
      const formattedToday = yyyy + '-' + mm + '-' + dd;

      if (usersPending.length === 0) {
        return `Welcome Technocrats Robotics to Weekly Update. (`+day+`: `+formattedToday+`)\n📑${bold(actionMessage.title)} ${role.toString()}\n${await getRandomGif()}`;
      }
      else {
        return `Welcome Technocrats Robotics to Weekly Update. (`+day+`: `+formattedToday+`)\n📑${bold(actionMessage.title)} ${role.toString()}${template}${italic('Pending:')}\n${usersPending.map(u => `:white_small_square: ${u.toString()}`).join('\n')}`;
      }
    }
    catch (error) {
      console.error(error);
      return '';
    }
  };
};
