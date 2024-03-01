import { getPhotographers } from './index.js';
import { photographerTemplate } from '../templates/photographer.js';
import { mediaTemplate } from '../templates/media.js';

const url = new URL(document.location);
const params = url.searchParams;
const id = params.get('id');

let displayedMedias;
let photographer;
let isDropdownOpen = false;
let totalLikes = 0;

const buttonsList = [
  { id: 1, label: 'Popularité', sortingFunction: sortByPopularity },
  { id: 2, label: 'Titre', sortingFunction: sortByTitle },
  { id: 3, label: 'Date', sortingFunction: sortByDate },
];

function generateDropdownButtons() {
  const dropdownButtons = document.querySelector('.dropdown-buttons');
  // Vider le conteneur avant d'ajouter de nouveaux boutons
  dropdownButtons.innerHTML = '';

  if (!isDropdownOpen) {
    // Affiche uniquement le premier bouton si le menu est fermé
    const element = buttonsList[0];
    const button = document.createElement('button');
    button.textContent = element.label;
    button.classList.add('dropdown-button', 'dropdown-button1'); // Classe spécifique pour le premier bouton
    dropdownButtons.appendChild(button);
    button.addEventListener('click', (event) => {
      event.stopPropagation(); // Empêche l'événement de clic de se propager
      // Ouvre le menu et regénère les boutons
      isDropdownOpen = true;
      generateDropdownButtons();
      toggleDropdownArrows();
    });
  } else {
    // Affiche tous les boutons si le menu est ouvert
    buttonsList.forEach((element, index) => {
      const dropdownButton = document.createElement('button');
      dropdownButton.textContent = element.label;
      dropdownButton.classList.add('dropdown-button');
      // Si c'est le dernier élément du tableau, ajoute une classe spécifique
      if (index === buttonsList.length - 1) {
        dropdownButton.classList.add('last-dropdown-button');
      }
      dropdownButtons.appendChild(dropdownButton);

      dropdownButton.addEventListener('click', () => {
        element.sortingFunction();
        // Déplace l'élément cliqué en première position du tableau
        buttonsList.unshift(
          buttonsList.splice(buttonsList.indexOf(element), 1)[0]
        );
        isDropdownOpen = false; // Ferme le menu après sélection
        generateDropdownButtons();
        toggleDropdownArrows();
      });
    });
    toggleDropdownArrows();
  }
}

document.addEventListener('click', (event) => {
  const dropdown = document.querySelector('.dropdown');
  const isDropdownClicked = dropdown.contains(event.target);
  if (!isDropdownClicked) {
    generateDropdownButtons();
    toggleDropdownArrows();
    isDropdownOpen = false;
  }
});

async function createMedias(photographer) {
  let mediasContainer = document.querySelector('.medias-container');
  if (!mediasContainer) {
    mediasContainer = document.createElement('div');
    mediasContainer.classList.add('medias-container');
    document.querySelector('#main').appendChild(mediasContainer);
  }

  mediasContainer.innerHTML = '';

  const photographerName = photographer.name;

  for (let oneMedia of displayedMedias) {
    const mediaModel = mediaTemplate(
      oneMedia,
      photographerName,
      updateTotalLikes,
      changeMediaNumberOfLikes,
      openLightbox
    );
    const mediaCard = mediaModel.createMedia();
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

  //   const likesNumber = document.createElement('p');
  //   const heart = document.createElement('i');
  //   heart.classList.add('fa-solid');
  //   heart.classList.add('fa-heart');
  //   likesNumber.textContent = totalLikes + heart;
  //   const priceAndTotalLikes = document.createElement('div');
  //   const price = document.createElement('p');
  //   price.textContent = `${photographer.price}€ / jour`;
  //   priceAndTotalLikes.classList.add('price-and-total-likes');
  //   priceAndTotalLikes.appendChild(likesNumber);
  //   priceAndTotalLikes.appendChild(price);
  //   const mainContainer = document.getElementsByTagName('mainContainer');
  //   mainContainer[0].appendChild(priceAndTotalLikes);
  // }

  // if (photographer?.price) {
  //   let totalLikes = 0;
  //   if (displayedMedias) {
  //     for (let oneMedia of displayedMedias) {
  //       totalLikes += oneMedia.likes;
  //     }
  //   }

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

function displayModal() {
  const contactModal = document.querySelector('#contact_modal');
  contactModal.style.display = 'block';
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
    console.error("L'élément .number-of-likes n'a pas été trouvé dans le DOM.");
  }
}

function openLightbox(mediaPath, imgTitle) {
  const lightbox = document.getElementById('lightbox_modal');
  lightbox.style.display = 'block';
  const mainContainer = document.querySelector('.main-container');
  mainContainer.style.display = 'none';
  const lightboxMediaContainer = document.querySelector(
    '.lightbox-media-container'
  );
  lightboxMediaContainer.innerHTML = '';
  if (mediaPath.includes('mp4')) {
    console.log('bebou', mediaPath);
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
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox_modal');
  lightbox.style.display = 'none';
  const mainContainer = document.querySelector('.main-container');
  // Réafficher mainContainer lorsque la lightbox est fermée
  mainContainer.style.display = '';
}

document
  .querySelector('.close-lightbox')
  .addEventListener('click', closeLightbox);

document.querySelector('#prevButton').addEventListener('click', () => {
  const currentImageSrc = document.querySelector('.lightbox-img').src;
  const imgNameParts = currentImageSrc.split('/');
  const imgName = imgNameParts[imgNameParts.length - 1];

  const currentImageIndex = displayedMedias.findIndex(
    (media) => media.image === imgName || media.video === imgName
  );

  const lightboxMediaContainer = document.querySelector(
    '.lightbox-media-container'
  );
  lightboxMediaContainer.innerHTML = '';
  const newLightboxImg = document.createElement('img');
  let newImageIndex;
  if (currentImageIndex - 1 < 0) {
    newImageIndex = displayedMedias.length - 1;
  } else {
    newImageIndex = currentImageIndex - 1;
  }
  const newImageName =
    displayedMedias[newImageIndex].image ||
    displayedMedias[newImageIndex].video;
  console.log('newSrc', newImageName);
  imgNameParts[imgNameParts.length - 1] = newImageName;
  const newFullSrc = imgNameParts.join('/');
  newLightboxImg.src = newFullSrc;
  newLightboxImg.classList.add('lightbox-img');
  lightboxMediaContainer.appendChild(newLightboxImg);

  const lightboxImgTitle = document.createElement('p');
  lightboxImgTitle.classList.add('lightboxImgTitle');
  lightboxImgTitle.textContent = displayedMedias[newImageIndex].title;
  lightboxMediaContainer.appendChild(lightboxImgTitle);
});

//gérer quand on arrive à index 0 ou index length -1
//q
document.querySelector('#nextButton').addEventListener('click', () => {
  const currentImageSrc = document.querySelector('.lightbox-img').src;
  const imgNameParts = currentImageSrc.split('/');
  const imgName = imgNameParts[imgNameParts.length - 1];

  const currentImageIndex = displayedMedias.findIndex(
    (media) => media.image === imgName || media.video === imgName
  );

  const lightboxMediaContainer = document.querySelector(
    '.lightbox-media-container'
  );
  lightboxMediaContainer.innerHTML = '';
  const newLightboxImg = document.createElement('img');
  let newImageIndex;
  if (currentImageIndex + 1 > displayedMedias.length - 1) {
    newImageIndex = 0;
  } else {
    newImageIndex = currentImageIndex + 1;
  }
  const newImageName =
    displayedMedias[newImageIndex].image ||
    displayedMedias[newImageIndex].video;
  imgNameParts[imgNameParts.length - 1] = newImageName;
  const newFullSrc = imgNameParts.join('/');
  newLightboxImg.src = newFullSrc;
  newLightboxImg.classList.add('lightbox-img');
  lightboxMediaContainer.appendChild(newLightboxImg);

  const lightboxImgTitle = document.createElement('p');
  lightboxImgTitle.classList.add('lightboxImgTitle');
  lightboxImgTitle.textContent = displayedMedias[newImageIndex].title;
  lightboxMediaContainer.appendChild(lightboxImgTitle);
});
