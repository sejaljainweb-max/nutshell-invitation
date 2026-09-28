/* Wedding invite — vanilla jQuery port */

// const DEV_MODE = true;

// if (DEV_MODE) {

//     phase = "hero";

//     $("#video-screen").hide();
//     $("#hero").removeClass("d-none");

//     $("body").removeClass("intro-lock"); // Enable scrolling

// } else {

//     $("body").addClass("intro-lock");

// }

// $(function () {

//     const DEV_MODE = true;

//     const $video = $('#envelope-video');
//     const video = $video[0];
//     const $poster = $('#envelope-poster');
//     const $hint = $('#tap-hint');
//     const $videoScreen = $('#video-screen');
//     const $hero = $('#hero');

//     let phase = DEV_MODE ? 'hero' : 'intro';

//     if (DEV_MODE) {

//         $videoScreen.hide();
//         $hero.removeClass('d-none');

//     } else {

//         $("body").addClass("intro-lock");

//     }

// Rest of your code...

/*==================================================
SETUP
==================================================*/

// Prevent the browser from restoring an old scroll position on reload,
// since the intro video should always start the page at the top.
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

$(function () {
    $("body").addClass("intro-lock");

    const $video = $('#envelope-video');
    const video = $video[0];
    const $poster = $('#envelope-poster');
    const $hint = $('#tap-hint');
    const $videoScreen = $('#video-screen');
    const $hero = $('#hero');
    const $reveal = $('#reveal');
    const $countdown = $('#countdown-section');
    const $countdownInner = $('#countdown-inner');

    let phase = 'intro'; // intro | playing | hero

    /*==================================================
    INTRO VIDEO
    ==================================================*/

    // Tap the envelope to start playback
    $videoScreen.on('click', function () {

        music.play().then(function () {
            $(".vinyl").css("animation-play-state", "running");
        }).catch(function (err) {
            console.log(err);
        });
        if (phase !== 'intro') return;
        phase = 'playing';
        video.muted = false;
        const p = video.play();
        if (p && p.catch) {
            p.catch(function () { video.muted = true; video.play().catch(function () { }); });
        }
        $poster.fadeOut(200);
        $hint.fadeOut(200);
    });

    // When the envelope-opening video finishes, reveal the hero section
    $video.on('ended', function () {
        phase = 'hero';
        window.scrollTo(0, 0);

        $videoScreen.addClass('d-none');
        $("body").removeClass("intro-lock");
        $hero.removeClass('d-none');
        $reveal.removeClass('d-none');
        $countdown.removeClass('d-none');
        bindShare();
    });

    // "Our Invitation" button -> scroll down to the scratch cards
    $('#invitation-btn').on('click', function () {
        document.getElementById('scratch-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    /*==================================================
    SCRATCH CARDS
    ==================================================*/

    $(function () {

        let canvases = [];
        let alreadyRevealed = false;

        let scratched = {
            DAY: false,
            MONTH: false,
            YEAR: false

        }

        /*----------------------------
        Create Scratch Hearts
        -----------------------------*/

        $(".scratchCanvas").each(function () {

            const canvas = this;

            canvases.push(canvas);

            createScratch(canvas);

        });


        /*----------------------------
        Scratch Layer
        -----------------------------*/

        function createScratch(canvas) {



            const size = canvas.offsetWidth;

            const dpr = window.devicePixelRatio || 1;

            canvas.width = size * dpr;
            canvas.height = size * dpr;

            const ctx = canvas.getContext("2d", { willReadFrequently: true });

            ctx.scale(dpr, dpr);

            /* Premium Gradient */

            const g = ctx.createLinearGradient(0, 0, size, size);

            g.addColorStop(0, "#3a0d10");
            g.addColorStop(.35, "#7b1920");
            g.addColorStop(.55, "#aa3641");
            g.addColorStop(.75, "#681419");
            g.addColorStop(1, "#2d0708");

            ctx.fillStyle = g;

            ctx.fillRect(0, 0, size, size);

            /* Gold Dots */

            ctx.fillStyle = "rgba(232,194,111,.45)";

            for (let i = 0; i < 45; i++) {

                ctx.beginPath();

                ctx.arc(

                    Math.random() * size,

                    Math.random() * size,

                    Math.random() * 1.6,

                    0,

                    Math.PI * 2

                );

                ctx.fill();

            }

            /* Text */

            ctx.fillStyle = "rgba(255,230,170,.9)";

            ctx.font = "500 " + Math.round(size * .075) + "px Cormorant Garamond";

            ctx.textAlign = "center";

            ctx.fillText("SCRATCH", size / 2, size / 2 - 6);

            ctx.globalCompositeOperation = "destination-out";

            let drawing = false;

            /* Mouse */

            canvas.addEventListener("mousedown", function (e) {

                drawing = true;

                erase(e);

            });

            window.addEventListener("mouseup", function () {

                drawing = false;

                checkProgress();

            });

            canvas.addEventListener("mousemove", function (e) {

                if (!drawing) return;

                erase(e);

            });

            /* Touch */

            canvas.addEventListener("touchstart", function (e) {

                drawing = true;

                eraseTouch(e);

            });

            canvas.addEventListener("touchmove", function (e) {

                if (!drawing) return;

                e.preventDefault();

                eraseTouch(e);

            }, { passive: false });

            window.addEventListener("touchend", function () {

                drawing = false;

                checkProgress();

            });

            /* Erase */

            function erase(e) {

                const r = canvas.getBoundingClientRect();

                const x = (e.clientX - r.left);

                const y = (e.clientY - r.top);

                ctx.beginPath();

                ctx.arc(x, y, size * .15, 0, Math.PI * 2);

                ctx.fill();

            }

            function eraseTouch(e) {

                const touch = e.touches[0];

                const r = canvas.getBoundingClientRect();

                const x = (touch.clientX - r.left);

                const y = (touch.clientY - r.top);

                ctx.beginPath();

                ctx.arc(x, y, size * .15, 0, Math.PI * 2);

                ctx.fill();

            }

            /* Scratch Percentage */

            function checkProgress() {

                if (alreadyRevealed) return;

                if (scratched[canvas.dataset.label]) return;

                const img = ctx.getImageData(

                    0,

                    0,

                    canvas.width,

                    canvas.height

                );

                let clear = 0;

                let total = 0;

                for (let i = 3; i < img.data.length; i += 32) {

                    total++;

                    if (img.data[i] == 0) {

                        clear++;

                    }

                }

                let percent = clear / total;


                if (percent > 0.10) {

                    scratched[canvas.dataset.label] = true;

                    $(canvas).parent().addClass("completed");

                    setTimeout(function () {

                        $(canvas).parent().removeClass("completed");

                    }, 700);

                    if (
                        scratched.DAY &&
                        scratched.MONTH &&
                        scratched.YEAR &&
                        !alreadyRevealed
                    ) {

                        alreadyRevealed = true;
                        revealAll();

                    }

                }

            }

        }

        /*=========================================
        Reveal Everything
        =========================================*/

        function revealAll() {

            /* Fade all hearts */

            $(".scratchCanvas").each(function () {

                $(this).addClass("hide");

            });


            /* Small delay */

            setTimeout(function () {

                celebrate();

            }, 500);

        }


        /*=========================================
        Premium Confetti
        =========================================*/

        function celebrate() {

            const colors = [
                "#D4AF37",
                "#F5D98A",
                "#B8860B",
                "#FFF4D1",
                "#8A1F2D"
            ];

            confetti({

                particleCount: 160,

                spread: 90,

                startVelocity: 40,

                scalar: 1.15,

                ticks: 250,

                origin: {
                    y: .55
                },

                colors: colors

            });

            setTimeout(function () {

                confetti({

                    particleCount: 70,

                    angle: 60,

                    spread: 60,

                    origin: {
                        x: 0,
                        y: .6
                    },

                    colors: colors

                });

                confetti({

                    particleCount: 70,

                    angle: 120,

                    spread: 60,

                    origin: {
                        x: 1,
                        y: .6
                    },

                    colors: colors

                });

            }, 250);


            /* Scroll */

            $("#countdownSection").addClass("show");

            setTimeout(function () {

                $("html,body").animate({

                    scrollTop: $("#countdownSection").offset().top - 20

                }, 1000);

            }, 500);



            setTimeout(function () {

                $("#countdownSection").addClass("show");

                // Animate countdown boxes one by one
                $(".countdown div").each(function (i) {

                    const card = $(this);

                    setTimeout(function () {

                        card.css({
                            opacity: 1,
                            transform: "translateY(0) scale(1)"
                        });

                    }, i * 700);

                });

            }, 800);


        }


        /*==================================================
        COUNTDOWN
        ==================================================*/

        const weddingDate = new Date("february 03, 2027 00:00:00").getTime();

        function updateCountdown() {

            const now = new Date().getTime();

            const distance = weddingDate - now;

            if (distance <= 0) {

                $("#days").text("00");
                $("#hours").text("00");
                $("#minutes").text("00");
                $("#seconds").text("00");

                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));

            const hours = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) /
                (1000 * 60 * 60)
            );

            const minutes = Math.floor(
                (distance % (1000 * 60 * 60)) /
                (1000 * 60)
            );

            const seconds = Math.floor(
                (distance % (1000 * 60)) /
                1000
            );

            $("#days").text(String(days).padStart(2, "0"));
            $("#hours").text(String(hours).padStart(2, "0"));
            $("#minutes").text(String(minutes).padStart(2, "0"));
            $("#seconds").text(String(seconds).padStart(2, "0"));

        }

        updateCountdown();

        setInterval(updateCountdown, 1000);

    });


    // to delete later
    // }); 

    /*==================================================
    PHOTO GALLERY
    ==================================================*/

    // Duplicate the gallery track so the CSS marquee animation (galleryMove)
    // can loop seamlessly.
    const track = document.querySelector(".gallery-track");

    track.innerHTML += track.innerHTML;

    /*==================================================
    SCROLL-REVEAL OBSERVER (Wedding Functions / Invitation)
    ==================================================*/

    const observer = new IntersectionObserver(function (entries) {

        entries.forEach(function (entry) {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    }, { threshold: .1 });

    document.querySelectorAll(".function-card,.family-card").forEach(function (el) {

        observer.observe(el);

    });


});

/*==================================================
ROSE PETALS
==================================================*/

function spawnRosePetals(count) {
    var $wrap = $('#rose-petals');
    var frag = '';
    for (var i = 0; i < count; i++) {
        var left = Math.random() * 100;
        var size = 16 + Math.random() * 16;
        var duration = 16 + Math.random() * 12;
        var delay = -Math.random() * (duration + 2);
        var drift = (Math.random() - 0.5) * 180;
        var sway = 30 + Math.random() * 60;
        var op = 0.3 + Math.random() * 0.03;
        var hue = 340 + Math.random() * 20;
        var svg = rosePetalSvg(hue);

        frag += '<span class="rose-petal" style="' +
            'left:' + left + '%;' +
            'width:' + size + 'px;' +
            'height:' + (size * 1.4) + 'px;' +
            'animation-duration:' + duration + 's;' +
            'animation-delay:' + delay + 's;' +
            '--drift:' + drift + 'px;' +
            '--sway:' + sway + 'px;' +
            '--rose-op:' + op + ';' +
            'opacity:0;' +
            '">' + svg + '</span>';
    }

    $wrap.append(frag);

    setTimeout(function () {

        $wrap.children(".rose-petal").first().remove();

    }, 30000);
}

function rosePetalSvg(hue) {
    var light = 'hsl(44, 65%, 87%)';
    var mid = 'hsl(39, 58%, 72%)';
    var deep = 'hsl(33, 48%, 52%)';
    var id = 'rp-' + Math.floor(hue * 100);
    return '<svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg" ' +
        'style="width:100%;height:100%;filter:drop-shadow(0 2px 4px rgba(160,50,90,0.18));">' +
        '<defs><radialGradient id="' + id + '" cx="35%" cy="30%" r="80%">' +
        '<stop offset="0%" stop-color="' + light + '"/>' +
        '<stop offset="55%" stop-color="' + mid + '"/>' +
        '<stop offset="100%" stop-color="' + deep + '"/>' +
        '</radialGradient></defs>' +
        '<path d="M20 2 C34 10 38 26 30 42 C26 50 22 54 20 54 C18 54 14 50 10 42 C2 26 6 10 20 2 Z" fill="url(#' + id + ')"/>' +
        '<path d="M20 6 C22 20 22 36 20 52" stroke="' + deep + '" stroke-opacity="0.25" stroke-width="0.6" fill="none"/>' +
        '</svg>';
}

/*==================================================
GOLD BURST (defined but not currently triggered anywhere — kept as-is)
==================================================*/

var goldBurstPlayed = false;
function spawnGoldBurst(count) {
    if (goldBurstPlayed) return;
    goldBurstPlayed = true;
    var $wrap = $('#gold-burst');
    var GOLD_TONES = [
        // 'linear-gradient(135deg, #f7e7a3 0%, #e6c76a 45%, #b8862c 100%)',
        // 'linear-gradient(135deg, #fff2c2 0%, #f1cf6b 50%, #9c6f1e 100%)',
        // 'linear-gradient(135deg, #fdf6d8 0%, #d9b26a 55%, #7a5316 100%)',
        // 'linear-gradient(135deg, #fffbe6 0%, #f4d98a 50%, #c39a3a 100%)'

        '#E9D8A6', // Champagne Gold
        '#D4AF37', // Metallic Gold
        '#C9A86A', // Antique Gold
        '#F6E7C1', // Ivory Gold
        '#B8860B', // Dark Gold
        '#F4E4BC', // Soft Gold
        '#C97C8B', // Dusty Rose
        '#8C4A5B'  // Burgundy

    ];
    var html = '';
    for (var i = 0; i < count; i++) {
        var kindRoll = Math.random();
        var kind =
            kindRoll < 0.35 ? 'strip' :
                kindRoll < 0.65 ? 'star' :
                    kindRoll < 0.90 ? 'dot' :
                        'diamond';
        var spread = (Math.random() - 0.5) * Math.PI * 0.95;
        var angle = -Math.PI / 2 + spread;
        var velocity = 420 + Math.random() * 920;
        var gravity = 380 + Math.random() * 220;
        var dx = Math.cos(angle) * velocity;
        var dy = Math.sin(angle) * velocity + gravity;
        var size =
            kind === 'strip' ? 18 + Math.random() * 18 :
                kind === 'star' ? 14 + Math.random() * 12 :
                    kind === 'diamond' ? 10 + Math.random() * 8 :
                        8 + Math.random() * 8;
        var rot = (Math.random() - 0.5) * 1500;
        var delay = 0.15 + Math.random() * 0.45;
        var duration = 2.2 + Math.random() * 1.4;
        var tone = GOLD_TONES[Math.floor(Math.random() * GOLD_TONES.length)];
        var originX = (Math.random() - 0.5) * 120;

        var style = 'left:calc(50% + ' + originX + 'px);' +
            '--dx:' + dx + 'px;--dy:' + dy + 'px;--rot:' + rot + 'deg;' +
            'animation-duration:' + duration + 's;animation-delay:' + delay + 's;';
        style += 'box-shadow:0 0 12px rgba(255,215,120,0.5);';

        if (kind === 'strip') {
            style += 'width:' + (size * 0.35) + 'px;height:' + (size * 0.4) + 'px;background:' + tone + ';';
            html += '<span class="gold-particle gold-strip" style="' + style + '"></span>';
        } else if (kind === 'star') {
            style += 'width:' + size + 'px;height:' + size + 'px;';
            html += '<span class="gold-particle gold-star" style="' + style + '"></span>';
        }
        else if (kind === 'diamond') {

            style +=
                'width:' + size +
                'px;height:' + size +
                'px;background:' + tone +
                ';transform:rotate(45deg);border-radius:2px;';

            html +=
                '<span class="gold-particle gold-diamond" style="' +
                style +
                '"></span>';
        } else {
            style += 'width:' + size + 'px;height:' + size + 'px;';
            html += '<span class="gold-particle gold-dot" style="' + style + '"></span>';
        }

    }
    $wrap.append(html);
    setTimeout(function () { $wrap.addClass('done'); }, 4200);
}

/*==================================================
INTERVALS
==================================================*/

// Continuously spawn a new rose petal every 2 seconds
setInterval(function () {

    spawnRosePetals(1);

}, 2000);

/*==================================================
music player
==================================================*/
const music = document.getElementById("bgMusic");

$("#enterBtn").click(function () {

    music.volume = .30;

    music.play();

    $(".vinyl").css("animation-play-state", "running");

});
$("#musicPlayer").click(function () {

    if (music.paused) {

        music.play();

        $(".vinyl").css("animation-play-state", "running");

    }
    else {

        music.pause();

        $(".vinyl").css("animation-play-state", "paused");

    }

});

/*==================================================
share button
==================================================*/

function bindShare() {
    $('#share-btn').on('click', async function () {
        const $btn = $(this);

        if ($btn.prop('disabled')) return;

        $btn.prop('disabled', true);
        $btn.find('.share-idle').addClass('d-none');
        $btn.find('.share-loading').removeClass('d-none');

        const shareData = {
            title: 'Aditi & Pankaj Wedding Invitation',
            text: 'You are invited to our wedding 💍',
           url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Invitation link copied to clipboard!');
            }
        } catch (err) {
            console.log('Share cancelled or failed:', err);
        }

        $btn.prop('disabled', false);
        $btn.find('.share-loading').addClass('d-none');
        $btn.find('.share-idle').removeClass('d-none');
    });
}