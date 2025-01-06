function displayRandomPopup(messages, popupId, popupTextId, displayTime) {
    // Get a random message
    // var randomIndex = Math.floor(Math.random() * messages.length);
    var popupText = messages;
    console.log(popupText);
    // Update the text content of the popup
    document.getElementById(popupTextId).textContent = popupText;
  
    // Display the popup
    document.getElementById(popupId).style.display = 'block';
  
    // Close the popup after a specified time
    setTimeout(function () {
      document.getElementById(popupId).style.display = 'none';
    }, displayTime);
  }
  
  // Example usage:
  var messages = 
    ' ';
  
  displayRandomPopup(messages, 'popup', 'popupText', 5000);
  

// Open and close the popup automatically
// openAndClosePopup();


export {displayRandomPopup}