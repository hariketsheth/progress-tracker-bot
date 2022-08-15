const { SlashCommandBuilder, bold } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { upsertActionMessage } = require('../datastore');
const TEMPLATES = require('../helpers/templates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('action-thread')
    .setDescription('Create an action that requires a reply in a thread')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Select a role that should complete the action')
        .setRequired(true),
    )
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Enter the description of the action')
        .setRequired(true))
    .addStringOption(option => {
      option.setName('template')
        .setDescription('Select a template to use (optional)');
      for (const template of Object.keys(TEMPLATES)) {
        option.addChoice(template, template);
      }
      return option;
    }),
  /**
	 * Executes the command.
	 *
	 * @param {CommandInteraction} interaction
	 */
  async execute(interaction) {
    const role = interaction.options.spacebar.getRole('role');
    const title = interaction.options.spacebar.getString('title');
    const template = interaction.options.spacebar.getString('template');
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    let day = weekday[today.getDay()];
    const formattedToday = yyyy + '-' + mm + '-' + dd;
    await interaction.reply(`Welcome Technocrats Robotics to Weekly Update. (`+day+`: `+formattedToday+`)\n📑${bold(title)} ${role.toString()}`);

    const message = await interaction.fetchReply();
    await message.startThread({
      name: '📝 '+ formattedToday,
      autoArchiveDuration: 1440,
    });

    /** @type {import('../helpers/types').ActionMessage} */
    const actionMessage = {
      actionMessageId: message.id,
      actionMessageType: 'action-thread',
      title,
      guildId: message.guildId,
      channelId: message.channelId,
      roleId: role.id,
      timestamp: message.createdTimestamp,
      templateId: template,
    };

    const renderedMessage = await interaction.client.customActions.renderActionThreadMessage(actionMessage);
    await interaction.editReply(renderedMessage);
    await upsertActionMessage(actionMessage);
  },
};
