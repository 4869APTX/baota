$(function(){
    $.fn.extend({
        fixedThead:function(options){
            var _that = $(this);
            console.log(_that);
            var option = {
                height:400,
                shadow:true,
                resize:true
            };
            options = $.extend(option,options);
            if($(this).find('table').length === 0){
                return false;
            }
            var _height = $(this)[0].style.height,_table_config = _height.match(/([0-9]+)([%\w]+)/);
            if(_table_config === null){
                _table_config = [null,options.height,'px'];
            }else{
                $(this).css({
                    'boxSizing': 'content-box',
                    'paddingBottom':$(this).find('thead').height()
                });
            }
            $(this).css({'position':'relative'});
            var _thead = $(this).find('thead')[0].outerHTML,
                _tbody = $(this).find('tbody')[0].outerHTML,
                _thead_div = $('<div class="thead_div"><table class="table table-hover mb0"></table></div>'),
                _shadow_top = $('<div class="tbody_shadow_top"></div>'),
                _tbody_div = $('<div class="tbody_div" style="height:'+ _table_config[1] + _table_config[2] +';"><table class="table table-hover mb0" style="margin-top:-'+ $(this).find('thead').height() +'px"></table></div>'),
                _shadow_bottom = $('<div class="tbody_shadow_bottom"></div>');
            _thead_div.find('table').append(_thead);
            _tbody_div.find('table').append(_thead);
            _tbody_div.find('table').append(_tbody);
            $(this).html('');
            $(this).append(_thead_div);
            $(this).append(_shadow_top);
            $(this).append(_tbody_div);
            $(this).append(_shadow_bottom);
            var _table_width = _that.find('.thead_div table')[0].offsetWidth,
                _body_width = _that.find('.tbody_div table')[0].offsetWidth,
                _length = _that.find('tbody tr:eq(0)>td').length;
            $(this).find('tbody tr:eq(0)>td').each(function(index,item){
                var _item = _that.find('thead tr:eq(0)>th').eq(index);
                if(index === (_length-1)){
                	_item.attr('width',$(item)[0].clientWidth + (_table_width - _body_width));
                }else{
                	_item.attr('width',$(item)[0].offsetWidth);
                }
            });
            if(options.resize){
                $(window).resize(function(){
            		var _table_width = _that.find('.thead_div table')[0].offsetWidth,
	                _body_width = _that.find('.tbody_div table')[0].offsetWidth,
	                _length = _that.find('tbody tr:eq(0)>td').length;
		            _that.find('tbody tr:eq(0)>td').each(function(index,item){
		                var _item = _that.find('thead tr:eq(0)>th').eq(index);
		                if(index === (_length-1)){
		                	_item.attr('width',$(item)[0].clientWidth + (_table_width - _body_width));
		                }else{
		                	_item.attr('width',$(item)[0].offsetWidth);
		                }
		            });
	            });	
            }
            if(options.shadow){
                var table_body = $(this).find('.tbody_div')[0];
                if(_table_config[1] >= table_body.scrollHeight){
                    $(this).find('.tbody_shadow_top').hide();
                    $(this).find('.tbody_shadow_bottom').hide();
                }else{
                    $(this).find('.tbody_shadow_top').hide();
                    $(this).find('.tbody_shadow_bottom').show();
                }
                $(this).find('.tbody_div').scroll(function(e){
                    var _scrollTop = $(this)[0].scrollTop,
                        _scrollHeight  = $(this)[0].scrollHeight,
                        _clientHeight = $(this)[0].clientHeight,
                        _shadow_top = _that.find('.tbody_shadow_top'),
                        _shadow_bottom = _that.find('.tbody_shadow_bottom');
                    if(_scrollTop == 0){
                        _shadow_top.hide();
                        _shadow_bottom.show();
                    }else if(_scrollTop > 0 && _scrollTop < (_scrollHeight - _clientHeight)){
                        _shadow_top.show();
                        _shadow_bottom.show();
                    }else if(_scrollTop == (_scrollHeight - _clientHeight)){
                        _shadow_top.show();
                        _shadow_bottom.hide();
                    }
                })
            }
        }
        
    });
}(jQuery))

$(document).ready(function() {
	$(".sub-menu a.sub-menu-a").click(function() {
		$(this).next(".sub").slideToggle("slow").siblings(".sub:visible").slideUp("slow");
	});
});
var aceEditor = {
	layer_view:'', 
	aceConfig:{},  //ace配置参数
	editor: null,
	pathAarry:[],
	editorLength: 0,
	isAceView:true,
	ace_active:'',
	is_resizing:false,
	menu_path:'', //当前文件目录根地址
	refresh_config:{
		el:{}, // 需要重新获取的元素,为DOM对象
		path:'',// 需要获取的路径文件信息
		group:1,// 当前列表层级，用来css固定结构
		is_empty:true
	}, //刷新配置参数
	// 事件编辑器-方法，事件绑定
	eventEditor: function () {
		var _this = this,_icon = '<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>';
		$(window).resize(function(){
			if(_this.ace_active != undefined) _this.setEditorView()
			if( $('.aceEditors .layui-layer-maxmin').length >0){
            	$('.aceEditors').css({
                	'top':0,
                	'left':0,
                	'width':$(this)[0].innerWidth,
                	'height':$(this)[0].innerHeight
                });
            }
		})
		$(document).click(function(e){
			$('.ace_toolbar_menu').hide();
			$('.ace_conter_editor .ace_editors').css('fontSize', _this.aceConfig.aceEditor.fontSize + 'px');
			$('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
		});
		$('.ace_editor_main').on('click',function(){
            $('.ace_toolbar_menu').hide();
        });
		$('.ace_toolbar_menu').click(function(e){
			e.stopPropagation();
			e.preventDefault();
		});
		// 显示工具条
		$('.ace_header .pull-down').click(function(){
			if($(this).find('i').hasClass('glyphicon-menu-down')){
                $('.ace_header').css({'top':'-35px'});
                $('.ace_overall').css({'top':'0'});
                $(this).css({'top':'35px','height':'40px','line-height':'40px'});
				$(this).find('i').addClass('glyphicon-menu-up').removeClass('glyphicon-menu-down');
			}else{
				$('.ace_header').css({'top':'0'});
                $('.ace_overall').css({'top':'35px'});
                $(this).removeAttr('style');
				$(this).find('i').addClass('glyphicon-menu-down').removeClass('glyphicon-menu-up');
			}
			_this.setEditorView();
		});
		// 切换TAB视图
		$('.ace_conter_menu').on('click', '.item', function (e) {
			var _id = $(this).attr('data-id'),_item = _this.editor[_id]
			$('.item_tab_'+ _id).addClass('active').siblings().removeClass('active');
			$('#ace_editor_'+ _id).addClass('active').siblings().removeClass('active');
			_this.ace_active = _id;
			_this.currentStatusBar(_id);
			_this.is_file_history(_item);
		});
		// 移上TAB按钮变化，仅文件被修改后
		$('.ace_conter_menu').on('mouseover', '.item .icon-tool', function () {
			var type = $(this).attr('data-file-state');
			if (type != '0') {
				$(this).removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
			}
		});
		// 移出tab按钮变化，仅文件被修改后
		$('.ace_conter_menu').on('mouseout', '.item .icon-tool', function () {
			var type = $(this).attr('data-file-state');
			if (type != '0') {
				$(this).removeClass('glyphicon-remove').addClass('glyphicon-exclamation-sign');
			}
		});
		// 关闭编辑视图
		$('.ace_conter_menu').on('click', '.item .icon-tool', function (e) {
			var file_type = $(this).attr('data-file-state');
			var file_title = $(this).attr('data-title');
			var _id = $(this).parent().parent().attr('data-id');
			switch (file_type) {
				// 直接关闭
				case '0':
					_this.removeEditor(_id);
				break;
					// 未保存
				case '1':
					var loadT = layer.open({
						type: 1,
						area: ['400px', '180px'],
						title: '提示',
						content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">是否保存对&nbsp<span class="size_ellipsis" style="max-width:150px;vertical-align: top;" title="' + file_title + '">' + file_title + '</span>&nbsp的更改？</div>\
							<div class="clear-tips">如果不保存，更改会丢失！</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default" style="float:left" data-type="2">不保存文件</button>\
								<button type="button" class="btn btn-sm btn-default" style="margin-right:10px;" data-type="1">取消</button>\
								<button type="button" class="btn btn-sm btn-success" data-type="0">保存文件</button>\
							</div>\
						</div>',
						success: function (layers, index) {
							$('.ace-clear-btn .btn').click(function () {
								var _type = $(this).attr('data-type'),
									_item = _this.editor[_id];
								switch (_type) {
									case '0': //保存文件
										_this.saveFileMethod(_item);
									break;
									case '1': //关闭视图
										layer.close(index);
									break;
									case '2': //取消保存
										_this.removeEditor(_id);
										layer.close(index);
									break;
								}
							});
						}
					});
				break;
			}
			$('.ace_toolbar_menu').hide();
			$('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
			e.stopPropagation();
			e.preventDefault();
		});
		$(window).keyup(function(e){
			if(e.keyCode === 116 && $('#ace_conter').length == 1){
				layer.msg('编辑器模式下无法刷新网页，请关闭后重试');
			}
		});
		// 新建编辑器视图
		$('.ace_editor_add').click(function () {
			_this.addEditorView();
		});
		// 底部状态栏功能按钮
		$('.ace_conter_toolbar .pull-right span').click(function (e) {
			var _type = $(this).attr('data-type'),
				_item = _this.editor[_this.ace_active];
			$('.ace_toolbar_menu').show();
			switch (_type) {
				case 'cursor':
					$('.ace_toolbar_menu').hide();
					$('.ace_header .jumpLine').click();
				break;
				
				case 'history':
					$('.ace_toolbar_menu').hide();
					if(_item.historys.length === 0){
						layer.msg('历史文件为空',{icon:0});
						return false;
					}
					_this.layer_view = layer.open({
						type: 1,
						area: '550px',
						title: '文件历史版本[ '+ _item.fileName +' ]',
						skin:'historys_layer',
						content: '<div class="pd20">\
							<div class="divtable">\
								<table class="historys table table-hover">\
									<thead><tr><th>文件名</th><th>版本时间</th><th style="text-align:right;">操作</th></tr></thead>\
									<tbody></tbody>\
								</table>\
							</div>\
						</div>',
						success:function(layeo,index){
							var _html = '';
							for(var i=0;i<_item.historys.length;i++){
								_html += '<tr><td><span class="size_ellipsis" style="max-width:200px">'+ _item.fileName +'</span></td><td>'+ bt.format_data(_item.historys[i]) +'</td><td align="right"><a href="javascript:;" class="btlink open_history_file" data-time="'+ _item.historys[i] +'">打开文件</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="javascript:;" class="btlink recovery_file_historys" data-history="'+ _item.historys[i] +'" data-path="'+ _item.path +'">恢复</a></td></tr>'
							}
							if(_html === '') _html += '<tr><td colspan="3">当前文件无历史版本</td></tr>'
							$('.historys tbody').html(_html);
							$('.historys_layer').css('top', ($(window).height()/2)-($('.historys_layer').height()/2)+'px')
							$('.open_history_file').click(function(){
								var _history = $(this).attr('data-time');
								_this.openHistoryEditorView({filename:_item.path,history:_history},function(){
									layer.close(index);
									$('.ace_conter_tips').show();
									$('.ace_conter_tips .tips').html('只读文件，文件为'+ _item.path +'，历史版本 [ '+ bt.format_data(new Number(_history)) +' ]<a href="javascript:;" class="ml35 btlink" data-path="'+ _item.path +'" data-history="'+ _history +'">点击恢复当前历史版本</a>');
								});
							});
							$('.recovery_file_historys').click(function(){
								_this.event_ecovery_file(this);
							});
						}
					});
				break;
				case 'tab':
					$('.ace_toolbar_menu .menu-tabs').show().siblings().hide();
					$('.tabsType').find(_item.softTabs?'[data-value="nbsp"]':'[data-value="tabs"]').addClass('active').append(_icon);
					$('.tabsSize [data-value="'+ _item.tabSize +'"]').addClass('active').append(_icon);
				break;
				case 'encoding':
					_this.getEncodingList(_item.encoding);
					$('.ace_toolbar_menu .menu-encoding').show().siblings().hide();
				break;
				case 'lang':
					$('.ace_toolbar_menu').hide();
					layer.msg('暂不支持切换语言模式，敬请期待!',{icon:6});
				break;
			}
			e.stopPropagation();
			e.preventDefault();
		});
		// 隐藏目录
		$('.tips_fold_icon .glyphicon').click(function(){
			if($(this).hasClass('glyphicon-menu-left')){
				$('.ace_conter_tips').css('right','0');
				$('.tips_fold_icon').css('left','0');
				$(this).removeClass('glyphicon-menu-left').addClass('glyphicon-menu-right');
			}else{
				$('.ace_conter_tips').css('right','-100%');
				$('.tips_fold_icon').css('left','-25px');
				$(this).removeClass('glyphicon-menu-right').addClass('glyphicon-menu-left');
			}
		});
		// 设置换行符
		$('.menu-tabs').on('click','li',function(e){
			var _val = $(this).attr('data-value'),_item =  _this.editor[_this.ace_active];
			if($(this).parent().hasClass('tabsType')){
				_item.ace.getSession().setUseSoftTabs(_val == 'nbsp');
				_item.softTabs = _val == 'nbsp';
			}else{
				_item.ace.getSession().setTabSize(_val);
				_item.tabSize = _val;
			}
			$(this).siblings().removeClass('active').find('.icon').remove();
			$(this).addClass('active').append(_icon);
			_this.currentStatusBar(_item.id);
			e.stopPropagation();
			e.preventDefault();
		});
		// 设置编码内容
		$('.menu-encoding').on('click','li',function(e){
			var _item = _this.editor[_this.ace_active];
			layer.msg('设置文件编码：' + $(this).attr('data-value'));
			$('.ace_conter_toolbar [data-type="encoding"]').html('编码：<i>'+ $(this).attr('data-value') +'</i>');
			$(this).addClass('active').append(_icon).siblings().removeClass('active').find('span').remove();
			_item.encoding = $(this).attr('data-value');
			_this.saveFileMethod(_item);
		});
		// 搜索内容键盘事件
		$('.menu-files .menu-input').keyup(function () {
			_this.searchRelevance($(this).val());
			if($(this).val != ''){
				$(this).next().show();
			}else{
				$(this).next().hide();
			}
		});
		// 清除搜索内容事件
		$('.menu-files .menu-conter .fa').click(function(){
			$('.menu-files .menu-input').val('').next().hide();
			_this.searchRelevance();
		});
		// 顶部状态栏
		$('.ace_header>span').click(function (e) {
			var type =  $(this).attr('class'),_item =  _this.editor[_this.ace_active];
			if(_this.ace_active == '' && type != 'helps'){
				return false;
			}
			switch(type){
				case 'saveFile': //保存当时文件
					_this.saveFileMethod(_item);
				break;
				case 'saveFileAll': //保存全部
					var loadT = layer.open({
						type: 1,
						area: ['350px', '180px'],
						title: '提示',
						content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">是否保存对全部文件的更改？</div>\
							<div class="clear-tips">如果不保存，更改会丢失！</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default clear-btn" style="margin-right:10px;" >取消</button>\
								<button type="button" class="btn btn-sm btn-success save-all-btn">保存文件</button>\
							</div>\
						</div>',
						success: function (layers, index) {
							$('.clear-btn').click(function(){
								layer.close(index);
							});
							$('.save-all-btn').click(function(){
								var _arry = [],editor = aceEditor['editor'];
								for(var item in editor){
									_arry.push({
										path: editor[item]['path'],
										data: editor[item]['ace'].getValue(),
										encoding: editor[item]['encoding'],
									})
								}
								_this.saveAllFileBody(_arry,function(){
									$('.ace_conter_menu>.item').each(function (el,index) {
										$(this).find('i').attr('data-file-state','0').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
										_item.fileType = 0;
									});
									layer.close(index);
								});
							});
						}
					});
				break;
				case 'refreshs': //刷新文件
					if(_item.fileType === 0 ){
						aceEditor.getFileBody({path:_item.path},function(res){
							_item.ace.setValue(res.data);
							_item.fileType = 0;
							$('.item_tab_' + _item.id + ' .icon-tool').attr('data-file-state', '0').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
							layer.msg('刷新成功',{icon:1});
						});
						return false;
					}
					var loadT = layer.open({
						type: 1,
						area: ['350px', '180px'],
						title: '提示',
						content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">是否刷新当前文件</div>\
							<div class="clear-tips">刷新当前文件会覆盖当前修改,是否继续！</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default clear-btn" style="margin-right:10px;" >取消</button>\
								<button type="button" class="btn btn-sm btn-success save-all-btn">确定</button>\
							</div>\
						</div>',
						success: function (layers, index) {
							$('.clear-btn').click(function(){
								layer.close(index);
							});
							$('.save-all-btn').click(function(){
								aceEditor.getFileBody({path:_item.path},function(res){
									layer.close(index);
									_item.ace.setValue(res.data);
									_item.fileType == 0;
									$('.item_tab_' + _item.id + ' .icon-tool').attr('data-file-state', '0').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
									layer.msg('刷新成功',{icon:1});
								});
							});
						}
					});
				break;
				// 搜索
				case 'searchs':
					_item.ace.execCommand('find');
				break;
				// 替换
				case 'replaces':
					_item.ace.execCommand('replace');
				break;
				// 跳转行
				case 'jumpLine':
					$('.ace_toolbar_menu').show().find('.menu-jumpLine').show().siblings().hide();
					$('.set_jump_line input').val('').focus();
				    var _cursor = aceEditor.editor[aceEditor.ace_active].ace.selection.getCursor();
				    $('.set_jump_line .jump_tips span:eq(0)').text(_cursor.row);
				    $('.set_jump_line .jump_tips span:eq(1)').text(_cursor.column);
				    $('.set_jump_line .jump_tips span:eq(2)').text(aceEditor.editor[aceEditor.ace_active].ace.session.getLength());
					$('.set_jump_line input').unbind('keyup').on('keyup',function(e){
					    var _val = $(this).val();
						if((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)){
						    if(_val != '' && typeof parseInt(_val) == 'number'){
						        _item.ace.gotoLine(_val);
						    };
						}
					});
				break;
				// 字体
				case 'fontSize':
					$('.ace_toolbar_menu').show().find('.menu-fontSize').show().siblings().hide();
					$('.menu-fontSize .set_font_size input').val(_this.aceConfig.aceEditor.fontSize).focus();
					$('.menu-fontSize set_font_size input').unbind('keypress onkeydown').on('keypress onkeydown',function (e){
						var _val = $(this).val();
						if(_val == ''){
							$(this).css('border','1px solid red');
							$(this).next('.tips').text('字体设置范围 12-45');
						}else if(!isNaN(_val)){
							$(this).removeAttr('style');
							if(parseInt(_val) > 11 && parseInt(_val) <45){
								$('.ace_conter_editor .ace_editors').css('fontSize', _val+'px')
							}else{
								$('.ace_conter_editor .ace_editors').css('fontSize','13px');
								$(this).css('border','1px solid red');
								$(this).next('.tips').text('字体设置范围 12-45');
							}
						}else{
							$(this).css('border','1px solid red');
							$(this).next('.tips').text('字体设置范围 12-45');
						}
						e.stopPropagation();
						e.preventDefault();
					});
					$('.menu-fontSize .menu-conter .set_font_size input').unbind('change').change(function (){
						var _val = $(this).val();
						$('.ace_conter_editor .ace_editors').css('fontSize',_val+'px');
					});
					$('.set_font_size .btn-save').unbind('click').click(function(){
						var _fontSize = $('.set_font_size input').val();
						_this.aceConfig.aceEditor.fontSize = parseInt(_fontSize);
						_this.saveAceConfig(_this.aceConfig,function(res){
							if(res.status){
								$('.ace_editors').css('fontSize',_fontSize +'px');
								layer.msg('设置成功', {icon: 1});
							}
						});
					}); 
				break;
				//主题
				case 'themes':
					$('.ace_toolbar_menu').show().find('.menu-themes').show().siblings().hide();
					var _html = '',_arry = ['白色主题','黑色主题'];
					for(var i=0;i<_this.aceConfig.themeList.length;i++){
						if(_this.aceConfig.themeList[i] != _this.aceConfig.aceEditor.editorTheme){
							_html += '<li data-value="'+ _this.aceConfig.themeList[i] +'">'+ _this.aceConfig.themeList[i] +'【'+ _arry[i] +'】</li>';
						}else{
							_html += '<li data-value="'+ _this.aceConfig.themeList[i] +'" class="active">'+ _this.aceConfig.themeList[i] +'【'+ _arry[i] +'】'+ _icon +'</li>';
						}
					}
					$('.menu-themes ul').html(_html);
					$('.menu-themes ul li').click(function(){
						var _theme = $(this).attr('data-value');
                        $(this).addClass('active').append(_icon).siblings().removeClass('active').find('.icon').remove();
						_this.aceConfig.aceEditor.editorTheme = _theme;
						_this.saveAceConfig(_this.aceConfig,function(res){
							for(var item in _this.editor){
								_this.editor[item].ace.setTheme("ace/theme/"+_theme);
							}
							layer.msg('设置成功', {icon: 1});
						});
					});
				break;
				case 'setUp':
					$('.ace_toolbar_menu').show().find('.menu-setUp').show().siblings().hide();
					$('.menu-setUp .editor_menu li').each(function(index,el){
						var _type = _this.aceConfig.aceEditor[$(el).attr('data-type')];
						if(_type) $(el).addClass('active').append(_icon);
					})
					$('.menu-setUp .editor_menu li').unbind('click').click(function(){
						var _type = $(this).attr('data-type');
						_this.aceConfig.aceEditor[_type] = !$(this).hasClass('active');
						if($(this).hasClass('active')){
							$(this).removeClass('active').find('.icon').remove();
						}else{
							$(this).addClass('active').append(_icon);
						}
						_this.saveAceConfig(_this.aceConfig,function(res){
							for(var item in _this.editor){
								_this.editor[item].ace.setOption(_type,_this.aceConfig.aceEditor[_type]);
							}
							layer.msg('设置成功', {icon: 1});
						});
					});
				break;
				case 'helps':
					if(!$('[data-type=shortcutKeys]').length != 0){
						_this.addEditorView(1,{title:'快捷键提示',html:aceShortcutKeys.innerHTML});
					}else{
						$('[data-type=shortcutKeys]').click();
					}
				break;
			}
			
			e.stopPropagation();
			e.preventDefault();
		});
		
		// 文件目录选择
		$('.ace_catalogue_list').on('click','.has-children .file_fold',function(e){
			var _layers = $(this).attr('data-layer'),_type = $(this).find('data-type'),_path = $(this).parent().attr('data-menu-path'),_menu = $(this).find('.glyphicon'),_group = parseInt($(this).attr('data-group')),_file = $(this).attr('data-file'),_tath = $(this);
			var _active = $('.ace_catalogue_list .has-children .file_fold.edit_file_group');
			if(_active.length>0 && $(this).attr('data-edit') === undefined){
				switch(_active.attr('data-edit')){
					case '2':
						_active.find('.file_input').siblings().show();
						_active.find('.file_input').remove();
						_active.removeClass('edit_file_group').removeAttr('data-edit');
					break;
					case '1':
					case '0':
						_active.parent().remove();
					break;
				}
				layer.closeAll('tips');
			}
			$('.ace_toolbar_menu').hide();
			$('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
			if($(this).hasClass('edit_file_group')) return false;
			$('.ace_catalogue_list .has-children .file_fold').removeClass('bg');
			$(this).addClass('bg');
			if($(this).attr('data-file') == 'Dir'){
				if(_menu.hasClass('glyphicon-menu-right')){
					_menu.removeClass('glyphicon-menu-right').addClass('glyphicon-menu-down');
					$(this).next().show();
					if($(this).next().find('li').length == 0) _this.reader_file_dir_menu({el:$(this).next(),path:_path,group:_group+1});
				}else{
					_menu.removeClass('glyphicon-menu-down').addClass('glyphicon-menu-right');
					$(this).next().hide();
				}
			}else{
				_this.openEditorView(_path,function(res){
					if(res.status) _tath.addClass('active');
				});
			}
			e.stopPropagation();
			e.preventDefault();
		});
		// 禁用目录选择（文件目录）
		$('.ace_catalogue').bind("selectstart",function(e){
			var omitformtags = ["input", "textarea"];
			omitformtags = "|" + omitformtags.join("|") + "|";
			if (omitformtags.indexOf("|" + e.target.tagName.toLowerCase() + "|") == -1) {
				return false;
			}else{
				return true;
			}
		});
		// 返回目录（文件目录主菜单）
		$('.ace_dir_tools').on('click','.upper_level',function(){
			var _paths = $(this).attr('data-menu-path');
			_this.reader_file_dir_menu({path:_paths,is_empty:true});
			$('.ace_catalogue_title').html('目录：'+ _paths).attr('title',_paths);
		});
		// 新建文件（文件目录主菜单）
		$('.ace_dir_tools').on('click','.new_folder',function(e){
			var _paths = $(this).parent().find('.upper_level').attr('data-menu-path');
			$(this).find('.folder_down_up').show();
			$(document).click(function(){
				$('.folder_down_up').hide();
				$(this).unbind('click');
				return false;
			});
			$('.ace_toolbar_menu').hide();
			$('.ace_catalogue_menu').hide();
			$('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
			e.stopPropagation();
			e.preventDefault();
		});
		// 刷新列表 (文件目录主菜单)
		$('.ace_dir_tools').on('click','.refresh_dir',function(e){
			_this.refresh_config = {
				el:$('.cd-accordion-menu')[0],
				path:$('.ace_catalogue_title').attr('title'),
				group:1,
				is_empty:true
			}
			_this.reader_file_dir_menu(_this.refresh_config,function(){
				layer.msg('刷新成功',{icon:1});
			});
		});
		// 搜索内容 (文件目录主菜单)
		$('.ace_dir_tools').on('click','.search_file',function(e){
			if($(this).parent().find('.search_input_view').length == 0){
				$(this).siblings('div').hide();
				$(this).css('color','#ec4545').attr({'title':'关闭'}).find('.glyphicon').removeClass('glyphicon-search').addClass('glyphicon-remove').next().text("关闭");
				$(this).before('<div class="search_input_title">搜索目录文件</div>');
				$(this).after('<div class="search_input_view">\
					<form>\
                        <input type="text" id="search_input_val" class="ser-text pull-left" placeholder="">\
                        <button type="button" class="ser-sub pull-left"></button>\
                    </form>\
                    <div class="search_boxs">\
                        <input id="search_alls" type="checkbox">\
                        <label for="search_alls"><span>包含子目录文件</span></label>\
                    </div>\
                </div>');
				$('.ace_catalogue_list').css('top','150px');
				$('.ace_dir_tools').css('height','110px');
				$('.cd-accordion-menu').empty();
			}else{
				$(this).siblings('div').show();
				$(this).parent().find('.search_input_view,.search_input_title').remove();
				$(this).removeAttr('style').attr({'title':'搜索内容'}).find('.glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-search').next().text("搜索");
				$('.ace_catalogue_list').removeAttr('style')
				$('.ace_dir_tools').removeAttr('style');
				_this.refresh_config = {
					el:$('.cd-accordion-menu')[0],
					path:$('.ace_catalogue_title').attr('title'),
					group:1,
					is_empty:true
				}
				_this.reader_file_dir_menu(_this.refresh_config);
			}
		});
		
		// 搜索文件内容
		$('.ace_dir_tools').on('click','.search_input_view button',function(e){
			var path = _this.menu_path,
				search = $('#search_input_val').val();
				_this.reader_file_dir_menu({
					el:$('.cd-accordion-menu')[0],
					path:path,
					group:1,
					search:search,
					all:$('#search_alls').is(':checked')?'True':'False',
					is_empty:true
				})
		});
		
		// 当前根目录操作，新建文件或目录
		$('.ace_dir_tools').on('click','.folder_down_up li',function(e){
			var _type = parseInt($(this).attr('data-type'));
			switch(_type){
				case 2:
					_this.newly_file_type_dom($('.cd-accordion-menu'),0,0);
				break;
				case 3:
					_this.newly_file_type_dom($('.cd-accordion-menu'),0,1);
				break;
			}
			_this.refresh_config = {
				el:$('.cd-accordion-menu')[0],
				path:$('.ace_catalogue_title').attr('title'),
				group:1,
				is_empty:true
			}
			$(this).parent().hide();
			$('.ace_toolbar_menu').hide();
			$('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
			e.preventDefault();
			e.stopPropagation();
		});
		// 移动编辑器文件目录
		$('.ace_catalogue_drag_icon .drag_icon_conter').on('mousedown', function (e) {
			var _left = $('.aceEditors')[0].offsetLeft;
			$('.ace_gutter-layer').css('cursor','col-resize');
			$('#ace_conter').unbind().on('mousemove',function(ev){
				var _width = (ev.clientX+1) -_left;
				if(_width >= 265 && _width <= 450){
					$('.ace_catalogue').css({'width':_width,'transition':'none'});
					$('.ace_editor_main').css({'marginLeft':_width,'transition':'none'});
					$('.ace_catalogue_drag_icon ').css('left',_width);
					$('.file_fold .newly_file_input').width($('.file_fold .newly_file_input').parent().parent().parent().width() - ($('.file_fold .newly_file_input').parent().parent().attr('data-group') * 15 -5)-20-30-53);
				}
			}).on('mouseup', function (ev){
				$('.ace_gutter-layer').css('cursor','inherit');
			    $('.ace_catalogue').css('transition','all 500ms');
                $('.ace_editor_main').css('transition','all 500ms');
				$(this).unbind('mouseup mousemove');
			});
		});
		// 收藏目录显示和隐藏
        $('.ace_catalogue_drag_icon .fold_icon_conter').on('click',function (e) {
            if($('.ace_overall').hasClass('active')){
                $('.ace_overall').removeClass('active');
                $('.ace_catalogue').css('left','0');
                $(this).removeClass('active').attr('title','隐藏文件目录');
                $('.ace_editor_main').css('marginLeft',$('.ace_catalogue').width());
            }else{
                $('.ace_overall').addClass('active');
                $('.ace_catalogue').css('left','-'+$('.ace_catalogue').width()+'px');
                $(this).addClass('active').attr('title','显示文件目录');
                $('.ace_editor_main').css('marginLeft',0);
            }
            setTimeout(function(){
            	 if(_this.ace_active != '') _this.editor[_this.ace_active].ace.resize();
            },600);
        });
		// 恢复历史文件
		$('.ace_conter_tips').on('click','a',function(){
			_this.event_ecovery_file(this);
		});
		// 右键菜单
		$('.ace_catalogue_list').on('mousedown','.has-children .file_fold',function(e){
			var x = e.clientX,y = e.clientY,_left = $('.aceEditors')[0].offsetLeft,_top = $('.aceEditors')[0].offsetTop,_that = $('.ace_catalogue_list .has-children .file_fold'),_active =$('.ace_catalogue_list .has-children .file_fold.edit_file_group');
			$('.ace_toolbar_menu').hide();
			if(e.which === 3){
				if($(this).hasClass('edit_file_group')) return false;
				$('.ace_catalogue_menu').css({'display':'block','left':x-_left,'top':y-_top});
				_that.removeClass('bg');
				$(this).addClass('bg');
				_active.attr('data-edit') != '2'?_active.parent().remove():'';
				_that.removeClass('edit_file_group').removeAttr('data-edit');
				_that.find('.file_input').siblings().show();
				_that.find('.file_input').remove();
				$('.ace_catalogue_menu li').show();
				if($(this).attr('data-file') == 'Dir'){
					$('.ace_catalogue_menu li:nth-child(6)').hide();
				}else{
					$('.ace_catalogue_menu li:nth-child(-n+4)').hide();
				}
				$(document).click(function(){
					$('.ace_catalogue_menu').hide();
					$(this).unbind('click');
					return false;
				});
				_this.refresh_config = {
					el:$(this).parent().parent()[0],
					path:_this.get_file_dir($(this).parent().attr('data-menu-path'),1),
					group:parseInt($(this).attr('data-group')),
					is_empty:true
				}
			}
		});
		// 文件目录右键功能
		$('.ace_catalogue_menu li').click(function(e){
			_this.newly_file_type(this);
		});
		// 新建、重命名鼠标事件
		$('.ace_catalogue_list').on('click','.has-children .edit_file_group .glyphicon-ok',function(){
			var _file_or_dir = $(this).parent().find('input').val(),
			_file_type = $(this).parent().parent().attr('data-file'),
			_path = $('.has-children .file_fold.bg').parent().attr('data-menu-path'),
			_type = parseInt($(this).parent().parent().attr('data-edit'));
			if($(this).parent().parent().parent().attr('data-menu-path') === undefined && parseInt($(this).parent().parent().attr('data-group')) === 1){
			    console.log('根目录')
			    _path = $('.ace_catalogue_title').attr('title');
			}
// 			return false;
			if(_file_or_dir === ''){
				$(this).prev().css('border','1px solid #f34a4a');
				layer.tips(_type===0?'文件目录不能为空':(_type===1?'文件名称不能空':'新名称不能为空'),$(this).prev(),{tips: [1,'#f34a4a'],time:0});
				return false;
			}else if($(this).prev().attr('data-type') == 0){
				return false;
			}
			switch(_type){
				case 0: //新建文件夹
					_this.event_create_dir({ path:_path+'/'+_file_or_dir });
				break;
				case 1: //新建文件
					_this.event_create_file({ path:_path+'/'+_file_or_dir });
				break;
				case 2: //重命名
					_this.event_rename_currency({ sfile:_path,dfile:_this.get_file_dir(_path,1)+'/'+_file_or_dir});
				break;
			}
		});
		// 新建、重命名键盘事件
		$('.ace_catalogue_list').on('keyup','.has-children .edit_file_group input',function(e){
			var _type = $(this).parent().parent().attr('data-edit'),
			_arry = $('.has-children .file_fold.bg+ul>li');
			if(_arry.length == 0 && $(this).parent().parent().attr('data-group') == 1) _arry = $('.cd-accordion-menu>li')
			if(_type != 2){
				for(var i=0;i<_arry.length;i++){
					if($(_arry[i]).find('.file_title span').html() === $(this).val()){
						$(this).css('border','1px solid #f34a4a');
						$(this).attr('data-type',0);
						layer.tips(_type == 0?'文件目录存在同名目录':'文件名称存在同名文件',$(this)[0],{tips: [1,'#f34a4a'],time:0});
						return false
					}
				}
			}
			if(_type == 1 && $(this).val().indexOf('.')) $(this).prev().removeAttr('class').addClass(_this.get_file_suffix($(this).val())+'-icon');
			$(this).attr('data-type',1);
			$(this).css('border','1px solid #528bff');
			layer.closeAll('tips');
			if(e.keyCode === 13) $(this).next().click();
			$('.ace_toolbar_menu').hide();
			$('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
			e.stopPropagation();
			e.preventDefault();
		});
		// 新建、重命名鼠标点击取消事件
		$('.ace_catalogue_list').on('click','.has-children .edit_file_group .glyphicon-remove',function(){
			layer.closeAll('tips');
			if($(this).parent().parent().parent().attr('data-menu-path')){
				$(this).parent().parent().removeClass('edit_file_group').removeAttr('data-edit');
				$(this).parent().siblings().show();
				$(this).parent().remove();
				return false;
			}
			$(this).parent().parent().parent().remove();
		});
		//屏蔽浏览器右键菜单
		$('.ace_catalogue_list')[0].oncontextmenu=function(){
			return false;
		}
		$('.ace_conter_menu').dragsort({
			dragSelector:'.icon_file',
			itemSelector:'li'
		});
		this.setEditorView();
		this.reader_file_dir_menu();
	},
    // 	设置本地存储，设置类型type：session或local
	setStorage:function(type,key,val){
	    if(type != "local" && type != "session")  val = key,key = type,type = 'session';
	    window[type+'Storage'].setItem(key,val);
	},
	//获取指定本地存储，设置类型type：session或local
	getStorage:function(type,key){
	    if(type != "local" && type != "session")  key = type,type = 'session';
	    return window[type+'Storage'].getItem(key);
	},
	//删除指定本地存储，设置类型type：session或local
	removeStorage:function(type,key){
	    if(type != "local" && type != "session")  key = type,type = 'session';
	    window[type+'Storage'].removeItem(key);
	},
    // 	删除指定类型的所有存储信息
	clearStorage:function(type){
	    if(type != "local" && type != "session")  key = type,type = 'session';
	    window[type+'Storage'].clear();
	},
	
	// 新建文件类型
	newly_file_type:function(that){
		var _type = parseInt($(that).attr('data-type')),
			_active = $('.ace_catalogue .ace_catalogue_list .has-children .file_fold.bg'),
			_group = parseInt(_active.attr('data-group')),
			_path = _active.parent().attr('data-menu-path'), //当前文件夹新建
			_this = this;
			console.log(_type);
		switch(_type){
			case 0: //刷新目录
				_active.next().empty();
				_this.reader_file_dir_menu({
					el:_active.next(),
					path:_path,
					group:parseInt(_active.attr('data-group')) + 1,
					is_empty:true
				},function(){
					layer.msg('刷新成功',{icon:1});
				});
			break;
			case 1: //打开文件
				_this.menu_path = _path;
				_this.reader_file_dir_menu({
					el:'.cd-accordion-menu',
					path:_this.menu_path,
					group:1,
					is_empty:true
				});
			break;
			case 2: //新建文件
			case 3:
				if(this.get_file_dir(_path,1) != this.menu_path){ //判断当前文件上级是否为显示根目录
					this.reader_file_dir_menu({el:_active,path:_path,group:_group+1},function(res){
						_this.newly_file_type_dom(_active,_group, _type == 2?0:1);
					});
				}else{
					_this.newly_file_type_dom(_active,_group,_type == 2?0:1);
				}
			break;
			case 4: //文件重命名
				var _types = _active.attr('data-file');
				if(_active.hasClass('active')){
					layer.msg('该文件已打开，无法修改名称',{icon:0});
					return false;
				}
				_active.attr('data-edit',2);
				_active.addClass('edit_file_group');
				_active.find('.file_title').hide();
				_active.find('.glyphicon').hide();
				_active.prepend('<span class="file_input"><i class="'+ (_types === 'Dir'?'folder':(_this.get_file_suffix(_active.find('.file_title span').html()))) +'-icon"></i><input type="text" class="newly_file_input" value="'+ (_active.find('.file_title span').html()) +'"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>')
				$('.file_fold .newly_file_input').width($('.file_fold .newly_file_input').parent().parent().parent().width() - ($('.file_fold .newly_file_input').parent().parent().attr('data-group') * 15 -5)-20-30-53);
				$('.file_fold .newly_file_input').focus();
			break;
			case 5:
				GetFileBytes(_path);
			break;
			case 6:
				var is_files =  _active.attr('data-file') === 'Files'
				layer.confirm(lan.get(is_files?'recycle_bin_confirm':'recycle_bin_confirm_dir', [_active.find('.file_title span').html()]), { title: is_files?lan.files.del_file:lan.files.del_dir, closeBtn: 2, icon: 3 }, function (index) {
					_this[is_files?'del_file_req':'del_dir_req']({path:_path},function(res){
						layer.msg(res.msg,{icon:res.status?1:2});
						if(res.status){
							if(_active.attr('data-group') != 1) _active.parent().parent().prev().addClass('bg')
							_this.reader_file_dir_menu(_this.refresh_config,function(){
								layer.msg(res.msg,{icon:1});
							});
						}
					});
				});
			break;
		}
	},
	// 新建文件和文件夹
	newly_file_type_dom:function(_active,_group,_type,_val){
		var _html = '',_this = this,_nextLength = _active.next(':not(.ace_catalogue_menu)').length;
		if(_nextLength > 0){
			_active.next().show();
			_active.find('.glyphicon').removeClass('glyphicon-menu-right').addClass('glyphicon-menu-down');
		}
		_html += '<li class="has-children children_'+ (_group+1) +'"><div class="file_fold edit_file_group group_'+ (_group+1) +'" data-group="'+ (_group+1) +'" data-edit="'+ _type +'"><span class="file_input">';
		_html += '<i class="'+ (_type == 0?'folder':(_type == 1?'text':(_this.get_file_suffix(_val || '')))) +'-icon"></i>'
		_html += '<input type="text" class="newly_file_input" value="'+ (_val != undefined?_val:'') +'">'
		_html += '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></span></div></li>'
		if(_nextLength > 0){
			_active.next().prepend(_html);
		}else{
			_active.prepend(_html);
		}
		setTimeout(function(){
		    $('.newly_file_input').focus()
		},100)
		$('.file_fold .newly_file_input').width($('.file_fold .newly_file_input').parent().parent().parent().width() - ($('.file_fold .newly_file_input').parent().parent().attr('data-group') * 15 -5)-20-30-53);
		return false;
	},
	// 通用重命名事件
	event_rename_currency:function(obj){
		var _active = $('.ace_catalogue_list .has-children .file_fold.edit_file_group'),_this = this;
		this.rename_currency_req({sfile:obj.sfile,dfile:obj.dfile},function(res){
			layer.msg(res.msg,{icon:res.status?1:2});
			if(res.status){
				_this.reader_file_dir_menu(_this.refresh_config,function(){
					layer.msg(res.msg,{icon:1});
				});
			}else{
				_active.find('.file_input').siblings().show();
				_active.find('.file_input').remove();
				_active.removeClass('edit_file_group').removeAttr('data-edit');
			}
		})
	},
	// 创建文件目录事件
	event_create_dir:function(obj){
		var _this = this;
		this.create_dir_req({path:obj.path},function(res){
			layer.msg(res.msg,{icon:res.status?1:2});
			if(res.status){
				_this.reader_file_dir_menu(_this.refresh_config,function(){
					layer.msg(res.msg,{icon:1});
				});
			}
		})
	},
	// 创建文件事件
	event_create_file:function(obj){
		var _this = this;
		this.create_file_req({path:obj.path},function(res){
			layer.msg(res.msg,{icon:res.status?1:2});
			if(res.status){
				_this.reader_file_dir_menu(_this.refresh_config,function(){
					layer.msg(res.msg,{icon:1});
					_this.openEditorView(obj.path);
				});
			}
		})
	},
	// 重命名请求
	rename_currency_req:function(obj,callback){
		var loadT = layer.msg('正在重命名文件或目录，请稍后...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=MvFile",{
			sfile:obj.sfile,
			dfile:obj.dfile,
			rename:'true'
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},	
	// 创建文件事件
	create_file_req:function(obj,callback){
		var loadT = layer.msg('正在新建文件，请稍后...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=CreateFile",{
			path:obj.path
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// 创建目录请求
	create_dir_req:function(obj,callback){
		var loadT = layer.msg('正在新建目录，请稍后...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=CreateDir",{
			path:obj.path
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// 删除文件请求
	del_file_req:function(obj,callback){
		var loadT = layer.msg('正在删除文件，请稍后...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=DeleteFile",{
			path:obj.path
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// 删除目录请求
	del_dir_req:function(obj,callback){
		var loadT = layer.msg('正在删除文件目录，请稍后...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=DeleteDir",{
			path:obj.path
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// 临时文件保存
	auto_save_temp:function(obj,callback){
		// var loadT = layer.msg('正在新建目录，请稍后...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=auto_save_temp",{
			filename:obj.filename,
			body:obj.body
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// 获取临时文件内容
	get_auto_save_body:function(obj,callback){
		var loadT = layer.msg('正在获取自动保存文件信息，请稍后...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=get_auto_save_body",{
			filename:obj.filename
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// 恢复历史文件事件
	event_ecovery_file:function(that){
		var _path = $(that).attr('data-path'),_history = new Number($(that).attr('data-history')),_this =this;
		var loadT = layer.open({
			type: 1,
			area: ['400px', '180px'],
			title: '恢复历史文件',
			content: '<div class="ace-clear-form">\
				<div class="clear-icon"></div>\
				<div class="clear-title">是否恢复历史文件&nbsp<span class="size_ellipsis" style="max-width:150px;vertical-align: top;" title="' + bt.format_data(_history) + '">' + bt.format_data(_history) + '</span>?</div>\
				<div class="clear-tips">恢复历史文件后，当前文件内容将会被替换！</div>\
				<div class="ace-clear-btn" style="">\
					<button type="button" class="btn btn-sm btn-default" style="margin-right:10px;" data-type="1">取消</button>\
					<button type="button" class="btn btn-sm btn-success" data-type="0">恢复历史文件</button>\
				</div>\
			</div>',
			success:function (layero,index) {
				$('.ace-clear-btn .btn').click(function () {
					var _type = $(this).attr('data-type');
					switch (_type) {
						case '0':
							_this.recovery_file_history({
								filename:_path,
								history:_history
							},function(res){
								layer.close(index);
								layer.msg(res.status?'恢复历史文件成功':'恢复历史文件失败',{icon:res.status?1:2});
								if(res.status){
									if(_this.editor[_this.ace_active].historys_file){
										_this.removeEditor(_this.ace_active);
									}
									if($('.ace_conter_menu>[title="'+ _path +'"]').length>0){
										$('.ace_header .refreshs').click();
										layer.close(_this.layer_view);
									}
								}
							});
						break;
						case '1':
							layer.close(index);
						break;
					}
				});
			}
		});
	},
	// 判断是否为历史文件
	is_file_history:function(_item){
		if(_item == undefined) return false;
		if(_item.historys_file){
			$('.ace_conter_tips').show();
			$('#ace_editor_'+_item.id).css('bottom','50px');
			$('.ace_conter_tips .tips').html('只读文件，文件为'+ _item.path +'，历史版本 [ '+ bt.format_data(new Number(_item.historys_active)) +' ]<a href="javascript:;" class="ml35 btlink" style="margin-left:35px" data-path="'+ _item.path +'" data-history="'+ _item.historys_active +'">点击恢复当前历史版本</a>');
		}else{
			$('.ace_conter_tips').hide();
		}
	},
	// 判断文件是否打开
	is_file_open:function(path,callabck){
		var is_state = false
		for(var i=0;i<this.pathAarry.length;i++){
			if(path === this.pathAarry[i]) is_state = true
		}
		if(callabck){
			callabck(is_state);
		}else{
			return is_state;
		}
	},
	// 恢复文件历史
	recovery_file_history:function(obj,callback){
		var loadT = layer.msg('正在恢复历史文件，请稍后...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=re_history",{
			filename:obj.filename,
			history:obj.history
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// 获取文件列表
	get_file_dir_list:function(obj,callback){
		var loadT = layer.msg('正在获取文件列表，请稍后...',{time: 0,icon: 16,shade: [0.3, '#000']}),_this = this;
		if(obj['p'] === undefined) obj['p'] = 1;
		if(obj['showRow'] === undefined) obj['showRow'] = 200;
		if(obj['sort'] === undefined) obj['sort'] = 'name';
		if(obj['reverse'] === undefined) obj['reverse'] = 'False';
		if(obj['search'] === undefined) obj['search'] = '';
		if(obj['all'] === undefined) obj['all'] = 'False';
		$.post("/files?action=GetDir&tojs=GetFiles",{p:obj.p,showRow:obj.showRow,sort:obj.sort,reverse:obj.reverse,path:obj.path,search:obj.search}, function(res) {
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// 获取历史文件
	get_file_history:function(obj,callback){
		var loadT = layer.msg('正在获取历史文件内容，请稍后...',{time: 0,icon: 16,shade: [0.3, '#000']}),_this = this;
		$.post("/files?action=read_history",{filename:obj.filename,history:obj.history}, function(res) {
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// 渲染文件列表
	reader_file_dir_menu:function(obj,callback){
		var _path = getCookie('Path'),_this = this;
		if(obj === undefined) obj = {}
		if(obj['el'] === undefined) obj['el'] = '.cd-accordion-menu';
		if(obj['group'] === undefined) obj['group'] = 1;
		if(obj['p'] === undefined) obj['p'] = 1;
		if(obj['path'] === undefined) obj['path'] = _path;
		if(obj['search'] === undefined) obj['search'] = '';
		if(obj['is_empty'] === undefined) obj['is_empty'] = false;
		if(obj['all'] === undefined) obj['all'] = 'False'
		this.get_file_dir_list({p:obj.p,path:obj.path,search:obj.search,all:obj.all},function (res){
			var _dir = res.DIR,_files = res.FILES,_dir_dom = '',_files_dom = '',_html ='';
			_this.menu_path = res.PATH;
			for(var i=0;i<_dir.length;i++){
				var _data = _dir[i].split(';');
				if(_data[0] === '__pycache__') continue;
				_dir_dom += '<li class="has-children children_'+ obj.group +'" title="'+ (obj.path+'/'+_data[0]) +'" data-menu-path="'+ (obj.path+'/'+_data[0])+'" data-size="'+ (_data[1]) +'">\
					<div class="file_fold group_'+ obj.group +'" data-group="'+ obj.group +'" data-file="Dir">\
						<span class="glyphicon glyphicon-menu-right"></span>\
						<span class="file_title"><i class="folder-icon"></i><span>'+ _data[0] +'</span></span>\
					</div>\
					<ul data-group=""></ul>\
					<span class="has_children_separator"></span>\
				</li>';
			}
			for(var j=0;j<_files.length;j++){
				var _data = _files[j].split(';');
				if(_data[0].indexOf('.pyc') !== -1) continue;
				_files_dom += '<li class="has-children" title="'+ (obj.path+'/'+_data[0]) +'" data-menu-path="'+ (obj.path+'/'+_data[0])+'" data-size="'+ (_data[1]) +'" data-suffix="'+ _this.get_file_suffix(_data[0]) +'">\
					<div class="file_fold  group_'+ obj.group +'" data-group="'+ obj.group +'" data-file="Files">\
						<span class="file_title"><i class="'+ _this.get_file_suffix(_data[0]) +'-icon"></i><span>'+ _data[0] +'</span></span>\
					</div>\
				</li>';
			}
			if(res.PATH !== '/' && obj['group'] === 1){
				$('.upper_level').attr('data-menu-path',_this.get_file_dir(res.PATH,1));
				$('.ace_catalogue_title').html('目录：'+ res.PATH).attr('title',res.PATH);
				$('.upper_level').html('<i class="glyphicon glyphicon-share-alt" aria-hidden="true"></i>上一级')
			}else if(res.PATH === '/'){
				$('.upper_level').html('<i class="glyphicon glyphicon-hdd" aria-hidden="true"></i>根目录')
			}
			if(obj.is_empty) $(obj.el).empty();
			$(obj.el).append(_html+_dir_dom+_files_dom);
			if(callback) callback(res);
		});
	},
	// 获取文件目录位置
	get_file_dir:function(path,num){
		var _arry = path.split('/');
		if(path === '/') return '/';
		_arry.splice(-1,num);
		return _arry == ''?'/':_arry.join('/');
	},
	// 获取文件全称
	get_file_suffix:function(fileName){
		var filenames = fileName.match(/\.([0-9A-z]*)$/);
		filenames = (filenames == null?'text':filenames[1]);
		for (var name in this.aceConfig.supportedModes) {
			var data = this.aceConfig.supportedModes[name],suffixs = data[0].split('|'),filename = name.toLowerCase();
			for (var i = 0; i < suffixs.length; i++) {
				if (filenames == suffixs[i]) return filename;
			}
		}
		return 'text';
	},
    // 设置编辑器视图
    setEditorView:function () {
    	var aceEditorHeight = $('.aceEditors').height(),_this = this;
    	var autoAceHeight = setInterval(function(){
    		var page_height = $('.aceEditors').height();
	        var ace_conter_menu = $('.ace_conter_menu').height();
	        var ace_conter_toolbar = $('.ace_conter_toolbar').height();
	        var _height = page_height - ($('.pull-down .glyphicon').hasClass('glyphicon-menu-down')?35:0) - ace_conter_menu - ace_conter_toolbar - 42;
	        $('.ace_conter_editor').height(_height);
	        if(aceEditorHeight == $('.aceEditors').height()){
	        	if(_this.ace_active) _this.editor[_this.ace_active].ace.resize();
	        	clearInterval(autoAceHeight);
	        }else {
	        	aceEditorHeight = $('.aceEditors').height();
	        }
    	},200);
    },
	// 获取文件编码列表
	getEncodingList: function (type) {
		var _option = '';
		for (var i = 0; i < this.aceConfig.encodingList.length; i++) {
			var item = this.aceConfig.encodingList[i] == type.toUpperCase();
			_option += '<li data- data-value="' + this.aceConfig.encodingList[i] + '" ' + (item ? 'class="active"' : '') + '>' + this.aceConfig.encodingList[i] + (item ?'<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>' : '') + '</li>';
		}
		$('.menu-encoding ul').html(_option);
	},
	// 获取文件关联列表
	getRelevanceList: function (fileName) {
		var _option = '', _top = 0, fileType = this.getFileType(fileName), _set_tops = 0;
		for (var name in this.aceConfig.supportedModes) {
			var data = this.aceConfig.supportedModes[name],item = (name == fileType.name);
			_option += '<li data-height="' + _top + '" data-rule="' + this.aceConfig.supportedModes[name] + '" data-value="' + name + '" ' + (item ? 'class="active"' : '') + '>' + (this.aceConfig.nameOverrides[name] || name) + (item ?'<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>' : '') + '</li>'
			if (item) _set_tops = _top
			_top += 35;
		}
		$('.menu-files ul').html(_option);
		$('.menu-files ul').scrollTop(_set_tops);
	},
	// 搜索文件关联
	searchRelevance: function (search) {
		if(search == undefined) search = '';
		$('.menu-files ul li').each(function (index, el) {
			var val = $(this).attr('data-value').toLowerCase(),
				rule = $(this).attr('data-rule'),
				suffixs = rule.split('|'),
				_suffixs = false;
				search = search.toLowerCase();
			for (var i = 0; i < suffixs.length; i++) {
				if (suffixs[i].indexOf(search) > -1) _suffixs = true 
			}
			if (search == '') {
				$(this).removeAttr('style');
			} else {
				if (val.indexOf(search) == -1) {
					$(this).attr('style', 'display:none');
				} else {
					$(this).removeAttr('style');
				}
				if (_suffixs)  $(this).removeAttr('style')
			}
		});
	},
	// 设置编码类型
	setEncodingType: function (encode) {
		this.getEncodingList('UTF-8');
		$('.menu-encoding ul li').click(function (e) {
			layer.msg('设置文件编码：' + $(this).attr('data-value'));
			$(this).addClass('active').append('<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>').siblings().removeClass('active').find('span').remove();
		});
	},
	// 更新状态栏
	currentStatusBar: function(id){
		var _item = this.editor[id];
		if(_item == undefined){
			this.removerStatusBar();
			return false;
		}
		$('.ace_conter_toolbar [data-type="cursor"]').html('行<i class="cursor-row">1</i>,列<i class="cursor-line">0</i>');
		$('.ace_conter_toolbar [data-type="history"]').html('历史版本：<i>'+ (_item.historys.length === 0?'无':_item.historys.length+'份') +'</i>');
		$('.ace_conter_toolbar [data-type="path"]').html('文件位置：<i title="'+ _item.path +'">'+ _item.path +'</i>');
		$('.ace_conter_toolbar [data-type="tab"]').html(_item.softTabs?'空格：<i>'+ _item.tabSize +'</i>':'制表符长度：<i>'+ _item.tabSize +'</i>');
		$('.ace_conter_toolbar [data-type="encoding"]').html('编码：<i>'+ _item.encoding.toUpperCase() +'</i>');
		$('.ace_conter_toolbar [data-type="lang"]').html('语言：<i>'+ _item.type +'</i>');
		$('.ace_conter_toolbar span').attr('data-id',id);
		$('.file_fold').removeClass('bg');
		$('[data-menu-path="'+ (_item.path) +'"]').find('.file_fold').addClass('bg');
		if(_item.historys_file){
			$('.ace_conter_toolbar [data-type="history"]').hide();
		}else{
			$('.ace_conter_toolbar [data-type="history"]').show();
		}
		_item.ace.resize();
	},
	// 清除状态栏
	removerStatusBar:function(){
		$('.ace_conter_toolbar [data-type="history"]').html('');
		$('.ace_conter_toolbar [data-type="path"]').html('');
		$('.ace_conter_toolbar [data-type="tab"]').html('');
		$('.ace_conter_toolbar [data-type="cursor"]').html('');
		$('.ace_conter_toolbar [data-type="encoding"]').html('');
		$('.ace_conter_toolbar [data-type="lang"]').html('');
	},
	// 创建ACE编辑器-对象
	creationEditor: function (obj, callabck) {
		var _this = this;
		$('#ace_editor_' + obj.id).text(obj.data || '');
		$('.ace_conter_editor .ace_editors').css('fontSize', _this.fontSize+'px');
		if(this.editor == null) this.editor = {};
		this.editor[obj.id] = {
			ace: ace.edit("ace_editor_" + obj.id, {
				theme: "ace/theme/"+_this.aceConfig.aceEditor.editorTheme, //主题
				mode: "ace/mode/" + (obj.fileName != undefined ? obj.mode : 'text'), // 语言类型
				wrap: _this.aceConfig.aceEditor.wrap,
				showInvisibles:_this.aceConfig.aceEditor.showInvisibles,
				showPrintMargin: false,
				enableBasicAutocompletion: true,
				enableSnippets: _this.aceConfig.aceEditor.enableSnippets,
				enableLiveAutocompletion: _this.aceConfig.aceEditor.enableLiveAutocompletion,
				useSoftTabs:_this.aceConfig.aceEditor.useSoftTabs,
				tabSize:_this.aceConfig.aceEditor.tabSize,
				keyboardHandler:'sublime',
				readOnly:obj.readOnly === undefined?false:obj.readOnly
			}), //ACE编辑器对象
			id: obj.id,
			wrap: _this.aceConfig.aceEditor.wrap, //是否换行
			path:obj.path,
			tabSize:_this.aceConfig.aceEditor.tabSize,
			softTabs:_this.aceConfig.aceEditor.useSoftTabs,
			fileName:obj.fileName,
			enableSnippets: true, //是否代码提示
			encoding: (obj.encoding != undefined ? obj.encoding : 'utf-8'), //编码类型
			mode: (obj.fileName != undefined ? obj.mode : 'text'), //语言类型
			type:obj.type,
            fileType: 0, //文件状态 
			historys: obj.historys,
			historys_file:obj.historys_file === undefined?false:obj.historys_file,
			historys_active:obj.historys_active === ''?false:obj.historys_active
		};
		var ACE = this.editor[obj.id];
		ACE.ace.moveCursorTo(0, 0); //设置鼠标焦点
		ACE.ace.resize(); //设置自适应
		ACE.ace.commands.addCommand({
			name: '保存文件',
			bindKey: {
				win: 'Ctrl-S',
				mac: 'Command-S'
			},
			exec: function (editor) {
				_this.saveFileMethod(ACE);
			},
			readOnly: false // 如果不需要使用只读模式，这里设置false
		});
		ACE.ace.commands.addCommand({
			name: '跳转行',
			bindKey: {
				win: 'Ctrl-I',
				mac: 'Command-I'
			},
			exec: function (editor) {
				$('.ace_header .jumpLine').click();
			},
			readOnly: false // 如果不需要使用只读模式，这里设置false
		})
		// 获取光标位置
		ACE.ace.getSession().selection.on('changeCursor', function(e) {
			var _cursor = ACE.ace.selection.getCursor();
			$('[data-type="cursor"]').html('行<i class="cursor-row">'+ (_cursor.row + 1) +'</i>,列<i class="cursor-line">'+ _cursor.column +'</i>');
		});

		// 触发修改内容
		ACE.ace.getSession().on('change', function (editor) {
			$('.item_tab_' + ACE.id + ' .icon-tool').addClass('glyphicon-exclamation-sign').removeClass('glyphicon-remove').attr('data-file-state', '1');
			ACE.fileType = 1;
			$('.ace_toolbar_menu').hide();
		});
		this.currentStatusBar(ACE.id);
		this.is_file_history(ACE);
	},
	// 保存文件方法
	saveFileMethod:function(ACE){
		if($('.item_tab_' + ACE.id + ' .icon-tool').attr('data-file-state') == 0){
			layer.msg('当前文件未修改，无需保存!');
			return false;
		}
		$('.item_tab_' + ACE.id + ' .icon-tool').attr('title','保存文件中，请稍后..').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-repeat');
		layer.msg('保存文件中，请稍后<img src="/static/img/ns-loading.gif" style="width:15px;margin-left:5px">',{icon:0});
		this.saveFileBody({
			path: ACE.path,
			data: ACE.ace.getValue(),
			encoding: ACE.encoding
		}, function (res) {
			ACE.fileType = 0;
			$('.item_tab_' + ACE.id + ' .icon-tool').attr('data-file-state','0').removeClass('glyphicon-repeat').addClass('glyphicon-remove');
		},function(res){
			ACE.fileType = 1;
			$('.item_tab_' + ACE.id + ' .icon-tool').attr('data-file-state','1').removeClass('glyphicon-remove').addClass('glyphicon-repeat');
		});
	},
	// 获取文件模型
	getFileType: function (fileName) {
		var filenames = fileName.match(/\.([0-9A-z]*)$/);
		filenames = (filenames == null?'text':filenames[1]);
		for (var name in this.aceConfig.supportedModes) {
			var data = this.aceConfig.supportedModes[name],suffixs = data[0].split('|'),filename = name.toLowerCase();
			for (var i = 0; i < suffixs.length; i++) {
				if (filenames == suffixs[i]){
					return { name: name,mode: filename };
				}
			}
		}
		return {name:'Text',mode:'text'};
	},
	// 新建编辑器视图-方法
	addEditorView: function (type,conifg) {
		if(type == undefined) type = 0
		var _index = this.editorLength,_id = bt.get_random(8);
		$('.ace_conter_menu .item').removeClass('active');
		$('.ace_conter_editor .ace_editors').removeClass('active');
		$('.ace_conter_menu').append('<li class="item active item_tab_'+_id+'" data-type="shortcutKeys" data-id="'+ _id +'" >\
			<div class="ace_item_box">\
				<span class="icon_file"><i class="text-icon"></i></span>\
				<span>'+ (type?conifg.title:('新建文件-'+ _index)) +'</span>\
				<i class="glyphicon icon-tool glyphicon-remove" aria-hidden="true" data-file-state="0" data-title="'+ (type?conifg.title:('新建文件-'+ _index)) +'"></i>\
			</div>\
		</li>');
		$('#ace_editor_' + _id).siblings().removeClass('active');
		$('.ace_conter_editor').append('<div id="ace_editor_'+_id+'" class="ace_editors active">'+ (type?aceShortcutKeys.innerHTML:'') +'</div>');
		switch(type){
			case 0:
				this.creationEditor({ id: _id });
				this.editorLength = this.editorLength + 1;
			break;
			case 1:
				this.removerStatusBar();
				this.editorLength = this.editorLength + 1;
			break;
		}
	},
	// 删除编辑器视图-方法
	removeEditor: function (id) {
		if(id == undefined) id = this.ace_active;
		if ($('.item_tab_' + id).next().length != 0 && this.editorLength != 1) {
			$('.item_tab_' + id).next().click();
		} else if($('.item_tab_' + id).prev.length !=  0 && this.editorLength != 1){
			$('.item_tab_' + id).prev().click();
		}
		$('.item_tab_' + id).remove();
		$('#ace_editor_' + id).remove();
		this.editorLength --;
		if(this.editor[id] == undefined) return false;
		for(var i=0;i<this.pathAarry.length;i++){
		    if(this.pathAarry[i] == this.editor[id].path){
		        this.pathAarry.splice(i,1);
		    }
		}
		if(!this.editor[id].historys_file) $('[data-menu-path="'+ (this.editor[id].path) +'"]').find('.file_fold').removeClass('active bg');
		delete this.editor[id];
		if(this.editorLength === 0){
			this.ace_active = '';
			this.pathAarry = [];
			this.removerStatusBar();
		}else{
			this.currentStatusBar(this.ace_active);
		}
		if(this.ace_active != '') this.is_file_history(this.editor[this.ace_active]);
	},
	// 打开历史文件文件-方法
	openHistoryEditorView: function (obj,callback) {
		// 文件类型（type，列如：JavaScript） 、文件模型（mode，列如：text）、文件标识（id,列如：x8AmsnYn）、文件编号（index,列如：0）、文件路径 (path，列如：/www/root/)
		var _this = this,path = obj.filename,paths = path.split('/'),_fileName = paths[paths.length - 1],_fileType = this.getFileType(_fileName),_type = _fileType.name,_mode = _fileType.mode,_id = bt.get_random(8),_index = this.editorLength;
		this.get_file_history({filename:obj.filename,history:obj.history}, function (res) {
			_this.pathAarry.push(path);
			$('.ace_conter_menu .item').removeClass('active');
			$('.ace_conter_editor .ace_editors').removeClass('active');
			$('.ace_conter_menu').append('<li class="item active item_tab_' + _id +'" title="'+ path +'" data-type="'+ _type +'" data-mode="'+ _mode +'" data-id="'+ _id +'" data-fileName="'+ _fileName +'">'+
				'<div class="ace_item_box">'+
					'<span class="icon_file"><img src="/static/img/ico-history.png"></span><span title="'+ path + ' 历史版本[ '+ bt.format_data(obj.history) +' ]' +'">' + _fileName +'</span>'+
					'<i class="glyphicon glyphicon-remove icon-tool" aria-hidden="true" data-file-state="0" data-title="' + _fileName + '"></i>'+
				'</div>'+
			'</li>');
			$('.ace_conter_editor').append('<div id="ace_editor_'+_id +'" class="ace_editors active"></div>');
			$('[data-paths="'+ path +'"]').find('.file_fold').addClass('active bg');
			_this.ace_active = _id;
			_this.editorLength = _this.editorLength + 1;
			_this.creationEditor({id: _id,fileName: _fileName,path: path,mode:_mode,encoding: res.encoding,data: res.data,type:_type,historys:res.historys,readOnly:true,historys_file:true,historys_active:obj.history});
			if(callback) callback(res);
		});
	},
	// 打开编辑器文件-方法
	openEditorView: function (path,callback) {
		if(path == undefined) return false;
		// 文件类型（type，列如：JavaScript） 、文件模型（mode，列如：text）、文件标识（id,列如：x8AmsnYn）、文件编号（index,列如：0）、文件路径 (path，列如：/www/root/)
	    var _this = this,paths = path.split('/'),_fileName = paths[paths.length - 1],_fileType = this.getFileType(_fileName),_type = _fileType.name,_mode = _fileType.mode,_id = bt.get_random(8),_index = this.editorLength;
		_this.is_file_open(path,function(is_state){
			if(is_state){
				$('.ace_conter_menu').find('[title="'+ path +'"]').click();
			}else{
				_this.getFileBody({path: path}, function (res) {
				    _this.pathAarry.push(path);
				    $('.ace_conter_menu .item').removeClass('active');
		    		$('.ace_conter_editor .ace_editors').removeClass('active');
		    		$('.ace_conter_menu').append('<li class="item active item_tab_' + _id +'" title="'+ path +'" data-type="'+ _type +'" data-mode="'+ _mode +'" data-id="'+ _id +'" data-fileName="'+ _fileName +'">'+
		    			'<div class="ace_item_box">'+
			    			'<span class="icon_file"><i class="'+ _mode +'-icon"></i></span><span title="'+ path +'">' + _fileName + '</span>'+
			    			'<i class="glyphicon glyphicon-remove icon-tool" aria-hidden="true" data-file-state="0" data-title="' + _fileName + '"></i>'+
			    		'</div>'+
		    		'</li>');
		    		$('.ace_conter_editor').append('<div id="ace_editor_'+_id +'" class="ace_editors active" style="font-size:'+ aceEditor.aceConfig.aceEditor.fontSize +'px"></div>');
					$('[data-menu-path="'+ path +'"]').find('.file_fold').addClass('active bg');
					_this.ace_active = _id;
				    _this.editorLength = _this.editorLength + 1;
					_this.creationEditor({id: _id,fileName: _fileName,path: path,mode:_mode,encoding: res.encoding,data: res.data,type:_type,historys:res.historys});
					if(callback) callback(res);
				});
			}
		});
		$('.ace_toolbar_menu').hide();
	},
	// 获取收藏夹列表-方法
	getFavoriteList: function () {},
	// 获取文件列表-请求
	getFileList: function () {},
	// 获取文件内容-请求
	getFileBody: function (obj, callback) {
		var loadT = layer.msg('正在获取文件内容，请稍后...',{time: 0,icon: 16,shade: [0.3, '#000']}),_this = this;
		$.post("/files?action=GetFileBody", "path=" + encodeURIComponent(obj.path), function(res) {
			layer.close(loadT);
			if (!res.status) {
				if(_this.editorLength == 0) layer.closeAll();
				layer.msg(res.msg, {icon: 2});
				
				return false;
			}else{
				if(!aceEditor.isAceView){
				    var _path =  obj.path.split('/');
					layer.msg('已打开文件【'+ (_path[_path.length-1]) +'】');
				}
			}
			if (callback) callback(res);
		});
	},
	// 保存文件内容-请求
	saveFileBody: function (obj,success,error) {
		$.ajax({
			type:'post',
			url:'/files?action=SaveFileBody',
			timeout: 7000, //设置保存超时时间
			data:{
				data:obj.data,
				encoding:obj.encoding.toLowerCase(),
				path:obj.path
			},
			complete:function(res,status){
				if(res.status != 200){
					if(error) error(res.responseJSON)
				}else if(res.status == 200){
					var rdata = res.responseJSON;
					if(rdata.status){
						if(success) success(rdata)
					}else{
						if(error) error(rdata)
					}
					if(!obj.tips) layer.msg(rdata.msg,{icon:rdata.status?1:2});
				}
			}
		});
	},
// 	保存ace配置
	saveAceConfig:function(data,callback){
		var loadT = layer.msg('正在设置配置文件，请稍后...',{time: 0,icon: 16,shade: [0.3, '#000']}),_this = this;
		this.saveFileBody({
			path:'/www/server/panel/BTPanel/static/ace/ace.editor.config.json',
			data:JSON.stringify(data),
			encoding:'utf-8',
			tips:true,
		},function(rdata){
			layer.close(loadT);
			_this.setStorage('aceConfig',JSON.stringify(data));
			if(callback) callback(rdata);
		});
	},
	// 获取配置文件
	getAceConfig:function(callback){
		var loadT = layer.msg('正在获取配置文件，请稍后...',{time: 0,icon: 16,shade: [0.3, '#000']}),_this = this;
		this.getFileBody({path:'/www/server/panel/BTPanel/static/ace/ace.editor.config.json'},function(rdata){
			layer.close(loadT);
			_this.setStorage('aceConfig',JSON.stringify(rdata.data));
			if(callback) callback(JSON.parse(rdata.data));
		});
	},
	// 递归保存文件
	saveAllFileBody:function(arry,num,callabck) {
		var _this = this;
		if(typeof num == "function"){
			callabck = num; num = 0;
		}else if(typeof num == "undefined"){
			num = 0;
		}
		if(num == arry.length){
			if(callabck) callabck();
			layer.msg('全部保存成功',{icon:1});
			return false;
		}
		aceEditor.saveFileBody({
			path: arry[num].path,
			data: arry[num].data,
			encoding: arry[num].encoding
		},function(){
			num = num + 1;
			aceEditor.saveAllFileBody(arry,num,callabck);
		});
	}
}

function openEditorView(type,path){
	var paths = path.split('/'),
	_fileName = paths[paths.length -1], 
		_aceTmplate = document.getElementById("aceTmplate").innerHTML;
		_aceTmplate = _aceTmplate.replace(/\<\\\/script\>/g,'</script>');
	if(aceEditor.editor !== null){
		if(aceEditor.isAceView == false){
			aceEditor.isAceView = true;
			$('.aceEditors .layui-layer-max').click();
		}
		aceEditor.openEditorView(path);
		return false;
	}
	var r = layer.open({
		type: 1,
		maxmin: true,
		shade:false,
		area: ['80%','80%'],
		title: "在线文本编辑器",
		skin:'aceEditors',
		zIndex:19999,
		content: _aceTmplate,
		success:function(layero,index){
			function set_edit_file(){
				aceEditor.ace_active = '';
				aceEditor.eventEditor();
				ace.require("/ace/ext/language_tools");
				ace.config.set("modePath", "/static/ace");
				ace.config.set("workerPath", "/static/ace");
				ace.config.set("themePath", "/static/ace");
				aceEditor.openEditorView(path);
				$('#ace_conter').addClass(aceEditor.aceConfig.aceEditor.editorTheme);
				$('.aceEditors .layui-layer-min').click(function (e){
					aceEditor.setEditorView();
				});
				$('.aceEditors .layui-layer-max').click(function (e){
					aceEditor.setEditorView();
				});
			}
			var aceConfig =  aceEditor.getStorage('aceConfig');
			if(aceConfig == null){
				// 获取编辑器配置
				aceEditor.getAceConfig(function(res){
					aceEditor.aceConfig = res; // 赋值配置参数
					set_edit_file();
				});
            }else{
            	aceEditor.aceConfig = JSON.parse(aceConfig);
            	typeof aceEditor.aceConfig == 'string'?aceEditor.aceConfig = JSON.parse(aceEditor.aceConfig):''
                set_edit_file();
			}
		},
		cancel:function(){
			for(var item in aceEditor.editor){
				if(aceEditor.editor[item].fileType == 1){
					layer.open({
						type: 1,
						area: ['400px', '180px'],
						title: '保存提示',
						content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">检测到文件未保存，是否保存文件更改？</div>\
							<div class="clear-tips">如果不保存，更改会丢失！</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default" style="float:left" data-type="2">不保存文件</button>\
								<button type="button" class="btn btn-sm btn-default" style="margin-right:10px;" data-type="1">取消</button>\
								<button type="button" class="btn btn-sm btn-success" data-type="0">保存文件</button>\
							</div>\
						</div>',
						success: function (layers, indexs) {
							$('.ace-clear-btn button').click(function(){
								var _type = $(this).attr('data-type');
								switch(_type){
									case '2':
										aceEditor.editor = null;
										aceEditor.editorLength = 0;
										aceEditor.pathAarry = [];
										layer.closeAll();
									break;
									case '1':
										layer.close(indexs);
									break;
									case '0':
										var _arry = [],editor = aceEditor['editor'];
										for(var item in editor){
											_arry.push({
												path: editor[item]['path'],
												data: editor[item]['ace'].getValue(),
												encoding: editor[item]['encoding'],
											})
										}
										aceEditor.saveAllFileBody(_arry,function(){
											$('.ace_conter_menu>.item').each(function (el,indexx) {
												var _id = $(this).attr('data-id');
												$(this).find('i').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove').attr('data-file-state','0')
												aceEditor.editor[_id].fileType = 0;
											});
											aceEditor.editor = null;
											aceEditor.pathAarry = [];
											layer.closeAll();
										});
									break;
								}
							});
						}
					});
					return false;
				}
			}
		},
		end:function(){
		    aceEditor.ace_active = '';
		    aceEditor.editor = null;
		    aceEditor.pathAarry = [];
		    aceEditor.menu_path = '';
		}
	});
}

function ajaxSetup() {
    var my_headers = {};
    var request_token_ele = document.getElementById("request_token_head");
    if (request_token_ele) {
        var request_token = request_token_ele.getAttribute('token');
        if (request_token) {
            my_headers['x-http-token'] = request_token
        }
    }
    request_token_cookie = getCookie('request_token');
    if (request_token_cookie) {
        my_headers['x-cookie-token'] = request_token_cookie
    }

    if (my_headers) {
        $.ajaxSetup({ headers: my_headers });
    }
}
ajaxSetup();

function RandomStrPwd(b) {
	b = b || 32;
	var c = "AaBbCcDdEeFfGHhiJjKkLMmNnPpRSrTsWtXwYxZyz2345678";
	var a = c.length;
	var d = "";
	for(i = 0; i < b; i++) {
		d += c.charAt(Math.floor(Math.random() * a))
	}
	return d
}

function repeatPwd(a) {
	$("#MyPassword").val(RandomStrPwd(a))
}

function refresh() {
	window.location.reload()
}

function GetBakPost(b) {
	$(".baktext").hide().prev().show();
	var c = $(".baktext").attr("data-id");
	var a = $(".baktext").val();
	if(a == "") {
		a = lan.bt.empty;
	}
	setWebPs(b, c, a);
	$("a[data-id='" + c + "']").html(a);
	$(".baktext").remove()
}

function setWebPs(b, e, a) {
	var d = layer.load({
		shade: true,
		shadeClose: false
	});
	var c = "ps=" + a;
	$.post("/data?action=setPs", "table=" + b + "&id=" + e + "&" + c, function(f) {
		if(f == true) {
			if(b == "sites") {
				getWeb(1)
			} else {
				if(b == "ftps") {
					getFtp(1)
				} else {
					getData(1)
				}
			}
			layer.closeAll();
			layer.msg(lan.public.edit_ok, {
				icon: 1
			});
		} else {
			layer.msg(lan.public.edit_err, {
				icon: 2
			});
			layer.closeAll();
		}
	});
}

$(".menu-icon").click(function() {
	$(".sidebar-scroll").toggleClass("sidebar-close");
	$(".main-content").toggleClass("main-content-open");
	if($(".sidebar-close")) {
		$(".sub-menu").find(".sub").css("display", "none")
	}
});
var Upload, percentage;

Date.prototype.format = function(b) {
	var c = {
		"M+": this.getMonth() + 1,
		"d+": this.getDate(),
		"h+": this.getHours(),
		"m+": this.getMinutes(),
		"s+": this.getSeconds(),
		"q+": Math.floor((this.getMonth() + 3) / 3),
		S: this.getMilliseconds()
	};
	if(/(y+)/.test(b)) {
		b = b.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
	}
	for(var a in c) {
		if(new RegExp("(" + a + ")").test(b)) {
			b = b.replace(RegExp.$1, RegExp.$1.length == 1 ? c[a] : ("00" + c[a]).substr(("" + c[a]).length))
		}
	}
	return b
};

function getLocalTime(a) {
	a = a.toString();
	if(a.length > 10) {
		a = a.substring(0, 10)
	}
	return new Date(parseInt(a) * 1000).format("yyyy/MM/dd hh:mm:ss")
}

function ToSize(a) {
	var d = [" B", " KB", " MB", " GB", " TB", " PB"];
	var e = 1024;
	for(var b = 0; b < d.length; b++) {
		if(a < e) {
			return(b == 0 ? a : a.toFixed(2)) + d[b]
		}
		a /= e
	}
}


function ChangePath(d) {
	setCookie("SetId", d);
	setCookie("SetName", "");
	var c = layer.open({
		type: 1,
		area: "650px",
		title: lan.bt.dir,
		closeBtn: 2,
		shift: 5,
		shadeClose: false,
		content: "<div class='changepath'><div class='path-top'><button type='button' class='btn btn-default btn-sm' onclick='BackFile()'><span class='glyphicon glyphicon-share-alt'></span> "+lan.public.return+"</button><div class='place' id='PathPlace'>"+lan.bt.path+"：<span></span></div></div><div class='path-con'><div class='path-con-left'><dl><dt id='changecomlist' onclick='BackMyComputer()'>"+lan.bt.comp+"</dt></dl></div><div class='path-con-right'><ul class='default' id='computerDefautl'></ul><div class='file-list divtable'><table class='table table-hover' style='border:0 none'><thead><tr class='file-list-head'><th width='40%'>"+lan.bt.filename+"</th><th width='20%'>"+lan.bt.etime+"</th><th width='10%'>"+lan.bt.access+"</th><th width='10%'>"+lan.bt.own+"</th><th width='10%'></th></tr></thead><tbody id='tbody' class='list-list'></tbody></table></div></div></div></div><div class='getfile-btn' style='margin-top:0'><button type='button' class='btn btn-default btn-sm pull-left' onclick='CreateFolder()'>"+lan.bt.adddir+"</button><button type='button' class='btn btn-danger btn-sm mr5' onclick=\"layer.close(getCookie('ChangePath'))\">"+lan.public.close+"</button> <button type='button' class='btn btn-success btn-sm' onclick='GetfilePath()'>"+lan.bt.path_ok+"</button></div>"
	});
	setCookie("ChangePath", c);
	var b = $("#" + d).val();
	tmp = b.split(".");
	if(tmp[tmp.length - 1] == "gz") {
		tmp = b.split("/");
		b = "";
		for(var a = 0; a < tmp.length - 1; a++) {
			b += "/" + tmp[a]
		}
		setCookie("SetName", tmp[tmp.length - 1])
	}
	b = b.replace(/\/\//g, "/");
	GetDiskList(b);
	ActiveDisk()
}

function GetDiskList(b) {
	var d = "";
	var a = "";
	var c = "path=" + b + "&disk=True";
	$.post("/files?action=GetDir", c, function(h) {
		if(h.DISK != undefined) {
			for(var f = 0; f < h.DISK.length; f++) {
				a += "<dd onclick=\"GetDiskList('" + h.DISK[f].path + "')\"><span class='glyphicon glyphicon-hdd'></span>&nbsp;" + h.DISK[f].path + "</dd>"
			}
			$("#changecomlist").html(a)
		}
		for(var f = 0; f < h.DIR.length; f++) {
			var g = h.DIR[f].split(";");
			var e = g[0];
			if(e.length > 20) {
				e = e.substring(0, 20) + "..."
			}
			if(isChineseChar(e)) {
				if(e.length > 10) {
					e = e.substring(0, 10) + "..."
				}
			}
			d += "<tr><td onclick=\"GetDiskList('" + h.PATH + "/" + g[0] + "')\" title='" + g[0] + "'><span class='glyphicon glyphicon-folder-open'></span>" + e + "</td><td>" + getLocalTime(g[2]) + "</td><td>" + g[3] + "</td><td>" + g[4] + "</td><td><span class='delfile-btn' onclick=\"NewDelFile('" + h.PATH + "/" + g[0] + "')\">X</span></td></tr>"
		}
		if(h.FILES != null && h.FILES != "") {
			for(var f = 0; f < h.FILES.length; f++) {
				var g = h.FILES[f].split(";");
				var e = g[0];
				if(e.length > 20) {
					e = e.substring(0, 20) + "..."
				}
				if(isChineseChar(e)) {
					if(e.length > 10) {
						e = e.substring(0, 10) + "..."
					}
				}
				d += "<tr><td title='" + g[0] + "'><span class='glyphicon glyphicon-file'></span>" + e + "</td><td>" + getLocalTime(g[2]) + "</td><td>" + g[3] + "</td><td>" + g[4] + "</td><td></td></tr>"
			}
		}
		$(".default").hide();
		$(".file-list").show();
		$("#tbody").html(d);
		if(h.PATH.substr(h.PATH.length - 1, 1) != "/") {
			h.PATH += "/"
		}
		$("#PathPlace").find("span").html(h.PATH);
		ActiveDisk();
		return
	})
}

function CreateFolder() {
	var a = "<tr><td colspan='2'><span class='glyphicon glyphicon-folder-open'></span> <input id='newFolderName' class='newFolderName' type='text' value=''></td><td colspan='3'><button id='nameOk' type='button' class='btn btn-success btn-sm'>"+lan.public.ok+"</button>&nbsp;&nbsp;<button id='nameNOk' type='button' class='btn btn-default btn-sm'>"+lan.public.cancel+"</button></td></tr>";
	if($("#tbody tr").length == 0) {
		$("#tbody").append(a)
	} else {
		$("#tbody tr:first-child").before(a)
	}
	$(".newFolderName").focus();
	$("#nameOk").click(function() {
		var c = $("#newFolderName").val();
		var b = $("#PathPlace").find("span").text();
		newTxt = b.replace(new RegExp(/(\/\/)/g), "/") + c;
		var d = "path=" + newTxt;
		$.post("/files?action=CreateDir", d, function(e) {
			if(e.status == true) {
				layer.msg(e.msg, {
					icon: 1
				})
			} else {
				layer.msg(e.msg, {
					icon: 2
				})
			}
			GetDiskList(b)
		})
	});
	$("#nameNOk").click(function() {
		$(this).parents("tr").remove()
	})
}

function NewDelFile(c) {
	var a = $("#PathPlace").find("span").text();
	newTxt = c.replace(new RegExp(/(\/\/)/g), "/");
	var b = "path=" + newTxt + "&empty=True";
	$.post("/files?action=DeleteDir", b, function(d) {
		if(d.status == true) {
			layer.msg(d.msg, {
				icon: 1
			})
		} else {
			layer.msg(d.msg, {
				icon: 2
			})
		}
		GetDiskList(a)
	})
}

function ActiveDisk() {
	var a = $("#PathPlace").find("span").text().substring(0, 1);
	switch(a) {
		case "C":
			$(".path-con-left dd:nth-of-type(1)").css("background", "#eee").siblings().removeAttr("style");
			break;
		case "D":
			$(".path-con-left dd:nth-of-type(2)").css("background", "#eee").siblings().removeAttr("style");
			break;
		case "E":
			$(".path-con-left dd:nth-of-type(3)").css("background", "#eee").siblings().removeAttr("style");
			break;
		case "F":
			$(".path-con-left dd:nth-of-type(4)").css("background", "#eee").siblings().removeAttr("style");
			break;
		case "G":
			$(".path-con-left dd:nth-of-type(5)").css("background", "#eee").siblings().removeAttr("style");
			break;
		case "H":
			$(".path-con-left dd:nth-of-type(6)").css("background", "#eee").siblings().removeAttr("style");
			break;
		default:
			$(".path-con-left dd").removeAttr("style")
	}
}

function BackMyComputer() {
	$(".default").show();
	$(".file-list").hide();
	$("#PathPlace").find("span").html("");
	ActiveDisk()
}

function BackFile() {
	var c = $("#PathPlace").find("span").text();
	if(c.substr(c.length - 1, 1) == "/") {
		c = c.substr(0, c.length - 1)
	}
	var d = c.split("/");
	var a = "";
	if(d.length > 1) {
		var e = d.length - 1;
		for(var b = 0; b < e; b++) {
			a += d[b] + "/"
		}
		GetDiskList(a.replace("//", "/"))
	} else {
		a = d[0]
	}
	if(d.length == 1) {}
}

function GetfilePath() {
	var a = $("#PathPlace").find("span").text();
	a = a.replace(new RegExp(/(\\)/g), "/");
	setCookie('path_dir_change',a);
	$("#" + getCookie("SetId")).val(a + getCookie("SetName"));
	layer.close(getCookie("ChangePath"))
}

function setCookie(a, c) {
	var b = 30;
	var d = new Date();
	d.setTime(d.getTime() + b * 24 * 60 * 60 * 1000);
	document.cookie = a + "=" + escape(c) + ";expires=" + d.toGMTString()
}

function getCookie(b) {
	var a, c = new RegExp("(^| )" + b + "=([^;]*)(;|$)");
	if(a = document.cookie.match(c)) {
		return unescape(a[2])
	} else {
		return null
	}
}

function aotuHeight() {
	var a = $("body").height() - 50;
	$(".main-content").css("min-height", a)
}
$(function() {
	aotuHeight()
});
$(window).resize(function() {
	aotuHeight()
});

function showHidePwd() {
	var a = "glyphicon-eye-open",
		b = "glyphicon-eye-close";
	$(".pw-ico").click(function() {
		var g = $(this).attr("class"),
			e = $(this).prev();
		if(g.indexOf(a) > 0) {
			var h = e.attr("data-pw");
			$(this).removeClass(a).addClass(b);
			e.text(h)
		} else {
			$(this).removeClass(b).addClass(a);
			e.text("**********")
		}
		var d = $(this).next().position().left;
		var f = $(this).next().position().top;
		var c = $(this).next().width();
		$(this).next().next().css({
			left: d + c + "px",
			top: f + "px"
		})
	})
}

function openPath(a) {
	setCookie("Path", a);
	window.location.href = "/files"
}

function OnlineEditFile(k, f) {
	if(k != 0) {
		var l = $("#PathPlace input").val();
		var h = encodeURIComponent($("#textBody").val());
		var a = $("select[name=encoding]").val();
		var loadT = layer.msg(lan.bt.save_file, {
			icon: 16,
			time: 0
		});
		$.post("/files?action=SaveFileBody", "data=" + h + "&path=" + encodeURIComponent(f) + "&encoding=" + a, function(m) {
			if(k == 1) {
				layer.close(loadT);
			}
			layer.msg(m.msg, {
				icon: m.status ? 1 : 2
			});
		});
		return
	}
	var e = layer.msg(lan.bt.read_file, {
		icon: 16,
		time: 0
	});
	var g = f.split(".");
	var b = g[g.length - 1];
	var d;
	switch(b) {
		case "html":
			var j = {
				name: "htmlmixed",
				scriptTypes: [{
					matches: /\/x-handlebars-template|\/x-mustache/i,
					mode: null
				}, {
					matches: /(text|application)\/(x-)?vb(a|script)/i,
					mode: "vbscript"
				}]
			};
			d = j;
			break;
		case "htm":
			var j = {
				name: "htmlmixed",
				scriptTypes: [{
					matches: /\/x-handlebars-template|\/x-mustache/i,
					mode: null
				}, {
					matches: /(text|application)\/(x-)?vb(a|script)/i,
					mode: "vbscript"
				}]
			};
			d = j;
			break;
		case "js":
			d = "text/javascript";
			break;
		case "json":
			d = "application/ld+json";
			break;
		case "css":
			d = "text/css";
			break;
		case "php":
			d = "application/x-httpd-php";
			break;
		case "tpl":
			d = "application/x-httpd-php";
			break;
		case "xml":
			d = "application/xml";
			break;
		case "sql":
			d = "text/x-sql";
			break;
		case "conf":
			d = "text/x-nginx-conf";
			break;
		default:
			var j = {
				name: "htmlmixed",
				scriptTypes: [{
					matches: /\/x-handlebars-template|\/x-mustache/i,
					mode: null
				}, {
					matches: /(text|application)\/(x-)?vb(a|script)/i,
					mode: "vbscript"
				}]
			};
			d = j
	}
	$.post("/files?action=GetFileBody", "path=" + encodeURIComponent(f), function(s) {
		if(s.status === false){
			layer.msg(s.msg,{icon:5});
			return;
		}
		layer.close(e);
		var u = ["utf-8", "GBK", "GB2312", "BIG5"];
		var n = "";
		var m = "";
		var o = "";
		for(var p = 0; p < u.length; p++) {
			m = s.encoding == u[p] ? "selected" : "";
			n += '<option value="' + u[p] + '" ' + m + ">" + u[p] + "</option>"
		}
		var r = layer.open({
			type: 1,
			shift: 5,
			closeBtn: 2,
			area: ["90%", "90%"],
			title: lan.bt.edit_title+"[" + f + "]",
			content: '<form class="bt-form pd20 pb70"><div class="line"><p style="color:red;margin-bottom:10px">'+lan.bt.edit_ps+'			<select class="bt-input-text" name="encoding" style="width: 74px;position: absolute;top: 31px;right: 19px;height: 22px;z-index: 9999;border-radius: 0;">' + n + '</select></p><textarea class="mCustomScrollbar bt-input-text" id="textBody" style="width:100%;margin:0 auto;line-height: 1.8;position: relative;top: 10px;" value="" />			</div>			<div class="bt-form-submit-btn" style="position:absolute; bottom:0; width:100%">			<button type="button" class="btn btn-danger btn-sm btn-editor-close">'+lan.public.close+'</button>			<button id="OnlineEditFileBtn" type="button" class="btn btn-success btn-sm">'+lan.public.save+'</button>			</div>			</form>'
		});
		$("#textBody").text(s.data);
		var q = $(window).height() * 0.9;
		$("#textBody").height(q - 160);
		var t = CodeMirror.fromTextArea(document.getElementById("textBody"), {
			extraKeys: {
				"Ctrl-F": "findPersistent",
				"Ctrl-H": "replaceAll",
				"Ctrl-S": function() {
					$("#textBody").text(t.getValue());
					OnlineEditFile(2, f)
				}
			},
			mode: d,
			lineNumbers: true,
			matchBrackets: true,
			matchtags: true,
			autoMatchParens: true
		});
		t.focus();
		t.setSize("auto", q - 150);
		$("#OnlineEditFileBtn").click(function() {
			$("#textBody").text(t.getValue());
			OnlineEditFile(1, f);
		});
		$(".btn-editor-close").click(function() {
			layer.close(r);
		});
	});
}

function ServiceAdmin(a, b) {
	if(!isNaN(a)) {
		a = "php-fpm-" + a
	}
	a = a.replace('_soft','');
	var c = "name=" + a + "&type=" + b;
	var d = "";
	
	switch(b) {
		case "stop":
			d = lan.bt.stop;
			break;
		case "start":
			d = lan.bt.start;
			break;
		case "restart":
			d = lan.bt.restart;
			break;
		case "reload":
			d = lan.bt.reload;
			break
	}
	layer.confirm( lan.get('service_confirm',[d,a]), {icon:3,
		closeBtn: 2
	}, function() {
		var e = layer.msg(lan.get('service_the',[d,a]), {
			icon: 16,
			time: 0
		});
		$.post("/system?action=ServiceAdmin", c, function(g) {
			layer.close(e);
			
			var f = g.status ? lan.get('service_ok',[a,d]):lan.get('service_err',[a,d]);
			layer.msg(f, {
				icon: g.status ? 1 : 2
			});
			if(b != "reload" && g.status == true) {
				setTimeout(function() {
					window.location.reload()
				}, 1000)
			}
			if(!g.status) {
				layer.msg(g.msg, {
					icon: 2,
					time: 0,
					shade: 0.3,
					shadeClose: true
				})
			}
		}).error(function() {
			layer.close(e);
			layer.msg(lan.public.success, {
				icon: 1
			})
		})
	})
}

function GetConfigFile(a) {
	var b = "";
	switch(a) {
		case "mysql":
			b = "/etc/my.cnf";
			break;
		case "nginx":
			b = "/www/server/nginx/conf/nginx.conf";
			break;
		case "pure-ftpd":
			b = "/www/server/pure-ftpd/etc/pure-ftpd.conf";
			break;
		case "apache":
			b = "/www/server/apache/conf/httpd.conf";
			break;
		case "tomcat":
			b = "/www/server/tomcat/conf/server.xml";
			break;
		default:
			b = "/www/server/php/" + a + "/etc/php.ini";
			break
	}
	OnlineEditFile(0, b)
}

function GetPHPStatus(a) {
	if(a == "52") {
		layer.msg(lan.bt.php_status_err, {
			icon: 2
		});
		return
	}
	$.post("/ajax?action=GetPHPStatus", "version=" + a, function(b) {
		layer.open({
			type: 1,
			area: "400",
			title: lan.bt.php_status_title,
			closeBtn: 2,
			shift: 5,
			shadeClose: true,
			content: "<div style='margin:15px;'><table class='table table-hover table-bordered'>						<tr><th>"+lan.bt.php_pool+"</th><td>" + b.pool + "</td></tr>						<tr><th>"+lan.bt.php_manager+"</th><td>" + ((b["process manager"] == "dynamic") ? lan.bt.dynamic : lan.bt.static) + "</td></tr>						<tr><th>"+lan.bt.php_start+"</th><td>" + b["start time"] + "</td></tr>						<tr><th>"+lan.bt.php_accepted+"</th><td>" + b["accepted conn"] + "</td></tr>						<tr><th>"+lan.bt.php_queue+"</th><td>" + b["listen queue"] + "</td></tr>						<tr><th>"+lan.bt.php_max_queue+"</th><td>" + b["max listen queue"] + "</td></tr>						<tr><th>"+lan.bt.php_len_queue+"</th><td>" + b["listen queue len"] + "</td></tr>						<tr><th>"+lan.bt.php_idle+"</th><td>" + b["idle processes"] + "</td></tr>						<tr><th>"+lan.bt.php_active+"</th><td>" + b["active processes"] + "</td></tr>						<tr><th>"+lan.bt.php_total+"</th><td>" + b["total processes"] + "</td></tr>						<tr><th>"+lan.bt.php_max_active+"</th><td>" + b["max active processes"] + "</td></tr>						<tr><th>"+lan.bt.php_max_children+"</th><td>" + b["max children reached"] + "</td></tr>						<tr><th>"+lan.bt.php_slow+"</th><td>" + b["slow requests"] + "</td></tr>					 </table></div>"
		})
	})
}

function GetNginxStatus() {
	$.post("/ajax?action=GetNginxStatus", "", function(a) {
		layer.open({
			type: 1,
			area: "400",
			title: lan.bt.nginx_title,
			closeBtn: 2,
			shift: 5,
			shadeClose: true,
			content: "<div style='margin:15px;'><table class='table table-hover table-bordered'>						<tr><th>"+lan.bt.nginx_active+"</th><td>" + a.active + "</td></tr>						<tr><th>"+lan.bt.nginx_accepts+"</th><td>" + a.accepts + "</td></tr>						<tr><th>"+lan.bt.nginx_handled+"</th><td>" + a.handled + "</td></tr>						<tr><th>"+lan.bt.nginx_requests+"</th><td>" + a.requests + "</td></tr>						<tr><th>"+lan.bt.nginx_reading+"</th><td>" + a.Reading + "</td></tr>						<tr><th>"+lan.bt.nginx_writing+"</th><td>" + a.Writing + "</td></tr>						<tr><th>"+lan.bt.nginx_waiting+"</th><td>" + a.Waiting + "</td></tr>					 </table></div>"
		})
	})
}

function divcenter() {
	$(".layui-layer").css("position", "absolute");
	var c = $(window).width();
	var b = $(".layui-layer").outerWidth();
	var g = $(window).height();
	var f = $(".layui-layer").outerHeight();
	var a = (c - b) / 2;
	var e = (g - f) / 2 > 0 ? (g - f) / 2 : 10;
	var d = $(".layui-layer").offset().left - $(".layui-layer").position().left;
	var h = $(".layui-layer").offset().top - $(".layui-layer").position().top;
	a = a + $(window).scrollLeft() - d;
	e = e + $(window).scrollTop() - h;
	$(".layui-layer").css("left", a + "px");
	$(".layui-layer").css("top", e + "px")
}

function isChineseChar(b) {
	var a = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
	return a.test(b)
}

function SafeMessage(j, h, g, f) {
	if(f == undefined) {
		f = ""
	}
	var d = Math.round(Math.random() * 9 + 1);
	var c = Math.round(Math.random() * 9 + 1);
	var e = "";
	e = d + c;
	sumtext = d + " + " + c;
	setCookie("vcodesum", e);
	var mess = layer.open({
		type: 1,
		title: j,
		area: "350px",
		closeBtn: 2,
		shadeClose: true,
		content: "<div class='bt-form webDelete pd20 pb70'><p>" + h + "</p>" + f + "<div class='vcode'>"+lan.bt.cal_msg+"<span class='text'>" + sumtext + "</span>=<input type='number' id='vcodeResult' value=''></div><div class='bt-form-submit-btn'><button type='button' class='btn btn-danger btn-sm bt-cancel'>"+lan.public.cancel+"</button> <button type='button' id='toSubmit' class='btn btn-success btn-sm' >"+lan.public.ok+"</button></div></div>"
	});
	$("#vcodeResult").focus().keyup(function(a) {
		if(a.keyCode == 13) {
			$("#toSubmit").click()
		}
	});
	$(".bt-cancel").click(function(){
		layer.close(mess);
	});
	$("#toSubmit").click(function() {
		var a = $("#vcodeResult").val().replace(/ /g, "");
		if(a == undefined || a == "") {
			layer.msg('请正确输入计算结果!');
			return
		}
		if(a != getCookie("vcodesum")) {
			layer.msg('请正确输入计算结果!');
			return
		}
		layer.close(mess);
		g();
	})
}

$(function() {
	$(".fb-ico").hover(function() {
		$(".fb-text").css({
			left: "36px",
			top: 0,
			width: "80px"
		})
	}, function() {
		$(".fb-text").css({
			left: 0,
			width: "36px"
		})
	}).click(function() {
		$(".fb-text").css({
			left: 0,
			width: "36px"
		});
		$(".zun-feedback-suggestion").show()
	});
	$(".fb-close").click(function() {
		$(".zun-feedback-suggestion").hide()
	});
	$(".fb-attitudes li").click(function() {
		$(this).addClass("fb-selected").siblings().removeClass("fb-selected")
	})
});
$("#dologin").click(function() {
	layer.confirm(lan.bt.loginout, {icon:3,
		closeBtn: 2
	}, function() {
		window.location.href = "/login?dologin=True"
	});
	return false
});

function setPassword(a) {
	if(a == 1) {
		p1 = $("#p1").val();
		p2 = $("#p2").val();
		if(p1 == "" || p1.length < 8) {
			layer.msg(lan.bt.pass_err_len, {
				icon: 2
			});
			return
		}
		
		//准备弱口令匹配元素
		var checks = ['admin888','123123123','12345678','45678910','87654321','asdfghjkl','password','qwerqwer'];
		pchecks = 'abcdefghijklmnopqrstuvwxyz1234567890';
		for(var i=0;i<pchecks.length;i++){
			checks.push(pchecks[i]+pchecks[i]+pchecks[i]+pchecks[i]+pchecks[i]+pchecks[i]+pchecks[i]+pchecks[i]);
		}
		
		//检查弱口令
		cps = p1.toLowerCase();
		var isError = "";
		for(var i=0;i<checks.length;i++){
			if(cps == checks[i]){
				isError += '['+checks[i]+'] ';
			}
		}
		
		if(isError != ""){
			layer.msg(lan.bt.pass_err+isError,{icon:5});
			return;
		}
		
		
		if(p1 != p2) {
			layer.msg(lan.bt.pass_err_re, {
				icon: 2
			});
			return
		}
		$.post("/config?action=setPassword", "password1=" + encodeURIComponent(p1) + "&password2=" + encodeURIComponent(p2), function(b) {
			if(b.status) {
				layer.closeAll();
				layer.msg(b.msg, {
					icon: 1
				})
			} else {
				layer.msg(b.msg, {
					icon: 2
				})
			}
		});
		return
	}
	layer.open({
		type: 1,
		area: "290px",
		title: lan.bt.pass_title,
		closeBtn: 2,
		shift: 5,
		shadeClose: false,
		content: "<div class='bt-form pd20 pb70'><div class='line'><span class='tname'>"+lan.public.pass+"</span><div class='info-r'><input class='bt-input-text' type='text' name='password1' id='p1' value='' placeholder='"+lan.bt.pass_new_title+"' style='width:100%'/></div></div><div class='line'><span class='tname'>"+lan.bt.pass_re+"</span><div class='info-r'><input class='bt-input-text' type='text' name='password2' id='p2' value='' placeholder='"+lan.bt.pass_re_title+"' style='width:100%' /></div></div><div class='bt-form-submit-btn'><span style='float: left;' title='"+lan.bt.pass_rep+"' class='btn btn-default btn-sm' onclick='randPwd(10)'>"+lan.bt.pass_rep_btn+"</span><button type='button' class='btn btn-danger btn-sm' onclick=\"layer.closeAll()\">"+lan.public.close+"</button> <button type='button' class='btn btn-success btn-sm' onclick=\"setPassword(1)\">"+lan.public.edit+"</button></div></div>"
	});
}


function randPwd(){
	var pwd = RandomStrPwd(12);
	$("#p1").val(pwd);
	$("#p2").val(pwd);
	layer.msg(lan.bt.pass_rep_ps,{time:2000})
}

function setUserName(a) {
	if(a == 1) {
		p1 = $("#p1").val();
		p2 = $("#p2").val();
		if(p1 == "" || p1.length < 3) {
			layer.msg(lan.bt.user_len, {
				icon: 2
			});
			return
		}
		if(p1 != p2) {
			layer.msg(lan.bt.user_err_re, {
				icon: 2
			});
			return
		}
		var checks = ['admin','root','admin123','123456'];
		
		if($.inArray(p1,checks)>=0){
			layer.msg('禁止使用常用用户名', {
				icon: 2
			});
			return;
		}
			
		$.post("/config?action=setUsername", "username1=" + encodeURIComponent(p1) + "&username2=" + encodeURIComponent(p2), function(b) {
			if(b.status) {
				layer.closeAll();
				layer.msg(b.msg, {
					icon: 1
				});
				$("input[name='username_']").val(p1)
			} else {
				layer.msg(b.msg, {
					icon: 2
				})
            }
        });
		return
	}
	layer.open({
		type: 1,
		area: "290px",
		title: lan.bt.user_title,
		closeBtn: 2,
		shift: 5,
		shadeClose: false,
		content: "<div class='bt-form pd20 pb70'><div class='line'><span class='tname'>"+lan.bt.user+"</span><div class='info-r'><input class='bt-input-text' type='text' name='password1' id='p1' value='' placeholder='"+lan.bt.user_new+"' style='width:100%'/></div></div><div class='line'><span class='tname'>"+lan.bt.pass_re+"</span><div class='info-r'><input class='bt-input-text' type='text' name='password2' id='p2' value='' placeholder='"+lan.bt.pass_re_title+"' style='width:100%'/></div></div><div class='bt-form-submit-btn'><button type='button' class='btn btn-danger btn-sm' onclick=\"layer.closeAll()\">"+lan.public.close+"</button> <button type='button' class='btn btn-success btn-sm' onclick=\"setUserName(1)\">"+lan.public.edit+"</button></div></div>"
	})
}
var openWindow = null;
var downLoad = null;
var speed = null;

function task() {
	messagebox();
}

function ActionTask() {
	var a = layer.msg(lan.public.the_del, {
		icon: 16,
		time: 0,
		shade: [0.3, "#000"]
	});
	$.post("/files?action=ActionTask", "", function(b) {
		layer.close(a);
		layer.msg(b.msg, {
			icon: b.status ? 1 : 5
		})
	})
}

function RemoveTask(b) {
	var a = layer.msg(lan.public.the_del, {
		icon: 16,
		time: 0,
		shade: [0.3, "#000"]
	});
	$.post("/files?action=RemoveTask", "id=" + b, function(c) {
		layer.close(a);
		layer.msg(c.msg, {
			icon: c.status ? 1 : 5
		});
	}).error(function(){
		layer.msg(lan.bt.task_close,{icon:1});
	});
}

function GetTaskList(a) {
	a = a == undefined ? 1 : a;
	$.post("/data?action=getData", "tojs=GetTaskList&table=tasks&limit=10&p=" + a, function(g) {
		var e = "";
		var b = "";
		var c = "";
		var f = false;
		for(var d = 0; d < g.data.length; d++) {
			switch(g.data[d].status) {
				case "-1":
					f = true;
					if(g.data[d].type != "download") {
						b = "<li><span class='titlename'>" + g.data[d].name + "</span><span class='state'>"+lan.bt.task_install+" <img src='/static/img/ing.gif'> | <a href=\"javascript:RemoveTask(" + g.data[d].id + ")\">"+lan.public.close+"</a></span><span class='opencmd'></span><pre class='cmd'></pre></li>"
					} else {
						b = "<li><div class='line-progress' style='width:0%'></div><span class='titlename'>" + g.data[d].name + "<a id='speed' style='margin-left:130px;'>0.0M/12.5M</a></span><span class='com-progress'>0%</span><span class='state'>"+lan.bt.task_downloading+" <img src='/static/img/ing.gif'> | <a href=\"javascript:RemoveTask(" + g.data[d].id + ")\">"+lan.public.close+"</a></span></li>"
					}
					break;
				case "0":
					c += "<li><span class='titlename'>" + g.data[d].name + "</span><span class='state'>"+lan.bt.task_sleep+"</span> | <a href=\"javascript:RemoveTask(" + g.data[d].id + ")\">"+lan.public.del+"</a></li>";
					break;
				case "1":
					e += "<li><span class='titlename'>" + g.data[d].name + "</span><span class='state'>" + g.data[d].addtime + "  "+lan.bt.task_ok+"  "+ lan.bt.time + (g.data[d].end - g.data[d].start) + lan.bt.s+"</span></li>"
			}
		}
		$("#srunning").html(b + c);
		$("#sbody").html(e);
		return f
	})
}

function GetTaskCount() {
    $.post("/ajax?action=GetTaskCount", "", function (a) {
        if (a.status === false) {
            window.location.href = '/login?dologin=True';
            return;
        }
		$(".task").text(a)
	})
}

function setSelectChecked(c, d) {
	var a = document.getElementById(c);
	for(var b = 0; b < a.options.length; b++) {
		if(a.options[b].innerHTML == d) {
			a.options[b].selected = true;
			break
		}
	}
}
GetTaskCount();
function RecInstall() {
	$.post("/ajax?action=GetSoftList", "", function(l){
		var c = "";
		var g = "";
		var e = "";
		for(var h = 0; h < l.length; h++) {
			if(l[h].name == "Tomcat") {
				continue
			}
			var o = "";
			var m = "<input id='data_" + l[h].name + "' data-info='" + l[h].name + " " + l[h].versions[0].version + "' type='checkbox' checked>";
			for(var b = 0; b < l[h].versions.length; b++) {
				var d = "";
				if((l[h].name == "PHP" && (l[h].versions[b].version == "5.4" || l[h].versions[b].version == "54")) || (l[h].name == "MySQL" && l[h].versions[b].version == "5.5") || (l[h].name == "phpMyAdmin" && l[h].versions[b].version == "4.4")) {
					d = "selected";
					m = "<input id='data_" + l[h].name + "' data-info='" + l[h].name + " " + l[h].versions[b].version + "' type='checkbox' checked>"
				}
				o += "<option value='" + l[h].versions[b].version + "' " + d + ">" + l[h].name + " " + l[h].versions[b].version + "</option>"
			}
			var f = "<li><span class='ico'><img src='/static/img/" + l[h].name.toLowerCase() + ".png'></span><span class='name'><select id='select_" + l[h].name + "' class='sl-s-info'>" + o + "</select></span><span class='pull-right'>" + m + "</span></li>";
			if(l[h].name == "Nginx") {
				c = f
			} else {
				if(l[h].name == "Apache") {
					g = f
				} else {
					e += f
				}
			}
		}
		c += e;
		g += e;
		g = g.replace(new RegExp(/(data_)/g), "apache_").replace(new RegExp(/(select_)/g), "apache_select_");
		var k = layer.open({
			type: 1,
			title: lan.bt.install_title,
			area: ["658px", "423px"],
			closeBtn: 2,
			shadeClose: false,
			content: "<div class='rec-install'><div class='important-title'><p><span class='glyphicon glyphicon-alert' style='color: #f39c12; margin-right: 10px;'></span>"+lan.bt.install_ps+" <a href='javascript:jump()' style='color:#20a53a'>"+lan.bt.install_s+"</a> "+lan.bt.install_s1+"</p></div><div class='rec-box'><h3>"+lan.bt.install_lnmp+"</h3><div class='rec-box-con'><ul class='rec-list'>" + c + "</ul><p class='fangshi'>"+lan.bt.install_type+"：<label data-title='"+lan.bt.install_rpm_title+"' style='margin-right:0'>"+lan.bt.install_rpm+"<input type='checkbox' checked></label><label data-title='"+lan.bt.install_src_title+"'>"+lan.bt.install_src+"<input type='checkbox'></label></p><div class='onekey'>"+lan.bt.install_key+"</div></div></div><div class='rec-box' style='margin-left:16px'><h3>LAMP</h3><div class='rec-box-con'><ul class='rec-list'>" + g + "</ul><p class='fangshi'>"+lan.bt.install_type+"：<label data-title='"+lan.bt.install_rpm_title+"' style='margin-right:0'>"+lan.bt.install_rpm+"<input type='checkbox' checked></label><label data-title='"+lan.bt.install_src_title+"'>"+lan.bt.install_src+"<input type='checkbox'></label></p><div class='onekey'>一键安装</div></div></div></div>"
		});
		$(".fangshi input").click(function() {
			$(this).attr("checked", "checked").parent().siblings().find("input").removeAttr("checked")
		});
		$(".sl-s-info").change(function() {
			var p = $(this).find("option:selected").text();
			var n = $(this).attr("id");
			p = p.toLowerCase();
			$(this).parents("li").find("input").attr("data-info", p)
		});
		$("#apache_select_PHP").change(function() {
			var n = $(this).val();
			j(n, "apache_select_", "apache_")
		});
		$("#select_PHP").change(function() {
			var n = $(this).val();
			j(n, "select_", "data_")
		});

		function j(p, r, q) {
			var n = "4.4";
			switch(p) {
				case "5.2":
					n = "4.0";
					break;
				case "5.3":
					n = "4.0";
					break;
				case "5.4":
					n = "4.4";
					break;
				case "5.5":
					n = "4.4";
					break;
				default:
					n = "4.7"
			}
			$("#" + r + "phpMyAdmin option[value='" + n + "']").attr("selected", "selected").siblings().removeAttr("selected");
			$("#" + r + "_phpMyAdmin").attr("data-info", "phpmyadmin " + n)
		}
		$("#select_MySQL,#apache_select_MySQL").change(function() {
			var n = $(this).val();
			a(n)
		});
		
		$("#apache_select_Apache").change(function(){
			var apacheVersion = $(this).val();
			if(apacheVersion == '2.2'){
				layer.msg(lan.bt.install_apache22);
			}else{
				layer.msg(lan.bt.install_apache24);
			}
		});
		
		$("#apache_select_PHP").change(function(){
			var apacheVersion = $("#apache_select_Apache").val();
			var phpVersion = $(this).val();
			if(apacheVersion == '2.2'){
				if(phpVersion != '5.2' && phpVersion != '5.3' && phpVersion != '5.4'){
					layer.msg(lan.bt.insatll_s22+'PHP-' + phpVersion,{icon:5});
					$(this).val("5.4");
					$("#apache_PHP").attr('data-info','php 5.4');
					return false;
				}
			}else{
				if(phpVersion == '5.2'){
					layer.msg(lan.bt.insatll_s24+'PHP-' + phpVersion,{icon:5});
					$(this).val("5.4");
					$("#apache_PHP").attr('data-info','php 5.4');
					return false;
				}
			}
		});

		function a(n) {
			memSize = getCookie("memSize");
			max = 64;
			msg = "64M";
			switch(n) {
				case "5.1":
					max = 256;
					msg = "256M";
					break;
				case "5.7":
					max = 1500;
					msg = "2GB";
					break;
				case "5.6":
					max = 800;
					msg = "1GB";
					break;
				case "AliSQL":
					max = 800;
					msg = "1GB";
					break;
				case "mariadb_10.0":
					max = 800;
					msg = "1GB";
					break;
				case "mariadb_10.1":
					max = 1500;
					msg = "2GB";
					break
			}
			if(memSize < max) {
				layer.msg( lan.bt.insatll_mem.replace("{1}",msg).replace("{2}",n), {
					icon: 5
				})
			}
		}
		var de = null;
		$(".onekey").click(function() {
			if(de) return;
			var v = $(this).prev().find("input").eq(0).prop("checked") ? "1" : "0";
			var r = $(this).parents(".rec-box-con").find(".rec-list li").length;
			var n = "";
			var q = "";
			var p = "";
			var x = "";
			var s = "";
			de = true;
			for(var t = 0; t < r; t++) {
				var w = $(this).parents(".rec-box-con").find("ul li").eq(t);
				var u = w.find("input");
				if(u.prop("checked")) {
					n += u.attr("data-info") + ","
				}
			}
			q = n.split(",");
			loadT = layer.msg(lan.bt.install_to, {
				icon: 16,
				time: 0,
				shade: [0.3, "#000"]
			});
			for(var t = 0; t < q.length - 1; t++) {
				p = q[t].split(" ")[0].toLowerCase();
				x = q[t].split(" ")[1];
				s = "name=" + p + "&version=" + x + "&type=" + v + "&id=" + (t + 1);
				$.ajax({
					url: "/files?action=InstallSoft",
					data: s,
					type: "POST",
					async: false,
					success: function(y) {}
				});
			}
			layer.close(loadT);
			layer.close(k);
			setTimeout(function() {
				GetTaskCount()
			}, 2000);
			layer.msg(lan.bt.install_ok, {
				icon: 1
			});
			setTimeout(function() {
				task()
			}, 1000)
		});
		InstallTips();
		fly("onekey")
	})
}

function jump() {
	layer.closeAll();
	window.location.href = "/soft"
}

function InstallTips() {
	$(".fangshi label").mouseover(function() {
		var a = $(this).attr("data-title");
		layer.tips(a, this, {
			tips: [1, "#787878"],
			time: 0
		})
	}).mouseout(function() {
		$(".layui-layer-tips").remove()
	})
}

function fly(a) {
	var b = $("#task").offset();
	$("." + a).click(function(d) {
		var e = $(this);
		var c = $('<span class="yuandian"></span>');
		c.fly({
			start: {
				left: d.pageX,
				top: d.pageY
			},
			end: {
				left: b.left + 10,
				top: b.top + 10,
				width: 0,
				height: 0
			},
			onEnd: function() {
				layer.closeAll();
				layer.msg(lan.bt.task_add, {
					icon: 1
				});
				GetTaskCount()
			}
		});
	});
};


//检查选中项
function checkSelect(){
	setTimeout(function(){
		var checkList = $("input[name=id]");
		var count = 0;
		for(var i=0;i<checkList.length;i++){
			if(checkList[i].checked) count++;
		}
		if(count > 0){
			$("#allDelete").show();
		}else{
			$("#allDelete").hide();
		}
	},5);
}

//处理排序
function listOrder(skey,type,obj){
	or = getCookie('order');
	orderType = 'desc';
	if(or){
		if(or.split(' ')[1] == 'desc'){
			orderType = 'asc';
		}
	}
	
	setCookie('order',skey + ' ' + orderType);
	
	switch(type){
		case 'site':
			getWeb(1);
			break;
		case 'database':
			getData(1);
			break;
		case 'ftp':
			getFtp(1);
			break;
	}
	$(obj).find(".glyphicon-triangle-bottom").remove();
	$(obj).find(".glyphicon-triangle-top").remove();
	if(orderType == 'asc'){
		$(obj).append("<span class='glyphicon glyphicon-triangle-bottom' style='margin-left:5px;color:#bbb'></span>");
	}else{
		$(obj).append("<span class='glyphicon glyphicon-triangle-top' style='margin-left:5px;color:#bbb'></span>");
	}
}

// //去关联列表
// function GetBtpanelList(){
// 	var con ='';
// 	$.post("/config?action=GetPanelList",function(rdata){
// 		for(var i=0; i<rdata.length; i++){
// 			con +='<h3 class="mypcip mypcipnew" style="opacity:.6" data-url="'+rdata[i].url+'" data-user="'+rdata[i].username+'" data-pw="'+rdata[i].password+'"><span class="f14 cw">'+rdata[i].title+'</span><em class="btedit" onclick="bindBTPanel(0,\'c\',\''+rdata[i].title+'\',\''+rdata[i].id+'\',\''+rdata[i].url+'\',\''+rdata[i].username+'\',\''+rdata[i].password+'\')"></em></h3>'
// 		}
// 		$("#newbtpc").html(con);
// 		$(".mypcipnew").hover(function(){
// 			$(this).css("opacity","1");
// 		},function(){
// 			$(this).css("opacity",".6");
// 		}).click(function(){
// 		$("#btpanelform").remove();
// 		var murl = $(this).attr("data-url");
// 		var user = $(this).attr("data-user");
// 		var pw = $(this).attr("data-pw");
// 		layer.open({
// 		  type: 2,
// 		  title: false,
// 		  closeBtn: 0, //不显示关闭按钮
// 		  shade: [0],
// 		  area: ['340px', '215px'],
// 		  offset: 'rb', //右下角弹出
// 		  time: 5, //2秒后自动关闭
// 		  anim: 2,
// 		  content: [murl+'/login', 'no']
// 		});
// 			var loginForm ='<div id="btpanelform" style="display:none"><form id="toBtpanel" action="'+murl+'/login" method="post" target="btpfrom">\
// 				<input name="username" id="btp_username" value="'+user+'" type="text">\
// 				<input name="password" id="btp_password" value="'+pw+'" type="password">\
// 				<input name="code" id="bt_code" value="12345" type="text">\
// 			</form><iframe name="btpfrom" src=""></iframe></div>';
// 			$("body").append(loginForm);
// 			layer.msg(lan.bt.panel_open,{icon:16,shade: [0.3, '#000'],time:1000});
// 			setTimeout(function(){
// 				$("#toBtpanel").submit();
// 			},500);
// 			setTimeout(function(){
// 				window.open(murl);
// 			},1000);
// 		});
// 		$(".btedit").click(function(e){
// 			e.stopPropagation();
// 		});
// 	})
	
// }
// GetBtpanelList();
// //添加面板快捷登录
// function bindBTPanel(a,type,ip,btid,url,user,pw){
// 	var titleName = lan.bt.panel_add;
// 	if(type == "b"){
// 		btn = "<button type='button' class='btn btn-success btn-sm' onclick=\"bindBTPanel(1,'b')\">"+lan.public.add+"</button>";
// 	}
// 	else{
// 		titleName = lan.bt.panel_edit+ip;
// 		btn = "<button type='button' class='btn btn-default btn-sm' onclick=\"bindBTPaneldel('"+btid+"')\">"+lan.public.del+"</button><button type='button' class='btn btn-success btn-sm' onclick=\"bindBTPanel(1,'c','"+ip+"','"+btid+"')\" style='margin-left:7px'>"+lan.public.edit+"</button>";
// 	}
// 	if(url == undefined) url="http://";
// 	if(user == undefined) user="";
// 	if(pw == undefined) pw="";
// 	if(ip == undefined) ip="";
// 	if(a == 1) {
// 		var gurl = "/config?action=AddPanelInfo";
// 		var btaddress = $("#btaddress").val();
// 		if(!btaddress.match(/^(http|https)+:\/\/([\w-]+\.)+[\w-]+:\d+/)){
// 			layer.msg(lan.bt.panel_err_format+'<p>http://192.168.0.1:8888</p>',{icon:5,time:5000});
// 			return;
// 		}
// 		var btuser = encodeURIComponent($("#btuser").val());
// 		var btpassword = encodeURIComponent($("#btpassword").val());
// 		var bttitle = $("#bttitle").val();
// 		var data = "title="+bttitle+"&url="+encodeURIComponent(btaddress)+"&username="+btuser+"&password="+btpassword;
// 		if(btaddress =="" || btuser=="" || btpassword=="" || bttitle==""){
// 			layer.msg(lan.bt.panel_err_empty,{icon:8});
// 			return;
// 		}
// 		if(type=="c"){
// 			gurl = "/config?action=SetPanelInfo";
// 			data = data+"&id="+btid;
// 		}
// 		$.post(gurl, data, function(b) {
// 			if(b.status) {
// 				layer.closeAll();
// 				layer.msg(b.msg, {icon: 1});
// 				GetBtpanelList();
// 			} else {
// 				layer.msg(b.msg, {icon: 2})
// 			}
// 		});
// 		return
// 	}
// 	layer.open({
// 		type: 1,
// 		area: "400px",
// 		title: titleName,
// 		closeBtn: 2,
// 		shift: 5,
// 		shadeClose: false,
// 		content: "<div class='bt-form pd20 pb70'>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_address+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='text' name='btaddress' id='btaddress' value='"+url+"' placeholder='"+lan.bt.panel_address+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_user+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='text' name='btuser' id='btuser' value='"+user+"' placeholder='"+lan.bt.panel_user+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_pass+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='password' name='btpassword' id='btpassword' value='"+pw+"' placeholder='"+lan.bt.panel_pass+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_ps+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='text' name='bttitle' id='bttitle' value='"+ip+"' placeholder='"+lan.bt.panel_ps+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><ul class='help-info-text c7'><li>"+lan.bt.panel_ps_1+"</li><li>"+lan.bt.panel_ps_2+"</li><li>"+lan.bt.panel_ps_3+"</li></ul></div>\
// 		<div class='bt-form-submit-btn'><button type='button' class='btn btn-danger btn-sm' onclick=\"layer.closeAll()\">"+lan.public.close+"</button> "+btn+"</div></div>"
// 	});
// 	$("#btaddress").on("input",function(){
// 		var str =$(this).val();
// 		var isip = /([\w-]+\.){2,6}\w+/;
// 		var iptext = str.match(isip);
// 		if(iptext) $("#bttitle").val(iptext[0]);
// 	}).blur(function(){
// 		var str =$(this).val();
// 		var isip = /([\w-]+\.){2,6}\w+/;
// 		var iptext = str.match(isip);
// 		if(iptext) $("#bttitle").val(iptext[0]);
// 	});
// }
// //删除快捷登录
// function bindBTPaneldel(id){
// 	$.post("/config?action=DelPanelInfo","id="+id,function(rdata){
// 		layer.closeAll();
// 		layer.msg(rdata.msg,{icon:rdata.status?1:2});
// 		GetBtpanelList();
// 	})
// }

function getSpeed(sele){
	if(!$(sele)) return;
	$.get('/ajax?action=GetSpeed',function(speed){
		if(speed.title === null) return;
		mspeed = '';
		if(speed.speed > 0){
			mspeed = '<span class="pull-right">'+ToSize(speed.speed)+'/s</span>';
		}
		body = '<p>'+speed.title+' <img src="/static/img/ing.gif"></p>\
		<div class="bt-progress"><div class="bt-progress-bar" style="width:'+speed.progress+'%"><span class="bt-progress-text">'+speed.progress+'%</span></div></div>\
		<p class="f12 c9"><span class="pull-left">'+speed.used+'/'+speed.total+'</span>'+mspeed+'</p>';
		$(sele).prev().hide();
		$(sele).css({"margin-left":"-37px","width":"380px"});
		$(sele).parents(".layui-layer").css({"margin-left":"-100px"});
		
		$(sele).html(body);
		setTimeout(function(){
			getSpeed(sele);
		},1000);
	});
}
//消息盒子
function messagebox() {
	layer.open({
		type: 1,
		title: lan.bt.task_title,
		area: "640px",
		closeBtn: 2,
		shadeClose: false,
		content: '<div class="bt-form">\
					<div class="bt-w-main">\
						<div class="bt-w-menu">\
							<p class="bgw" id="taskList" onclick="tasklist()">'+lan.bt.task_list+'(<span class="task_count">0</span>)</p>\
							<p onclick="remind()">'+lan.bt.task_msg+'(<span class="msg_count">0</span>)</p>\
							<p onclick="execLog()">执行日志</p>\
						</div>\
						<div class="bt-w-con pd15">\
							<div class="taskcon"></div>\
						</div>\
					</div>\
				</div>'
	});
	$(".bt-w-menu p").click(function(){
		$(this).addClass("bgw").siblings().removeClass("bgw");
	});
	tasklist();
}

//取执行日志
function execLog(){
	$.post('/files?action=GetExecLog',{},function(logs){
		var lbody = '<textarea readonly="" style="margin: 0px;width: 500px;height: 520px;background-color: #333;color:#fff; padding:0 5px" id="exec_log">'+logs+'</textarea>';
		$(".taskcon").html(lbody);
		var ob = document.getElementById('exec_log');
		ob.scrollTop = ob.scrollHeight;
	});
}

function get_msg_data(a,fun) {
    a = a == undefined ? 1 : a;
    $.post("/data?action=getData", "tojs=remind&table=tasks&result=2,4,6,8&limit=10&search=1&p=" + a, function (g) {
        fun(g)
    })
}


function remind(a) {
    get_msg_data(a, function (g) {
        var e = "";
        var f = false;
        var task_count = 0;
        for (var d = 0; d < g.data.length; d++) {
            if (g.data[d].status != '1') {
                task_count++;
                continue;
            }
            e += '<tr><td><input type="checkbox"></td><td><div class="titlename c3">' + g.data[d].name + '</span><span class="rs-status">【' + lan.bt.task_ok + '】<span><span class="rs-time">' + lan.bt.time + (g.data[d].end - g.data[d].start) + lan.bt.s + '</span></div></td><td class="text-right c3">' + g.data[d].addtime + '</td></tr>'
        }
        var con = '<div class="divtable"><table class="table table-hover">\
					<thead><tr><th width="20"><input id="Rs-checkAll" type="checkbox" onclick="RscheckSelect()"></th><th>'+ lan.bt.task_name + '</th><th class="text-right">' + lan.bt.task_time + '</th></tr></thead>\
					<tbody id="remind">'+ e + '</tbody>\
					</table></div>\
					<div class="mtb15" style="height:32px">\
						<div class="pull-left buttongroup" style="display:none;"><button class="btn btn-default btn-sm mr5 rs-del" disabled="disabled">'+ lan.public.del + '</button><button class="btn btn-default btn-sm mr5 rs-read" disabled="disabled">' + lan.bt.task_tip_read + '</button><button class="btn btn-default btn-sm">' + lan.bt.task_tip_all + '</button></div>\
						<div id="taskPage" class="page"></div>\
					</div>';


        var msg_count = g.page.match(/\'Pcount\'>.+<\/span>/)[0].replace(/[^0-9]/ig, "");
        $(".msg_count").text(parseInt(msg_count) - task_count);
        $(".taskcon").html(con);
        $("#taskPage").html(g.page);
        $("#Rs-checkAll").click(function () {
            if ($(this).prop("checked")) {
                $("#remind").find("input").prop("checked", true)
            }
            else {
                $("#remind").find("input").prop("checked", false)
            }
        });
    })

}

function GetReloads() {
	var a = 0;
    var mm = $("#taskList").html()
    if (mm == undefined || mm.indexOf(lan.bt.task_list) == -1 ) {
		clearInterval(speed);
		a = 0;
		speed = null;
		return
	}
	if(speed) return;
	speed = setInterval(function() {
        var mm = $("#taskList").html()
        if (mm == undefined || mm.indexOf(lan.bt.task_list) == -1) {
			clearInterval(speed);
			speed = null;
			a = 0;
			return
		}
		a++;
        $.post("/files?action=GetTaskSpeed", "", function (h) {
            if (h.task == undefined) {
                $(".cmdlist").html(lan.bt.task_not_list);
                return
            }

            if (h.status === false) {
                clearInterval(speed);
                speed = null;
                a = 0;
                return
            }
            
			var b = "";
			var d = "";
			$("#task").text(h.task.length);
			$(".task_count").text(h.task.length);
			for(var g = 0; g < h.task.length; g++) {
				if(h.task[g].status == "-1") {
					if(h.task[g].type != "download") {
						var c = "";
						var f = h.msg.split("\n");
						for(var e = 0; e < f.length; e++) {
							c += f[e] + "<br>"
						}
						if(h.task[g].name.indexOf("扫描") != -1) {
							b = "<li><span class='titlename'>" + h.task[g].name + "</span><span class='state'>"+lan.bt.task_scan+" <img src='/static/img/ing.gif'> | <a href=\"javascript:RemoveTask(" + h.task[g].id + ")\">"+lan.public.close+"</a></span><span class='opencmd'></span><div class='cmd'>" + c + "</div></li>"
						} else {
							b = "<li><span class='titlename'>" + h.task[g].name + "</span><span class='state'>"+lan.bt.task_install+" <img src='/static/img/ing.gif'> | <a href=\"javascript:RemoveTask(" + h.task[g].id + ")\">"+lan.public.close+"</a></span><div class='cmd'>" + c + "</div></li>"
						}
					} else {
						b = "<li><div class='line-progress' style='width:" + h.msg.pre + "%'></div><span class='titlename'>" + h.task[g].name + "<a style='margin-left:130px;'>" + (ToSize(h.msg.used) + "/" + ToSize(h.msg.total)) + "</a></span><span class='com-progress'>" + h.msg.pre + "%</span><span class='state'>"+lan.bt.task_downloading+" <img src='/static/img/ing.gif'> | <a href=\"javascript:RemoveTask(" + h.task[g].id + ")\">"+lan.public.close+"</a></span></li>"
					}
				} else {
					d += "<li><span class='titlename'>" + h.task[g].name + "</span><span class='state'>"+lan.bt.task_sleep+" | <a style='color:green' href=\"javascript:RemoveTask(" + h.task[g].id + ')">'+lan.public.del+'</a></span></li>'
				}
			}
			$(".cmdlist").html(b + d);
			$(".cmd").html(c);
			try{
				if($(".cmd")[0].scrollHeight) $(".cmd").scrollTop($(".cmd")[0].scrollHeight);
			}catch(e){
				return;
			}
		}).error(function(){});
	}, 1000);
}

//检查选中项
function RscheckSelect(){
	setTimeout(function(){
		var checkList = $("#remind").find("input");
		var count = 0;
		for(var i=0;i<checkList.length;i++){
			if(checkList[i].checked) count++;
		}
		if(count > 0){
			$(".buttongroup .btn").removeAttr("disabled");
		}else{
			$(".rs-del,.rs-read").attr("disabled","disabled");
		}
	},5);
}


function tasklist(a){
	var con='<ul class="cmdlist"></ul><span style="position:  fixed;bottom: 13px;">若任务长时间未执行，请尝试在首页点【重启面板】来重置任务队列</span>';
	$(".taskcon").html(con);
	a = a == undefined ? 1 : a;
	$.post("/data?action=getData", "tojs=GetTaskList&table=tasks&limit=10&p=" + a, function(g) {
		var e = "";
		var b = "";
		var c = "";
		var f = false;
		var task_count =0;
		for(var d = 0; d < g.data.length; d++) {
			switch(g.data[d].status) {
				case "-1":
					f = true;
					if(g.data[d].type != "download") {
						b = "<li><span class='titlename'>" + g.data[d].name + "</span><span class='state pull-right c6'>"+lan.bt.task_install+" <img src='/static/img/ing.gif'> | <a class='btlink' href=\"javascript:RemoveTask(" + g.data[d].id + ")\">"+lan.public.close+"</a></span><span class='opencmd'></span><pre class='cmd'></pre></li>"
					} else {
						b = "<li><div class='line-progress' style='width:0%'></div><span class='titlename'>" + g.data[d].name + "<a id='speed' style='margin-left:130px;'>0.0M/12.5M</a></span><span class='com-progress'>0%</span><span class='state'>"+lan.bt.task_downloading+" <img src='/static/img/ing.gif'> | <a href=\"javascript:RemoveTask(" + g.data[d].id + ")\">"+lan.public.close+"</a></span></li>"
					}
					task_count++;
					break;
				case "0":
					c += "<li><span class='titlename'>" + g.data[d].name + "</span><span class='state pull-right c6'>"+lan.bt.task_sleep+"</span> | <a href=\"javascript:RemoveTask(" + g.data[d].id + ")\" class='btlink'>"+lan.public.del+"</a></li>";
					task_count++;
					break;
			}
		}
		
		
		$(".task_count").text(task_count);
		
		get_msg_data(1, function (d) {
            var msg_count = d.page.match(/\'Pcount\'>.+<\/span>/)[0].replace(/[^0-9]/ig, "");
            $(".msg_count").text(parseInt(msg_count));
        })

		$(".cmdlist").html(b + c);
		GetReloads();
		return f
	})
}

//检查登陆状态
function check_login(){
	$.post('/ajax?action=CheckLogin',{},function(rdata){
		if(rdata === true) return;
	});
}


//登陆跳转
function to_login(){
	layer.confirm('您的登陆状态已过期，请重新登陆!',{title:'会话已过期',icon:2,closeBtn: 1,shift: 5},function(){
		location.reload();
	});
}
//表格头固定
function table_fixed(name){
	var tableName = document.querySelector('#'+name);
	tableName.addEventListener('scroll',scroll_handle);
}
function scroll_handle(e){
	var scrollTop = this.scrollTop;
	$(this).find("thead").css({"transform":"translateY("+scrollTop+"px)","position":"relative","z-index":"1"});
}
var clipboard, interval, socket, term, ssh_login,term_box;

var pdata_socket = {
    x_http_token: document.getElementById("request_token_head").getAttribute('token')
}
function loadLink(arry,param,callback){
	var ready = 0;
	if(typeof param === 'function') callback = param
	for(var i=0;i<arry.length;i++){
		if(!Array.isArray(bt['loadLink'])) bt['loadLink'] = []
		if(!is_file_existence(arry[i],false)){
			if((arry.length -1) === i && callback) callback();
			continue;
		};
		var link = document.createElement("link"),_arry_split = arry[i].split('/');
			link.rel = "stylesheet";
		if(typeof(callback) != "undefined"){
		    if (link.readyState) {
			    (function(i){
			    	link.onreadystatechange = function () {
			      		if (link.readyState == "loaded" || script.readyState == "complete") {
				          link.onreadystatechange = null;
				          bt['loadLink'].push(arry[i]);
				          ready ++;
				        }
			    	};
			    })(i);
		    } else {
		    	(function(i){
					link.onload=function () {
			        	bt['loadLink'].push(arry[i]);
			        	ready ++;
					};
		    	})(i);
			}
		}
		link.href = arry[i];
		document.body.appendChild(link);
	}
	var time = setInterval(function(){
		if(ready === arry.length){
			clearTimeout(time);
			callback();
		}
	},10);
};
function loadScript(arry,param,callback) {
	var ready = 0;
	if(typeof param === 'function') callback = param
	for(var i=0;i<arry.length;i++){
		if(!Array.isArray(bt['loadScript'])) bt['loadScript'] = []
		if(!is_file_existence(arry[i],true)){
			if((arry.length -1) === i && callback) callback();
			continue;
		};
		var script = document.createElement("script"),_arry_split = arry[i].split('/');
			script.type = "text/javascript";
		if(typeof(callback) != "undefined"){
		    if (script.readyState) {
			    (function(i){
			    	script.onreadystatechange = function () {
			      		if (script.readyState == "loaded" || script.readyState == "complete") {
				          script.onreadystatechange = null;
				          bt['loadScript'].push(arry[i]);
				          ready ++;
				        }
			    	};
			    })(i);
		    } else {
		    	(function(i){
					script.onload=function () {
			        	bt['loadScript'].push(arry[i]);
			        	ready ++;
					};
		    	})(i);
			}
		}
		script.src = arry[i];
		document.body.appendChild(script);
	}
	var time = setInterval(function(){
		if(ready === arry.length){
			clearTimeout(time);
			callback();
		}
	},10);
}

// 判断文件是否插入
function is_file_existence(name,type){
	var arry = type?bt.loadScript:bt.loadLink
	for(var i=0;i<arry.length;i++){
		if(arry[i] === name) return false
	}
	return true
}
var Term = {
    bws: null,      //websocket对象
    route: '/webssh',  //被访问的方法
    term: null,
    term_box: null,
	ssh_info: null,
	last_body:false,
	config:{
	   cols:0,
	   rows:0,
	   fontSize:12
	},
	
// 	缩放尺寸
    detectZoom:(function(){
        var ratio = 0,
          screen = window.screen,
          ua = navigator.userAgent.toLowerCase();
        if (window.devicePixelRatio !== undefined) {
          ratio = window.devicePixelRatio;
        }
        else if (~ua.indexOf('msie')) {
          if (screen.deviceXDPI && screen.logicalXDPI) {
            ratio = screen.deviceXDPI / screen.logicalXDPI;
          }
        }
        else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
          ratio = window.outerWidth / window.innerWidth;
        }
    
        if (ratio){
          ratio = Math.round(ratio * 100);
        }
        return ratio;
    })(),
    //连接websocket
    connect: function () {
        if (!Term.bws || Term.bws.readyState == 3 || Term.bws.readyState == 2) {
            //连接
            ws_url = (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host + Term.route;
			Term.bws = new WebSocket(ws_url);
            //绑定事件
            Term.bws.addEventListener('message', Term.on_message);
            Term.bws.addEventListener('close', Term.on_close);
            Term.bws.addEventListener('error', Term.on_error);

            if (Term.ssh_info) Term.send(JSON.stringify(Term.ssh_info))
        }
    },

    //服务器消息事件
    on_message: function (ws_event) {
		result = ws_event.data;
        if (result === "\r服务器连接失败!\r" || result == "\r用户名或密码错误!\r") {
            show_ssh_login(result);
            Term.close();
            return;
		}
		if(result.length > 1 && Term.last_body === false){
			Term.last_body = true;
		}
        Term.term.write(result);

        if (result == '\r\n登出\r\n' || result == '登出\r\n' || result == '\r\nlogout\r\n' || result == 'logout\r\n') {
            setTimeout(function () {
                layer.close(Term.term_box);
            }, 500);
            Term.close();
            Term.bws = null;
        }
    },
    //websocket关闭事件
    on_close: function (ws_event) {
        Term.bws = null;
    },

    //websocket错误事件
    on_error: function (ws_event) {
		if(ws_event.target.readyState === 3){
			var msg = '错误: 无法创建WebSocket连接，请在面板设置页面关闭【开发者模式】';
			layer.msg(msg,{time:5000})
			if(Term.state === 3) return
			Term.term.write(msg)
			Term.state = 3;
		}else{
			console.log(ws_event)
		}
    },

    //关闭连接
    close: function () {
        Term.bws.close();
	},
	
	new_terminal:function (){
		if (Term.bws && Term.bws.readyState != 3 && Term.bws.readyState != 2) {
			Term.send('new_terminal');	
			setTimeout(function(){
				if(Term.last_body === false){
					Term.new_terminal();
				}
			},500);
		}
	},

    resize: function () {
        var xterm_config =  bt.get_cookie('xterm_config');
        if(xterm_config == null){
            var xterm_mode = $('.xterm-text-layer'),
            _xterm_width =  xterm_mode[0].clientWidth / 4,
            _xterm_heigth =  xterm_mode[0].clientHeight / 4;
            this.config.cols = parseInt(920 / _xterm_width);
            this.config.rows = parseInt(578 / _xterm_heigth);
            var xterm_mode_width = this.config.cols *_xterm_width,
                xterm_mode_heigth = this.config.rows *_xterm_heigth,
                xterm_mode_width_offset = parseInt(Math.abs((900 - xterm_mode_width)) / _xterm_width);
            if(xterm_mode_width < 900){ 
                this.config.cols + xterm_mode_width_offset;
            }else{
                this.config.cols = xterm_mode_width_offset>1?(this.config.cols - xterm_mode_width_offset) + (this.detectZoom >= 125?1:0):this.config.cols
            }
            bt.set_cookie('xterm_config',JSON.stringify({
                cols:Term.config.cols,
                rows:Term.config.rows,
                detectZoom:Term.detectZoom
            }));
        }else{
            xterm_config = JSON.parse(xterm_config);
           if(xterm_config.detectZoom != this.detectZoom){
               bt.set_cookie('xterm_config',null,0);
               this.resize();
           }else{
               this.config.cols = xterm_config.cols;
               this.config.rows = xterm_config.rows;
           }
        }
        Term.term.resize(this.config.cols, this.config.rows);
		setTimeout(function(){
		    Term.term.scrollToBottom();
	    	Term.term.focus();
			Term.new_terminal();
		},500);
    },

    //发送数据
    //@param event 唯一事件名称
    //@param data 发送的数据
    //@param callback 服务器返回结果时回调的函数,运行完后将被回收
    send: function (data, num) {
        //如果没有连接，则尝试连接服务器
        if (!Term.bws || Term.bws.readyState == 3 || Term.bws.readyState == 2) {
            Term.connect();
        }

        //判断当前连接状态,如果!=1，则100ms后尝试重新发送
        if (Term.bws.readyState === 1) {
            Term.bws.send(data);
        } else {
			if(Term.state === 3) return;
            if (!num) num = 0;
            if (num < 5) {
                num++;
                setTimeout(function () { Term.send(data, num++); }, 100)
            }
        }
    },
    run: function (ssh_info) {
        if(this.detectZoom <= 125){ Term.config.fontSize = 14; }
        var loadT = layer.msg('正在加载终端所需文件，请稍后...', { icon: 16, time: 0, shade: 0.3 });
        loadScript([
        	"/static/build/xterm.min.js",
        	"/static/build/addons/attach/attach.min.js",
        	"/static/build/addons/fit/fit.min.js",
        	"/static/build/addons/fullscreen/fullscreen.min.js",
        	"/static/build/addons/search/search.min.js",
        	"/static/build/addons/winptyCompat/winptyCompat.js"
        ],function(){
        	layer.close(loadT);
        	Term.term = new Terminal({ cols: 4, rows: 4,fontSize:Term.config.fontSize, screenKeys: true, useStyle: true });
			Term.term.setOption('cursorBlink', true);
			Term.last_body = false;
	        Term.term_box = layer.open({
	            type: 1,
	            title: '宝塔终端',
	            area: ['920px', '630px'],
	            closeBtn: 2,
	            shadeClose: false,
	            skin:'term_box_all',
	            content: '<link rel="stylesheet" href="/static/build/xterm.min.css" />\
						<link rel="stylesheet" href="/static/build/addons/fullscreen/fullscreen.min.css" />\
	            <a class="btlink ssh-config" onclick="show_ssh_login(1)" style="position: fixed;margin-left: 83px;margin-top: -30px;">[设置]</a>\
	            <div class="term-box" style="background-color:#000"><div id="term"></div></div>',
	            cancel: function () {
	                Term.term.destroy();
	            },
	            success: function () {
	                $('.term_box_all').css('background-color','#000');
	                $('.term_box_all .layui-layer-content').css('overflow-x','hidden');
	                Term.term.open(document.getElementById('term'));
	                Term.resize();
	            }
	        });
	        Term.term.on('data', function (data) {
	            try {
	                Term.bws.send(data)
	            } catch (e) {
	                Term.term.write('\r\n连接丢失,正在尝试重新连接!\r\n')
	                Term.connect()
	            }
	        });
	        if (ssh_info) Term.ssh_info = ssh_info
	        Term.connect();
        })

    },
    reset_login: function () {
        var ssh_info = {
            data: JSON.stringify({
                host: $("input[name='host']").val(),
                port: $("input[name='port']").val(),
                username: $("input[name='username']").val(),
                password: $("input[name='password']").val()
            })
        }
        $.post('/term_open', ssh_info, function (rdata) {
            if (rdata.status === false) {
                layer.msg(rdata.msg);
                return;
            }
            layer.closeAll();
            Term.connect();
            Term.term.scrollToBottom();
            Term.term.focus();
        });
    }
}

function web_shell() {
    Term.run();
}

socket = {
    emit: function (data,data2) {
        if (data === 'webssh') {
            data = data2
        }
        if (typeof(data) === 'object') {
            return;
        }
        Term.send(data);
    }
}



function show_ssh_login(is_config) {
    if ($("input[name='ssh_user']").attr('autocomplete')) return;
    var s_body = '<div class="bt-form bt-form pd20 pb70">\
                            <style>.ssh_check_s1{    display: inline-block;\
    height: 38px;\
    background-color: #fff;\
    color: #050505;\
    white-space: nowrap;\
    text-align: center;\
    cursor: pointer;\
    border-radius: 0;\
    margin-left: 0px !important;\
    position: relative;\
    top: 2px;\
    line-height: 34px;\
    font-size: 13px;\
    border-color: #e6e6e6;\
    padding: 0 14px;\
    border: 1px solid #e0dfdf;}\
    .ssh_check_s2{margin-left: 0 !important;\
            position: relative;\
            top: 2px;\
            border-color: #e6e6e6;\
            display: inline - block;\
            height: 38px;\
            line-height: 38px;\
            padding: 0 18px;\
            background-color: #20a53a;\
            color: #fff;\
            white-space: nowrap;\
            text-align: center;\
            font-size: 14px;\
            border: none;\
            border-radius: 2px;\
            cursor: pointer;}        </style >\
                            <div class="line "><span class="tname">连接地址</span><div class="info-r "><input name="ssh_host" class="bt-input-text mr5" type="text" style="width:330px" value="127.0.0.1" autocomplete="off"></div></div>\
                            <div class="line "><span class="tname">端口</span><div class="info-r "><input name="ssh_port" class="bt-input-text mr5" type="text" style="width:330px" value="22" autocomplete="off"></div></div>\
                            <div class="line "><span class="tname">用户名</span><div class="info-r "><input name="ssh_user" class="bt-input-text mr5" type="text" style="width:330px" value="root" readonly="readonly" autocomplete="off"></div></div>\
                            <div class="line "><span class="tname">验证方式</span><div class="info-r "><button class="ssh_check_s2" id="pass_check" onclick="pass_check()">密码验证</button><button id="rsa_check" class="ssh_check_s1" onclick="rsa_check()">私钥验证</button></div></div>\
                            <div class="line ssh_passwd"><span class="tname">密码</span><div class="info-r "><input name="ssh_passwd" readonly="readonly" class="bt-input-text mr5" type="password" style="width:330px" value="" autocomplete="off"></div></div>\
                            <div class="line ssh_pkey" style="display:none;"><span class="tname">私钥</span><div class="info-r "><textarea name="ssh_pkey" class="bt-input-text mr5" style="width:330px;height:80px;" ></textarea></div></div>\
                            <div class="line "><span class="tname"></span><div class="info-r "><input style="margin-top: -6px;width: 16px;" name="ssh_is_save" id="ssh_is_save" class="bt-input-text mr5" type="checkbox" ><label style="position: absolute;margin-left: 5px;" for="ssh_is_save">记住密码，下次使用宝塔终端将自动登录</label></div></div>\
                            <p style="color: red;margin-top: 10px;text-align: center;">仅支持登录本服务器，如需登录其他服务器，可以使用<a class="btlink" href="https://www.bt.cn/platform" target="_blank">【堡塔云控平台】</a>进行多机管理</p>\
                            <div class="bt-form-submit-btn"><button type="button" class="btn btn-sm btn-danger" onclick="'+ (is_config ? 'layer.close(ssh_login)' :'layer.closeAll()')+'">关闭</button><button type="button" class="btn btn-sm btn-success ssh-login" onclick="send_ssh_info()">'+(is_config?'确定':'登录SSH')+'</button></div></div>';
    ssh_login = layer.open({
        type: 1,
        title: is_config?'请填写SSH连接配置':'请输入SSH登录帐户和密码',
        area: "500px",
        closeBtn: 0,
        shadeClose: false,
        content: s_body
    });

    setTimeout(function removeReadonly() {
        $("input[name='ssh_user']").removeAttr('readonly');
        $("input[name='ssh_passwd']").removeAttr('readonly');
        $("input[name='ssh_passwd']").focus();

        $("input[name='ssh_passwd']").keydown(function (e) {
            if (e.keyCode == 13) {
                $('.ssh-login').click();
            }
        });

    }, 500);
}


function pass_check() {
    $("#pass_check").attr("class", "ssh_check_s2");
    $("#rsa_check").attr("class", "ssh_check_s1");
    $(".ssh_pkey").hide();
    $(".ssh_passwd").show();
}

function rsa_check() {
    $("#pass_check").attr("class", "ssh_check_s1");
    $("#rsa_check").attr("class", "ssh_check_s2");
    $(".ssh_pkey").show();
    $(".ssh_passwd").hide();
}


function send_ssh_info() {
    pdata = {
        host: $("input[name='ssh_host']").val(),
        port: Number($("input[name='ssh_port']").val()),
        password: $("input[name='ssh_passwd']").val(),
        username: $("input[name='ssh_user']").val(),
        pkey: $("textarea[name='ssh_pkey']").val()
    }
    if (pdata['host'] !== '127.0.0.1' && pdata['host'] !== 'localhost') {
        layer.msg("连接地址只能是127.0.0.1或localhost");
        $("input[name='ssh_host']").focus();
        return;
    }
    if (pdata['port'] < 1 || pdata['port'] > 65535) {
        layer.msg("端口范围不正确[1-65535]");
        $("input[name='ssh_port']").focus();
        return;
    }
    if (!pdata['username']) {
        layer.msg("用户名不能为空!");
        $("input[name='ssh_user']").focus();
        return;
    }

    if ($("#rsa_check").attr("class") === "ssh_check_s2") {
        pdata['c_type'] = 'True'
        if (!pdata['pkey']) {
            layer.msg("私钥不能为空!");
            $("input[name='ssh_pkey']").focus();
            return;
        }
    } else {
        if (!pdata['password']) {
            layer.msg("密码不能为空!");
            $("input[name='ssh_passwd']").focus();
            return;
        }
    }
    if ($("#ssh_is_save").prop("checked")) {
        pdata['is_save'] = '1';
    }
    
    var loadT = layer.msg('正在尝试登录SSH...', { icon: 16, time: 0, shade: 0.3 });
    $.post("/term_open", { data: JSON.stringify(pdata) }, function () {
        layer.close(loadT)
        Term.send('reset_connect');
        layer.close(ssh_login)
        Term.term.focus();
    })
}


acme = {
	speed_msg:"<pre style='margin-bottom: 0px;height:250px;text-align: left;background-color: #000;color: #fff;white-space: pre-wrap;' id='create_lst'>[MSG]</pre>",
	loadT : null,
	//获取订单列表
	get_orders: function(callback){
		acme.request('get_orders',{},function(rdata){
			callback(rdata)
		},'正在获取订单列表...');
	},
	//取指定订单
	get_find: function(index,callback){
		acme.request('get_order_find',{index:index},function(rdata){
			callback(rdata)
		},'正在获取订单信息...')
	},

	//下载指定证书包
	download_cert: function(index,callback){
		acme.request('update_zip',{index:index},function(rdata){
			if(!rdata.status){
				bt.msg(rdata);
				return;
			}
			if(callback) {
				callback(rdata)
			}else{
				window.location.href = '/download?filename=' + rdata.msg
			}
			
		},'正在准备下载..');
	},

	//删除订单
	remove: function(index,callback){
		acme.request('remove_order',{index:index},function(rdata){
			bt.msg(rdata);
			if(callback) callback(rdata)
		});
	},

	//吊销证书
	revoke: function(index,callback){
		acme.request('revoke_order',{index:index},function(rdata){
			bt.msg(rdata);
			if(callback) callback(rdata)
		},'正在吊销证书...');
	},

	//验证域名(手动DNS申请)
	auth_domain: function(index,callback){
		acme.show_speed_window('正在验证DNS...',function(){
			acme.request('apply_dns_auth',{index:index},function(rdata){
				callback(rdata)
			},false);
		});
	},

	//取证书基本信息
	get_cert_init: function(pem_file,siteName,callback){
		acme.request('get_cert_init_api',{pem_file:pem_file,siteName:siteName},function(cert_init){
			callback(cert_init);
		},'正在获取证书信息...');
	},

	//显示进度
	show_speed: function () {
    	bt.send('get_lines','ajax/get_lines',{ 
    		num: 10, 
    		filename: "/www/server/panel/logs/letsencrypt.log" 
    	},function(rdata){
            if ($("#create_lst").text() === "") return;
            if (rdata.status === true) {
                $("#create_lst").text(rdata.msg);
                $("#create_lst").scrollTop($("#create_lst")[0].scrollHeight);
            }
            setTimeout(function () { acme.show_speed(); }, 1000);
    	});
	},
	
	//显示进度窗口
	show_speed_window: function(msg,callback){
		 acme.loadT = layer.open({
            title: false,
            type:1,
            closeBtn:0,
            shade: 0.3,
            area: "500px",
            offset: "30%",
            content: acme.speed_msg.replace('[MSG]',msg),
            success:function(layers,index){
				setTimeout(function(){
					acme.show_speed();
				},1000);
				if (callback) callback();
            }
        });
	},

	//一键申请
	//domain 域名列表 []
	//auth_type 验证类型 dns/http
	//auth_to 验证路径 网站根目录或dnsapi
	//auto_wildcard 是否自动组合通配符 1.是 0.否 默认0
	apply_cert: function(domains,auth_type,auth_to,auto_wildcard,callback){
		acme.show_speed_window('正在申请证书...',function(){
			if(auto_wildcard === undefined) auto_wildcard = '0'
			pdata = {
				domains:JSON.stringify(domains),
				auth_type:auth_type,
				auth_to:auth_to,
				auto_wildcard:auto_wildcard
			}

			if(acme.id) pdata['id'] = acme.id;
			if(acme.siteName) pdata['siteName'] = acme.siteName;
			acme.request('apply_cert_api',pdata,function(rdata){
				callback(rdata);
			},false);
		});
	},

	//续签证书
	renew: function(index,callback){
		acme.show_speed_window('正在续签证书...',function(){
			acme.request('renew_cert',{index:index},function(rdata){
				callback(rdata)
			},false);
		});
	},

	//获取用户信息
	get_account_info: function(callback){
		acme.request('get_account_info',{},function(rdata){
			callback(rdata)
		});
	},

	//设置用户信息
	set_account_info: function(account,callback){
		acme.request('set_account_info',account,function(rdata){
			bt.msg(rdata)
			if(callback) callback(rdata)
		});
	},

	//发送到请求
	request: function(action,pdata,callback,msg){
		if(msg == undefined) msg = '正在处理，请稍候...';
		if(msg){
			var loadT = layer.msg(msg,{icon:16,time:0,shade:0.3});
		}
		$.post("/acme?action=" + action,pdata,function(res){
			if(msg) layer.close(loadT)
			if(callback) callback(res)
		});
	}
}