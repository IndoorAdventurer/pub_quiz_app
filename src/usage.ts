

export default function usage() {
    console.log(
`
Description:
    A simple Express-based quiz app, where players can join via their phone to
    answer all sorts of questions made up by you!

Usage:
    npm start -- CONFIG
    npm start -- --help

Options:
    CONFIG: A .json configuration file that defines the quiz. I.e. it contains
            all questions and answers, etc. See the "Configuration file" section
            for more details.

    --help: Shows usage instructions (i.e. this page :-p).

Setup:
    To start using this app, you will need to create a config file (see next
    section), and run this program with said file as its only argument. This
    will start the server on the port specified in the config.
    You will have to make sure that your server is accessible to the people
    wanting to join your quiz. For example, by forwarding the port on your home
    network, or by hosting this server on a dedicated platform.
    Users can directly join by going to "your.domain.or.ip/". You, the quiz
    master, will need to go to "your.domain.or.ip/admin" to control the
    progression of the game. Finally, on "your.domain.or.ip/bigscreen" you will
    see content that is meant to be displayed on a big screen, such as a large
    television, or a beamer. It will, for example, show all videos you want to
    present to the audience.

Configuration file:
    TODO!
`
    );
}