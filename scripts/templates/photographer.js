export function photographerTemplate(
	data,
	isProfilePage = false,
	titleTag = 'h2',
	totalLikes
) {
	const { name, portrait, tagline, id, city, country, price } = data;

	const picture = `assets/photographers/${portrait}`;

	function getUserCardDOM() {
		if (isProfilePage) {
			const photographerHeaderContainer = document.createElement('div');
			photographerHeaderContainer.classList.add(
				'photographer-header-container'
			);
			const contactButton = document.querySelector('.contact_button');
			const img = document.createElement('img');
			img.setAttribute('src', picture);
			img.setAttribute('alt', `Portrait de ${name}`);
			const titleTagElement = document.createElement(titleTag); 
			titleTagElement.textContent = name ?? 'nom inconnu';
			titleTagElement.classList.add('photographer__name');
			const cityP = document.createElement('p');
			cityP.classList.add('city');
			cityP.textContent = city ? city + ',' : 'ville inconnue';
			const countryP = document.createElement('p');
			countryP.textContent = country || 'pays inconnu'; // => si falsy Une valeur "falsy" inclut false, 0, '' (chaîne vide), null, undefined, et NaN;
			const locationContainer = document.createElement('div');
			locationContainer.classList.add('location__container');
			const quote = document.createElement('p');
			quote.textContent = tagline ?? '';
			quote.classList.add('photographer__quote');
			const priceP = document.createElement('p');
			priceP.textContent = price ? `${price}€ par jour` : 'prix non spécifié';
			priceP.classList.add('photographer__price');
			const infosContainer = document.createElement('div');
			infosContainer.classList.add('infos-container');
			//gestion du total des likes
			const likesContainer = document.createElement('p');
			const heart = document.createElement('i');
			heart.classList.add('fa-solid');
			heart.classList.add('fa-heart');
			heart.classList.add('price-tag-heart');
			const likesNumber = document.createElement('span');
			const likesAndHeart = document.createElement('p');
			const priceAndTotalLikes = document.querySelector(
				'.price-and-total-likes'
			);
			likesNumber.textContent = totalLikes ?? '';
			likesNumber.classList.add('number-of-likes');
			likesAndHeart.appendChild(likesNumber);
			likesAndHeart.appendChild(heart);

			likesContainer.appendChild(likesAndHeart);
			priceAndTotalLikes.appendChild(likesContainer);
			locationContainer.appendChild(cityP);
			locationContainer.appendChild(countryP);
			infosContainer.appendChild(titleTagElement);
			infosContainer.appendChild(locationContainer);
			infosContainer.appendChild(quote);
			photographerHeaderContainer.appendChild(infosContainer);
			photographerHeaderContainer.appendChild(contactButton);
			photographerHeaderContainer.appendChild(img);
			return photographerHeaderContainer;
		} else {
			const article = document.createElement('article');
			const img = document.createElement('img');
			img.setAttribute('src', picture);
			img.setAttribute('alt', `Portrait de ${name}`);
			const titleTagElement = document.createElement(titleTag); // Utilise le paramètre titleTag
			titleTagElement.textContent = name ?? 'nom inconnu';
			titleTagElement.classList.add('photographer__name');
			const cityP = document.createElement('p');
			cityP.classList.add('city');
			cityP.textContent = city ? city + ',' : 'ville inconnue';
			const countryP = document.createElement('p');
			countryP.textContent = country || 'pays inconnu'; 
			const locationContainer = document.createElement('div');
			locationContainer.classList.add('location__container');
			const quote = document.createElement('p');
			quote.textContent = tagline ?? '';
			quote.classList.add('photographer__quote');
			const priceP = document.createElement('p');
			priceP.textContent = price ? `${price}€ par jour` : 'prix non spécifié';
			priceP.classList.add('photographer__price');
			const cardLink = document.createElement('a');
			cardLink.classList.add('photographer__link');
			cardLink.setAttribute('href', `photographer.html?id=${id}`);
			cardLink.setAttribute('aria-label', `Voir le profil de ${name}`);
			cardLink.appendChild(img);
			cardLink.appendChild(titleTagElement);
			article.appendChild(cardLink);
			//ajout des éléments à article en tant qu'enfant
			locationContainer.appendChild(cityP);
			locationContainer.appendChild(countryP);
			article.appendChild(locationContainer);
			article.appendChild(quote);
			article.appendChild(priceP);
			return article;
		}
	}
	return {
		name,
		picture,
		tagline,
		price,
		country,
		id,
		getUserCardDOM,
	};
}
