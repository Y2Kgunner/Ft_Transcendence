function setupTournamentPage() {
    const startNewTournamentButton = document.getElementById('startNewTournament');
    const newTournamentForm = document.getElementById('newTournamentForm');
    const backToTournamentMainButton = document.getElementById('backToTournamentMain');
    const minusButton = document.querySelector('.quantity__minus');
    const plusButton = document.querySelector('.quantity__plus');
    const input = document.getElementById('numParticipants');

    function handleStartNewTournament() {
        document.getElementById('tournament-content').style.display = 'none';
        document.getElementById('newTournamentContainer').style.display = 'block';
    }

    function handleNewTournamentFormSubmit(event) {
        event.preventDefault();
        const numParticipants = parseInt(input.value, 10);
        generateParticipantFields(numParticipants);
    }

    function handleBackToTournamentMain() {
        document.getElementById('newTournamentContainer').style.display = 'none';
        document.getElementById('tournament-content').style.display = 'block';
    }

    function handleMinusButtonClick() {
        let value = parseInt(input.value, 10);
        value = Math.max(3, value - 1);
        input.value = value;
    }

    function handlePlusButtonClick() {
        let value = parseInt(input.value, 10);
        value = Math.min(value + 1, 8);
        input.value = value;
    }

    startNewTournamentButton.addEventListener('click', handleStartNewTournament);
    newTournamentForm.addEventListener('submit', handleNewTournamentFormSubmit);
    backToTournamentMainButton.addEventListener('click', handleBackToTournamentMain);
    minusButton.addEventListener('click', handleMinusButtonClick);
    plusButton.addEventListener('click', handlePlusButtonClick);
    setupStartTournamentForm();
}

function generateParticipantFields(num) {
    const form = document.getElementById('participantDetailsFormInner');
    form.innerHTML = ''; 

    fetchUserProfile().then(username => {
        const formGroupUser = document.createElement('div');
        formGroupUser.classList.add('form-group');

        const labelUser = document.createElement('label');
        labelUser.textContent = `Participant 1 Name:`;
        formGroupUser.appendChild(labelUser);

        const inputUser = document.createElement('input');
        inputUser.type = 'text';
        inputUser.classList.add('form-control');
        inputUser.value = username;
        inputUser.readOnly = true;
        formGroupUser.appendChild(inputUser);

        form.appendChild(formGroupUser);

        //participants
        for (let i = 1; i < num; i++) {
            const formGroup = document.createElement('div');
            formGroup.classList.add('form-group');

            const label = document.createElement('label');
            label.textContent = `Participant ${i + 1} Name:`;
            formGroup.appendChild(label);

            const input = document.createElement('input');
            input.type = 'text';
            input.classList.add('form-control');
            input.placeholder = `Enter name for participant ${i + 1}`;
            input.required = true;
            input.name = `participantName${i}`;
            formGroup.appendChild(input);

            form.appendChild(formGroup);
        }

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.classList.add('btn', 'btn-primary', 'mt-3');
        submitButton.textContent = 'Submit Tournament';
        form.appendChild(submitButton);
    });

    document.getElementById('newTournamentContainer').style.display = 'none'; 
    document.getElementById('participantDetailsForm').style.display = 'block';
}

function fetchUserProfile() {
    return fetch('https://127.0.0.1:443/api/profile', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie('jwt')
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        return data.username;
    })
    .catch(error => {
        console.error('Failed to fetch user profile:', error);
        return 'Unknown';
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    console.log('Cookie value:', cookieValue);
    return cookieValue;
}

function startTournament() {
    const tournamentName = document.getElementById('tournamentName').value;
    const participantInputs = document.querySelectorAll('#participantDetailsFormInner .form-control:not([readonly])');
    const participants = Array.from(participantInputs).map(input => ({ temp_username: input.value }));
    const loggedInUser = document.querySelector('#participantDetailsFormInner .form-control[readonly]').value;
    participants.unshift({ username: loggedInUser });

    const tournamentData = {
        name: tournamentName,
        participants: participants
    };

    fetch('https://127.0.0.1:443/tournament_api/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie('jwt')
        },
        body: JSON.stringify(tournamentData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Tournament created:', data);
        alert('Tournament created successfully!');
        setTournamentId(data.id);
        // create breacket page here or direct the to the game page
    })
    .catch(error => {
        console.error('Failed to create tournament:', error);
        alert('Failed to create tournament. Please try again.');
    });
}

function setupStartTournamentForm() {
    const form = document.getElementById('participantDetailsFormInner');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        startTournament();
    });
}


function setTournamentId(tournamentId) {
    localStorage.setItem('currentTournamentId', tournamentId);
}

function getTournamentId() {
    return localStorage.getItem('currentTournamentId');
}


export { setupTournamentPage };
