const VideoPlayer = {
  setup(videoId, buttonId, source) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    const layer = button;
    let loaded = false;
    let hlsInstance = null;

    if (!video || !button || !source) {
      return;
    }

    function attach() {
      if (loaded) {
        return Promise.resolve();
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      return Promise.resolve();
    }

    function play() {
      attach().then(function () {
        layer.classList.add('is-hidden');
        video.controls = true;
        const action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {});
        }
      });
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      play();
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
};
