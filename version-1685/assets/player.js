(function () {
    function initializeMoviePlayer(containerId, playUrl) {
        var container = document.getElementById(containerId);
        if (!container) {
            return;
        }
        var video = container.querySelector('video');
        var startButton = container.querySelector('.player-start');
        var started = false;
        var hls = null;

        if (!video || !playUrl) {
            return;
        }

        function hideStartButton() {
            if (startButton) {
                startButton.classList.add('is-hidden');
            }
            container.classList.add('is-playing');
        }

        function playVideo() {
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    if (startButton) {
                        startButton.classList.remove('is-hidden');
                    }
                    container.classList.remove('is-playing');
                });
            }
        }

        function attachAndPlay() {
            hideStartButton();
            if (started) {
                playVideo();
                return;
            }
            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playUrl;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                video.load();
                playVideo();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(playUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal && hls) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                            hls = null;
                            started = false;
                            if (startButton) {
                                startButton.classList.remove('is-hidden');
                            }
                            container.classList.remove('is-playing');
                        }
                    }
                });
                return;
            }

            video.src = playUrl;
            video.load();
            playVideo();
        }

        if (startButton) {
            startButton.addEventListener('click', attachAndPlay);
        }
        video.addEventListener('click', function () {
            if (!started || video.paused) {
                attachAndPlay();
            }
        });
        video.addEventListener('play', hideStartButton);
        video.addEventListener('pause', function () {
            if (startButton && video.currentTime === 0) {
                startButton.classList.remove('is-hidden');
            }
        });
    }

    window.initializeMoviePlayer = initializeMoviePlayer;
})();
