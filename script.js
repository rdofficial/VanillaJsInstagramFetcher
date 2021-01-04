/*
JavaScript for Instagram Fetcher (VanillaJS)

Author : Rishav Das
*/

// Getting the input box HTML element where the user will enter the username of the instagram account that is needed to be fetched
const usernameInputBox = document.querySelector('input[name="instagram-username"]');

const fillData = (data) => {
	/* The function to fill the data in the informationContainer, just call this function */

	// Getting the 'container' HTML element where we are going to land up the fetched information of the user requested instagram account
	const informationContainer = document.getElementById('information-container');

	// Filling the data in a proper designed HTML format
	informationContainer.innerHTML = `<h3 style="color: #fff">Fetched Information</h3>`
	let html = `
	<img class="profile-picture" src="${data.profilePictureLink}" alt="${data.username}'s profile picture"></img><br>
	<b>Username </b>: ${data.username}<br>
	<b>Full Name </b>: ${data.fullname}<br>
	<b>Bio </b>: ${data.bio}<br>
	<b>Followers </b>: ${data.followers}<br>
	<b>Following </b>: ${data.following}<br>
	<b>External URL </b>: ${data.externalUrl}<br><br>
	<b>User blocked us </b>: ${data.blockedUs}<br>
	<b>Business Account </b>: ${data.isBusinessAccount}<br>
	<b>Fresh Account </b>: ${data.isNewAccount}<br>
	<b>Private Account </b>: ${data.isPrivateAccount}<br>
	<b>Verified Account  </b>: ${data.isVerifiedAccount}<br><br>
	<b>Number of posts </b>: ${data.amountPosts}<br>`;

	// Creating the posts cards div element ;-)
	for (let item of data.posts) {
		// Iterating the 'posts' array in the 'user' object

		html += `<div class="post-card"><img src="${item.thumbnailUrl}" alt="post-thumbnail" class="post-thumbnail"><div class="post-info"><b>Uploaded at </b>: ${item.uploadedAt}<br><b>Likes </b>: ${item.likesCount}<br><b>Comments </b>: ${item.commentsCount}<br><b>Is comments disabled </b>: ${item.commentsDisabled}<br><b>Caption </b>: ${item.captionText}<br></div></div>`
	}
	informationContainer.innerHTML += html;
}

// Getting the load-data-btn button
const loadDataBtn = document.getElementById('load-data-btn');

// Adding an onclick event listener to the load button
loadDataBtn.addEventListener('click', (e) => {
	/* The function to be executed when the user clicks on the 'load data' button. The function would first read off the requested username and then fetch the information from the instagram servers. */

	// Getting the username specified by the user from the usernameInputBox HTML element
	let username = usernameInputBox.value;

	// Checking if the data of the same username exists in the localStorage of the web browser
	data = localStorage.getItem(username);
	if (data != null) {
		// If the user requested instagram account's data is already been loaded and saved to the localStorage, then we will not fetch the same data from the instagram server again. We will just fill in the already saved data

		fillData(JSON.parse(data));
	} else {
		// If the user's data is not already fetched at localStorage, then we will start fetching the required information from the server
		
		fetch(`https://instagram.com/${username}?__a=1`).then(response => response.json()).then(response => {
			/* The function to be executed post the request has been fetched from the instagram server. In this function, we will display the fetched instagram account on the informationContainer HTML element. */

			// Creating a user object to store the filtered saved data
			let user = {
				username : username,
				fullname : response["graphql"]["user"]["full_name"],
				bio : response["graphql"]["user"]["biography"],
				blockedUs : response["graphql"]["user"]["blocked_by_viewer"],
				externalUrl : response["graphql"]["user"]["external_url"],
				followers : response["graphql"]["user"]["edge_followed_by"]["count"],
				following : response["graphql"]["user"]["edge_follow"]["count"],

				isBusinessAccount : response["graphql"]["user"]["is_business_account"],
				isNewAccount : response["graphql"]["user"]["is_joined_recently"],
				isPrivateAccount : response["graphql"]["user"]["is_private"],
				isVerifiedAccount : response["graphql"]["user"]["is_verified"],

				profilePictureLink : response["graphql"]["user"]["profile_pic_url_hd"],
				amountPosts : response["graphql"]["user"]["edge_owner_to_timeline_media"]["count"],
				posts: [],
			}

			// Getting the timeline posts
			response = response["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"];
			for (let item of response) {
				// Iterating through each timeline post

				user.posts.push({
					thumbnailUrl : item["node"]["display_url"],
					likesCount : item["node"]["edge_liked_by"]["count"],
					commentsCount : item["node"]["edge_media_to_comment"]["count"],
					commentsDisabled : item["node"]["comments_disabled"],
					captionText : item["node"]["edge_media_to_caption"]["edges"][0]["node"]["text"],
					uploadedAt : new Date(Number(item["node"]["taken_at_timestamp"]) * 1000).toGMTString(),
				});
			}

			// After fetching and filtering all the information let us fill the required information to our informationContainer HTML element
			fillData(user);

			// Saving the information to the localStorage for less future consumptions
			localStorage.setItem(`${user.username}`, JSON.stringify(user));
		}).catch(error => alert(error));
	}
});