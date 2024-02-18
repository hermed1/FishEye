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
      changeMediaNumberOfLikes
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
      const body = document.getElementsByTagName('body')[0];
      body.appendChild(priceAndTotalLikes);
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
  //   const body = document.getElementsByTagName('body');
  //   body[0].appendChild(priceAndTotalLikes);
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

// function handleLikes() {
//   const heartList = document.querySelectorAll('.media-heart');
//   heartList.forEach((heart) => {
//     heart.classList.remove('fa-regular');
//     heart.classList.add('fa-solid');
//   });
// }

// function handleClickLike() {
//   const heartList = document.querySelectorAll('.media-heart');
//   heartList.forEach((heart) => {
//     heart.addEventListener('click', () => {
//       if (heart.classList.contains('fa-regular')) {
//         heart.classList.remove('fa-regular');
//         heart.classList.add('fa-solid');
//         console.log('test1');
//       } else {
//         heart.classList.add('fa-regular');
//         heart.classList.remove('fa-solid');
//         console.log('test2');
//       }
//     });
//   });
// }
//via délégation d'events/bouillonnement

function changeMediaNumberOfLikes(isMore = true, target) {
  if (isMore) {
    let heart = target;
    console.log('fonction', heart);
    let number = heart.previousElementSibling;
    let numberOfLikes = parseInt(number.textContent);
    numberOfLikes += 1;
    number.textContent = numberOfLikes;
  } else {
    let heart = target;
    let number = heart.previousElementSibling;
    console.log('element', number);
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
