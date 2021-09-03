const path = require("path");
const config = require(path.join(__dirname, "../../config.json"));
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const pages = [
  "https://cdn.discordapp.com/attachments/881871227029979139/881881208680771604/image0.png",
  "https://cdn.discordapp.com/attachments/881871227029979139/881896623477772358/Screenshot_2021-08-30_at_14.38.23.png",
  "https://cdn.discordapp.com/attachments/881871227029979139/881896625855934544/Screenshot_2021-08-30_at_14.38.44.png",
  "https://cdn.discordapp.com/attachments/881871227029979139/881896633598640128/Screenshot_2021-08-30_at_14.38.53.png",
  "https://cdn.discordapp.com/attachments/881871227029979139/881896645523030096/Screenshot_2021-08-30_at_14.39.01.png",
  "https://cdn.discordapp.com/attachments/881871227029979139/881896650728144946/Screenshot_2021-08-30_at_14.39.09.png",
  "https://cdn.discordapp.com/attachments/881871227029979139/881896730482860052/Screenshot_2021-08-30_at_14.39.21.png",
  "https://cdn.discordapp.com/attachments/881871227029979139/881896744311468092/Screenshot_2021-08-30_at_14.39.29.png",
  "https://cdn.discordapp.com/attachments/881871227029979139/881896758421118976/Screenshot_2021-08-30_at_14.39.38.png",
  "https://cdn.discordapp.com/attachments/881871227029979139/881896772941795429/Screenshot_2021-08-30_at_14.39.45.png",
  "https://cdn.discordapp.com/attachments/881871227029979139/881896792638226493/Screenshot_2021-08-30_at_14.39.52.png",
  ]
const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('previous')
        .setLabel('Previous page')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('next')
        .setLabel('Next page')
        .setStyle('PRIMARY')
    );
module.exports = {
	name: "lore",
	aliases: ["nfrlore"],
	args: {},
	description: "Browse through the book of NFR lore",
	example: "lore",

	execute(msg, args) {
    var currentpage = 0;
    var bookembed = new MessageEmbed()
      .setColor(config.colors.default)
      .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      .setImage(pages[currentpage])

    msg.channel.send({embeds:[bookembed],components:[row]}).then(message => {
      
      const collector = message.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 });
      collector.on('collect', i => {
        if (i.customId==="next"){
          currentpage=currentpage+1;
          if(currentpage>pages.length-1){
            currentpage=0;
          }
          if(currentpage<0){
            currentpage=pages.length-1;
          }
          bookembed.setImage(pages[currentpage]);
          i.update({embeds:[bookembed]})
        }
        if (i.customId==="previous"){
          currentpage=currentpage-1;
          if(currentpage>pages.length-1){
            currentpage=0;
          }
          if(currentpage<0){
            currentpage=pages.length-1;
          }
          bookembed.setImage(pages[currentpage]);
          i.update({embeds:[bookembed]})
        }
      });

      collector.on('end', collected => {
        console.log(`Collected ${collected.size} interactions.`);
      });
    });

	}
};