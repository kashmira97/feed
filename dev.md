### Avoid using "yarn dev" for testing hash-driven widget integration.

We recommend avoiding using "yarn dev" since it...

&bullet; Doesn't include [embedding sample](https://model.earth/feed/embed-player.html) locally.
&bullet; Doesn't reside above Swiper for testing hash-driven interaction.
&bullet; Doesn't show local readme. (This text is pulled from GitHub.)

Simply use 'yarn build' and view with the swiper on the same page at:
[http://localhost:8887/feed](http://localhost:8887/feed)

Start your port 8887 server with the command at:
[https://model.earth/localsite/start/steps/](https://model.earth/localsite/start/steps/)