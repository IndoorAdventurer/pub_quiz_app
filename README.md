# Goeman Pub Quiz App
The **Goeman Pub Quiz** is a highly interactive quiz platform built with `TypeScript`, `Node.js`, and `Express`. Inspired by Dutch TV game shows like *De Slimste Mens* and *The Connection*, it brings the excitement of these formats to a local setting — going far beyond standard multiple-choice and open-ended questions. Players take part in dynamic rounds featuring fast-paced recall, elimination-based progression, and collaborative jury scoring. After its debut event, the quiz received an overwhelmingly positive response from participants.

The following trailer/explainer video gives a good idea of how the game is played. It is in Dutch, but English subtitles are available: [![Pub Quiz Trailer/Explainer Video](https://img.youtube.com/vi/LhsiQ00HpBI/0.jpg)](https://www.youtube.com/watch?v=LhsiQ00HpBI)
## Installation
This project is created with `Node.js`. Make sure you have it installed before proceeding with the following steps:
1. Cloning the repository:
	```bash
	git clone git@github.com:IndoorAdventurer/pub_quiz_app.git
	cd pub_quiz_app
	```
2. Installing the dependencies:
	```bash
	npm install
	```
3. Building the project:
	```bash
	npm run build_server
	npm run build
	```
	Calling `npm run build_server` only needs to be done the first time you compile the project. To re-compile after any changes, simply call `npm run build`[^1].
4. Running all unittests (optional):
	```bash
	npm run test
	```
	Only check if all tests pass. Ignore any printed warnings: they are supposed to be there.
[^1]: `npm run build_server` transpiles most `Typescript` files into `Javascript`. We have to manually call it the first time, because `npm run build` depends on a `Javascript` file that would otherwise not exist yet.
## Hosting your own quizzes
With everything set up and ready to go, it is now time to host your first pub quiz! In this section, I will briefly explain how to create a quiz and run it on your server. I will assume your machine is reachable on `https://your.domain.net`. You can probably host it on any cloud provider. I, however, only tested it on a `Raspberry Pi`, using a dynamic domain name. See [this section](#hosting-on-a-raspberry-pi) for some helpful details.
### Creating a new quiz
To create a new quiz `my_quiz`, start with a folder structure like so:
```
my_quiz/
├─ config.json
└─ resources/
   ├─ some_picture.png
   ├─ some_video.webm
   └─ etc.
```
The configuration file `config.json` will contain all your questions and other settings. The `resources/` directory is for your media files. You can refer to these in the config file as, for example, `"/resources/some_picture.png"`.

You can use `quiztemplates/gametemplate.json` as a starting point for your configuration file. This template also contains instructions to help you on your way. Some notable fields are:
- **admin_name** and **admin_auth_code**, which will be your credentials to log in on the admin page from which you control the game.
- **port** is the `TCP` port to use. Most commonly 443 for `https` and 80 for `http`.
- **key_file** and **cert_file** are optional fields for your `https` configuration. If you do not specify them, the server will switch to `http`. Note, however, that this will inhibit some client-side functionality, such as keeping the screen awake.
- **gamestates** is the most important field. It will contain a list of all rounds and questions. See below.

Game states define the whole game. They can be anything from a multiple-choice question to the lobby page where players can join. The `quiztemplates/` directory gives instructions for each possible game state. Here is a brief overview:
**Core game states:**
- **openquestion.json** A simple open question. The admin gets to see and correct all answers afterwards.
- **multiplechoicequestion.json** A multiple-choice question. Points are given directly.
- **adminmessage.json** Shows a message that only the admin can see. For example, a reminder of what is to come, or a text to read out loud before the next question.
- **multimediapage.json** Allows you to display an image, video, or audio fragment on the big screen. These should be put in the `my_quiz/resources/` directory, and can be referenced as `/resources/my_media.wav`, for example.
- **staticpage.json** Allows putting any `HTML` on the big screen.

**Special Rounds:**
- **connectionround.json** A simple connection round from the Dutch TV show *The Connection*. It will contain any number of constituent questions with related answers. At the end, candidates get to see all correct answers, and have to guess what the connection between them is.
- **topnfilter.json** For some later rounds, only the top `n` best candidates remain, and the rest gets eliminated. This game state does that automatically, and shows a leaderboard in the meantime.
- **puzzleround.json** The puzzle round from *De Slimste Mens*. Candidates get to see a puzzle with 3 answers, and have to give these as quickly as possible. Eliminated candidates judge the answers.
- **movieround.json** Movie round from *De Slimste Mens*. Candidates get to see a film fragment, and have to name 5 associated keywords. Eliminated candidates are judges here as well.
- **cjudgedopenquestion.json** The final round in *De Slimste Mens*. The two remaining players get open questions. Each correct answer subtracts points from the opponent till one is out of points. Eliminated candidates are judges again.

**Other:**
- **lobby.json** The lobby is automatically shown at the beginning of any game, and allows participants to join. If you add a second lobby, it will allow you to switch from playing in teams to playing individually, by giving everyone the amount of points of their team.
- **storyquestion.json** Inspired by *The Connection*: the host/admin tells a story about some topic. Candidates have to answer as soon as they know what the host is talking about. The sooner they respond, the more points they will get when they have it correct.
- **horsejump.json** The horse jump question from *Twee voor Twaalf*. Candidates see 8 letters on the screen. By making jumps like the horse in chess, they have to form a word out of it.
- **memorylist.json** Question from *De Max Geheugentrainer*. Shows a list of items (usually groceries). Later on, in an open question, candidates should write down all items they memorized.
- **final_connection.json** Also from *The Connection*. In essence, it is the same as **connectionround.json**, except that now all answers of the entire quiz form one big connection together. The final candidate gets to see all answers for a specified amount of time, and has to guess the connection. Afterwards, the host reads out a text that slowly reveals what the true connection is, and that contains all answers as keywords.
### Spinning up the server
To start the server with the specified configuration file, run:
```bash
npm run start -- path/to/config.json
```
You should use this command for testing on your local machine.

Alternatively, you can use `systemd` to run it in the background. An example service file is provided in `goemanquiz.service`.
### Basic usage
With the server now running, it is time to start the quiz! As said, I am assuming the service is reachable via `your.domain.net`. There are now three distinct pages you can visit. I will go over them one by one.

**Player screen**
When you visit `your.domain.net`, you will automatically get redirected to `your.domain.net/player`. This is where all candidates should go to participate. From here, they can join the quiz and answer questions — either on their phone, tablet, or laptop.

**Big screen**
For this game, you need a big television or beamer screen that all candidates can see. Visit `your.domain.net/bigscreen` on it, and press the button in the top-right corner to go into full-screen mode.

**Admin screen**
You, as the host of the quiz, should go to `your.domain.net/admin`, and log in with the name and authorization code you set in the `JSON` config file. From here, you have full control over the game.

At the top, you have the navigation panel. It lets you quickly move to the next (or previous) game state. You can also move to a specified state directly — either in absolute terms or relative to the current state.

Underneath the navigation panel, you will find a state-specific panel. For open questions, for example, this is where you would get to see and correct candidates' answers. For the `Lobby` it will show some tools to switch from teams to individual candidates.

At the bottom, you will find the *players* panel. Here, you have full control over players and their data. You can, for example, manually add or remove players from the player table, change their score by pressing on it, or change their `Is playing` status (whether they are in the game, or have been eliminated and are now judges).

In this last panel, you will also see a section called `Wildcard authorization code`. When a player wants to join the game outside of the `Lobby` state, they will have to enter an existing name and the code you set here. So, for example, if someone joins later, you should:
1. Add their name to the player table;
2. Set a new wildcard code;
3. Make them enter this name and code.
When an existing player wants to connect on a new device, or reconnect on the same device, you only need to set the wildcard (and make sure they write their name exactly as they did before).
### Hosting on a Raspberry Pi
As mentioned, I myself host this quiz on a Raspberry Pi. Here, I will very briefly mention the steps I took to set this up. This might not work exactly the same for you, but it can still be a helpful guide.
1. Setting up the `systemd` daemon:
	Move the specified service file to `/lib/systemd/system/goemanquiz.service`, and change the specified paths and username accordingly. After that, call:
	```bash
	sudo systemctl daemon-reload
	sudo systemctl start goemanquiz.service
	sudo systemctl enable goemanquiz.service
	```
2. Giving my Raspberry Pi a static local IP address, and forwarding `TCP` port 443. This heavily depends on your specific router.
3. Getting a dynamic domain name via [No-IP](https://www.noip.com/), and changing my router's configuration accordingly.
4. Using [Let's Encrypt](https://letsencrypt.org/), and I think its `certbot` to get an SSL certificate. Put the file they specify in the `static` directory:
	```bash
	sudo apt-get install certbot
	sudo certbot certonly --manual
	```
	and put the file they want you to be reachable in `static/.well-known/acme-challenge/`. I am not completely sure anymore how I did this, but I will look it up 🤓
## Contributing
Contributions are always welcome. If there are bugs you want to fix, you can submit a pull request. In addition, if you're going to extend the code, I added some helpful tools to create new game states quickly. See the next section for instructions.
### Adding a new game state
To add a new game state, I created a convenient script to help you on your way. Run:
```bash
node dist/utils/makegamestate.js
```
and answer the prompted questions. This will automatically create all the files you need for your new game state, with boilerplate code and instructions in each.

By re-building with:
```bash
npm run build
```
your new game state will automatically be discovered (via the `src/utils/collectgamestates.ts` script). You can now reference it in a `JSON` config file with the lowercase version of its class name. Once you are satisfied with your new state, please create a `JSON` template for in the `quiztemplates/` directory.