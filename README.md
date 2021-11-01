
![](https://raw.githubusercontent.com/MikhaD/nfr-bot/main/images/nfr-bot.png)

<div align="center">
	<a href="https://discord.gg/55XKx6mPuK">
		<img alt="Discord" src="https://img.shields.io/discord/739428526431666237?label=Nefarious%20Ravens&logo=discord&logoColor=ffffff&color=5865F2">
	</a>
	<img alt="version" src="https://img.shields.io/github/package-json/v/MikhaD/nfr-bot/stable?color=992699&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDYgNiI%2BPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTMsMGwyLDBsMCwxbDEsMGwwLDFsLTIsMGwwLDFsLTEsMGwwLDJsMSwwbDAsMWwtMiwwbDAsLTJsLTEsMGwwLC0xIGwtMSwwbDAsLTFsMiwwbDAsLTFsMSwweiIvPjwvc3ZnPg%3D%3D">
</div>

---

A utility discord bot for displaying information from the Wynncraft API, written in Javascript using [discord.js](https://github.com/discordjs/discord.js)

## Invite

While originally developed for the guild [Nefarious Ravens](https://forums.wynncraft.com/threads/%E2%9C%AE%E2%9C%AE-nefarious-ravens-lvl-76-community-warring-guild.294350/), I do intend to make it open to the public, hopefully with version 4.0.0.

You can invite it [here]()

scopes are bot and applications.commands

### Dev
Files and directories starting with _ are ignored by the command parser. Commands in the dev directory are ignored by the help command.

`MessageObject` is a special class meant to replace the object typically sent by methods like `channel.send` and `interaction.followUp`. It along with `Embed` and `EmbedChapter` allow you to create multi page embeds, and add more than 25 fields to embeds.
In order to create a multi page embed or allow an embed with more than 25 fields to have buttons create a `MessageObject`, add the embeds using `.addPage`, send the `MessageObject` and then call the `MessageObject.prototype.watchMessage` on the message returned by the send command.

**Example**
```javascript
const msg = new MessageObject();

msg.addPage(new Embed("Page 1", "this is page 1"));
msg.addPage(new Embed("Page 2", "this is page 2"));
msg.addPage(new Embed("Page 3", "this is page 3"));

msg.watchMessage(await interaction.followUp(msg));

```