/**
 * js网页雪花效果jquery插件
 */
$(function($){
  generateSnowContainer();
	$.fn.snow = function(options){
		var $flake = $('<div id="snowbox" />').css({'position': 'absolute', 'top': '-50px'}).html('&#10052;'),
			documentHeight = $(document).height(),
			documentWidth	= $(document).width(),
			defaults = {
        minSize	: 10,   //雪花的最小尺寸
        maxSize	: 20,   //雪花的最大尺寸
        newOn	: 1000,   //雪花出现的频率
        flakeColor: getRandomColor()
      },
    options = $.extend({}, defaults, options);
		const interval = setInterval( function(){
			const startPositionLeft = Math.random() * documentWidth - 100,
				startOpacity = 0.5 + Math.random(),
				sizeFlake = options.minSize + Math.random() * options.maxSize,
				endPositionTop = documentHeight - 40,
				endPositionLeft = startPositionLeft - 100 + Math.random() * 500,
				durationFall = documentHeight * 10 + Math.random() * 5000;
			  $flake.clone().appendTo('.snow-container').css({
          left: startPositionLeft,
          opacity: startOpacity,
          'font-size': sizeFlake,
          color: getRandomColor(),
          userSelect: 'none'
        }).animate({
          top: endPositionTop,
          left: endPositionLeft,
          opacity: 0.2
        }, durationFall, 'linear',function(){
          $(this).remove()
        }
      );
		}, options.newOn);

	};

});
// 生成容器
const generateSnowContainer = function () {
  let snowContainer = document.createElement('div');
  snowContainer.className = 'snow-container';
  document.body.appendChild(snowContainer);
  $('.snow-container').css({
    // position: 'fixed',
    // top: '0',
    // left: '0',
    // right: '0',
    // width: '100vw',
    // height: '100vh',
    // overflow: 'hidden',
    // zIndex: '-1'
  });
};
// 生成随机颜色
const getRandomColor = function(){
  return  '#' +
    (function(color){
      return (color +=  '0123456789abcdef'[Math.floor(Math.random()*16)])
      && (color.length === 6) ?  color : arguments.callee(color);
    })('');
};
