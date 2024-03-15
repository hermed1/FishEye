// eslint-disable-next-line no-unused-vars
function displayModal() {
	const modal = document.getElementById('contact_modal');
	modal.style.display = 'block';
	
	// Met le focus sur le premier élément focusable de la modale
	modal.querySelector('button, input, textarea').focus();

	// Ajoute un écouteur d'événements pour fermer la modale avec la touche Échappement
	document.addEventListener('keydown', function(event) {
		if (event.key === 'Escape') {
			closeModal();
		}
	});
}
// eslint-disable-next-line no-unused-vars
function closeModal() {
	const modal = document.getElementById('contact_modal');
	modal.style.display = 'none';
	document.querySelector('#contact_modal form').reset();

}

