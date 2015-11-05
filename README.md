# MEAN TicTacToe

[![Build Status](https://travis-ci.org/dting/meantictactoe.svg)](https://travis-ci.org/dting/meantictactoe)

Online TicTacToe app created to run using the MEAN Stack, generated by yeoman [angular-fullstack generator](https://github.com/DaftMonk/generator-angular-fullstack) and [socket.io](http://socket.io/).

See demo app at [https://mean-tictactoe.herokuapp.com](https://mean-tictactoe.herokuapp.com).

## Authentication 

OAuth and local authentication strategies using passport. Facebook, Google, and Twitter oauth logins enabled. After logging in, a socket.io connection is established. This connection is authenticated using the jwt token generated when logging into the site.
  
## Development and Deployment

**Vagrant**

The development environment for working with this application can be found in this [repository](https://github.com/dting/meantictactoe-vagrant). See readme for that repository for more information. 

**Grunt Task Runner**

Grunt is used as a task runner for developing and building the app. 

For developing, a task for serving a development server with livereload and injecting/rebuilding/preprocessing with code changes can be run with:
 
    $ grunt serve

The build (default) task minifies/uglfies the project to ready it for deployment. The buildcontrol tasks automate a couple different deployment strategies:

    $ grunt
    $ grunt buildcontrol:local
    $ grunt buildcontrol:heroku

**Heroku**

There is a grunt task to deploy this application to Heroku. This requires the [heroku-toolbelt](https://toolbelt.heroku.com/). If using the development environment, the toolbelt is installed by the provisioner.

After logging in to Heroku with Heroku toolbelt, deploying is accomplished by:

    $ grunt buildcontrol:heroku
    
**Env Variables**
    
The env variables that need to be set:

- DOMAIN = *SOME HTTPS DOMAIN*
- FACEBOOK_ID = *FACEBOOK ID*
- FACEBOOK_SECRET = *FACEBOOK SECRET*
- GOOGLE_ID = *GOOGLE ID*
- GOOGLE_SECRET = *GOOGLE SECRET*
- TWITTER_ID = *TWITTER ID*
- TWITTER_SECRET = *TWITTER SECRET*
- NODE_ENV = production

Facebook id and secret need to be obtained by creating an application: [Facebook](https://developers.facebook.com/apps).  
Google id and secret need to be obtained by creating an application: [Google](https://console.developers.google.com/project).  
Twitter id and secret need to be obtained by creating an application: [Twitter](https://apps.twitter.com/).  

## Notes

The app is somewhat responsive using [Angular Material](https://material.angularjs.org/latest/) (Google Material Design).

The practice game is re-purposed from an old project [codepen](http://codepen.io/dting/full/eNKdPP/).

Users are joined to a socket.io room with their userId. This allows for more than one connection for a user and the updates to be synced to all connected clients. 

## TODOs

- Chat functionality needs to be wired to the client. The server is ready to broadcast messages to each player.  
- Opponents are currently anonymous to the player on the front end but the userId is sent. Players names should be displayed.  
- User Model can be updated to track win/loss/tie records. Updated whenever a game is cleaned up.  
- Replace the GameManager with something better, probably [Redis](http://redis.io/).  
