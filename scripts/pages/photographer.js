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


// Écouteur d'événements pour gérer les clics à l'extérieur du menu déroulant.
document.addEventListener('click', (event) => {
	// Sélectionne l'élément dropdown.
	const dropdown = document.querySelector('.dropdown');
	// Vérifie si le clic a été effectué à l'intérieur du dropdown.
	const isDropdownClicked = dropdown.contains(event.target);
	// Si le clic a été effectué en dehors du dropdown, exécute la logique suivante.
	if (!isDropdownClicked) {
		// Régénère les boutons du dropdown pour refléter l'état initial.
		generateDropdownButtons();
		// Met à jour les flèches du dropdown pour indiquer qu'il est fermé.
		toggleDropdownArrows();
		// Réinitialise l'état du dropdown à fermé.
		isDropdownOpen = false;
	}
});


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


async function getPhotographer() {
	try {
		const datas = await getPhotographers();
		photographer = datas.photographers?.filter(
			(photographer) => photographer.id === parseInt(id)
		)[0];
		const photographerMedias = datas.media.filter(
			(oneMedia) => oneMedia.photographerId == id
		);
		displayedMedias = photographerMedias;

		return photographer;
	} catch (error) {
		console.error('Erreur lors de la récupération des photographes:', error);
	}
}

async function initPhotographerPage() {
	photographer = await getPhotographer();

	if (displayedMedias) {
		for (let oneMedia of displayedMedias) {
			totalLikes += oneMedia.likes;
		}
	}

	if (photographer) {
		const photographerModelSinglePage = photographerTemplate(
			photographer,
			true,
			'h1',
			totalLikes
		);
		if (photographer?.price) {
			const priceAndTotalLikes = document.createElement('div');
			const price = document.createElement('p');
			price.textContent = `${photographer.price}€ / jour`;
			priceAndTotalLikes.classList.add('price-and-total-likes');
			priceAndTotalLikes.appendChild(price);
			const mainContainer = document.querySelector('.main-container');
			mainContainer.appendChild(priceAndTotalLikes);
		}

		const photographerCardDom = photographerModelSinglePage.getUserCardDOM();
		const photographerHeader = document.querySelector('.photograph-header');
		photographerHeader.appendChild(photographerCardDom);
	} else {
		console.log('Aucun photographe trouvé avec cet ID.');
	}

	if (displayedMedias) {
		createMedias(photographer);
	}

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
	const arrowUp = document.querySelector('.fa-chevron-up');
	const arrowDown = document.querySelector('.fa-chevron-down');

	if (!isDropdownOpen) {
		arrowUp.classList.add('not-displayed-arrow');
		arrowUp.classList.remove('displayed-arrow');
		arrowDown.classList.add('displayed-arrow');
		arrowDown.classList.remove('not-displayed-arrow');
	} else {
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

document.addEventListener('DOMContentLoaded', () => {
	const sendButton = document.querySelector('.send_button');
	if (sendButton) {
		sendButton.addEventListener('click', (e) => {
			e.preventDefault();
			getFormValues();
		});
	}
});

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

	closeModal();
	console.log('form', formDetails);
}

function handleLikes(event) {
	if (event.target.classList.contains('fa-regular')) {
		event.target.classList.remove('fa-regular');
		event.target.classList.add('fa-solid');
		changeMediaNumberOfLikes(true, event.target);
		updateTotalLikes();
	} else {
		event.target.classList.add('fa-regular');
		event.target.classList.remove('fa-solid');
		changeMediaNumberOfLikes(false, event.target);
		updateTotalLikes(false);
	}
}

function changeMediaNumberOfLikes(isMore = true, target) {
	if (isMore) {
		let heart = target;
		let number = heart.previousElementSibling;
		let numberOfLikes = parseInt(number.textContent);
		numberOfLikes += 1;
		number.textContent = numberOfLikes;
	} else {
		let heart = target;
		let number = heart.previousElementSibling;
		let numberOfLikes = parseInt(number.textContent);
		numberOfLikes -= 1;
		number.textContent = numberOfLikes;
	}
}

function updateTotalLikes(isMore = true) {
	let totalLikesElement = document.querySelector('.number-of-likes');
	if (totalLikesElement) {
		if (isMore) {
			totalLikes += 1;
		} else {
			totalLikes -= 1;
		}
		totalLikesElement.textContent = totalLikes;
	} else {
		// Gestion de l'erreur ou tentative de récupération de l'élément à nouveau
		console.error('L\'élément .number-of-likes n\'a pas été trouvé dans le DOM.');
	}
}

function openLightbox(mediaPath, imgTitle, index) {
	currentLightboxIndex = index;
	const lightbox = document.getElementById('lightbox_modal');
	lightbox.style.display = 'block';
	const mainContainer = document.querySelector('.main-container');
	mainContainer.style.display = 'none';
	const lightboxMediaContainer = document.querySelector(
		'.lightbox-media-container'
	);
	lightboxMediaContainer.innerHTML = '';
	if (mediaPath.includes('mp4')) {
		const lightboxVideo = document.createElement('video');
		lightboxVideo.classList.add('lightbox-img');
		lightboxVideo.setAttribute('src', mediaPath);
		lightboxVideo.setAttribute('controls', 'controls');
		const lightboxImgTitle = document.createElement('p');
		lightboxImgTitle.classList.add('lightboxImgTitle');
		lightboxImgTitle.textContent = imgTitle;
		lightboxMediaContainer.appendChild(lightboxVideo);
		lightboxMediaContainer.appendChild(lightboxImgTitle);
	} else {
		const lightboxImg = document.createElement('img');
		lightboxImg.classList.add('lightbox-img');
		lightboxImg.setAttribute('src', mediaPath);
		const lightboxImgTitle = document.createElement('p');
		lightboxImgTitle.classList.add('lightboxImgTitle');
		lightboxImgTitle.textContent = imgTitle;
		lightboxMediaContainer.appendChild(lightboxImg);
		lightboxMediaContainer.appendChild(lightboxImgTitle);
	}
	handlePrevButton();
	handleNextButton();
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

function handlePrevButton() {
	console.log(displayedMedias);
	const lightboxMediaContainer = document.querySelector(
		'.lightbox-media-container'
	);

	const currentImageSrc = document.querySelector('.lightbox-img').src;
	const imgSourceArray = currentImageSrc.split('/');
	lightboxMediaContainer.innerHTML = '';

	let newImageIndex;
	if (currentLightboxIndex - 1 < 0) {
		newImageIndex = displayedMedias.length - 1;
		currentLightboxIndex = newImageIndex;
	} else {
		newImageIndex = currentLightboxIndex - 1;
		currentLightboxIndex = newImageIndex;
	}
	const newImageName =
    displayedMedias[newImageIndex].image ||
    displayedMedias[newImageIndex].video;

	imgSourceArray[imgSourceArray.length - 1] = newImageName;
	let newSrc = imgSourceArray.join('/');

	const newLightboxImg = displayedMedias[newImageIndex].hasOwnProperty('video')
		? document.createElement('video')
		: document.createElement('img');
	newLightboxImg.setAttribute('src', newSrc);

	if (newSrc.includes('mp4')) {
		newLightboxImg.setAttribute('controls', '');
	}

	newLightboxImg.classList.add('lightbox-img');
	lightboxMediaContainer.appendChild(newLightboxImg);

	const lightboxImgTitle = document.createElement('p');
	lightboxImgTitle.classList.add('lightboxImgTitle');
	lightboxImgTitle.textContent = displayedMedias[newImageIndex].title;
	lightboxMediaContainer.appendChild(lightboxImgTitle);
}

function handleNextButton() {
	const lightboxMediaContainer = document.querySelector(
		'.lightbox-media-container'
	);

	const currentImageSrc = document.querySelector('.lightbox-img').src;
	const imgSourceArray = currentImageSrc.split('/');
	lightboxMediaContainer.innerHTML = '';

	let newImageIndex;
	if (currentLightboxIndex + 1 > displayedMedias.length - 1) {
		newImageIndex = 0;
		currentLightboxIndex = newImageIndex;
	} else {
		newImageIndex = currentLightboxIndex + 1;
		currentLightboxIndex = newImageIndex;
	}
	const newImageName =
    displayedMedias[newImageIndex].image ||
    displayedMedias[newImageIndex].video;

	imgSourceArray[imgSourceArray.length - 1] = newImageName;
	let newSrc = imgSourceArray.join('/');

	const newLightboxImg = newSrc.includes('mp4')
		? document.createElement('video')
		: document.createElement('img');
	newLightboxImg.setAttribute('src', newSrc);

	if (newSrc.includes('mp4')) {
		newLightboxImg.setAttribute('controls', '');
	}

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

//meme chose fleche gauche puis refacto dans 2 fonctions à appeler au click et au keydown

// document.addEventListener('keydown', (event) => {
//   if (event.key === 'ArrowRight') {
//     document.querySelector('#nextButton').click();
//   } else if (event.key === 'ArrowLeft') {
//     document.querySelector('#prevButton').click();
//   } else if (event.key === 'Escape') {
//     closeLightbox();
//   }
// });
