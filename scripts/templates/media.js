// Exporte une fonction qui génère le template pour un média (image ou vidéo)
export function mediaTemplate(media, name, handleLikes, openLightbox) {
	const { title, likes, image, video } = media; 

	// Extrait le prénom du photographe et supprime les tirets si présents
	let photographerFirstName = name.split(' ')[0];
	if (photographerFirstName.includes('-')) {
		photographerFirstName = photographerFirstName.replace('-', '');
	}

	// Fonction pour créer et retourner le conteneur d'un média
	function createMedia(index) {
		// Crée et configure l'élément pour le nom du média
		const mediaName = document.createElement('p');
		mediaName.textContent = title ?? 'titre inconnu';
		mediaName.classList.add('media-title');  

		// Crée et configure l'élément pour le nombre de likes
		const mediaLikes = document.createElement('p');
		mediaLikes.textContent = likes ?? '';
		mediaLikes.classList.add('media-likes-number');

		// Crée et configure l'icône de coeur pour les likes
		const mediaHeart = document.createElement('i');
		mediaHeart.classList.add('fa-regular', 'fa-heart', 'media-heart');
		// Ajoute un écouteur d'événement pour gérer les clics et les touches "Enter" sur le coeur
		mediaHeart.addEventListener('click', (event) => handleLikes(event));
		mediaHeart.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				handleLikes(event);
			}
		});
		// Rend l'icône focusable au clavier (0 = ordre du HTML)
		mediaHeart.setAttribute('tabindex', 0);

		// Assemble les likes et l'icône de coeur dans un conteneur
		const heartAndNumber = document.createElement('div');
		heartAndNumber.classList.add('heart-and-number');
		heartAndNumber.appendChild(mediaLikes);
		heartAndNumber.appendChild(mediaHeart);

		// Crée le conteneur pour le nom et les likes, et l'ajoute au DOM
		const nameAndLikesContainer = document.createElement('div');
		nameAndLikesContainer.classList.add('name-likes-container');
		nameAndLikesContainer.appendChild(mediaName);
		nameAndLikesContainer.appendChild(heartAndNumber);

		// Crée le conteneur principal du média
		const mediaContainer = document.createElement('div');
		mediaContainer.classList.add('media-container');
		let mediaPath = ''; // Initialisation du chemin du média

		// Condition pour gérer si le média est une vidéo ou une image
		if (video) {
			mediaPath = `./FishEye_Photos/Sample_Photos/${photographerFirstName}/${video}`;
			const mediaVideo = document.createElement('video');
			mediaVideo.setAttribute('src', mediaPath);
			mediaVideo.setAttribute('alt', title);
			// Ajoute des écouteurs d'événements pour ouvrir la lightbox au clic ou à la touche "Enter"
			mediaVideo.addEventListener('click', () =>
				openLightbox(mediaPath, title ?? 'titre inconnu', index)
			);
			mediaVideo.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					openLightbox(mediaPath, title ?? 'titre inconnu', index);
				}
			});
			mediaVideo.setAttribute('tabindex', '0'); // Rend la vidéo focusable
			mediaContainer.appendChild(mediaVideo);
		} else {
			mediaPath = `./FishEye_Photos/Sample_Photos/${photographerFirstName}/${image}`;
			const mediaImage = document.createElement('img');
			mediaImage.setAttribute('src', mediaPath);
			mediaImage.setAttribute('alt', title);
			// Ajoute des écouteurs d'événements similaire à ceux de la vidéo
			mediaImage.addEventListener('click', () =>
				openLightbox(mediaPath, title ?? 'titre inconnu', index)
			);
			mediaImage.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					openLightbox(mediaPath, title ?? 'titre inconnu', index);
				}
			});
			mediaImage.setAttribute('tabindex', '0'); // Rend l'image focusable
			mediaContainer.appendChild(mediaImage);
		}
		mediaContainer.appendChild(nameAndLikesContainer); // Ajoute le conteneur de nom et likes au conteneur principal

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
