// Importation des modules nécessaires.
import { getPhotographers } from './index.js';
import { photographerTemplate } from '../templates/photographer.js';
import { mediaTemplate } from '../templates/media.js';

// Récupération de l'ID du photographe depuis l'URL de la page.
const url = new URL(document.location);
const params = url.searchParams;
const id = params.get('id');

// Déclaration des variables pour stocker les médias affichés, les informations du photographe, etc.
let displayedMedias;
let photographer;
let isDropdownOpen = false;
let totalLikes = 0;
let currentLightboxIndex;

// Configuration des boutons pour le tri des médias.
const buttonsList = [
	{ id: 1, label: 'Popularité', sortingFunction: sortByPopularity },
	{ id: 2, label: 'Titre', sortingFunction: sortByTitle },
	{ id: 3, label: 'Date', sortingFunction: sortByDate },
];

// Fonction pour générer et afficher les boutons du menu déroulant de tri.
function generateDropdownButtons() {
	const dropdownButtons = document.querySelector('.dropdown-buttons');
	// Efface le contenu actuel du conteneur de boutons.
	dropdownButtons.innerHTML = '';

	if (!isDropdownOpen) {
		// Si le menu déroulant est fermé, affiche seulement le premier bouton.
		const element = buttonsList[0];
		const button = document.createElement('button');
		button.textContent = element.label;
		button.classList.add('dropdown-button', 'dropdown-button1'); // Style spécifique pour le premier bouton.
		dropdownButtons.appendChild(button);
		button.addEventListener('click', (event) => {
			event.stopPropagation(); // Empêche la propagation de l'événement pour éviter des comportements inattendus.
			// Ouvre le menu déroulant et regénère les boutons.
			isDropdownOpen = true;
			generateDropdownButtons();
			toggleDropdownArrows();
		});
	} else {
		// Si le menu est ouvert, affiche tous les boutons de tri.
		buttonsList.forEach((element, index) => {
			const dropdownButton = document.createElement('button');
			dropdownButton.textContent = element.label;
			dropdownButton.classList.add('dropdown-button');
			// Ajoute une classe spécifique au dernier élément pour éventuellement ajuster son style.
			if (index === buttonsList.length - 1) {
				dropdownButton.classList.add('last-dropdown-button');
			}
			dropdownButtons.appendChild(dropdownButton);

			dropdownButton.addEventListener('click', () => {
				element.sortingFunction(); // Applique la fonction de tri associée au bouton.
				// Réorganise les éléments de la liste pour placer l'élément sélectionné en premier.
				//splice retire l'élément à son index trouvé et renvoie un tableau => récupération du 1er élément et on le pousse en 1ère position de buttonsList
				buttonsList.unshift(buttonsList.splice(buttonsList.indexOf(element), 1)[0]);
				isDropdownOpen = false; // Ferme le menu après la sélection.
				generateDropdownButtons(); // Regénère les boutons pour refléter le nouvel ordre.
				toggleDropdownArrows(); // Met à jour les flèches indiquant l'état du menu déroulant.
			});
		});
		toggleDropdownArrows(); // Met à jour les flèches dès que le menu change d'état.
	}
}


document.addEventListener('click', (event) => {
	const dropdown = document.querySelector('.dropdown');
	const isDropdownClicked = dropdown.contains(event.target);

	// On vérifie d'abord si le dropdown est ouvert
	if (isDropdownOpen) {
		// Si le clic a été effectué en dehors du dropdown et que le dropdown est ouvert,
		// on ferme le dropdown.
		if (!isDropdownClicked) {
			toggleDropdown(); // Supposons que cette fonction gère à la fois l'ouverture et la fermeture du dropdown
		}
	}
});

function toggleDropdown() {
	// Cette fonction devrait gérer le changement d'état du dropdown
	isDropdownOpen = !isDropdownOpen; // Bascule l'état d'ouverture
	if (isDropdownOpen) {
		// Logique pour ouvrir le dropdown
		generateDropdownButtons();
		toggleDropdownArrows(true); // On suppose que cette fonction peut prendre un paramètre pour indiquer l'état
	} else {
		// Logique pour fermer le dropdown
		generateDropdownButtons(); // Assurez-vous que cette fonction gère correctement l'état de fermeture
		toggleDropdownArrows(false); // Ferme visuellement le dropdown
	}
}

// Fonction asynchrone pour créer et afficher les médias d'un photographe spécifique.
async function createMedias(photographer) {
	// Sélectionne le conteneur pour les médias; le crée s'il n'existe pas déjà.
	let mediasContainer = document.querySelector('.medias-container');
	if (!mediasContainer) {
		mediasContainer = document.createElement('div');
		mediasContainer.classList.add('medias-container');
		document.querySelector('#main').appendChild(mediasContainer);
	}

	// Efface les médias précédemment affichés dans le conteneur.
	mediasContainer.innerHTML = '';

	// Récupère le nom du photographe pour le traitement ultérieur.
	const photographerName = photographer.name;

	// Boucle sur chaque média associé au photographe pour le créer et l'afficher.
	for (let i = 0; i < displayedMedias.length; i++) {
		let oneMedia = displayedMedias[i];
		// Crée le modèle de média en utilisant le template spécifié.
		const mediaModel = mediaTemplate(
			oneMedia,
			photographerName,
			handleLikes,
			openLightbox
		);
			// Crée l'élément DOM pour le média et l'ajoute au conteneur.
		const mediaCard = mediaModel.createMedia(i); 
		mediasContainer.appendChild(mediaCard);
	}
}


// Récupère les données d'un photographe spécifique par son ID
async function getPhotographer() {
	try {
		// Appel asynchrone pour récupérer tous les photographes
		const datas = await getPhotographers();
		// Filtre pour trouver le photographe par ID
		photographer = datas.photographers?.filter(
			(photographer) => photographer.id === parseInt(id)
		)[0];
		// Filtre les médias associés au photographe par son ID
		const photographerMedias = datas.media.filter(
			(oneMedia) => oneMedia.photographerId == id
		);
		displayedMedias = photographerMedias;

		return photographer;
	} catch (error) {
		// Gère les erreurs lors de la récupération des données
		console.error('Erreur lors de la récupération des photographes:', error);
	}
}


// Initialisation de la page du photographe
async function initPhotographerPage() {
	// Récupération du photographe par son ID
	photographer = await getPhotographer();

	// Calcul du total des likes pour les médias affichés
	if (displayedMedias) {
		for (let oneMedia of displayedMedias) {
			totalLikes += oneMedia.likes;
		}
	}

	// Si un photographe a été trouvé
	if (photographer) {
		// Création du modèle de la page du photographe
		const photographerModelSinglePage = photographerTemplate(photographer, true, 'h1', totalLikes);
			
		// Si le photographe a un tarif défini, affichage du tarif et du total des likes
		if (photographer?.price) {
			const priceAndTotalLikes = document.createElement('div');
			const price = document.createElement('p');
			price.textContent = `${photographer.price}€ / jour`;
			priceAndTotalLikes.classList.add('price-and-total-likes');
			priceAndTotalLikes.appendChild(price);
			const mainContainer = document.querySelector('.main-container');
			mainContainer.appendChild(priceAndTotalLikes);
		}

		// Ajout du modèle du photographe au DOM
		const photographerCardDom = photographerModelSinglePage.getUserCardDOM();
		const photographerHeader = document.querySelector('.photograph-header');
		photographerHeader.appendChild(photographerCardDom);
	} else {
		console.log('Aucun photographe trouvé avec cet ID.');
	}

	// Création des médias associés au photographe
	if (displayedMedias) {
		createMedias(photographer);
	}

	// Génération des boutons du menu déroulant
	generateDropdownButtons();
}

function sortByPopularity() {
	displayedMedias.sort((a, b) => b.likes - a.likes);
	createMedias(photographer);
}

function sortByDate() {
	displayedMedias.sort((a, b) => new Date(a.date) - new Date(b.date));
	createMedias(photographer);
}

function sortByTitle() {
	displayedMedias.sort((a, b) => a.title.localeCompare(b.title));
	createMedias(photographer);
}

initPhotographerPage();

function toggleDropdownArrows() {
	// Sélection des éléments flèche dans le DOM
	const arrowUp = document.querySelector('.fa-chevron-up');
	const arrowDown = document.querySelector('.fa-chevron-down');

	// Basculer la visibilité des flèches en fonction de l'état du menu déroulant
	if (!isDropdownOpen) {
		// Menu fermé : affiche flèche vers le bas, cache flèche vers le haut
		arrowUp.classList.add('not-displayed-arrow');
		arrowUp.classList.remove('displayed-arrow');
		arrowDown.classList.add('displayed-arrow');
		arrowDown.classList.remove('not-displayed-arrow');
	} else {
		// Menu ouvert : affiche flèche vers le haut, cache flèche vers le bas
		arrowUp.classList.add('displayed-arrow');
		arrowUp.classList.remove('not-displayed-arrow');
		arrowDown.classList.add('not-displayed-arrow');
		arrowDown.classList.remove('displayed-arrow');
	}
}

function closeModal() {
	const contactModal = document.querySelector('#contact_modal');
	contactModal.style.display = 'none';
	
}

function getFormValues() {
	const firstName = document.getElementById('firstName').value;
	const lastName = document.getElementById('lastName').value;
	const email = document.getElementById('email').value;
	const textarea = document.getElementById('form-textarea').value;
	const formDetails = {
		prénom: firstName,
		nom: lastName,
		email: email,
		message: textarea,
	};

	console.log('form', formDetails);
	closeModal();
	document.querySelector('#contact_modal form').reset();

}

document.addEventListener('DOMContentLoaded', () => {
	const sendButton = document.querySelector('.send_button');
	if (sendButton) {
		sendButton.addEventListener('click', (e) => {
			e.preventDefault();
			getFormValues();
		});
	}
});

// Gère les événements de clic sur les icônes de like
function handleLikes(event) {
	// Vérifie si l'élément cliqué est une icône "regular" (non liké)
	if (event.target.classList.contains('fa-regular')) {
		// Change l'icône à "solid" (liké), indiquant visuellement que l'élément a été liké
		event.target.classList.remove('fa-regular');
		event.target.classList.add('fa-solid');
		// Met à jour le nombre de likes du média et le total global de likes
		changeMediaNumberOfLikes(true, event.target);
		updateTotalLikes();
	} else {
		// Si l'icône est déjà "solid" (liké), la change à "regular" (non liké)
		event.target.classList.add('fa-regular');
		event.target.classList.remove('fa-solid');
		// Diminue le nombre de likes du média et met à jour le total global
		changeMediaNumberOfLikes(false, event.target);
		updateTotalLikes(false);
	}
}

// Modifie le nombre de likes pour un média spécifique
function changeMediaNumberOfLikes(isMore = true, target) {
	// Sélectionne l'élément affichant le nombre de likes adjacent à l'icône
	let heart = target;
	let number = heart.previousElementSibling;
	let numberOfLikes = parseInt(number.textContent);

	// Augmente ou diminue le nombre de likes selon l'action de l'utilisateur
	if (isMore) {
		numberOfLikes += 1; // Incrémente pour un like
	} else {
		numberOfLikes -= 1; // Décrémente pour un dislike
	}
	// Met à jour l'affichage du nombre de likes
	number.textContent = numberOfLikes;
}


// Met à jour le total des likes affiché sur la page
function updateTotalLikes(isMore = true) {
	// Sélectionne l'élément HTML qui affiche le total des likes
	let totalLikesElement = document.querySelector('.number-of-likes');
	
	// Vérifie si l'élément a été trouvé
	if (totalLikesElement) {
		// Incrémente ou décrémente le total des likes basé sur le paramètre isMore
		totalLikes += isMore ? 1 : -1;
			
		// Met à jour l'affichage avec le nouveau total des likes
		totalLikesElement.textContent = totalLikes;
	} else {
		// Affiche une erreur dans la console si l'élément n'est pas trouvé
		console.error('L\'élément .number-of-likes n\'a pas été trouvé dans le DOM.');
	}
}

// Ouvre la lightbox pour afficher les médias en grand format
function openLightbox(mediaPath, imgTitle, index) {
	// Met à jour l'index courant pour la navigation dans la lightbox
	currentLightboxIndex = index;
	
	// Affiche la lightbox en rendant son conteneur visible
	const lightbox = document.getElementById('lightbox_modal');
	lightbox.style.display = 'block';
	
	// Cache le conteneur principal pour mettre en évidence la lightbox
	const mainContainer = document.querySelector('.main-container');
	mainContainer.style.display = 'none';
	
	// Prépare le conteneur interne de la lightbox pour le nouveau média
	const lightboxMediaContainer = document.querySelector('.lightbox-media-container');
	lightboxMediaContainer.innerHTML = ''; // Efface les médias précédents

	// Vérifie le type de média (vidéo ou image) basé sur l'extension du fichier
	if (mediaPath.includes('mp4')) {
		// Crée un élément vidéo si le média est une vidéo
		const lightboxVideo = document.createElement('video');
		lightboxVideo.classList.add('lightbox-img');
		lightboxVideo.setAttribute('src', mediaPath);
		lightboxVideo.setAttribute('controls', 'controls'); // Ajoute les contrôles de lecture
		const lightboxImgTitle = document.createElement('p');
		lightboxImgTitle.classList.add('lightboxImgTitle');
		lightboxImgTitle.textContent = imgTitle; // Définit le titre de la vidéo
		lightboxMediaContainer.appendChild(lightboxVideo);
		lightboxMediaContainer.appendChild(lightboxImgTitle); // Ajoute vidéo et titre au conteneur
	} else {
		// Crée un élément image si le média est une image
		const lightboxImg = document.createElement('img');
		lightboxImg.classList.add('lightbox-img');
		lightboxImg.setAttribute('src', mediaPath); // Définit le chemin de l'image
		const lightboxImgTitle = document.createElement('p');
		lightboxImgTitle.classList.add('lightboxImgTitle');
		lightboxImgTitle.textContent = imgTitle; // Définit le titre de l'image
		lightboxMediaContainer.appendChild(lightboxImg); // Ajoute image et titre au conteneur
		lightboxMediaContainer.appendChild(lightboxImgTitle);
	}

	handlePrevButton();
	handleNextButton();

	// Gère les événements du clavier pour la navigation et la fermeture
	handleKeyboardEvents();
}

function closeLightbox() {
	const lightbox = document.getElementById('lightbox_modal');
	lightbox.style.display = 'none';
	const mainContainer = document.querySelector('.main-container');
	// Réafficher mainContainer lorsque la lightbox est fermée
	mainContainer.style.display = '';
	//repasser dessus
	document.removeEventListener('keydown', handleKeyboardEvents);
}

document
	.querySelector('.close-lightbox')
	.addEventListener('click', closeLightbox);

// Gère l'action de navigation vers le média précédent dans la lightbox
function handlePrevButton() {

	// Sélectionne le conteneur de la lightbox pour afficher le média
	const lightboxMediaContainer = document.querySelector('.lightbox-media-container');

	// Récupère le chemin de l'image ou de la vidéo actuellement affichée
	const currentImageSrc = document.querySelector('.lightbox-img').src;
	// Divise le chemin en segments pour pouvoir remplacer le nom du fichier
	const imgSourceArray = currentImageSrc.split('/');
	// Efface le contenu précédent du conteneur pour le nouveau média
	lightboxMediaContainer.innerHTML = '';

	let newImageIndex; // Déclare une variable pour le nouvel index du média

	// Calcule le nouvel index, gère le cas où l'index actuel est le premier élément
	if (currentLightboxIndex - 1 < 0) {
		newImageIndex = displayedMedias.length - 1; // Revient au dernier média si on est au début
	} else {
		newImageIndex = currentLightboxIndex - 1; // Sinon, décrémente simplement l'index
	}
	currentLightboxIndex = newImageIndex; // Met à jour l'index courant

	// Détermine le nouveau chemin du média en fonction de son type (image ou vidéo)
	const newImageName = displayedMedias[newImageIndex].image || displayedMedias[newImageIndex].video;
	imgSourceArray[imgSourceArray.length - 1] = newImageName; // Remplace le nom du fichier dans le chemin
	let newSrc = imgSourceArray.join('/'); // Recombine les segments en un chemin complet

	// // Crée un nouvel élément HTML (img ou video) selon le type de média
	// const newLightboxImg = displayedMedias[newImageIndex].hasOwnProperty('video')
	// 	? document.createElement('video')
	// 	: document.createElement('img');
	// newLightboxImg.setAttribute('src', newSrc); // Définit le chemin du nouveau média

	// // Si c'est une vidéo, ajoute les contrôles de lecture
	// if (displayedMedias[newImageIndex].hasOwnProperty('video')) {
	// 	newLightboxImg.setAttribute('controls', '');
	// }
	const hasVideoProperty = Object.prototype.hasOwnProperty.call(displayedMedias[newImageIndex], 'video');
	const newLightboxImg = hasVideoProperty
		? document.createElement('video')
		: document.createElement('img');
	newLightboxImg.setAttribute('src', newSrc); // Définit le chemin du nouveau média

	// Si c'est une vidéo, ajoute les contrôles de lecture
	if (hasVideoProperty) {
		newLightboxImg.setAttribute('controls', '');
	}

	
	// Ajoute le nouvel élément média au conteneur
	newLightboxImg.classList.add('lightbox-img');
	lightboxMediaContainer.appendChild(newLightboxImg);

	// Crée et ajoute le titre du média au conteneur
	const lightboxImgTitle = document.createElement('p');
	lightboxImgTitle.classList.add('lightboxImgTitle');
	lightboxImgTitle.textContent = displayedMedias[newImageIndex].title;
	lightboxMediaContainer.appendChild(lightboxImgTitle);
}

function handleNextButton() {
	// Sélectionne le conteneur de la lightbox pour le nouveau média
	const lightboxMediaContainer = document.querySelector('.lightbox-media-container');

	// Extrai le chemin actuel du média affiché pour déterminer le prochain média
	const currentImageSrc = document.querySelector('.lightbox-img').src;
	const imgSourceArray = currentImageSrc.split('/');
	lightboxMediaContainer.innerHTML = ''; // Prépare le conteneur pour le nouveau contenu

	// Détermine le nouvel index pour afficher le média suivant
	let newImageIndex;
	if (currentLightboxIndex + 1 > displayedMedias.length - 1) {
		newImageIndex = 0; // Retourne au début si on dépasse le dernier média
	} else {
		newImageIndex = currentLightboxIndex + 1; // Sinon, passe au média suivant
	}
	currentLightboxIndex = newImageIndex;

	// Construit le chemin du nouveau média en remplaçant le nom de fichier
	const newImageName = displayedMedias[newImageIndex].image || displayedMedias[newImageIndex].video;
	imgSourceArray[imgSourceArray.length - 1] = newImageName;
	let newSrc = imgSourceArray.join('/');

	// // Crée l'élément HTML approprié pour le type de média (image ou vidéo)
	// const newLightboxImg = displayedMedias[newImageIndex].hasOwnProperty('video')
	// 	? document.createElement('video')
	// 	: document.createElement('img');
	// newLightboxImg.setAttribute('src', newSrc);

	// // Ajoute les contrôles de lecture pour les vidéos
	// if (displayedMedias[newImageIndex].hasOwnProperty('video')) {
	// 	newLightboxImg.setAttribute('controls', '');
	// }
	const hasVideoProperty = Object.prototype.hasOwnProperty.call(displayedMedias[newImageIndex], 'video');
	const newLightboxImg = hasVideoProperty
		? document.createElement('video')
		: document.createElement('img');
	newLightboxImg.setAttribute('src', newSrc); // Définit le chemin du nouveau média

	// Si c'est une vidéo, ajoute les contrôles de lecture
	if (hasVideoProperty) {
		newLightboxImg.setAttribute('controls', '');
	}

	// Ajoute le nouvel élément média et son titre au conteneur de la lightbox
	newLightboxImg.classList.add('lightbox-img');
	lightboxMediaContainer.appendChild(newLightboxImg);
	const lightboxImgTitle = document.createElement('p');
	lightboxImgTitle.classList.add('lightboxImgTitle');
	lightboxImgTitle.textContent = displayedMedias[newImageIndex].title;
	lightboxMediaContainer.appendChild(lightboxImgTitle);
}


function handleKeyboardEvents() {
	document.addEventListener('keydown', (event) => {
		switch (event.key) {
		case 'ArrowRight':
			handleNextButton();
			break;
		case 'ArrowLeft':
			handlePrevButton();
			break;
		case 'Escape':
			closeLightbox();
			break;
		default:
			break;
		}
	});
}

document
	.querySelector('#prevButton')
	.addEventListener('click', handlePrevButton);

document
	.querySelector('#nextButton')
	.addEventListener('click', handleNextButton);

