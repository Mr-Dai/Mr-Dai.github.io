// 生成文章页的跳转列表
function branchJumpBinding() {
	var jumpDest = $("[id^='jump']");
	var jumpList = $("#JumpList");
	$.each(jumpDest, function(n, value) {
		jumpList.append("<li><a href='#"+value.id+"'>"+value.innerHTML+"</a></li>");
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

function javaStyle(codeArea) {

}

function mlStyle(codeArea) {

}

// 代码高亮主函数
function codeStyle() {
	var codeArea=$("pre[class='code'], code");
	$.each(codeArea, function(n, value){
		var lang=searchString(value.class.split(" "), "Lang-.*").split("-")[1];
		switch (lang) {
			case "HTML": case "XML": mlStyle(value); break;
			case "Java": case "JavaScript": case "C": case "C++": javaStyle(value); break;
			case "Python": pythonStyle(value); break;
		}
	});
}

$(document).ready(function(){
	branchJumpBinding();
	codeStyle();
});