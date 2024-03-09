export function mediaTemplate(
	media,
	name,
	updateTotalLikes,
	changeMediaNumberOfLikes,
	handleLikes,
	openLightbox
) {
	const { title, likes, image, video } = media;
	console.log(image);

	let photographerFirstName = name.split(' ')[0];

	if (photographerFirstName.includes('-')) {
		photographerFirstName = photographerFirstName.replace('-', '');
	}

	function createMedia(index) {
		const mediaName = document.createElement('p');
		mediaName.textContent = title ?? 'titre inconnu';
		mediaName.classList.add('media-title');

		const mediaLikes = document.createElement('p');
		mediaLikes.textContent = likes ?? '';
		mediaLikes.classList.add('media-likes-number');
		const mediaHeart = document.createElement('i');
		mediaHeart.classList.add('fa-regular');
		mediaHeart.classList.add('fa-heart');
		mediaHeart.classList.add('media-heart');
		//dans fonction puis passer aux deux listeners
		// mediaHeart.addEventListener('click', (event) => {
		//   if (event.target.classList.contains('fa-regular')) {
		//     event.target.classList.remove('fa-regular');
		//     event.target.classList.add('fa-solid');
		//     changeMediaNumberOfLikes(true, event.target);
		//     updateTotalLikes();
		//   } else {
		//     event.target.classList.add('fa-regular');
		//     event.target.classList.remove('fa-solid');
		//     changeMediaNumberOfLikes(false, event.target);
		//     updateTotalLikes(false);
		//   }
		// });

		mediaHeart.addEventListener('click', (event) => handleLikes(event));
		mediaHeart.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				handleLikes(event);
			}
		});
		mediaHeart.setAttribute('tabindex', 0);
		const heartAndNumber = document.createElement('div');
		heartAndNumber.classList.add('heart-and-number');
		heartAndNumber.appendChild(mediaLikes);
		heartAndNumber.appendChild(mediaHeart);

		const nameAndLikesContainer = document.createElement('div');
		nameAndLikesContainer.classList.add('name-likes-container');
		nameAndLikesContainer.appendChild(mediaName);
		nameAndLikesContainer.appendChild(heartAndNumber);

		const mediaContainer = document.createElement('div');
		mediaContainer.classList.add('media-container');
		let mediaPath = '';
		//listener pour lightbox

		if (video) {
			mediaPath = `./FishEye_Photos/Sample_Photos/${photographerFirstName}/${video}`;
			const mediaVideo = document.createElement('video');
			mediaVideo.setAttribute('src', mediaPath);
			mediaVideo.setAttribute('alt', title);
			mediaVideo.addEventListener('click', () => {
				openLightbox(mediaPath, title ?? 'titre inconnu', index);
			});
			mediaVideo.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					openLightbox(mediaPath, title ?? 'titre inconnu', index);
				}
			});
			mediaVideo.setAttribute('tabindex', '0'); // Permet à l'élément d'être focusable

			mediaContainer.appendChild(mediaVideo);
		} else {
			mediaPath = `./FishEye_Photos/Sample_Photos/${photographerFirstName}/${image}`;
			const mediaImage = document.createElement('img');
			mediaImage.setAttribute('src', mediaPath);
			mediaImage.setAttribute('alt', title);
			mediaImage.addEventListener('click', () => {
				openLightbox(mediaPath, title ?? 'titre inconnu', index);
			});
			mediaImage.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					openLightbox(mediaPath, title ?? 'titre inconnu', index);
				}
			});
			mediaImage.setAttribute('tabindex', '0'); // Permet à l'élément d'être focusable

			mediaContainer.appendChild(mediaImage);
		}
		mediaContainer.appendChild(nameAndLikesContainer);

		// Ajouts pour l'accessibilité et la navigation au clavier
		// mediaContainer.setAttribute('tabindex', '0'); // Permet à l'élément d'être focusable

		return mediaContainer;
	}
	return {
		title,
		likes,
		image,
		video,
		createMedia,
	};
}
