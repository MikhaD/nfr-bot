# TO DO
- instead of a parameter to get rid of times to make copying easier have reactions below message
- multiple pages if there are more than 25 people absent
- Failed page with names of players who's data failed to get retrieved on reacting to ❗ if there are failed players
- store guild object with player data in database & fetch it if query is made again within the hour
- if commands have required arguments, check for those in index
- add guild stats/info command
- programatically create hashmap of guild prefixes to names. Update when a 3-4 letter user input is not in the hashmap
    - When the user enters a 3-4 letter name first check hashmap, then try api, if neither work, only then give guild not found error
- Seperate _utils.js into _fetchUtils, _formatUtils, imageUtils and any other apparent categories (may require some functions to be split up)
- Validate values like player names and guild names
- Rate limit API pings globally
- add testing suite
- changelog will eventually need multiple pages



## Treasury Functionality
- Paste wynntils screenshot of guild emeralds
    - Analyse image & extract number of emeralds
    - print confirmation message with balance and affirmitive / negative reaction options for them to confirm balance is correct
    - If you can't post a ss of the actual balance you need to post one of chat assigning the emeralds to yourself and type in your IGN -BAD OPTION

- Get balance

- Get transaction log

- withdraw <reason> (needs another chief reaction to be logged as an approved withdrawl)

- Withdrawl log

## Play time in guild
Track how many hours someone has spent online while in the guild

## Keep track of guild tomes
- commands to add someone to the list, change peoples position on the list, give them a tome etc.
- Generates a channel (or is assigned a channel) just for this