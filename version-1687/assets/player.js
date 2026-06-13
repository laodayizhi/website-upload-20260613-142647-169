import { H as Hls } from "./hls.js";

export function initMoviePlayer(sourceUrl) {
    const player = document.querySelector(".movie-player");

    if (!player) {
        return;
    }

    const video = player.querySelector(".movie-video");
    const cover = player.querySelector(".player-cover");
    const status = player.querySelector(".player-status");
    let hls = null;
    let started = false;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function begin() {
        if (started) {
            video.play().catch(function () {});
            return;
        }

        started = true;
        setStatus("正在播放");

        if (cover) {
            cover.classList.add("is-hidden");
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });

            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function (eventName, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    setStatus("正在重新连接");
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    setStatus("正在恢复播放");
                } else {
                    setStatus("播放遇到问题");
                    hls.destroy();
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else {
            setStatus("播放遇到问题");
            if (cover) {
                cover.classList.remove("is-hidden");
            }
            return;
        }

        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                setStatus("点击继续播放");
                if (cover) {
                    cover.classList.remove("is-hidden");
                }
                started = false;
            });
        }
    }

    if (cover) {
        cover.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
        if (!started) {
            begin();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
