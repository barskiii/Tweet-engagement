
# Tweet interactions
[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/barskiii/Tweet-engagement/blob/main/LICENCE)

Tweet interactions is an app built with Typescript, Next Js, Tailwind Css, Firebase, Socket.io and Twitter V2 API for purpose of
checking your tweet engagments (likes, retweets and quotes)


## Screenshot

[![twgit-sc.png](https://i.postimg.cc/wx0jc6vn/twgit-sc.png)](https://postimg.cc/4nHGXRp1)


## Usage

Clone the project and install dependencies

```bash
  git clone https://link-to-project
  cd my-project
  npm install
```

Start the server locally

```bash
  npm run dev
```

Start the server in production:

```bash
  npm start
```

## Demo

Demo is hosted on heroku: https://twitter-inters.herokuapp.com/


## Environment Variables

To run this project, you will need to add the following environment variables to your .env / .env.local file



`TWITTER_BEARER_TOKEN`

`FIREBASE_API_KEY`

`FIREBASE_AUTH_DOMAIN`

`FIREBASE_PROJECT_ID`

`FIREBASE_STORAGE_BUCKET`

`FIREBASE_MESSAGING_SENDER_ID`

`FIREBASE_APP_ID`

`NEXT_PUBLIC_HOST` - *http:localhost:300 for local, your domain for production* 
## Note

Next's net server is adapted to HTTP server to make real-time communication between the server and the client possible *(check pages/api/socketio)*.
Because of this, app won't be able to run on platforms that **do not support custom servers** 
## Authors

- Andrija Joksimovic [@barskiii](https://github.com/barskiii)

