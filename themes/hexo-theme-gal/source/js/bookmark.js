(function ($) {

	// ------- 文章书签功能 -----------

	$(document).ready(function () {
		var $content = $('.content-article');
		if (!$content.length) return;

		// 提取文章中的标题 (h1-h6), 需要有 id 才能跳转
		var $headings = $content.find('h1, h2, h3, h4, h5, h6');
		var headings = [];
		$headings.each(function () {
			var $h = $(this);
			var id = $h.attr('id');
			if (!id) return;
			// 去掉 headerlink 锚点后的纯文本
			var text = $h.clone().find('.headerlink').remove().end().text().trim();
			if (!text) text = $h.attr('title') || $h.text().trim();
			var level = parseInt(this.tagName.substring(1), 10);
			headings.push({ id: id, text: text, level: level, $el: $h });
		});

		// 标题数量不足则不显示书签
		if (headings.length < 2) return;

		var $widget = $('#gal-bookmark');
		var $list = $('#gal-bookmark-list');
		var $body = $('#gal-bookmark-body');

		// 计算最小层级用于缩进
		var minLevel = Math.min.apply(null, headings.map(function (h) { return h.level; }));

		// 构建书签列表
		headings.forEach(function (h) {
			var indent = h.level - minLevel;
			var $li = $('<li class="gal-bookmark-item"></li>')
				.attr('data-target', h.id)
				.css('padding-left', (12 + indent * 14) + 'px');
			var $a = $('<a href="javascript:void(0);"></a>').text(h.text).attr('title', h.text);
			$li.append($a);
			$list.append($li);
		});

		// 显示书签窗口
		$widget.show();

		// 点击跳转
		var scrollOffset = 70; // 顶部偏移, 避免被固定头部遮挡
		$list.on('click', '.gal-bookmark-item a', function (e) {
			e.preventDefault();
			var id = $(this).parent().attr('data-target');
			var $target = $('#' + id);
			if ($target.length) {
				$('body,html').stop().animate({
					scrollTop: $target.offset().top - scrollOffset
				}, 400);
			}
		});

		// 最小化/展开
		$('#gal-bookmark-minimize').on('click', function () {
			$widget.toggleClass('gal-bookmark-minimized');
			var $icon = $(this).find('i');
			if ($widget.hasClass('gal-bookmark-minimized')) {
				$icon.removeClass('fa-minus').addClass('fa-plus');
			} else {
				$icon.removeClass('fa-plus').addClass('fa-minus');
			}
		});

		// 拖拽功能
		var $header = $('#gal-bookmark-header');
		var dragging = false;
		var startWidgetX = 0, startWidgetY = 0;
		var startCursorX = 0, startCursorY = 0;

		$header.on('mousedown', function (e) {
			// 点击按钮时不拖拽
			if ($(e.target).closest('.gal-bookmark-btn').length) return;
			dragging = true;
			// 仅记录起始位置，不修改任何 CSS，避免 right→left 切换导致跳动
			var rect = $widget[0].getBoundingClientRect();
			startWidgetX = rect.left;
			startWidgetY = rect.top;
			startCursorX = e.clientX;
			startCursorY = e.clientY;
			e.preventDefault();
		});

		$(document).on('mousemove', function (e) {
			if (!dragging) return;
			var dx = e.clientX - startCursorX;
			var dy = e.clientY - startCursorY;
			var newLeft = startWidgetX + dx;
			var newTop = startWidgetY + dy;
			var maxLeft = $(window).width() - $widget.outerWidth();
			var maxTop = $(window).height() - $widget.outerHeight();
			newLeft = Math.max(0, Math.min(newLeft, maxLeft));
			newTop = Math.max(0, Math.min(newTop, maxTop));
			// 仅在 mousemove 时才切换为 left 定位
			$widget.css({ left: newLeft + 'px', top: newTop + 'px', right: 'auto' });
		});

		$(document).on('mouseup', function () {
			dragging = false;
		});

		// 滚动监听, 高亮当前章节
		var $items = $('.gal-bookmark-item');

		function updateActive() {
			var scrollPos = $(window).scrollTop();
			var current = null;
			for (var i = 0; i < headings.length; i++) {
				var h = headings[i];
				if (h.$el.offset().top - scrollOffset - 10 <= scrollPos) {
					current = h.id;
				} else {
					break;
				}
			}
			$items.removeClass('active');
			if (current) {
				$items.filter('[data-target="' + current + '"]').addClass('active');
				// 滚动书签列表使当前项可见
				var $active = $items.filter('.active');
				if ($active.length) {
					var listTop = $body.scrollTop();
					var itemTop = $active.position().top;
					var itemBottom = itemTop + $active.outerHeight();
					var bodyHeight = $body.height();
					if (itemTop < 0) {
						$body.scrollTop(listTop + itemTop - 10);
					} else if (itemBottom > bodyHeight) {
						$body.scrollTop(listTop + itemBottom - bodyHeight + 10);
					}
				}
			}
		}

		$(window).on('scroll', updateActive);
		updateActive();

		// ------- 文章书签功能结束 -----------
	});

})($);
