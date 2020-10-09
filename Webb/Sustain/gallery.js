

var errorCard = {
	image:{
		title:"Not found",
		username:"Not found",
		image:""
	}
};

var webbServerIp = "http://its.teknikum.it:8080/", serverPath = "sustaining_backend/api/";
var webbServerAdress = webbServerIp + serverPath;

async function CreateGalleryGrid(fame){
	var informationArray = [];
	try {
		if(fame){
			//server request for fame
			informationArray = await AskServerForPosts(true);
			var appendElement = document.getElementById("fameBox");
		}
		else{
			//server request for shame
			informationArray = await AskServerForPosts(false);
			var appendElement = document.getElementById("shameBox");
		}
	} catch (error) {
		if(fame){
			var appendElement = document.getElementById("fameBox");
		}
		else{
			var appendElement = document.getElementById("shameBox");
		}
		informationArray.push(errorCard);
		informationArray.push(errorCard);
		informationArray.push(errorCard);
	}
	

	for (let index = 0; index < informationArray.length; index++) {
		const element = informationArray[index];
		let boxClass = index + 1;
		boxClass = "b" + boxClass;
		let totalRatings = await GetTotalRatings(element.image.id);
		let galleryBox = CreateGalleryBox(element.image.title, element.image.username, element.image.image, boxClass, element.image.rating, totalRatings);
		appendElement.appendChild(galleryBox);
	}

}

async function GetTotalRatings(imageID){
	const response = await fetch(webbServerAdress + "rating/" + imageID);
	const json = await response.json();
	return json.length;
}

function CreateGalleryBox(title, username, imageURL, boxClass, rating, totalRatings){
	let returnElement = document.createElement("section");
	returnElement.className = "gallery-box";
	returnElement.classList.add(boxClass);

	let imageElement = document.createElement("img");
	imageElement.src = imageURL;
	imageElement.alt = title;
	returnElement.appendChild(imageElement);



	let divElement = document.createElement("div");
	divElement.className = "usernameAndTitleBox";


	let textElementUsername = document.createElement("p");
	textElementUsername.className = "username";
	let textNodeUsername = document.createTextNode(username);
	textElementUsername.appendChild(textNodeUsername);
	divElement.appendChild(textElementUsername);

	let textElementTitle = document.createElement("p");
	textElementTitle.className = "title";
	let textNodeTitle = document.createTextNode(title);
	textElementTitle.appendChild(textNodeTitle);
	divElement.appendChild(textElementTitle);

	returnElement.appendChild(divElement);

	let ratingElement = document.createElement("progress");
	ratingElement.className = "ratingBox";
	let midRate = totalRatings/2;
	let fixedRate = rating/2;
	ratingElement.value = midRate+fixedRate;
	ratingElement.max = totalRatings;
	returnElement.appendChild(ratingElement);
	

	//this is what the returnElement looks like
	//<section class="gallery-box" id="boxID">
	//	<img src="imageURL" alt="title">
	//	<div class="usernameAndTitleBox">
	//		<p class="username">username</p>
	// 		<p class="title">title</p>
	//	</div>
	//	<progress max="100" value="70"></progress>
	//</section>

	return returnElement;
}

async function AskServerForPosts(fame){
	if(fame){
		const response = await fetch(webbServerAdress + "posts/fame/999");
		const json = await response.json();
		return json;
	}
	else{
		const response = await fetch(webbServerAdress +"posts/shame/999");
		const json = await response.json();
		return json;
	}
	
}


CreateGalleryGrid(true);
CreateGalleryGrid(false);