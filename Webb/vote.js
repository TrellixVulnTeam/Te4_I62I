let appElement = document.getElementById("mainAppBox");
let imageElement = document.getElementById("appImage");
var commentParent = document.getElementById("commentSection");
var imageIDArrayRemember = [];
var imageIDCounter = 0;
var firstRun = true, loggedIn = false;
var startPos = 0;
var webbServerIp = "http://its.teknikum.it:8080/", serverPath = "sustaining_backend/api/";
var webbServerAdress = webbServerIp + serverPath;

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime = date+' '+time;

let user = {
	isSignedIn : function() {
		return false;
	}
};

function onSignIn(googleUser) {
	user = googleUser;
}

var postCommentObj = {
	imageID: 0,
	text: "",
	date: "",
}

function PostCommentTextUpdate(){
	var inputElement = document.getElementById("commentPostText");
	postCommentObj.text = inputElement.value;
}

async function TryPostComment(){
	var today = new Date();
	let day = today.getDate() + "", month = (today.getMonth()+1) + "";
	if(day.length == 1){
		day = "0" + day;
	}
	if(month.length == 1){
		month = "0" + month
	}
	var date = today.getFullYear()+'-'+month+'-'+day;
	postCommentObj.date = date;
	postCommentObj.imageID = currentPost.image.id;
	if(!user.isSignedIn()){
		alert("You need to be logged in to post a comment");
		return;
	}
	if(postCommentObj.text == ""){
		alert("The comment needs to have text");
		return;
	}
	await PostComment();
}

async function PostComment(){
	console.log(JSON.stringify(postCommentObj));
	let token = user.getAuthResponse().id_token;
	console.log(postCommentObj);
	try {
		let response = await fetch(webbServerAdress + "comment/" + currentPost.image.id, {
			headers: {
				"Authorization": token,
				"Content-Type": "application/json"
			},
			method: "POST",
			body: JSON.stringify(postCommentObj)
		});
		console.log(response);
	} catch (error) {
		console.log(error);
		alert("Your comment faild to post");
	}
	await ReloadComments();
}

async function ReloadComments(){
	var commentsInfo = await AskServerForComments(currentPost.image.id);
	currentPost = new Post(commentsInfo, currentPost.image);

	while(commentParent.children.length > 0){
		commentParent.children[0].remove();
	}

	for (let index = 0; index < commentsInfo.length; index++) {
		const element = commentsInfo[index];
		commentsInfo[index] = await ReadyCommentForClass(element);
	}

	currentComments = [];
	commentsInfo.forEach(element => {
		currentComments.push(new comment(element));
	});
}

var errorCard = {
	image:{
		title:"Not found",
		username:"Not found",
		image:""
	}

};

var tempComment = {
	id:1,
	imageID: 58,
	userID: 11,
	text: "test Comment",
	date: "2020"
}

class text{
	constructor(elementID){
		let element = document.getElementById(elementID);
		this.set = function(string){
			element.innerHTML = string;
		}
	}
}

class image{
	constructor(elementID){
		let element = document.getElementById(elementID);
		this.setSrcAlt = function(data, alt){
			element.src = data;
			element.alt = alt;
		}
		this.setSrc = function(data){
			element.src = data;
		}
	}
}

class Post{
	constructor(comments, image) {
		this.image = {
			"id":image.id,
			"title": image.title,
			"date":image.date,
			"image":image.image,
			"location":image.location,
			"userID": image.userID
		};
		this.rating = image.rating; //int
		this.user = image.username;
		this.comments = comments;
	}
}

class imageObj{
	constructor(image){
		this.id = image.id;
		this.title = image.title;
		this.date = image.date;
		image = image.image;
		location = image.location;
		userID = image.userID;
	}
}

async function ReadyCommentForClass(comment){
	var newComment = comment;
	newComment.username = await GetUsername(comment.userID);
	return newComment;
}

async function GetUsername(userID){
	const response = await fetch(webbServerAdress + "user/" + userID);
	const text = await response.text();
	return text;
}

class comment{
	constructor(comment){
		this.id = comment.id;
		this.imageID = comment.imageID;
		this.userID = comment.userID;
		this.username = comment.username;
		this.text = comment.text;
		this.date = comment.date;

		this.element = this.MakeElement(this.id);
		commentParent.appendChild(this.element);
		this.mainText = new text("ct" + this.id);
		this.dateText = new text("dt" + this.id);
		this.usernameText = new text("ut" + this.id);

		this.mainText.set(this.text);
		this.dateText.set(this.date);
		this.usernameText.set(this.username);
		
	}

	MakeElement(commentID){
		let element = document.createElement("article");
		element.classList.add("commentBox");
		element.id = "c" + commentID;

		let mainText = document.createElement("p");
		mainText.classList.add("commentText");
		mainText.id = "ct" + commentID;
		let mainTextNode = document.createTextNode("temp");
		mainText.appendChild(mainTextNode);

		let dateText = document.createElement("p");
		dateText.classList.add("commentDate");
		dateText.id = "dt" + commentID;

		let usernameText = document.createElement("p");
		usernameText.classList.add("commentUsername");
		usernameText.id = "ut" + commentID;

		element.appendChild(mainText);
		element.appendChild(dateText);
		element.appendChild(usernameText);
		return element;
	}
}

var titleText = new text("titleText");
var userText = new text("userText");
var fameText = new text("fameNumbText");
var shameText = new text("shameNumbText");
var appImg = new image("appImage");
var currentPost;
var currentComments = [];

async function LoadPost(){
	//Requsets a post from the server
	var post;
	
	try {
		if(firstRun){
			loadProgress();
			post = await AskServerForPost(startPos);
			firstRun = false;
		}
		else{
			post = await AskServerForPost(currentPost.image.id);
		}

		var commentsInfo = await AskServerForComments(post.image.id);

		let buttons = document.getElementsByTagName("button");
		for (let index = 0; index < buttons.length; index++) {
			const element = buttons[index];
			element.removeAttribute("disabled");
		}

		currentPost = new Post(commentsInfo, post.image);
		userText.set(currentPost.user);
		titleText.set(currentPost.image.title);
		appImg.setSrcAlt(currentPost.image.image, currentPost.image.title);

		while(commentParent.children.length > 0){
			commentParent.children[0].remove();
		}

		for (let index = 0; index < commentsInfo.length; index++) {
			const element = commentsInfo[index];
			commentsInfo[index] = await ReadyCommentForClass(element);
		}

		currentComments = [];
		commentsInfo.forEach(element => {
			currentComments.push(new comment(element));
		});

		//gets the ratings for the image
		var rating = await AskServerForRatings(currentPost.image.id);

		//counts amount of Fame and shame
		let fameAmount = 0, shameAmount = 0;
		rating.forEach(element => {
		if(element.rating == 1){
			fameAmount += 1;
		}
		else if(element.rating == -1)
		{
			shameAmount += 1;
		}
		});

		fameText.set(fameAmount + "");
		shameText.set(shameAmount + "");
	} 
	catch (error) {
		post = errorCard;
		currentPost = new Post(post.comments, post.image);
		userText.set(currentPost.user);
		titleText.set(currentPost.image.title);
		appImg.setSrcAlt(currentPost.image.image, currentPost.image.title);
		fameText.set("Not found");
		shameText.set("Not found");
	}
	
	//check so that the user hasen't alredy seen the post this sesion
	/*do {
		imageIDCounter++;
		post = await AskServerForPost(imageIDCounter);
		saftyStop++;
		
	} while(!CheckImgIDActive(post) && saftyStop < 20);
	*/	
}

async function AskServerForPost(imageID){
	const response = await fetch(webbServerAdress + "post/" + imageID);
	const json = await response.json();
	return json;
}

async function AskServerForImage(imageID){
	const response = await fetch(webbServerAdress + "image/" + imageID);
	const json = await response.json();
	return json;
}

async function AskServerForRatings(imageID){
	const response = await fetch(webbServerAdress + "rating/" + imageID);
	const json = await response.json();
	return json;
}

async function AskServerForComments(imageID){
	const response = await fetch(webbServerAdress + "comment/" + imageID)
	const json = await response.json();
	return json;
}

function CheckImgIDActive(post){
	if(post == null){
		return false;
	}
	else{
		return true;
	}
}

async function FamePress(){
	if(user.isSignedIn()){
		await RatingSend(true);
		LoadPost();
	}
	else{
		alert("You need to be logged in to rate the image");
	}
	
}

async function ShamePress(){
	if(user.isSignedIn()){
		await RatingSend(false);
		saveProgress();
		LoadPost();
	}
	else{
		alert("You need to be logged in to rate the image");
	}
}

LoadPost();

var buttons = document.getElementsByTagName("button");
for (let index = 0; index < buttons.length; index++) {
	const element = buttons[index];
	element.setAttribute("disabled", "disabled");
}
	



async function RatingSend(fame){
	let buttons = document.getElementsByTagName("button");
	for (let index = 0; index < buttons.length; index++) {
		const element = buttons[index];
		element.setAttribute("disabled", "disabled");
	}
	let ratingNumb;
	let token = user.getAuthResponse().id_token;
	if(fame){
		ratingNumb = 1;
	}
	else{
		ratingNumb = -1;
	}
	let response = await fetch(webbServerAdress + "rating/" + currentPost.image.id, {
		headers: {
			"Content-Type": "application/json",
			"Authorization": token
		},
		method: "POST",
		body: JSON.stringify({
			rating: ratingNumb,
			imageID: currentPost.image.id
		})
	});
}

window.onunload = saveProgress;

function saveProgress(){
	if(currentPost.image.id != null){
		var toLoad = currentPost.image.id - 1;
		localStorage.setItem("imgIDToLoad", toLoad);
	}
}

function loadProgress(){
	if(localStorage.getItem("notAutoContinue") == "0"){
		startPos = 0;
	}
	else{
		var toLoad = localStorage.getItem("imgIDToLoad");
		if(toLoad != null){
			startPos = parseInt(toLoad);
		}
	}
}