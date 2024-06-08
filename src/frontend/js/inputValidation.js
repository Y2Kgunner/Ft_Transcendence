//? How to use! import the checkInputV69 and the inputElement class!!
//? import { inputElement } from './inputElement.js';

//? How to send an entire inputElementBlock?? ==> here u go!
//? const _elementBlock = [
//?   new inputElement('phone', 'phone', true, 10, 15),
//?   new inputElement('name', 'name', true, 2, 50),
//?   new inputElement('userName', 'userName', true, 3, 20),
//? ];

//? JSDoc-style comments to document the class and its properties.
/**
 * Represents an input element
 */
class inputElement {
  /**
   * @param {string} id - The ID of the input element { string }
   * @param {string} type - The type of input field: { string }("phone" || "name" || "userName" || "password")
   * @param {boolean} isRequired - Whether the input is required { boolean }
   * @param {number} minLen - The minimum length of the input value { int }
   * @param {number} maxLen - The maximum length of the input value { int }
   */
  constructor(id, type, isRequired, minLen, maxLen) {
    this.id = id;
    this.type = type;
    this.isRequired = isRequired;
    this.minLen = minLen;
    this.maxLen = maxLen;
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

function phoneValidation(field) {
  const phoneRegex = /^((\+971\s?(5[0-9]))|0(5[0-9]))([-.]?)([0-9]{3})([-.]?)([0-9]{4})$/;
  const isValidPhone = phoneRegex.test(field.inputValue);

  if (!isValidPhone) {
    field.invalidFeedback.textContent = "Looks like an invalid phone number! 😿";
    field.inputField.classList.add("is-invalid");
    clearTimeout(window.timeoutId);
    window.timeoutId = setTimeout(clearErrorMessage, 5000, field);
    return false;
  }
  return true;
}

function isPrintableASCII(str) {
  var printableASCIIRegex = /^[!-~]+$/;
  return printableASCIIRegex.test(str);
}

function clearErrorMessage(field) {
  field.invalidFeedback.textContent = "Looks stinky! 🚽";
  field.inputField.classList.remove("is-invalid");
}

function checkInput(inputElements) {
  let allInputsValid = true;
  let bigBoiTruncation = (inputElements.length > 4) ? true : false;
  const seenUsernames = {};

  inputElements.forEach((_element) => {
    const input_field = document.getElementById(_element.id);
    const field = {
      inputField: input_field,
      inputValue: input_field.value.trim(),
      invalidFeedback: input_field.nextElementSibling,
      validFeedback: input_field.nextElementSibling.nextElementSibling
    };

    if (bigBoiTruncation && !allInputsValid)
      return;
    if (_element) {
      field.invalidFeedback.textContent = "Looks stinky! 🚽";
      field.validFeedback.style.display = "none";

      if (_element.isRequired && field.inputField === '') {
        console.log('empty');
        field.invalidFeedback.textContent = "input field cannot be empty! 😾";
        inputField.classList.add("is-invalid");
        clearTimeout(window.timeoutId);
        window.timeoutId = setTimeout(clearErrorMessage, 5000, field);
        allInputsValid = false;
      }
      else if (field.inputValue.length && !isPrintableASCII(field.inputValue) && _element.type !== 'name') {
        console.log('non printable');
        field.invalidFeedback.textContent = "input can only contain printable ASCII characters! 😸";
        input_field.classList.add("is-invalid");
        clearTimeout(window.timeoutId);
        window.timeoutId = setTimeout(clearErrorMessage, 5000, field);
        allInputsValid = false;
      }
      else if (_element.type !== 'phone' && (_element.isRequired || (field.inputValue.length !== 0)) && ((field.inputValue.length > _element.maxLen) || (field.inputValue.length < _element.minLen))) {
        if (field.inputValue.length > _element.maxLen) {
          console.log('too big', field.inputValue.length, _element.maxLen);
        }
        if (field.inputValue.length < _element.minLen) {
          console.log('too smol', field.inputValue.length, _element.minLen);
        }
        console.log('length issue -->>', _element.isRequired);
        field.invalidFeedback.textContent = `input must be between ${_element.minLen} and ${_element.maxLen} characters long! 😼`;
        input_field.classList.add("is-invalid");
        clearTimeout(window.timeoutId);
        window.timeoutId = setTimeout(clearErrorMessage, 5000, field);
        allInputsValid = false;
      }
      else if (_element.type === 'phone') {
        allInputsValid = (!_element.isRequired && field.inputValue.length === 0) ? allInputsValid : (phoneValidation(field) ? allInputsValid : false);
        // var abc = phoneValidation(field) ? allInputsValid : false;
        console.log('phone ternary check', field.inputValue.length);
      }
      else if (_element.type === 'name') {
        // if (!(/^[a-zA-Z]+(?: [a-zA-Z]+)?$/).test(field.inputValue)) {
        if (!(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/).test(field.inputValue)) {
          console.log('non printable');
          field.invalidFeedback.textContent = "no elon musk typeof names only letter!! 💀";
          input_field.classList.add("is-invalid");
          clearTimeout(window.timeoutId);
          window.timeoutId = setTimeout(clearErrorMessage, 5000, field);
          allInputsValid = false;
        }
      }
      else if (_element.type === 'userName') {
        const username = field.inputValue.trim();
        if (seenUsernames[username]) {
          field.invalidFeedback.textContent = 'Username already taken!';
          input_field.classList.add("is-invalid");
          clearTimeout(window.timeoutId);
          window.timeoutId = setTimeout(clearErrorMessage, 5000, field);
          allInputsValid = false;
        } else {
          seenUsernames[username] = true;
        }
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
  let alertContainer = document.getElementById(id); // assume this is the container for alerts
  if (limitAlerts(alertContainer))
    return;

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


export { eventManager, inputElement, checkInput, isPrintableASCII, displayBootstrapAlert };