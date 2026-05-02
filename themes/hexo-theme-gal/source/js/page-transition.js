(function ($) {
    var transitionConfig = window.pageTransition || { enable: false, animation: 'fade', duration: 300 };

    if (!transitionConfig.enable) {
        return;
    }

    var isTransitioning = false;
    var $mainstay = $('#mainstay');
    var $sidebar = $('#sidebar');
    var $loader = $('#page-loader');

    function showLoader() {
        $loader.css('display', 'block');
        $('body').addClass('page-transitioning');
    }

    function hideLoader() {
        $loader.css('display', 'none');
        $('body').removeClass('page-transitioning');
    }

    function getPageContent(url, callback) {
        showLoader();
        $.ajax({
            url: url,
            type: 'GET',
            success: function (data) {
                var $temp = $('<div>').html(data);
                var mainContent = $temp.find('#mainstay').html();
                var sidebarContent = $temp.find('#sidebar').html();
                var title = $temp.find('title').text();
                hideLoader();
                callback(null, { main: mainContent, sidebar: sidebarContent, title: title });
            },
            error: function (xhr) {
                hideLoader();
                callback(xhr);
            }
        });
    }

    function animateOut(callback) {
        var duration = transitionConfig.duration;
        var animation = transitionConfig.animation;

        if (animation === 'fade') {
            $mainstay.css({
                'opacity': '1',
                'transition': 'opacity ' + duration + 'ms ease'
            }).animate({ opacity: 0 }, duration, callback);
        } else if (animation === 'slide') {
            $mainstay.css({
                'transition': 'transform ' + duration + 'ms ease, opacity ' + duration + 'ms ease'
            }).animate({
                opacity: 0,
                marginLeft: '-50px'
            }, duration, callback);
        } else if (animation === 'scale') {
            $mainstay.css({
                'transition': 'transform ' + duration + 'ms ease, opacity ' + duration + 'ms ease'
            }).animate({
                opacity: 0,
            }, {
                duration: duration,
                step: function (now, fx) {
                    if (fx.prop === 'opacity') {
                        var scale = 1 - (1 - now) * 0.1;
                        $(this).css('transform', 'scale(' + scale + ')');
                    }
                },
                complete: callback
            });
        } else {
            callback();
        }
    }

    function animateIn(callback) {
        var duration = transitionConfig.duration;
        var animation = transitionConfig.animation;

        if (animation === 'fade') {
            $mainstay.css('opacity', 0).animate({ opacity: 1 }, duration, callback);
        } else if (animation === 'slide') {
            $mainstay.css({
                opacity: 0,
                marginLeft: '50px'
            }).animate({
                opacity: 1,
                marginLeft: 0
            }, duration, callback);
        } else if (animation === 'scale') {
            $mainstay.css({
                opacity: 0,
                transform: 'scale(0.9)'
            }).animate({ opacity: 1 }, {
                duration: duration,
                step: function (now, fx) {
                    if (fx.prop === 'opacity') {
                        var scale = 0.9 + now * 0.1;
                        $(this).css('transform', 'scale(' + scale + ')');
                    }
                },
                complete: callback
            });
        } else {
            callback();
        }
    }

    function navigateTo(url, pushState) {
        if (isTransitioning) return;
        if (url === window.location.href || url === window.location.pathname) return;

        isTransitioning = true;

        if (pushState !== false) {
            history.pushState({ url: url }, '', url);
        }

        animateOut(function () {
            getPageContent(url, function (err, data) {
                if (err) {
                    window.location.href = url;
                    return;
                }

                document.title = data.title;

                $mainstay.html(data.main);
                $sidebar.html(data.sidebar);

                animateIn(function () {
                    isTransitioning = false;
                    $('html, body').animate({ scrollTop: 0 }, 300);

                    try {
                        if (typeof AOS !== 'undefined') {
                            AOS.init({ duration: 1000, delay: 0, easing: 'ease-out-back' });
                        }
                    } catch (e) { }

                    try {
                        hs.graphicsDir = '/js/highslide/graphics/';
                        hs.outlineType = "rounded-white";
                        hs.dimmingOpacity = 0.8;
                        hs.outlineWhileAnimating = true;
                        hs.showCredits = false;
                        hs.captionEval = "this.thumb.alt";
                        hs.numberPosition = "caption";
                        hs.align = "center";
                        hs.transitions = ["expand", "crossfade"];
                        hs.lang.number = '共%2张图, 当前是第%1张';
                    } catch (e) { }
                });
            });
        });
    }

    $(document).on('click', 'a', function (e) {
        var $link = $(this);
        var href = $link.attr('href');

        if (!href) return;
        if (href === '#') return;
        if ($link.attr('target') === '_blank') return;
        if ($link.attr('download') !== undefined) return;
        if ($link.data('toggle') || $link.data('hover')) return;
        if (href.indexOf('#') === 0) return;
        if (href.indexOf('javascript') === 0) return;
        if (href.indexOf('mailto:') === 0) return;
        if (href.indexOf('tel:') === 0) return;

        var isInternal = false;
        if (href.indexOf('/') === 0) {
            isInternal = true;
        } else if (href.indexOf(window.location.origin) === 0) {
            isInternal = true;
        }
        if (!isInternal) return;

        e.preventDefault();
        navigateTo(href, true);
    });

    $(window).on('popstate', function (e) {
        if (e.originalEvent.state && e.originalEvent.state.url) {
            navigateTo(e.originalEvent.state.url, false);
        }
    });

})($);