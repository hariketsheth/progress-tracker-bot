const { MessageReaction, User } = require('discord.js');
const { getActionMessageById } = require('../datastore');

module.exports = {
  name: 'messageReactionAdd',
  /**
	 * Executes the command.
	 *
	 * @param {MessageReaction} reaction
	 * @param {User} user
	 */
  async execute(reaction, user) {
    if (reaction.partial) {
      try {
        await reaction.fetch();
      }
      catch (error) {
        console.error(error);
        return;
      }
    }
    if (!user.bot) {
      const actionMessage = await getActionMessageById(reaction.message.id);
      if (actionMessage) {
        if (actionMessage.actionMessageType === 'action-react') {
          const renderedMessage = await reaction.client.customActions.renderActionReactMessage(actionMessage);
          reaction.message.edit(renderedMessage);
        }
        else if (actionMessage.actionMessageType === 'action-poll') {
          const renderedMessage = await reaction.client.customActions.renderActionPollMessage(actionMessage);
          reaction.message.edit(renderedMessage);
        }
      }
    }
  },
};
