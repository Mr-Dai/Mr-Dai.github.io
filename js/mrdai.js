// 生成文章页的跳转列表
function branchJumpBinding() {
	var jumpDest = $(".jump");
	var jumpList = $("#JumpList");
    // 若本页无跳转目标则隐藏跳转目录
    // 加入#right_wrapper li的个数判断是为了防止index页的#right_wrapper被隐藏
    $.each(jumpDest, function(n, value) {
		if (value.id == "")
			value.id = "index_" + (n+1);
        jumpList.append("<li><a href='#"+value.id+"'>"+value.innerHTML+"</a></li>");
    });
}

// 将文章内容内的每个链接都设定为在新标签页中打开
function aAttributeSetting() {
	var aList = $("#left_wrapper a")
	$.each(aList, function(n, value) {
		if (value.target == "")
			value.target = "_blank";
	});
}

// 查找字符串数组中首个匹配正则表达式的元素
function searchString(stringArray, reString) {
	for (elem in stringArray) {
		if (elem.match(reString))
			return elem;
	}
	return null;
}


// 代码高亮子函数拓展

$.fn.javaStyle = function () {
	if (this.length == 0)
		return this;
	$.each(this, function(n, value) {
		var codeArea = $(value);
	});

}

$.fn.mlStyle = function () {
	if (this.length == 0)
		return this;
	$.each(this, function(n, value) {
		var codeArea = $(value);
	});
}

$.fn.pythonStyle = function () {
	if (this.length == 0)
		return this;
	$.each(this, function(n, value) {
		var codeArea = $(value);
	});
}

// 浏览器跳转
function browserRedirect() {  
	var sUserAgent = navigator.userAgent.toLowerCase();  
	var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";  
	var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";  
	var bIsMidp = sUserAgent.match(/midp/i) == "midp";  
	var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";  
	var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";  
	var bIsAndroid = sUserAgent.match(/android/i) == "android";  
	var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";  
	var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";  
	if ((bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) ){  
		window.location.href="/mobile";
	} 
} 

$(document).ready(function(){
//	browserRedirect();
	branchJumpBinding();
	aAttributeSetting();
	$("#post_list_container ul li").last().css("border-bottom-width", "0");
	$("html").removeClass("ui-icon-loading");
	$(".ui-loader").remove();
});