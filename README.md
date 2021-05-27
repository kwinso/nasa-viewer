# NASA Viewer
See photos from Mars taken with NASA Rovers.  
Original bot link: https://t.me/nasa-viewer

# Setup
### Code
```bash
# clone this repo
git clone https://github.com/uwumouse/nasa-viewer.git
# install deps
npm i
```
### Env.   
Change `.example.env` file into `.env` and then replace all values in it with yours.   
Fields are pretty self-explained.  
- Where to get NASA API Key? [Here](https://api.nasa.gov/)
- Where to get BOT Token? [Here](https://t.me/botfather)

# Building
```
npm run build
```
# Running
You should build the bot before running this
```bash
npm run start # starts a dist/bot.js file
```

# Dev
```bash
npm run dev # Run without compiling (using ts.node)
npm run dev:watch # Start without compiling and with watching for files change
```