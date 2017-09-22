function play68_init() {
	updateShare(0);
}
function play68_submitScore(score) {
	updateShareScore(score);
	Play68.shareFriend();
	//setTimeout( function() { Play68.shareFriend(); }, 1000 )
}
function updateShare(score) {
	var descContent = "六角拼拼";

	if(score > 0){
		shareTitle = '这游戏完爆2048，我玩了'+ score +'分！据说只有3%的人可以到玩5000分！'
	}else{
		shareTitle = '这游戏完爆2048！太虐心了！谨慎点击！'
	}
	appid = '';
	//Play68.setShareInfo(shareTitle,descContent);
	document.title = shareTitle;
}
function updateShareScore(score) {
	updateShare(score);
}