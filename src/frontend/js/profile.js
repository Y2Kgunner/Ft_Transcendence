import { checkProfileInput, displayBootstrapAlert } from './inputValidation.js';

var editModal;
var deleteModal;

const eventManager = {
  addListener(element, event, handler) {
    element.removeEventListener(event, handler);
    element.addEventListener(event, handler);
  }
};

//? ------------------->> setting the profile page! and ensuring only one event listener is active!
function setUpProfile() {
  deleteModal = new bootstrap.Modal(document.getElementById('deleteOtpModal'));
  editModal = new bootstrap.Modal(document.getElementById('editProfileModal'));

  eventManager.addListener(document.getElementById("editProfileModal"), "keypress", chkIfInput);
  eventManager.addListener(document.getElementById("editBtn"), "click", openEditModal);
  eventManager.addListener(document.getElementById("saveChangesProfileBtn"), "click", chkInp);
  eventManager.addListener(document.getElementById("closeEditProfileModal"), "click", closeEditModal);
  eventManager.addListener(document.getElementById("verifyDeleteOtpButton"), "click", verifyAndDeleteAccount); //? line 229
  eventManager.addListener(document.getElementById("uploadPicButton"), "click", editPfp); //? line 221
  eventManager.addListener(document.getElementById("deleteProfileButton"), "click", deleteProfile); //? line 235
  eventManager.addListener(document.getElementById("anonymizeButton"), "click", anonymizeUser); //? line 284

  document.getElementById('closeDeleteOtpModal').addEventListener('click', deleteModal.hide());
  fetchUserProfile();
  setupFriends();
}

//? ------------------->> grab profile to display!
function fetchUserProfile() {
  const jwt = getCookie('jwt');

  fetch('https://127.0.0.1:443/api/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${jwt}`
    },
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok)
        throw new Error(`Network response was not ok: ${response.statusText}`);
      return response.json();
    })
    .then(data => {
      updateProfilePage(data);
      fetchProfilePicture();
      loadMatchHistory(data);
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}

function chkIfInput(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById("saveChangesProfileBtn").click();
  }
}

async function chkInp() {
  if (await checkProfileInput())
    editModal.hide();
}

async function openEditModal() {
  var firstName = document.getElementById('firstName').textContent;
  var lastName = document.getElementById('lastName').textContent;
  var phone = document.getElementById('phone').textContent;
  var address = document.getElementById('address').textContent;
  if (firstName != "N/A")
    document.getElementById('firstNameInput').value = document.getElementById('firstName').textContent;
  if (lastName != "N/A")
    document.getElementById('lastNameInput').value = document.getElementById('lastName').textContent;
  if (phone != "N/A")
    document.getElementById('phoneInput').value = document.getElementById('phone').textContent;
  if (address != "N/A")
    document.getElementById('addressInput').value = document.getElementById('address').textContent;
  editModal.show()
}

async function closeEditModal() {
  editModal.hide()
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
};

//? ------------------->> format profile for display!!   --> called by fetchUserProfile,l-3
//? ------------------->> format profile for display!!   --> main func -> updateProfilePage(data),l-94
const elementMap = {
  username: 'username',
  firstName: 'first_name',
  lastName: 'last_name',
  phone: 'phone',
  address: 'address',
  email: 'email',
};

const formatElementMap = {
  joinDate: 'join_date',
  lastActivity: 'last_activitiy',
};

function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

function formatDateDisplay(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function truncateText(text, limit) {
  if (text.length > limit) {
    return text.substring(0, limit) + '...';
  }
  return text;
}

function updateElement(elementId, userDataProperty) {
  const element = document.getElementById(elementId);
  if (userDataProperty) {
    element.textContent = truncateText(userDataProperty, 15);
    element.setAttribute('title', userDataProperty);
  } else {
    element.textContent = 'N/A';
  }
}

function updateElementandFormat(elementId, userDataProperty) {
  const element = document.getElementById(elementId);
  if (userDataProperty) {
    element.textContent = formatDateDisplay(userDataProperty);
    element.setAttribute('title', formatDate(userDataProperty));
  } else {
    element.textContent = 'N/A';
  }
}

function updateProfilePage(userData) {
  Object.keys(elementMap).forEach((elementId) => {
    updateElement(elementId, userData[elementMap[elementId]]);
  });
  Object.keys(formatElementMap).forEach((elementId) => {
    updateElementandFormat(elementId, userData[formatElementMap[elementId]]);
  });
  document.getElementById('twoFactorAuth').textContent = userData.twofa_enabled ? 'Enabled' : 'Disabled';

  const profilePicture = document.getElementById('profilePicture');
  if (userData.profile_picture) {
    profilePicture.src = `data:image/jpeg;base64,${userData.profile_picture_base64}`;
  } else {
    profilePicture.src = `url('../assets/profile_pictures/default.png')`;
  };
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}
//! ------------------->> end of formating profile for display!!   --> called by fetchUserProfile,l-3

function fetchProfilePicture() {
  const jwtToken = getCookie('jwt');
  if (!jwtToken) {
    console.error('JWT token is not available. User might not be authenticated.');
    return;
  }
  fetch('https://127.0.0.1:443/api/get_profile_picture/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Accept': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error('No image URL provided in the response.');
      } else {
        // const image = document.createElement('img');
        // image.src = `data:image/jpeg;base64,${data.profile_picture_base64}`;
        const profilePicture = document.getElementById('profilePicture');
        profilePicture.src = `data:image/jpeg;base64,${data.profile_picture_base64}`;
      }
    })
    .catch(error => {
      console.error('Error fetching the profile picture:', error);
      document.getElementById('profilePicture').src = '../assets/profile_pictures/default.png';
    });
}

function uploadProfilePicture(file) {
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

function editPfp() {
  console.log('im here!');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.id = 'profilePictureInput';
  fileInput.accept = 'image/*';
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    uploadProfilePicture(file);
  });
  fileInput.click();
}

//? opens delete profile modal
function deleteProfile() {
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
    .then(data => { deleteModal.show(); })
    .catch(error => console.error('Error initiating account deletion:', error));
};

//? once u provide the otp and click the button it comes here!
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

function anonymizeUser() {
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
      // alert('Your data has been anonymized.');
      displayBootstrapAlert('editProfileAlert', 'Your data has been anonymized 🙀', 'anonymize');
      fetchAndUpdateProfile();
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
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

// ? ------------------------------------------>> friends stuff
async function updateFriendList() {
  let friendList = await getFriendslist();
  console.log(friendList);
  const friendsList = document.getElementById('friendsList');
  friendsList.innerHTML = "";
  if (friendList.friends.length) {

    for (let i = 0; i < friendList.friends.length; i++) {
      let freindListDiv = `<tr>
      <th scope="col">${friendList.friends[i].username}</th>
      <th scope="col">${friendList.friends[i].online_status}</th>
    </tr>`
      friendsList.innerHTML += freindListDiv;
    }
  }
  else {
    let freindListDiv = `<tr>
      <th scope="col">No Friends!</th>
      <th scope="col">None</th>
    </tr>`
    friendsList.innerHTML += freindListDiv;
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
    if (response.status == 400)
      displayBootstrapAlert('editProfileAlert', 'cannot add yourself as a friend 😹', 'warning');
      // alert("cannot add yourself as friend");
    return null;
  }
  displayBootstrapAlert('editProfileAlert', 'request has been sent to user! 😸', 'success');
  // alert("request has been sent to user! ")
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
  // alert("freind request rejected")
  displayBootstrapAlert('editProfileAlert', 'freind request rejected 🙀', 'info');
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
  displayBootstrapAlert('editProfileAlert', 'freind request accepted 😽', 'primary');
  // alert("freind request accepted")
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

async function addFriend() {
  let userInfo
  const friendUserName = document.getElementById('friendUserName');
  console.log(friendUserName);
  let username = friendUserName.value;
  console.log(username);
  const friendData = await checkUsername(username);
  if (friendData == null)
    displayBootstrapAlert('editProfileAlert', 'friend not found! 😿', 'warning');
    // alert(" friend not found!");
  else {
    console.log(friendData);
    userInfo = friendData.user_info;
    console.log(userInfo);
    await addUser(userInfo.user_id);
  }
}

async function showInvites() {
  const pendingFriends = await getPendingFriends();
  console.log(pendingFriends);
  const invitationz = document.getElementById('invitationz');
  invitationz.innerHTML = "";
  if (pendingFriends.notifications.length) {
    console.log("has requests");
    for (let i = 0; i < pendingFriends.notifications.length; i++) {
      let buttonsDiv = Array.from({ length: pendingFriends.notifications.length },
        () => ({
          acceptBtnId: "acceptBtn" + i,
          declineBtnId: "declineBtn" + i
        }));
      let freindRequestDiv = `<div class="inviteBox rounded mb-2">
      <div class="d-flex flex-row justify-content-between">
        <div class="invitee px-2 d-flex align-items-center">${pendingFriends.notifications[i].username}</div>
        <div>
          <button id=${buttonsDiv[i].acceptBtnId} class="btn acceptInvitationBtn mx-md-2">accept friend request</button>
          <button id=${buttonsDiv[i].declineBtnId} class="btn rejectInvitationBtn ms-md-1">reject friend request</button>
        </div>
      </div>
    </div>`
      invitationz.innerHTML += freindRequestDiv;
    }
    const rejectButtons = document.querySelectorAll(".rejectInvitationBtn");
    console.log(rejectButtons);
    rejectButtons.forEach((button, index) => {
      button.addEventListener("click",
        async function () {
          await rejectRequest(pendingFriends.notifications[index].id);
        });
    });
    const acceptButtons = document.querySelectorAll(".acceptInvitationBtn");
    acceptButtons.forEach((button, index) => {
      button.addEventListener("click",
        async function () {
          console.log("accept " + index);
          await acceptRequest(pendingFriends.notifications[index].id);
          updateFriendList();
          showInvites();
        });
    });
  }
  else {
    // invitationz.innerHTML = "<div class='no-invites-message'>No pending friend requests</div>";
    invitationz.innerHTML = "<div id='NoInvitesMsg' class='text-center pt-md-5 h5' style='color: #a6a6a6'>No pending friend requests</div>";
    document.getElementById('NoInvitesMsg').innerHTML = "<div class='no-invites-message'>No pending friend requests</div>";
    console.log("empty");
  }
}

async function setupFriends() {
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
  eventManager.addListener(addFriendBtn, "click", addFriend);
  // addFriendBtn.addEventListener('click', async function () {
  //   await addFriend();
  // });
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


export { setUpProfile, getCookie, updateProfilePage, fetchUserProfile };



/* 
async function setupProfilePage() {
  const authStatus = await isAuthenticated();
  if (authStatus)
    setUpProfile();
  else
    appRouter.navigate('/login', { replace: true });
}

import { setUpProfile } from './profile.js';

import { checkProfileInput, displayBootstrapAlert } from './inputValidation.js';

var editModal;
var deleteModal;

const eventManager = {
  addListener(element, event, handler) {
    element.removeEventListener(event, handler);
    element.addEventListener(event, handler);
  }
};

const asyncEventManager = {
  addListener(element, event, handler) {
    element.removeEventListener(event, handler);
    element.addEventListener(event, async (event) => {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error handling event: ${error}`);
      }
    });
  }
};

//? ------------------->> setting the profile page! and ensuring only one event listener is active!
function setUpProfile() {
  deleteModal = new bootstrap.Modal(document.getElementById('deleteOtpModal'));
  editModal = new bootstrap.Modal(document.getElementById('editProfileModal'));

  eventManager.addListener(document.getElementById("editProfileModal"), "keypress", chkIfInput);
  eventManager.addListener(document.getElementById("editBtn"), "click", openEditModal);
  eventManager.addListener(document.getElementById("saveChangesProfileBtn"), "click", chkInp);
  eventManager.addListener(document.getElementById("closeEditProfileModal"), "click", closeEditModal);
  eventManager.addListener(document.getElementById("verifyDeleteOtpButton"), "click", verifyAndDeleteAccount); //? line 229
  eventManager.addListener(document.getElementById("uploadPicButton"), "click", editPfp); //? line 221
  eventManager.addListener(document.getElementById("deleteProfileButton"), "click", deleteProfile); //? line 235
  eventManager.addListener(document.getElementById("anonymizeButton"), "click", anonymizeUser); //? line 284

  document.getElementById('closeDeleteOtpModal').addEventListener('click', deleteModal.hide());
  fetchUserProfile();
  setupFriends();
}

//? ------------------->> grab profile to display!
function fetchUserProfile() {
  const jwt = getCookie('jwt');

  fetch('https://127.0.0.1:443/api/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${jwt}`
    },
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok)
        throw new Error(`Network response was not ok: ${response.statusText}`);
      return response.json();
    })
    .then(data => {
      updateProfilePage(data);
      fetchProfilePicture();
      loadMatchHistory(data);
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}

function chkIfInput(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById("saveChangesProfileBtn").click();
  }
}

async function chkInp() {
  if (await checkProfileInput())
    editModal.hide();
}

async function openEditModal() {
  var firstName = document.getElementById('firstName').textContent;
  var lastName = document.getElementById('lastName').textContent;
  var phone = document.getElementById('phone').textContent;
  var address = document.getElementById('address').textContent;
  if (firstName != "N/A")
    document.getElementById('firstNameInput').value = document.getElementById('firstName').textContent;
  if (lastName != "N/A")
    document.getElementById('lastNameInput').value = document.getElementById('lastName').textContent;
  if (phone != "N/A")
    document.getElementById('phoneInput').value = document.getElementById('phone').textContent;
  if (address != "N/A")
    document.getElementById('addressInput').value = document.getElementById('address').textContent;
  editModal.show()
}

async function closeEditModal() {
  editModal.hide()
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
};

//? ------------------->> format profile for display!!   --> called by fetchUserProfile,l-3
//? ------------------->> format profile for display!!   --> main func -> updateProfilePage(data),l-94
const elementMap = {
  username: 'username',
  firstName: 'first_name',
  lastName: 'last_name',
  phone: 'phone',
  address: 'address',
  email: 'email',
};

const formatElementMap = {
  joinDate: 'join_date',
  lastActivity: 'last_activitiy',
};

function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

function formatDateDisplay(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function truncateText(text, limit) {
  if (text.length > limit) {
    return text.substring(0, limit) + '...';
  }
  return text;
}

function updateElement(elementId, userDataProperty) {
  const element = document.getElementById(elementId);
  if (userDataProperty) {
    element.textContent = truncateText(userDataProperty, 15);
    element.setAttribute('title', userDataProperty);
  } else {
    element.textContent = 'N/A';
  }
}

function updateElementandFormat(elementId, userDataProperty) {
  const element = document.getElementById(elementId);
  if (userDataProperty) {
    element.textContent = formatDateDisplay(userDataProperty);
    element.setAttribute('title', formatDate(userDataProperty));
  } else {
    element.textContent = 'N/A';
  }
}

function updateProfilePage(userData) {
  Object.keys(elementMap).forEach((elementId) => {
    updateElement(elementId, userData[elementMap[elementId]]);
  });
  Object.keys(formatElementMap).forEach((elementId) => {
    updateElementandFormat(elementId, userData[formatElementMap[elementId]]);
  });
  document.getElementById('twoFactorAuth').textContent = userData.twofa_enabled ? 'Enabled' : 'Disabled';

  const profilePicture = document.getElementById('profilePicture');
  if (userData.profile_picture) {
    profilePicture.src = `data:image/jpeg;base64,${userData.profile_picture_base64}`;
  } else {
    profilePicture.src = `url('../assets/profile_pictures/default.png')`;
  };
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}
//! ------------------->> end of formating profile for display!!   --> called by fetchUserProfile,l-3

function fetchProfilePicture() {
  const jwtToken = getCookie('jwt');
  if (!jwtToken) {
    console.error('JWT token is not available. User might not be authenticated.');
    return;
  }
  fetch('https://127.0.0.1:443/api/get_profile_picture/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Accept': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error('No image URL provided in the response.');
      } else {
        // const image = document.createElement('img');
        // image.src = `data:image/jpeg;base64,${data.profile_picture_base64}`;
        const profilePicture = document.getElementById('profilePicture');
        profilePicture.src = `data:image/jpeg;base64,${data.profile_picture_base64}`;
      }
    })
    .catch(error => {
      console.error('Error fetching the profile picture:', error);
      document.getElementById('profilePicture').src = '../assets/profile_pictures/default.png';
    });
}

function uploadProfilePicture(file) {
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

function editPfp() {
  console.log('im here!');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.id = 'profilePictureInput';
  fileInput.accept = 'image/*';
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    uploadProfilePicture(file);
  });
  fileInput.click();
}

//? opens delete profile modal
function deleteProfile() {
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
    .then(data => { deleteModal.show(); })
    .catch(error => console.error('Error initiating account deletion:', error));
};

//? once u provide the otp and click the button it comes here!
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

function anonymizeUser() {
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
      // alert('Your data has been anonymized.');
      displayBootstrapAlert('editProfileAlert', 'Your data has been anonymized 🙀', 'anonymize');
      fetchAndUpdateProfile();
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
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

// ? ------------------------------------------>> friends stuff
async function updateFriendList() {
  let friendList = await getFriendslist();
  console.log(friendList);
  const friendsList = document.getElementById('friendsList');
  friendsList.innerHTML = "";
  if (friendList.friends.length) {

    for (let i = 0; i < friendList.friends.length; i++) {
      let freindListDiv = `<tr>
      <th scope="col">${friendList.friends[i].username}</th>
      <th scope="col">${friendList.friends[i].online_status}</th>
    </tr>`
      friendsList.innerHTML += freindListDiv;
    }
  }
  else {
    let freindListDiv = `<tr>
      <th scope="col">No Friends!</th>
      <th scope="col">None</th>
    </tr>`
    friendsList.innerHTML += freindListDiv;
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
    if (response.status == 400)
      displayBootstrapAlert('editProfileAlert', 'cannot add yourself as a friend 😹', 'warning');
      // alert("cannot add yourself as friend");
    return null;
  }
  displayBootstrapAlert('editProfileAlert', 'request has been sent to user! 😸', 'success');
  // alert("request has been sent to user! ")
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
  // alert("freind request rejected")
  displayBootstrapAlert('editProfileAlert', 'freind request rejected 🙀', 'info');
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
  displayBootstrapAlert('editProfileAlert', 'freind request accepted 😽', 'primary');
  // alert("freind request accepted")
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

async function addFriend() {
  let userInfo
  const friendUserName = document.getElementById('friendUserName');
  console.log(friendUserName);
  let username = friendUserName.value;
  console.log(username);
  const friendData = await checkUsername(username);
  if (friendData == null)
    displayBootstrapAlert('editProfileAlert', 'friend not found! 😿', 'warning');
    // alert(" friend not found!");
  else {
    console.log(friendData);
    userInfo = friendData.user_info;
    console.log(userInfo);
    await addUser(userInfo.user_id);
  }
}

async function showInvites() {
  const pendingFriends = await getPendingFriends();
  console.log(pendingFriends);
  const invitationz = document.getElementById('invitationz');
  invitationz.innerHTML = "";
  if (pendingFriends.notifications.length) {
    console.log("has requests");
    for (let i = 0; i < pendingFriends.notifications.length; i++) {
      let buttonsDiv = Array.from({ length: pendingFriends.notifications.length },
        () => ({
          acceptBtnId: "acceptBtn" + i,
          declineBtnId: "declineBtn" + i
        }));
      let freindRequestDiv = `<div class="inviteBox rounded mb-2">
      <div class="d-flex flex-row justify-content-between">
        <div class="invitee px-2 d-flex align-items-center">${pendingFriends.notifications[i].username}</div>
        <div>
          <button id=${buttonsDiv[i].acceptBtnId} class="btn acceptInvitationBtn mx-md-2">accept friend request</button>
          <button id=${buttonsDiv[i].declineBtnId} class="btn rejectInvitationBtn ms-md-1">reject friend request</button>
        </div>
      </div>
    </div>`
      invitationz.innerHTML += freindRequestDiv;
    }
    const rejectButtons = document.querySelectorAll(".rejectInvitationBtn");
    console.log(rejectButtons);
    rejectButtons.forEach((button, index) => {
      button.addEventListener("click",
        async function () {
          await rejectRequest(pendingFriends.notifications[index].id);
        });
    });
    const acceptButtons = document.querySelectorAll(".acceptInvitationBtn");
    acceptButtons.forEach((button, index) => {
      button.addEventListener("click",
        async function () {
          console.log("accept " + index);
          await acceptRequest(pendingFriends.notifications[index].id);
          updateFriendList();
          showInvites();
        });
    });
  }
  else {
    // invitationz.innerHTML = "<div class='no-invites-message'>No pending friend requests</div>";
    invitationz.innerHTML = "<div id='NoInvitesMsg' class='text-center pt-md-5 h5' style='color: #a6a6a6'>No pending friend requests</div>";
    document.getElementById('NoInvitesMsg').innerHTML = "<div class='no-invites-message'>No pending friend requests</div>";
    console.log("empty");
  }
}

async function setupFriends() {
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
  // asyncEventManager.addListener(addFriendBtn, "click", addFriend);
  eventManager.addListener(addFriendBtn, "click", addFriend);
  // addFriendBtn.addEventListener('click', async function () {
  //   await addFriend();
  // });
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


export { setUpProfile, getCookie, updateProfilePage, fetchUserProfile };



/* 
async function setupProfilePage() {
  const authStatus = await isAuthenticated();
  if (authStatus)
    setUpProfile();
  else
    appRouter.navigate('/login', { replace: true });
}

import { setUpProfile } from './profile.js';




⠀⠀⠀⣠⣾⠟⠁⠀⠟⠁⢸⣿⡇⠀⢀⣀⡀⣀⣀⠀⣀⣀⣀⣀⠀⣀⠀⠀⢀⡀⢀⣀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣠⣾⠟⠁⠀⠀⠀⢀⣴⡿⠋⠀⠀⢸⣆⣀⣀⣿⠀⡇⠀⠀⢸⠀⣿⠒⡀⢸⡇⢸⠀⢀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠸⠿⠿⠿⠿⣿⣿⠀⣿⣿⡆⣠⡆⠀⢸⡇⠀⠀⠀⠀⣧⣀⣀⣸⠀⣿⠀⠀⠚⡇⢸⣄⣀⣀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀


*/