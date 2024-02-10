import { getPhotographers } from './index.js';
import { photographerTemplate } from '../templates/photographer.js';
import { mediaTemplate } from '../templates/media.js';

const url = new URL(document.location);
const params = url.searchParams;
const id = params.get('id');

let displayedMedias;
let photographer;
// let isSortedByPopularityAsc = true;
// let isSortedByDateAsc = true;
// let isSortedByTitleAsc = true;
let isDropdownOpen = false;

const buttonsList = [
  { id: 1, label: 'Popularité', sortingFunction: sortByPopularity },
  { id: 2, label: 'Titre', sortingFunction: sortByTitle },
  { id: 3, label: 'Date', sortingFunction: sortByDate },
];

// function generateDropdownButtons() {
//   const dropdownButtons = document.querySelector('.dropdown-buttons');

//   if (!isDropdownOpen) {
//     const element = buttonsList[0];
//     const button = document.createElement('button');
//     button.textContent = element.label;
//     button.classList.add('dropdown-button');
//     dropdownButtons.appendChild(button);
//   }
//   for (let element of buttonsList) {
//     const button = document.createElement('button');
//     button.textContent = element.label;
//     button.classList.add('dropdown-button');
//     dropdownButtons.appendChild(button);
//     button.addEventListener('click', () => {
//       element.sortingFunction();
//     });
//   }
// }

// function generateDropdownButtons() {
//   const dropdownButtons = document.querySelector('.dropdown-buttons');
//   // Vider le conteneur avant d'ajouter de nouveaux boutons
//   dropdownButtons.innerHTML = '';

//   if (!isDropdownOpen) {
//     // Affiche uniquement le premier bouton si le menu est fermé
//     const element = buttonsList[0];
//     const button = document.createElement('button');
//     button.textContent = element.label;
//     button.classList.add('dropdown-button', 'dropdown-button1');
//     dropdownButtons.appendChild(button);
//     button.addEventListener('click', (event) => {
//       event.stopPropagation(); // Empêche l'événement de clic de se propager
//       // Ouvre le menu et regénère les boutons
//       isDropdownOpen = true;
//       generateDropdownButtons();
//       toggleDropdownArrows();
//     });
//   } else {
//     // Affiche tous les boutons si le menu est ouvert

//     for (let element of buttonsList) {
//       const dropdownButton = document.createElement('button');
//       dropdownButton.textContent = element.label;
//       dropdownButton.classList.add('dropdown-button');
//       dropdownButtons.appendChild(dropdownButton);
//       dropdownButton.addEventListener('click', () => {
//         element.sortingFunction();
//         // Déplace l'élément cliqué en première position du tableau
//         //avec unshift j'insère l'élément cliqué à [0]
//         buttonsList.unshift(
//           //mais je veux supprimer l'élément cliqué pour pas qu'il soit en double = splice(index de début, 1 élément à supprimer)
//           //je récupère l'élément supprimé avec [0] pour pouvoir l'insérer avec unshift
//           buttonsList.splice(buttonsList.indexOf(element), 1)[0]
//         );
//         isDropdownOpen = false; // Ferme le menu après sélection
//         generateDropdownButtons();
//         toggleDropdownArrows();
//       });
//     }
//     toggleDropdownArrows();
//   }
// }

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
    console.log('test');
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
    const mediaModel = mediaTemplate(oneMedia, photographerName);
    const mediaCard = mediaModel.createMedia();
    mediasContainer.appendChild(mediaCard);
  }
}

async function getPhotographer() {
  try {
    const datas = await getPhotographers();
    photographer = datas.photographers.filter(
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
  if (photographer) {
    const photographerModelSinglePage = photographerTemplate(
      photographer,
      true,
      'h1'
    );
    const photographerCardDom = photographerModelSinglePage.getUserCardDOM();
    const photographerHeader = document.querySelector('.photograph-header');
    photographerHeader.appendChild(photographerCardDom);
  } else {
    console.log('Aucun photographe trouvé avec cet ID.');
  }

  if (displayedMedias) {
    createMedias(photographer);
  }

  if (photographer?.price) {
    const priceTag = document.createElement('p');
    priceTag.textContent = `${photographer.price}€ / jour`;
    priceTag.classList.add('price-tag');
    const body = document.getElementsByTagName('body');
    body[0].appendChild(priceTag);
  }
  generateDropdownButtons();
}

function sortByPopularity() {
  displayedMedias.sort((a, b) => b.likes - a.likes);
  console.log('Tri par popularité', displayedMedias);
  createMedias(photographer);
}

function sortByDate() {
  displayedMedias.sort((a, b) => new Date(a.date) - new Date(b.date));
  console.log('Tri par date', displayedMedias);
  createMedias(photographer);
}

function sortByTitle() {
  displayedMedias.sort((a, b) => a.title.localeCompare(b.title));
  console.log('Tri par titre', displayedMedias);
  createMedias(photographer);
}

// function toggleOptions() {
//   // Sélectionne les éléments HTML qui représentent les options de tri.
//   const option1 = document.querySelector('.option1');
//   const option2 = document.querySelector('.option2');
//   const option3 = document.querySelector('.option3');

//   // Ajoute un écouteur d'événement 'click' sur option1.
//   option1.addEventListener('click', () => {
//     if (!isDropdownOpen) {
//       option2.classList.remove('not-displayed-options');
//       option3.classList.remove('not-displayed-options');
//       toggleDropdownArrows();
//       isDropdownOpen = true;
//     } else {
//       // Lorsque option1 est cliquée, appelle toggleSelectedOption avec option1 comme l'option sélectionnée.
//       toggleSelectedOption(option1, option2, option3);
//     }
//   });

//   // Ajoute un écouteur d'événement 'click' sur option2, similaire à option1.
//   option2.addEventListener('click', () => {
//     toggleSelectedOption(option2, option1, option3);
//   });

//   // Ajoute un écouteur d'événement 'click' sur option3, similaire à option1 et option2.
//   option3.addEventListener('click', () => {
//     toggleSelectedOption(option3, option1, option2);
//   });
// }

// // Définit la fonction qui gère le changement d'option sélectionnée.
// function toggleSelectedOption(selectedOption, otherOption1, otherOption2) {
//   // Vérifie le contenu textuel de l'option sélectionnée pour déterminer quelle fonction de tri appeler.
//   if (selectedOption.textContent.includes('Popularité')) {
//     // Si le texte inclut 'Popularité', appelle la fonction de tri par popularité.
//     sortByPopularity();
//   } else if (selectedOption.textContent.includes('Date')) {
//     // Si le texte inclut 'Date', appelle la fonction de tri par date.
//     sortByDate();
//   } else if (selectedOption.textContent.includes('Titre')) {
//     // Si le texte inclut 'Titre', appelle la fonction de tri par titre.
//     sortByTitle();
//   }

//   // Affiche toutes les options en retirant la classe 'not-displayed-options' qui pourrait les cacher.
//   selectedOption.classList.remove('not-displayed-options');
//   otherOption1.classList.remove('not-displayed-options');
//   otherOption2.classList.remove('not-displayed-options');

//   // Réorganise les options en déplaçant l'option sélectionnée en première position dans le conteneur '.dropdown-buttons'.
//   const dropdown = document.querySelector('.dropdown-buttons');
//   dropdown.insertBefore(selectedOption, dropdown.firstChild);
// }

// toggleOptions();
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
