// 生成文章页的跳转列表
function branchJumpBinding() {
	var jumpDest = $("#post_content h2,.jump");
	var jumpList = $("#JumpList");
    // 若本页无跳转目标则隐藏跳转目录
    // 加入#right_wrapper li的个数判断是为了防止index页的#right_wrapper被隐藏
    if (jumpDest.length == 0)
    	jumpList.hide();
    else {
    	$.each(jumpDest, function(n, value) {
			if (value.id == "")
				value.id = "index_" + (n+1);
        	jumpList.append("<li><a href='#"+value.id+"'>"+value.innerHTML+"</a></li>");
    	});
	}

	// Add scrollspy to <body>
	$('body').scrollspy({ target: "#right_wrapper", offset: 50 });
}

// 将文章内容内的每个链接都设定为在新标签页中打开
function aAttributeSetting() {
	var aList = $("#left_wrapper a")
	$.each(aList, function(n, value) {
		if (value.target == "" && value.href.split("#")[0] != window.location.href.split("#")[0])
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

// Set header ID
function setHeaderID() {
	var headers = $("#post_content h2,h3,h4,h5");
	$.each(headers, function(n, header) {
		var parts = header.innerHTML.split("#", 2);
		if (parts.length > 1) {
			header.innerHTML = parts[0].trim();
			header.setAttribute("id", parts[1].trim());
		}
	})
}

$(document).ready(function(){
	setHeaderID();
	branchJumpBinding();
	aAttributeSetting();
	$("#post_list_container ul li").last().css("border-bottom-width", "0");
	$("html").removeClass("ui-icon-loading");
	$(".ui-loader").remove();
	if (window.location.pathname != "/aboutme.html")
		$("table").addClass("table");
	SyntaxHighlighter.all()
});