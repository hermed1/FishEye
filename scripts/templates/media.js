//opti
// export function mediaTemplate(media, name) {
//   const { title, likes, image, video } = media;

//   let photographerFirstName = name.split(' ')[0];

//   if (photographerFirstName.includes('-')) {
//     photographerFirstName = photographerFirstName.replace('-', '');
//   }

//   function createMedia() {
//     const mediaName = document.createElement('p');
//     mediaName.textContent = title ?? 'titre inconnu';
//     mediaName.classList.add('media-title');

//     const mediaLikes = document.createElement('p');
//     mediaLikes.textContent = likes ?? '';
//     const mediaHeart = document.createElement('i');
//     mediaHeart.classList.add('fa-solid');
//     mediaHeart.classList.add('fa-heart');
//     const heartAndNumber = document.createElement('div');
//     heartAndNumber.classList.add('heart-and-number');
//     heartAndNumber.appendChild(mediaHeart);
//     heartAndNumber.appendChild(mediaLikes);

//     const nameAndLikesContainer = document.createElement('div');
//     nameAndLikesContainer.classList.add('name-likes-container');
//     nameAndLikesContainer.appendChild(mediaName);
//     nameAndLikesContainer.appendChild(heartAndNumber);

//     const mediaContainer = document.createElement('div');
//     mediaContainer.classList.add('media-container');

//     if (video) {
//       const mediaPath = `./FishEye_Photos/Sample_Photos/${photographerFirstName}/${video}`;
//       const mediaVideo = document.createElement('video');
//       mediaVideo.setAttribute('src', mediaPath);
//       mediaVideo.setAttribute('alt', title);
//       mediaVideo.setAttribute('controls', 'controls');
//       mediaContainer.appendChild(mediaVideo);
//     } else {
//       const mediaPath = `./FishEye_Photos/Sample_Photos/${photographerFirstName}/${image}`;
//       const mediaImage = document.createElement('img');
//       mediaImage.setAttribute('src', mediaPath);
//       mediaImage.setAttribute('alt', title);
//       mediaContainer.appendChild(mediaImage);
//     }

//     mediaContainer.appendChild(nameAndLikesContainer);
//     return mediaContainer;
//   }
//   return {
//     title,
//     likes,
//     image,
//     video,
//     createMedia,
//   };
// }
export function mediaTemplate(media, name) {
  const { title, likes, image, video } = media;

  let photographerFirstName = name.split(' ')[0];

  if (photographerFirstName.includes('-')) {
    photographerFirstName = photographerFirstName.replace('-', '');
  }

  function createMedia() {
    const mediaName = document.createElement('p');
    mediaName.textContent = title ?? 'titre inconnu';
    mediaName.classList.add('media-title');

    const mediaLikes = document.createElement('p');
    mediaLikes.textContent = likes ?? '';
    const mediaHeart = document.createElement('i');
    mediaHeart.classList.add('fa-solid');
    mediaHeart.classList.add('fa-heart');
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

    if (video) {
      const mediaPath = `./FishEye_Photos/Sample_Photos/${photographerFirstName}/${video}`;
      const mediaVideo = document.createElement('video');
      mediaVideo.setAttribute('src', mediaPath);
      mediaVideo.setAttribute('alt', title);
      mediaVideo.setAttribute('controls', 'controls');
      mediaContainer.appendChild(mediaVideo);
    } else {
      const mediaPath = `./FishEye_Photos/Sample_Photos/${photographerFirstName}/${image}`;
      const mediaImage = document.createElement('img');
      mediaImage.setAttribute('src', mediaPath);
      mediaImage.setAttribute('alt', title);
      mediaContainer.appendChild(mediaImage);
    }

    mediaContainer.appendChild(nameAndLikesContainer);
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
