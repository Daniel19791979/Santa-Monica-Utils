require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const express = require('express');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

client.commands = new Collection();

// Load commands
const folders = fs.readdirSync('./commands');
for (const folder of folders) {
  const files = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
  for (const file of files) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
  }
}

// Load events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Keep-alive web server
const app = express();
app.get('/', (req, res) => res.send('Santa Monica Utils bot is running!'));
app.listen(process.env.PORT || 3000, () => console.log('Web server running.'));

client.login(process.env.TOKEN);
