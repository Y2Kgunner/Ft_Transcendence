import { getCookie, updateProfilePage, fetchUserProfile } from './profile.js';
import { isPrintableASCII } from './pong3.js';

const inputIds = ["firstNameInput", "lastNameInput", "phoneInput", "addressInput"];
const domz = ["firstName", "lastName", "phone", "address"];

const userData = {
  first_name: '',
  last_name: '',
  phone: '',
  address: '',
};

function resetFields() {
  console.log('tf');
  document.getElementById('firstNameInput').value = "";
  document.getElementById('lastNameInput').value = "";
  document.getElementById('phoneInput').value = "";
  document.getElementById('addressInput').value = "";
}

async function failedBackEndTests() {
  const response = await fetch(`https://127.0.0.1:443/api/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie('jwt')
    },
    body: JSON.stringify(userData)
  })
  if (!response.ok) {
    if (response.status == 410)
      displayBootstrapAlert("editProfileAlert", "first name must be a non-empty string and cannot be numeric!", "danger");
    else if (response.status == 420)
      displayBootstrapAlert("editProfileAlert", "Last name must be a non-empty string and cannot be numeric", "danger");
    else if (response.status == 430)
      displayBootstrapAlert("editProfileAlert", "Phone must be a non-empty string of digits", "danger");
    else
      displayBootstrapAlert("editProfileAlert", "value too big!", "danger");
    return true;
  }
  const data = await response.json();
  fetchUserProfile();
  return false;
}

async function checkProfileInput() {
  var numbr = true; var other = true;

  for (let i = 0; i < inputIds.length; i++) {
    const inputField = document.getElementById(inputIds[i]);
    var invalidFeedback = inputField.nextElementSibling;
    var validFeedback = invalidFeedback.nextElementSibling;

    invalidFeedback.textContent = "Looks stinky! 🚽";
    validFeedback.style.display = "none";
    inputField.classList.remove("is-invalid", "is-valid");

    const inputValue = inputField.value.trim();
    const isEmpty = inputValue === "";
    const isTooLong = inputValue.length > 20;

    if (inputField.id === "phoneInput") {
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      const isValidPhone = phoneRegex.test(inputValue);
      if (isEmpty) {
        userData[Object.keys(userData)[i]] = document.getElementById(domz[i]).value;
        numbr = true;
      } else if (!isValidPhone) {
        invalidFeedback.textContent = "Looks like an invalid phone number!";
        inputField.classList.add("is-invalid");
        numbr = false;
      } else {
        userData[Object.keys(userData)[i]] = inputValue;
        numbr = true;
      }
      continue;
    }

    if (isEmpty) {
      console.log("no. 1 -> ", Object.keys(userData)[i]);
      userData[Object.keys(userData)[i]] = document.getElementById(domz[i]).value;
      // inputField.classList.add("is-valid");
    } else if (isTooLong) {
      invalidFeedback.textContent = "Input should not exceed 20 characters!";
      inputField.classList.add("is-invalid");
      other = false;
    } else if (!isPrintableASCII(inputValue)) {
      invalidFeedback.textContent = "Please input printable ASCII characters! else 🤬";
      inputField.classList.add("is-invalid");
      other = false;
    } else {
      userData[Object.keys(userData)[i]] = inputValue;
      validFeedback.style.display = "block";
      inputField.classList.add("is-valid");
    }
  }
  console.log("bumber -> ", numbr);
  console.log("otehr -> ", other);
  if (!numbr || !other)
    return false;
  var backend = await failedBackEndTests();
  if (backend)
    return false;
  resetFields();
  displayBootstrapAlert("editProfileAlert", "profile info updated!!", "success");
  return true;
}

// function displayBootstrapAlert(id, message, type) {
//   const alertContainer = document.getElementById(id);
//   const alertDiv = document.createElement('div');
//   alertDiv.className = `alert alert-success alert-${type} alert-dismissible fade show`;
//   alertDiv.role = 'alert';
//   alertDiv.innerHTML = `
//     ${message}
//     <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
//   `;
//   alertContainer.appendChild(alertDiv);
// }

// function displayBootstrapAlert(id, message, type) {
//   const alertContainer = document.getElementById(id);
//   const alertDiv = document.createElement('div');
//   alertDiv.className = `alert alert-success alert-${type} alert-dismissible fade show`;
//   alertDiv.role = 'alert';
//   alertDiv.innerHTML = `
//     ${message}
//     <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
//   `;
//   alertContainer.appendChild(alertDiv);

//   setTimeout(() => {
//     alertDiv.classList.remove('show');
//     alertDiv.classList.add('hide');
//     setTimeout(() => {
//       alertContainer.removeChild(alertDiv);
//     }, 300);
//   }, 3000);
// }


let alertCount = 0;
let alerts = [];

function limitAlerts(alertContainer) {
  if (alertCount >= 1) {
    // const oldestAlert = alerts.shift();
    // if (!oldestAlert)
    //   return ;
    // oldestAlert.classList.remove('show');
    // oldestAlert.classList.add('hide');
    // setTimeout(() => {
    //   alertContainer.removeChild(oldestAlert);
    //   // if (oldestAlert.parentNode === alertContainer)
    //     alertContainer.removeChild(alertDiv);
    //   alertCount--;
    // }, 300);
    return true;
  }
  return false;
}

function displayBootstrapAlert(id, message, type) {
  let alertContainer = document.getElementById(id); // assume this is the container for alerts
  if (limitAlerts(alertContainer))
    return ;

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-success alert-${type} alert-dismissible fade show`;
  alertDiv.role = 'alert';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  alertContainer.appendChild(alertDiv);
  alerts.push(alertDiv);
  alertCount++;

  setTimeout(() => {
    alertDiv.classList.remove('show');
    alertDiv.classList.add('hide');
    setTimeout(() => {
      // if (alertDiv.parentNode === alertContainer)
        alertContainer.removeChild(alertDiv);
      alertCount--;
      const index = alerts.indexOf(alertDiv);
      if (index !== -1) {
        alerts.splice(index, 1);
      }
    }, 300);
  }, 3000);
}

function clearErrorMessage(invalidFeedback, inputField) {
  invalidFeedback.textContent = "Looks stinky! 🚽";
  inputField.classList.remove("is-invalid");
}

export { checkProfileInput, displayBootstrapAlert };