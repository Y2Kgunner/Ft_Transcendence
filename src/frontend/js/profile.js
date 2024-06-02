import { appRouter } from './router.js';
// import { getCookie } from './profile.js';

let userName = '';

async function patchUserDetails(userData) {
  const response = await fetch(`https://127.0.0.1:443/api/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie('jwt')
    },
    body: JSON.stringify(userData)
  })
  if (!response.ok) {
    if(response.status == 410)
      alert('first name must be a non-empty string and cannot be numeric');
    if(response.status == 420)
      alert('Last name must be a non-empty string and cannot be numeric');
    if(response.status == 430)
      alert('Phone must be a non-empty string of digits');
    return null;
  }
  alert("profile info updated!! ")
  const data = await response.json();
  return data;
}

async function setupEdit()
{
  console.log("ckick");
  const editBtn = document.getElementById('editBtn');
  editBtn.addEventListener('click', async function() {
    const editModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    editModal.show();
    console.log("ckick");
  });
  const saveChangesProfileBtn = document.getElementById('saveChangesProfileBtn');
    saveChangesProfileBtn.addEventListener('click', async function() {
      const firstNameInput = document.getElementById("firstNameInput");
      const lastNameInput = document.getElementById("lastNameInput");
      const phoneInput = document.getElementById("phoneInput");
      const addressInput = document.getElementById("addressInput");
      const userData = {};
      if (firstNameInput.value)
        userData.first_name = firstNameInput.value;
      if(lastNameInput.value)
        userData.last_name = lastNameInput.value;
      if(phoneInput.value)
        userData.phone = phoneInput.value;
      if(addressInput.value)
        userData.address = addressInput.value;
      firstNameInput.value = "";

      console.log(userData);
      await patchUserDetails(userData);
      fetchUserProfile();
      firstNameInput.value = "";
      lastNameInput.value = "";
      phoneInput.value = "";
      addressInput.value = "";
    });
}

async function updateFriendList()
{
    let friendList = await getFriendslist();
    console.log(friendList);
    const friendsList = document.getElementById('friendsList');
    friendsList.innerHTML = "";
    if(friendList.friends.length)
    {
      
      for( let i =0;i< friendList.friends.length; i++)
      {
      let freindListDiv =`<tr>
      <th scope="col">${friendList.friends[i].username}</th>
      <th scope="col">${friendList.friends[i].online_status}</th>
    </tr>`
    friendsList.innerHTML+=freindListDiv;
      }
    }
    else 
      {
        let freindListDiv =`<tr>
      <th scope="col">No Friends!</th>
      <th scope="col">None</th>
    </tr>`
    friendsList.innerHTML+=freindListDiv;
      }
    

}

async function addUser(userId) {
  const response = await fetch(`https://127.0.0.1:443/api/add_friend/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie('jwt')
    }
  })
  if (!response.ok) {
    if(response.status == 400)
      alert("cannot add yourself as friend");
    return null;
  }
  alert("request has been sent to user! ")
  const data = await response.json();
  return data;
}

async function checkUsername(username) {
  const response = await fetch(`https://127.0.0.1:443/api/check_username/${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie('jwt')
    }
  })
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data;
}
async function rejectRequest(userId) {
  const response = await fetch(`https://127.0.0.1:443/api/reject_friend/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie('jwt')
    }
  })
  if (!response.ok) {
    return null;
  }
  alert("freind request rejected")
  const data = await response.json();
  return data;
}
async function acceptRequest(userId) {
  const response = await fetch(`https://127.0.0.1:443/api/accept_friend_request/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie('jwt')
    }
  })
  if (!response.ok) {
    return null;
  }
  alert("freind request accepted")
  const data = await response.json();
  return data;
}

async function getPendingFriends() {
  const response = await fetch(`https://127.0.0.1:443/api/pending_frinship_requets`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie('jwt')
    }
  })
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data;
}

async function addFriend()
{
  let userInfo
  const friendUserName = document.getElementById('friendUserName');
  console.log(friendUserName);
  let username = friendUserName.value;
  console.log(username);
  const friendData = await checkUsername(username);
  if(friendData == null)
    alert(" friend not found!");
  else
  {
    console.log(friendData);
    userInfo=friendData.user_info;
    console.log(userInfo);
    await addUser(userInfo.user_id);
  }

}
async function showInvites()
{
  const pendingFriends = await getPendingFriends();
  console.log(pendingFriends);
  const invitationz = document.getElementById('invitationz');
  invitationz.innerHTML = "";
  if(pendingFriends.notifications.length)
  {
    console.log("has requests");
    for(let i = 0; i < pendingFriends.notifications.length; i++)
    {
      let buttonsDiv = Array.from({length : pendingFriends.notifications.length },
        () => ({
          acceptBtnId : "acceptBtn" +i,
          declineBtnId : "declineBtn" + i
        }));
      let freindRequestDiv =`<div class="inviteBox rounded mb-2">
      <div class="d-flex flex-row justify-content-between">
        <div class="invitee px-2 d-flex align-items-center">${pendingFriends.notifications[i].username}</div>
        <div>
          <button id=${buttonsDiv[i].acceptBtnId} class="btn acceptInvitationBtn mx-md-2">accept friend request</button>
          <button id=${buttonsDiv[i].declineBtnId} class="btn rejectInvitationBtn ms-md-1">reject friend request</button>
        </div>
      </div>
    </div>`
    invitationz.innerHTML+=freindRequestDiv;
    }
    const rejectButtons = document.querySelectorAll(".rejectInvitationBtn");
    console.log(rejectButtons);
    rejectButtons.forEach((button,index) => {
      button.addEventListener("click", 
      async function () {
        await rejectRequest(pendingFriends.notifications[index].id);
      });
    });
    const acceptButtons = document.querySelectorAll(".acceptInvitationBtn");
    acceptButtons.forEach((button,index) => {
      button.addEventListener("click", 
      async function () {
        console.log("accept "+index);
        await acceptRequest(pendingFriends.notifications[index].id);
        updateFriendList();
        showInvites();
      });
    });

  }
  else
  {
    console.log("empty");
  }
}

async function setupFriends()
{ 
  const addFriendForm = document.getElementById('addFriendForm');

  const addFriendBtn = document.getElementById('addFriendBtn');
    const invitationzDiv = document.getElementById('invitationz');
    const radioButtons = document.getElementsByName('btnradio');
    updateFriendList();
    radioButtons.forEach((radioButton) => {
      radioButton.addEventListener('click', (e) => {
        if (e.target.id === 'btnradio1') {
          addFriendForm.style.display = 'block';
          invitationzDiv.style.display = 'none'
          //show invites
          updateFriendList();
        } else if (e.target.id === 'btnradio3') {
          addFriendForm.style.display = 'none';
          invitationzDiv.style.display = 'block';
          showInvites();
        }
      });
    });
    addFriendBtn.addEventListener('click', async function() {
      await addFriend();
    });
    // console.log()

}

async function getFriendslist() {
  const response = await fetch(`https://127.0.0.1:443/api/list_friends`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie('jwt')
    }
  })
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data;
}


function fetchUserProfile() {
  const jwt = getCookie('jwt');
  // console.log('Token from cookie:', jwt);

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
      console.log(data);
      loadMatchHistory(data);
      fetchProfilePicture();

    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
};


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
};

// function fetchAndUpdateProfile() {
//     fetchUserProfile();
// };

// clean up

function updateProfilePage(userData) {
  //console.log('User data:', userData);
  const usernameElement = document.getElementById('username');
  if (userData.username) {
    usernameElement.textContent = userData.username;
  } else {
    usernameElement.textContent = 'N/A';
    //console.log('username not found');
  }
  const fistNameElement = document.getElementById('firstName');
  if (userData.first_name) {
    fistNameElement.textContent = userData.first_name;
  } else {
    fistNameElement.textContent = 'N/A';
    //console.log('username not found');
  }
  const lastNameElement = document.getElementById('lastName');
  if (userData.last_name) {
    lastNameElement.textContent = userData.last_name;
  } else {
    lastNameElement.textContent = 'N/A';
    //console.log('username not found');
  }
  const phoneElement = document.getElementById('phone');
  if (userData.phone) {
    phoneElement.textContent = userData.phone;
  } else {
    phoneElement.textContent = 'N/A';
    //console.log('username not found');
  }
  const addressElement = document.getElementById('address');
  if (userData.address != "") {
    addressElement.textContent = userData.address;
  } else {
    addressElement.textContent = 'N/A';
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
  };

  const lastActivityElement = document.getElementById('lastActivity');
  if (userData.last_activitiy) {
    lastActivityElement.textContent = formatDate(userData.last_activitiy);
  } else {
    lastActivityElement.textContent = 'N/A';
    //console.log('activity not found');
  };

  document.getElementById('twoFactorAuth').textContent = userData.twofa_enabled ? 'Enabled' : 'Disabled';
  if (userData.profile_picture) {
    document.querySelector('.profile-picture').style.backgroundImage = `url('${userData.profile_picture}')`;
  } else {
    document.querySelector('.profile-picture').style.backgroundImage = `url('../assets/profile_pictures/default.png')`;
    //console.log('profile picture not found');
  };
}
function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

function setupAnonymizeButton() {
  const anonymizeButton = document.getElementById('anonymizeButton');

  anonymizeButton.addEventListener('click', function () {
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
};

function setupDeleteProfileButton() {
  const deleteProfileButton = document.getElementById('deleteProfileButton');
  const deleteOtpModal = document.getElementById('deleteOtpModal');

  deleteProfileButton.addEventListener('click', function () {
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
};

function setupCloseButton() {
  const closeButton = document.querySelector('.close');
  if (closeButton) {
    closeButton.addEventListener('click', function () {
      document.getElementById('deleteOtpModal').style.display = 'none';
    });
  }
};

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
        appRouter.navigate('/logout');
      }
    })
    .catch(error => {
      console.error('Error deleting account:', error);
    });
};

function setUpVerifyDeleteOtpButton() {
  document.getElementById('verifyDeleteOtpButton').addEventListener('click', verifyAndDeleteAccount);
};

function loadMatchHistory(playerData) {
  if (!playerData.id) {
    console.error("Player ID is undefined, cannot load match history.");
    return;
  }

  fetch('https://127.0.0.1:443/pongApp/player_match_history', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getCookie('jwt')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ player_id: playerData.id })
  })
    .then(response => response.json())
    .then(data => {
      if (!data.matches) {
        console.error("No matches data received:", data);
        return;
      }
      console.log("Match Data Received:", data);
      const table = document.getElementById('matchHistoryTable').getElementsByTagName('tbody')[0];
      table.innerHTML = "";
      data.matches.forEach(match => {
        let row = table.insertRow();
        row.insertCell(0).textContent = match.id;
        row.insertCell(1).textContent = match.game_type;
        row.insertCell(2).textContent = new Date(match.match_date).toLocaleString();
        row.insertCell(3).textContent = playerData.username;
        row.insertCell(4).textContent = match.guest_player1;
        row.insertCell(5).textContent = match.guest_player2 || 'N/A';
        row.insertCell(6).textContent = match.winner;
      });
    })
    .catch(error => console.error('Error loading match history:', error));
};

function fetchProfilePicture() {
  const jwtToken = getCookie('jwt');
  if (!jwtToken) {
    console.error('JWT token is not available. User might not be authenticated.');
    return;
  }

  console.log('Fetching profile picture with JWT:', jwtToken);

  fetch('https://127.0.0.1:443/api/get_profile_picture/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Accept': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      console.log('Received data  for profile picture:', data);
      if (data.profile_picture_url) {
        console.log('Setting profile picture URL:', data.profile_picture_url);
        document.getElementById('profilePicture').src = data.profile_picture_url + '?v=' + new Date().getTime();
      } else {
        throw new Error('No image URL provided in the response.');
      }
    })
    .catch(error => {
      console.error('Error fetching the profile picture:', error);
      document.getElementById('profilePicture').src = '../assets/profile_pictures/default.png';
    });
}

// function setupUploadProfilePictureButton() {
//   const uploadButton = document.getElementById('uploadPicButton');
//   uploadPicButton.addEventListener('click', () => {
//     const fileInput = document.createElement('input');
//     fileInput.type = 'file';
//     fileInput.accept = 'image/*';
  
//     fileInput.addEventListener('change', () => {
//       const file = fileInput.files[0];
//       uploadProfilePicture(file);
//     });
//     fileInput.click();
//   });
  
//   // const fileInput = document.getElementById('profilePictureInput');
//   // console.log(uploadButton);
//   // console.log(fileInput);
//   // if (uploadButton) {
//   //   uploadButton.addEventListener('click', () => {
//   //     fileInput.click();
//   //   });

//   //   fileInput.addEventListener('change', uploadProfilePicture);
//   // } else {
//     // console.error('Elements not found: uploadButton or fileInput is null');
//   // }
// }

function uploadProfilePicture(file) {
  // const fileInput = document.getElementById('profilePictureInput');
  // const file = fileInput.files[0];

  if (file) {
    const formData = new FormData();
    formData.append('profile_picture', file);

    fetch('https://127.0.0.1:443/api/upload_profile_picture/', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getCookie('jwt')}`,
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
          document.getElementById('profilePicture').src = URL.createObjectURL(file);
          console.log('Success:', data.message);
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
};

function setupUploadProfilePictureButton() {
  const uploadButton = document.getElementById('uploadPicButton');
  uploadButton.addEventListener('click', () => {
    const existingFileInput = document.getElementById('profilePictureInput');
    if (existingFileInput) {
      existingFileInput.remove();
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'profilePictureInput';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      uploadProfilePicture(file);
    });
    
    fileInput.click();
  });
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
};

  

export { fetchUserProfile, getCookie, setupAnonymizeButton, setupDeleteProfileButton, setupCloseButton, setUpVerifyDeleteOtpButton, setupUploadProfilePictureButton,setupFriends, setupEdit};
