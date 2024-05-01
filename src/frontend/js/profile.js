import { appRouter } from './router.js';

let userName = '';

function fetchUserProfile() {
  const jwt = getCookie('jwt');
 console.log('Token from cookie:', jwt);

  fetch('https://127.0.0.1:443/api/profile', {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${jwt}`,
      },
      credentials: 'include'
  })
  .then(response => {
      if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      return response.json();
  })
  .then(data => {
      userName = data.username;
      updateProfilePage(data);
      loadMatchHistory(data.id);
      fetchProfilePicture();
 
  })
  .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
  });
}


function getCookie(name) {
    const decodedCookies = decodeURIComponent(document.cookie); 
    const cookies = decodedCookies.split(';');
    const cookiePrefix = name + '=';
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(cookiePrefix)) {
            return cookie.substring(cookiePrefix.length);
        }
    }
    return null;
}

  function fetchAndUpdateProfile() {
    fetchUserProfile(); 
}

// clean up
  
function updateProfilePage(userData) {
   //console.log('User data:', userData);
    const usernameElement = document.getElementById('username');
    if (userData.username) {
      usernameElement.textContent = userData.username;
    }else {
      usernameElement.textContent = 'N/A';
      //console.log('username not found');
    }
    const emailElement = document.getElementById('email');
    if (userData.email) {
      emailElement.textContent = userData.email;
    } else {
      emailElement.textContent = 'N/A';
      //console.log('email null ');
    }
    const joinDateElement = document.getElementById('joinDate');
    if (userData.join_date) {
      joinDateElement.textContent = formatDate(userData.join_date);
    } else {
      joinDateElement.textContent = 'N/A';
      //console.log('join date nil');
    }

    const lastActivityElement = document.getElementById('lastActivity');
    if (userData.last_activitiy) { 
        lastActivityElement.textContent = formatDate(userData.last_activitiy);
    } else {
        lastActivityElement.textContent = 'N/A';
        //console.log('activity not found');
    }

    document.getElementById('twoFactorAuth').textContent = userData.twofa_enabled ? 'Enabled' : 'Disabled';
    // if (userData.profile_picture) {
    //   document.querySelector('.profile-picture').style.backgroundImage = `url('${userData.profile_picture}')`;
    // }else {
    //   document.querySelector('.profile-picture').style.backgroundImage = `url(/assets/profile_pictures/default.png')`;
      //console.log('profile picture not found');
    }

  function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
  
  function setupAnonymizeButton() {
    const anonymizeButton = document.getElementById('anonymizeButton');

    anonymizeButton.addEventListener('click', function() {
        const token = getCookie('jwt');

        fetch('https://127.0.0.1:443/api/anonymize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include' 
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            //console.log('anonymization response:', data);
            alert('Your data has been anonymized.');
            fetchAndUpdateProfile();
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    });
}

function setupDeleteProfileButton() {
  const deleteProfileButton = document.getElementById('deleteProfileButton');
  const deleteOtpModal = document.getElementById('deleteOtpModal');

  deleteProfileButton.addEventListener('click', function() {
      const token = getCookie('jwt');

      fetch('https://127.0.0.1:443/api/initiate_delete_account', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          credentials: 'include'
      })
      .then(response => response.json())
      .then(data => {
          //console.log(data.message);
          deleteOtpModal.style.display = 'block';
          deleteOtpModal.setAttribute('aria-hidden', 'false');
      })
      .catch(error => console.error('Error initiating account deletion:', error));
  });
}

function setupCloseButton() {
  const closeButton = document.querySelector('.close');
  if (closeButton) {
      closeButton.addEventListener('click', function() {
          document.getElementById('deleteOtpModal').style.display = 'none';
      });
  }
}

function verifyAndDeleteAccount() {
  const token = getCookie('jwt');
  const otp = document.getElementById('deleteOtpInput').value;

  fetch('https://127.0.0.1:443/api/delete_account', {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ otp: otp })
  })
  .then(response => response.json())
  .then(data => {
      if (data.error) {
          alert(data.error);
      } else {
          alert(data.message); 
          appRouter.navigate('/login'); 
      }
  })
  .catch(error => {
      console.error('Error deleting account:', error); 
  });
}

function setUpVerifyDeleteOtpButton() {
  document.getElementById('verifyDeleteOtpButton').addEventListener('click', verifyAndDeleteAccount);
}

function loadMatchHistory(playerId) {
  if (!playerId) {
      console.error("Player ID is undefined, cannot load match history.");
      return;
  }

  fetch('https://127.0.0.1:443/pongApp/player_match_history', {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${getCookie('jwt')}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ player_id: playerId })
  })
  .then(response => response.json())
  .then(data => {
      if (!data.matches) {
          console.error("No matches data received:", data);
          return;
      }
     //console.log("Match Data Received:", data);
      const table = document.getElementById('matchHistoryTable').getElementsByTagName('tbody')[0];
      data.matches.forEach(match => {
          let row = table.insertRow();
          row.insertCell(0).textContent = match.id;
          row.insertCell(1).textContent = new Date(match.match_date).toLocaleString();
          row.insertCell(2).textContent = match.score_player;
          row.insertCell(3).textContent = match.guest_player1;
          row.insertCell(4).textContent = match.guest_player2 || 'N/A';
          row.insertCell(5).textContent = match.winner;
      });
  })
  .catch(error => console.error('Error loading match history:', error));
}

function fetchProfilePicture() {
    fetch('https://127.0.0.1:443/api/get_profile_picture/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${getCookie('jwt')}`
        },
    })
    .then(response => {
        console.log(response);
        if (response.ok) {
            return response.blob();
        } else {
            throw new Error('Network response was not ok.');
        }
    })
    .then(blob => {
        document.getElementById('profilePicture').src = URL.createObjectURL(blob);
    })
    .catch((error) => {
        console.error('Error retrieving profile picture:', error);
        document.getElementById('profilePicture').src = '../assets/profile_pictures/default.png';
    });
}

// function fetchProfilePicture() {
//     fetch('https://127.0.0.1:443/api/get_profile_picture/', {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${getCookie('jwt')}`
//         },
//     })
//     .then(response => {
//         console.log(response);
//         if (response.body) {
//             // console.log('Profile picture retrieved:', data.profile_picture_url);
//             document.getElementById('profilePicture').src = URL.createObjectURL(response.body.blob())
//         } else {
//             console.error('Error:', data.error);
//             // document.getElementById('profilePicture').src = '/assets/profile_pictures/default.png'; 
//         }
//     })
//     // .then(data => {
//     //     console.log(data);
//     //     if (data.profile_picture_url) {
//     //         console.log('Profile picture retrieved:', data.profile_picture_url);
//     //         document.getElementById('profilePicture').src = data;
//     //     } else {
//     //         console.error('Error:', data.error);
//     //         document.getElementById('profilePicture').src = '/assets/profile_pictures/default.png'; 
//     //     }
//     // })
//     .catch((error) => {
//         console.error('Error retrieving profile picture:', error);
//         document.getElementById('profilePicture').src = '/assets/profile_pictures/default.png';
//     });
// }

// function fetchProfilePicture() {
//   const jwtToken = getCookie('jwt'); 
//   if (!jwtToken) {
//       console.error('JWT token is not available. User might not be authenticated.');
//       return;
//   }

//   fetch('/api/get_profile_picture/', {
//       method: 'GET',
//       headers: {
//           'Authorization': `Bearer ${jwtToken}`,
//           'Content-Type': 'application/json'
//       },
//   })
//   .then(response => {
//       if (!response.ok) {
//           throw new Error(`Network response was not ok: ${response.statusText}`);
//       }
//       return response.json();
//   })
//   .then(data => {
//       if (data.profile_picture_url) {
//           const profilePictureElement = document.getElementById('profilePicture');
//           if (profilePictureElement) {
//               profilePictureElement.src = data.profile_picture_url + '?v=' + new Date().getTime();
//           } else {
//               console.error('Profile picture element not found in the document.');
//           }
//       } else {
//           console.error('Profile picture URL is missing in the response data.');
//           document.getElementById('profilePicture').src = '/assets/profile_pictures/default.png';
//       }
//   })
//   .catch(error => {
//       console.error('Error fetching the profile picture:', error);
//       document.getElementById('profilePicture').src = '/assets/profile_pictures/default.png';
//   });
// }


function setupUploadProfilePictureButton() {
  const uploadButton = document.getElementById('uploadPicButton');
  const fileInput = document.getElementById('profilePictureInput');

  if (uploadButton && fileInput) {
      uploadButton.addEventListener('click', () => {
          fileInput.click();
      });

      fileInput.addEventListener('change', uploadProfilePicture);
  } else {
      console.error('Elements not found: uploadButton or fileInput is null');
  }
}

function uploadProfilePicture() {
  const fileInput = document.getElementById('profilePictureInput');
  const file = fileInput.files[0];

  if (file) {
      const formData = new FormData();
      formData.append('profile_picture', file);

      fetch('https://127.0.0.1:443/api/upload_profile_picture/', {
          method: 'POST',
          body: formData,
          headers: {
              'Authorization': `Bearer ${getCookie('jwt')}`
              // Removed 'Content-Type': 'application/json'
          },
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok: ' + response.statusText);
          }
          return response.json();
      })
      .then(data => {
          if (data.message) {
             //console.log('Success:', data.message);
              document.getElementById('profilePicture').src = URL.createObjectURL(file);
          } else {
              console.error('Error:', data.error);
              document.getElementById('profilePicture').src = '/assets/profile_pictures/default.png';
          }
      })
      .catch((error) => {
          console.error('Error:', error);
          document.getElementById('profilePicture').src = '/assets/profile_pictures/default.png';
      });
  }
}

function deleteProfilePicture() {
    fetch('https://127.0.0.1:443/api/delete_profile_picture/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getCookie('jwt')}`,
            'X-CSRFToken': getCookie('csrftoken')
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        document.getElementById('profilePicture').src = '/assets/profile_pictures/default.png'; // Path to default image
    })
    .catch((error) => {
        console.error('Error deleting profile picture:', error);
    });
}

export { setupAnonymizeButton, fetchUserProfile, setupDeleteProfileButton, setupCloseButton , setUpVerifyDeleteOtpButton, getCookie, setupUploadProfilePictureButton};
