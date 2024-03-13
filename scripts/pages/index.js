// Importation du module pour créer le template d'un photographe.
import { photographerTemplate } from '../templates/photographer.js';

// Fonction asynchrone pour récupérer les données des photographes depuis un fichier JSON.
export async function getPhotographers() {
	try {
		// Tente de récupérer les données depuis le fichier JSON.
		const response = await fetch('data/photographers.json');
		// Lance une erreur avec le code de statut HTTP si la requête échoue.
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		// Si la requête est réussie, parse le JSON en objet JavaScript.
		const datas = await response.json();
		return datas;
	} catch (error) {
		// Log l'erreur dans la console si la requête échoue.
		console.log('Erreur lors de la récupération des données:', error);
	}
}

// Fonction asynchrone pour afficher les données des photographes sur la page.
async function displayData(photographers) {
	// Sélectionne la section HTML où insérer les données des photographes.
	const photographersSection = document.querySelector('.photographer_section');

	// Pour chaque photographe, crée un élément HTML avec les données et l'ajoute à la section.
	photographers.forEach((photographer) => {
		const photographerModel = photographerTemplate(photographer);
		const userCardDOM = photographerModel.getUserCardDOM();
		photographersSection.appendChild(userCardDOM);
	});
}

// Fonction d'initialisation exécutée au chargement de la page.
async function init() {
	// Récupère les données des photographes puis les affiche.
	const { photographers } = await getPhotographers();
	displayData(photographers);
}

// Ajoute un écouteur d'événement pour exécuter la fonction d'initialisation une fois que le DOM est entièrement chargé.
document.addEventListener('DOMContentLoaded', () => {
	const photographersSection = document.querySelector('.photographer_section');
	if (photographersSection) {
		init();
	}
});
