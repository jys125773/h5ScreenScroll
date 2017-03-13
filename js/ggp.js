function Slide(name){
		this.$dom = $(name);
		this.$pages = this.$dom.find('.page');
		this.len = this.$pages.length;
		this.idx = 0;
		this.lock = true;
		this.init();
		this.inArray = [];//进场动画
		this.outArray = [];
		this.defineAnimates();
		this.bindEvent();
	};
	Slide.prototype.defineAnimates = function(){
		var self = this;
		var p1_ren = this.$pages.eq(0).find('.p1-ren'),
			p1_mask = this.$pages.eq(0).find('.p1-mask'),
			p1_arrows = this.$pages.eq(0).find('.p1-arrow'),
			p1_dl = this.$pages.eq(0).find('dl'),
			p1_line = this.$pages.eq(0).find('.p1-line');//得到第一页动画的元素
		this.outArray[0] = function(){
			 p1_ren.css({'opacity': 0,"transform":"translateY(40px)"});
			 p1_arrows.css('opacity', 0);
			 p1_line.eq(0).css({"transform": 'translate(100%,-100%)',"opacity":0});
			 p1_line.eq(1).css({"transform": 'translate(-100%,100%)',"opacity":0 });
			 p1_dl.css({"transform": 'translate(0,50px)',"opacity":0});
		};
		this.inArray[0] = function(fx){
			 p1_ren.animate({'opacity':1,'transform':'none'},600,function(){
			 		 p1_line.animate({"opacity":1,"transform":"translate(0,0)"}, 800,function(){
			 		 	p1_dl.animate({"opacity":1,"transform": 'none'}, 300,function(){
			 		 		fx&&fx();
			 		 	});
			 		 });
			 		p1_arrows.each(function(i) {
			 			$(this).animate({"opacity":1},{"duration":300,"delay":100*i});
			 		});
			 });
		};
		this.outArray[0]();
		this.inArray[0]();//初始执行
		
		var p2_r = this.$pages.eq(1).find('.p2-r'),
			p2_bg = this.$pages.eq(1).find('.p2-bg'),
			p2_mask = this.$pages.eq(1).find('.p2-mask'),
			p2_line1 = this.$pages.eq(1).find('.p2-line1'),
			p2_line2 = this.$pages.eq(1).find('.p2-line2'),
			p2_line = this.$pages.eq(1).find('.p2-line'),
			p2_dl = this.$pages.eq(1).find('dl');
		this.outArray[1] = function(){
			p2_r.css({'opacity': 0,"transform":"translateY(40px)"});
			p2_mask.css('opacity', 0);
			p2_line1.css({"transform": 'translate(100%,-100%)',"opacity":0});
			p2_line2.css({"transform": 'translate(-100%,100%)',"opacity":0 });
			p2_dl.css({'opacity': 0,"transform":"translateY(140px)"});
		};
		this.inArray[1] = function(fx){
			p2_r.animate({'opacity':1,'transform':'none'},600,function(){
				p2_mask.animate({"opacity":1}, 200);
				p2_line.animate({"opacity":1,"transform":"translate(0,0)"}, 800,function(){
					p2_dl.animate({'opacity': 1,"transform":"translate(0,0)"}, 400,function(){
			 		 		fx&&fx();
			 		 	});
				});
			});
		};
		this.outArray[1]();

		var p3_time = this.$pages.eq(2).find('.p3-time');
		this.outArray[2] = function(){
			p3_time.css({'opacity': 0,"transform":"translateY(40px)"});
		};
		this.inArray[2] = function(){
			p3_time.each(function(i) {
				$(this).animate({'opacity':1,'transform':'none'}, {
					"delay":i*500,
					"duration":600
				});
			});
		};
		this.outArray[2]();
		
	};
	Slide.prototype.init = function(){
		this.$dom.css('height', 100*this.len+"%");
		this.$pages.css('height', 100/this.len+"%");
		this.h = this.$pages.eq(0).height();
	};
	Slide.prototype.bindEvent = function(){
		this.$dom.bind("touchstart", startHandler);
		this.$dom.bind("touchmove", moveHandler);
		this.$dom.bind("touchend", endHandler);
		var self = this;
		var startY,offsetY;//触屏开始位置，y偏移量;
		function startHandler(event){
			startY = event.touches[0].pageY;
			offsetY = 0;
		};
		function moveHandler(event){
			event.preventDefault();
			offsetY = event.touches[0].pageY - startY;
			if (self.idx != 0) {
				self.$pages.eq(self.idx-1).css('transform', 'translate(0,'+ (offsetY-self.h) +'px)');
			};
			if (self.idx != self.len - 1) {
				self.$pages.eq(self.idx+1).css('transform', 'translate(0,'+ (offsetY+self.h) +'px)');
			};
			self.$pages.eq(self.idx).css('transform', 'translate(0,'+ offsetY +'px)');
		};
		function endHandler(event){
			if (offsetY > self.h/6) {
				self.go(-1);
			} else if(offsetY < -self.h/6){
				self.go(+1);
			}else{
				self.go(0);
			};
		};
	};
	Slide.prototype.go = function(j){
		var temp = this.idx;
		this.idx = this.idx + j*1;
		if (this.idx > this.len - 1 ) {
			this.idx = this.len - 1;
		} else if(this.idx < 0){
			this.idx = 0 ;
		};
		// console.log(this.idx);
		if (this.idx != 0) {
				this.$pages.eq(this.idx-1).animate({'transform':'translate(0,'+ -this.h +'px)'},600);
			};
		if (this.idx != this.len-1) {
				this.$pages.eq(this.idx+1).animate({'transform':'translate(0,'+ this.h +'px)'},600);
			};
		var self = this;
		this.$pages.eq(this.idx).animate({"transform":"translate(0,0)"}, 600,function(){
			if (temp == self.idx) return;
			self.outArray[temp] && self.outArray[temp]();
			//下一屏运动完了反过来设置上一屏为下一次进场动画准备
			self.inArray[self.idx] && self.inArray[self.idx]();/////////
		});
	};
	function Manager(){
		this.picAmount = 0;
		this.swipe = null;//轮播图
		this.hasWdata = null;//便于得到轮播图的那一屏,为第四屏,new 轮播图组件
		this.loadingPage = $(".loading_page");
		this.box = $(".box").hide();//整个滚滚屏
		this.loading = this.loadingPage.find(".loading");//loading图
		this.loadSpan = this.loading.find('span');//加载条
		this.replaceImgs = $("img[data-src]");//ajax加载后需要被替换的图
		
		var self = this;
		$.get("resource.txt",function(data){
			data = typeof data == "object" ? data : JSON.parse(data);
			for(var i = 0,k,count=0 ; i < data.pages.length ; i++){
				if (i===3) {
					var picSrcs = [];
					self.hasWdata = data.pages[i];
					for(var k in self.hasWdata){
						picSrcs.push('images/'+self.hasWdata[k]);
					};
					//得到了轮播图片的src数组
				};
				for(k in data.pages[i]){
					self.picAmount++;
					var $img = $(new Image()).attr('src', 'images/'+data.pages[i][k]);
					$img.attr('class', $('.'+k).attr('class'));
					$('.'+k).replaceWith($img);
					$img.on("load",function() {
						count++;
						self.loadSpan.css('width', 100*count/self.picAmount+"%");//加载条进度百分比
						if (count == self.picAmount) {//此时加载图片全部完成，后续操作
								self.loadingPage.hide();
								self.box.show();
								self.slide = new Slide(".box");
								self.swipe = new Swipe({
									"dom":document.querySelector(".swipe"),
									"interval":500,
									"width":1,//小数字
									"imgSrc": picSrcs
								});
						};
					});
				};
			};
		});
	};