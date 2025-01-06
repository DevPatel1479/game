// function applyFadeOutEffect(element, fadeTime, additionalLogic) {
//     element.style.opacity = '0';
//     setTimeout(function () {
//       if (typeof additionalLogic === 'function') {
//         additionalLogic();
//       }
//     }, fadeTime);
//   }

//   var boxContainer = document.querySelector('.box-container');
//   var btnYes = document.querySelector('.btn-yes');
//   var btnNo = document.querySelector('.btn-no');

//   setTimeout(function () {
//     boxContainer.style.opacity = '1';
//   }, 1000);

//   btnYes.addEventListener('click', function () {
//     applyFadeOutEffect(boxContainer, 0, function () {
//       // Additional logic or actions after fade-out for 'Yes' button
//     });
//     applyFadeOutEffect(btnYes, 5000);
//     applyFadeOutEffect(btnNo, 5000);
//   });

//   btnNo.addEventListener('click', function () {
//     applyFadeOutEffect(boxContainer, 0, function () {
//       // Additional logic or actions after fade-out for 'No' button
//     });
//     applyFadeOutEffect(btnYes, 5000);
//     applyFadeOutEffect(btnNo, 5000);
//   });
// Create a module named 'fadeEffects'
// fadeUtils.js

export function applyFadeOutEffect(element, fadeTime, additionalLogic) {
    element.style.opacity = '0';
    setTimeout(function () {
      if (typeof additionalLogic === 'function') {
        additionalLogic();
      }
    }, fadeTime);
  }
  
  export function handleButtonClick(element, additionalLogic) {
    applyFadeOutEffect(element, 0, additionalLogic);
    applyFadeOutEffect(btnYes, 5000);
    applyFadeOutEffect(btnNo, 5000);
  }
  
  export const boxContainer = document.querySelector('.box-container');
  export const btnYes = document.querySelector('.btn-yes');
  export const btnNo = document.querySelector('.btn-no');
  
  setTimeout(function () {
    boxContainer.style.opacity = '1';
  }, 1000);
  
  btnYes.addEventListener('click', function () {
    handleButtonClick(boxContainer, function () {
      // Additional logic or actions after fade-out for 'Yes' button
    });
  });
  
  btnNo.addEventListener('click', function () {
    handleButtonClick(boxContainer, function () {
      // Additional logic or actions after fade-out for 'No' button
    });
  });
  