//? How to use! import the checkInputV69 and the inputElement class!!
//? import { inputElement } from './inputElement.js';

//? How to send an entire inputElementBlock?? ==> here u go!
//? const currentElementBlock = [
//?   new inputElement('phone', 'phone', true, 10, 15),
//?   new inputElement('name', 'name', true, 2, 50),
//?   new inputElement('userName', 'userName', true, 4, 20),
//? ];

//? JSDoc-style comments to document the class and its properties.
/**
 * Represents an input element
 */
class inputElement {
  /**
   * @param {string} id - The ID of the input element { string }
   * @param {string} type - The type of input field: { string }("phone" || "name" || "userName" || "password" || "email")
   * @param {boolean} isRequired - Whether the input is required { boolean }
   * @param {number} minLen - The minimum length of the input value { int }
   * @param {number} maxLen - The maximum length of the input value { int }
   * @param {number} player1alias - The maximum length of the input value { int }
  //  * @param {boolean} isFormFloating - Whether the input is in form-floating { boolean }
   */
  // constructor(id, type, isRequired, minLen, maxLen, isFormFloating) {
  constructor(id, type, isRequired, minLen, maxLen, player1alias) {
    this.id = id;
    this.type = type;
    this.isRequired = isRequired;
    this.minLen = minLen;
    this.maxLen = maxLen;
    this.player1alias = player1alias;
    // this.isFormFloating = isFormFloating;
  }
}

const eventManager = {
  /**
   * Adds an event listener to an element
   * @param {Element} element - The element to add the listener to
   * @param {string} event - The event to listen for (e.g. "click", "change", "keypress", etc.)
   * @param {Function} handler - The function to call when the event is triggered
   */
  addListener(element, event, handler) {
    element.removeEventListener(event, handler);
    element.addEventListener(event, handler);
  },

  /**
   * Removes an event listener from an element
   * @param {Element} element - The element to remove the listener from
   * @param {string} event - The event to stop listening for
   * @param {Function} handler - The function to remove
   */
  removeListener(element, event, handler) {
    element.removeEventListener(event, handler);
  }
};

function printInvalidFeedback(field, msg) {
  field.invalidFeedback.textContent = msg;
  field.inputField.classList.add("is-invalid");
  const timeoutId = setTimeout(clearErrorMessage, 5000, field);
  window.timeoutId = timeoutId;
  return false;
}

function phoneValidation(field) {
  const phoneRegex = /^((\+971\s?(5[0-9]))|0(5[0-9]))([-.]?)([0-9]{3})([-.]?)([0-9]{4})$/;
  const isValidPhone = phoneRegex.test(field.inputValue);

  if (!isValidPhone)
    return printInvalidFeedback(field, "Looks like an invalid phone number! 😿");
  return true;
}

function emailValidation(field) {
  if (!(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(field.inputValue)) {
    return printInvalidFeedback(field, "Invalid email format");
  }
  return true;
}

function passwordValidation(field) {
  if (!(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/).test(field.inputValue)) {
    return printInvalidFeedback(field, "Weak password! 🔒️ {8+ chars, 1 UPPER, 1 lower, 1 num}");
  }
  return true;
}


function nameValidation(field) {
  if ((field.inputValue.length !== 0) && !(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/).test(field.inputValue)) {
    return printInvalidFeedback(field, "no elon musk typeof names only letter!! 💀");
  }
  return true;
}

function visibilityValidation(field) {
  return printInvalidFeedback(field, "input can only contain printable ASCII characters! 😸");
}

function lengthValidation(field, currentElement) {
  if ((field.inputValue.length > currentElement.maxLen) || (field.inputValue.length < currentElement.minLen)) {
    return printInvalidFeedback(field, `${(currentElement.type === 'userName') ? 'input' : currentElement.type} must be between ${currentElement.minLen} and ${currentElement.maxLen} characters long! 😼`);
  }
  return true;
}

function isPrintableASCII(str) {
  var printableASCIIRegex = /^[!-~]+$/;
  return printableASCIIRegex.test(str);
}

function clearErrorMessage(field) {
  field.invalidFeedback.textContent = "";
  field.inputField.classList.remove("is-invalid");
}

function checkInput(inputElements) {
  let allInputsValid = true;
  let bigBoiTruncation = (inputElements.length > 4) ? true : false;
  const passwordGroup = {};
  const seenUsernames = {};

  for (let i = 0; i < inputElements.length; i++) {
    let currentElement = inputElements[i];
    if (currentElement.player1alias.length !== 0) {
      seenUsernames[inputElements[0].player1alias] = true;
      continue;
    }
    let currentElementStatus = true;
    const input_field = document.getElementById(currentElement.id);
    const field = {
      inputField: input_field,
      inputValue: input_field.value.trim(),
      invalidFeedback: null,
      validFeedback: null
    }
    field.invalidFeedback = field.inputField.closest('.input-group').querySelector('.invalid-feedback');
    if (bigBoiTruncation && !allInputsValid)
      return;
    if (currentElement) {
      field.invalidFeedback.textContent = "";
      if (currentElement.isRequired && field.inputValue === '') {
        field.invalidFeedback.textContent = `${(currentElement.type === 'userName' ? 'name' : currentElement.type)} cannot be empty! 😾`;
        field.inputField.classList.add("is-invalid");
        clearTimeout(window.timeoutId);
        window.timeoutId = setTimeout(clearErrorMessage, 5000, field);
        currentElementStatus = false;
      }
      else if (field.inputValue.length && !isPrintableASCII(field.inputValue) && currentElement.type !== 'name') {
        visibilityValidation(field);
        currentElementStatus = false;
      }
      else if (currentElement.type !== 'phone' && (currentElement.isRequired || (field.inputValue.length !== 0))) {
        currentElementStatus = lengthValidation(field, currentElement) ? currentElementStatus : false;
      }
      if (currentElementStatus && (currentElement.type === 'phone')) {
        currentElementStatus = (!currentElement.isRequired && field.inputValue.length === 0) ? currentElementStatus : (phoneValidation(field) ? currentElementStatus : false);
      }
      else if (currentElementStatus && (currentElement.type === 'name')) {
        currentElementStatus = nameValidation(field) ? currentElementStatus : false;
      }
      else if (currentElementStatus && (currentElement.type === 'userName')) {
        if (currentElement.isRequired && (field.inputValue.length !== 0) && !(/^[a-zA-Z]{4,}$/).test(field.inputValue))
          currentElementStatus = printInvalidFeedback(field, 'Invalid Username {min 4, max 10} only letters');
        else if (seenUsernames[field.inputValue])
          currentElementStatus = printInvalidFeedback(field, 'Username already taken!');
        else
          seenUsernames[field.inputValue] = true;
      }
      else if (currentElementStatus && (currentElement.type === 'password')) {
        currentElementStatus = passwordValidation(field) ? currentElementStatus : false;
        if (!passwordGroup[field.inputValue] && Object.keys(passwordGroup).length == 1)
          currentElementStatus = printInvalidFeedback(field, 'passwords don\'t match!');
        else
          passwordGroup[field.inputValue] = true;
      }
      else if (currentElementStatus && (currentElement.type === 'email')) {
        currentElementStatus = emailValidation(field) ? currentElementStatus : false;
      }
      if (!currentElementStatus) {
        allInputsValid = !true;
        field.inputField.classList.add('is-invalid');
        field.inputField.classList.remove('is-valid');
        field.invalidFeedback.style.display = 'block';
      } else {
        field.inputField.classList.remove('is-invalid');
        clearTimeout(window.timeoutId);
      }
    } else {
      console.error(`input field with ID ${currentElement} not found!`);
    }
  }
  if (!allInputsValid) {
    return !true;
  }
  return !false;
}

function displayBootstrapAlert(id, message, type) {
  let alertContainer = document.getElementById(id);
  if (alertContainer.querySelector('.alert'))
    return;

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-success alert-${type} alert-dismissible fade show`;
  alertDiv.role = 'alert';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  alertContainer.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.classList.remove('show');
    alertDiv.classList.add('hide');
    setTimeout(() => {
      alertContainer.removeChild(alertDiv);
    }, 300);
  }, 5000);
}

export { eventManager, inputElement, checkInput, isPrintableASCII, displayBootstrapAlert };