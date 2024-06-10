//? How to use! import the checkInputV69 and the inputElement class!!
//? import { inputElement } from './inputElement.js';

//? How to send an entire inputElementBlock?? ==> here u go!
//? const _elementBlock = [
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
  //  * @param {boolean} isFormFloating - Whether the input is in form-floating { boolean }
   */
  // constructor(id, type, isRequired, minLen, maxLen, isFormFloating) {
  constructor(id, type, isRequired, minLen, maxLen) {
    this.id = id;
    this.type = type;
    this.isRequired = isRequired;
    this.minLen = minLen;
    this.maxLen = maxLen;
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
  }
};

function printInvalidFeedback(field, msg) {
  field.invalidFeedback.textContent = msg;
  field.inputField.classList.add("is-invalid");
  const timeoutId = setTimeout(clearErrorMessage, 5000, field);
  window.timeoutId = timeoutId;
  console.log('printttt err');
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
    console.log('non printable');
    return printInvalidFeedback(field, "Invalid email format");
  }
  return true;
}

function passwordValidation(field) {
  if (!(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/).test(field.inputValue)) {
    console.log('non printable');
    return printInvalidFeedback(field, "Weak password! 🔒️ {8+ chars, 1 UPPER, 1 lower, 1 num}");
  }
  return true;
}

// function userNameValidation(field, seenUsernames) {
//   const username = field.inputValue.trim();
//   if (seenUsernames[username])
//     return printInvalidFeedback(field, 'Username already taken!');
//   else
//     seenUsernames[username] = true;
//   return true;
// }

function nameValidation(field) {
  if (!(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/).test(field.inputValue)) {
    console.log('non printable');
    return printInvalidFeedback(field, "no elon musk typeof names only letter!! 💀");
  }
  return true;
}

function visibilityValidation(field) {
  console.log('non printable');
  return printInvalidFeedback(field, "input can only contain printable ASCII characters! 😸");
}

function lengthValidation(field, _element) {
  console.log("elllloooooo---------");
  if ((field.inputValue.length > _element.maxLen) || (field.inputValue.length < _element.minLen)) {
    console.log('length issue -->>', _element.isRequired);
    return printInvalidFeedback(field, `${_element.type} must be between ${_element.minLen} and ${_element.maxLen} characters long! 😼`);
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
  console.log("input valz");
  let allInputsValid = true;
  let bigBoiTruncation = (inputElements.length > 4) ? true : false;
  const passwordGroup = {};
  const seenUsernames = {};

  inputElements.forEach((_element) => {
    let currentElementStatus = true;
    const input_field = document.getElementById(_element.id);
    const field = {
      inputField: input_field,
      inputValue: input_field.value.trim(),
      invalidFeedback: null,
      validFeedback: null
    }
    field.invalidFeedback = field.inputField.closest('.input-group').querySelector('.invalid-feedback');
    // if (_element.isFormFloating) {
    // field.invalidFeedback = field.inputField.parentNode.nextElementSibling;
    // field.invalidFeedback.textContent = 'dafag';
    // console.log('floating');
    // } else {
    // field.invalidFeedback = field.inputField.nextElementSibling;
    // }
    if (bigBoiTruncation && !allInputsValid)
      return;
    if (_element) {
      field.invalidFeedback.textContent = "";

      if (_element.isRequired && field.inputValue === '') {
        field.invalidFeedback.textContent = `${_element.type} cannot be empty! 😾`;
        field.inputField.classList.add("is-invalid");
        clearTimeout(window.timeoutId);
        window.timeoutId = setTimeout(clearErrorMessage, 5000, field);
        currentElementStatus = false;
      }
      else if (field.inputValue.length && !isPrintableASCII(field.inputValue) && _element.type !== 'name') {
        visibilityValidation(field);
        currentElementStatus = false;
      }
      else if (_element.type !== 'phone' && (_element.isRequired || (field.inputValue.length !== 0))) {
        currentElementStatus = lengthValidation(field, _element) ? currentElementStatus : false;
      }
      if (currentElementStatus && (_element.type === 'phone')) {
        currentElementStatus = (!_element.isRequired && field.inputValue.length === 0) ? currentElementStatus : (phoneValidation(field) ? currentElementStatus : false);
        console.log('phone ternary check', field.inputValue.length);
      }
      else if (currentElementStatus && (_element.type === 'name')) {
        currentElementStatus = nameValidation(field) ? currentElementStatus : false;
      }
      else if (currentElementStatus && (_element.type === 'userName')) {
        console.log("cur -> userName");
        if (_element.isRequired && (field.inputValue.length !== 0) &&  !(/^[a-zA-Z]{4,}$/).test(field.inputValue))
          currentElementStatus = printInvalidFeedback(field, 'Invalid Username {min 4, max 10} only letters');
        else if (seenUsernames[field.inputValue])
          currentElementStatus = printInvalidFeedback(field, 'Username already taken!');
        else
          seenUsernames[field.inputValue] = true;
      }
      else if (currentElementStatus && (_element.type === 'password')) {
        console.log("pass ---->", Object.keys(passwordGroup).length);
        currentElementStatus = passwordValidation(field) ? currentElementStatus : false;
        if (!passwordGroup[field.inputValue] && Object.keys(passwordGroup).length == 1)
          currentElementStatus = printInvalidFeedback(field, 'passwords don\'t match!');
        else
          passwordGroup[field.inputValue] = true;
      }
      else if (currentElementStatus && (_element.type === 'email')) {
        console.log("email");
        currentElementStatus = emailValidation(field) ? currentElementStatus : false;
      }
      if (!currentElementStatus) {
        allInputsValid = !true;
        field.inputField.classList.add('is-invalid');
        field.inputField.classList.remove('is-valid');
        // if (_element.isFormFloating)
        field.invalidFeedback.style.display = 'block';
      } else {
        field.inputField.classList.remove('is-invalid');
        // field.inputField.classList.add('is-valid');
        clearTimeout(window.timeoutId);
      }
    } else {
      console.error(`input field with ID ${_element} not found!`);
    }
  });
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