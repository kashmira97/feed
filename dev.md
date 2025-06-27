# Why using "yarn dev" stinks for testing hash-driven widget integration.

We recommend avoiding using "yarn dev"

- Doesn't include [embedding sample](https://model.earth/feed/embed-player.html) locally.
- Doesn't reside above Swiper.
- Doesn't show local readme.

Instead, use 'yarn build' and view with the swiper on the same page at:
[http://localhost:8887/feed](http://localhost:8887/feed
)

Start your port 8887 server with the command at:<br>
[https://model.earth/localsite/start/steps/](https://model.earth/localsite/start/steps/)

This text is not local, it's pulled from GitHub.