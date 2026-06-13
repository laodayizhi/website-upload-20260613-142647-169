window.MoviePlayer = {
  mount: function (id, source) {
    var root = document.getElementById(id);
    if (!root) return;
    var video = root.querySelector('video');
    var cover = root.querySelector('.player-cover');
    var ready = false;
    var hls = null;
    var setError = function () {
      if (cover) {
        var start = cover.querySelector('.player-start');
        if (start) start.textContent = '重试';
      }
    };
    var attach = function (done) {
      if (ready) {
        done();
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', done, { once: true });
        video.load();
        setTimeout(done, 1200);
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, done);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setError();
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
            else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
            else hls.destroy();
          }
        });
        setTimeout(done, 1600);
      } else {
        video.src = source;
        done();
      }
    };
    var play = function () {
      if (cover) cover.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      attach(function () {
        var promise = video.play();
        if (promise && promise.catch) promise.catch(setError);
      });
    };
    if (cover) cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!ready || video.paused) play();
      else video.pause();
    });
    window.addEventListener('beforeunload', function () {
      if (hls) hls.destroy();
    });
  }
};
