import { getCookie } from './profile.js';
import { setTournamentId, getTournamentId } from './tournament.js';

async function createTournament() {
  const tournamentName = document.getElementById('tournamentName').value;
  const participantInputs = document.querySelectorAll('#participantDetailsFormInner .form-control:not([readonly])');
  const participants = Array.from(participantInputs).map(input => ({ temp_username: input.value }));
  const loggedInUser = document.querySelector('#participantDetailsFormInner .form-control[readonly]').value;
  participants.unshift({ username: loggedInUser });

  const tournamentData = {
    name: tournamentName,
    participants: participants
  };

  try {
    const response = await fetch(`https://127.0.0.1:443/tournament_api/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getCookie('jwt')
      },
      body: JSON.stringify(tournamentData)
    })
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
  }
  catch (error) {
    console.error("Fetch error:", error);
  }
}

async function startTournament() {
  try {
    const response = await fetch(`https://127.0.0.1:443/tournament_api/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getCookie('jwt')
      }
    })
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
  }
  catch (error) {
    console.error("Fetch error:", error);
  }
}

async function getTournamentDetails() {
  try {
    const response = await fetch(`https://127.0.0.1:443/tournament_api/detail`, {
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
    setTournamentId(data);
    return data;
  }
  catch (error) {
    console.error("Fetch error:", error);
  }
}

async function getFirstRound() {
  const tournamentData = {
    tournament_id: getTournamentId()
  };
  try {
    const response = await fetch(`https://127.0.0.1:443/tournament_api/arrange-matches/${getTournamentId()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getCookie('jwt')
      },
      body: JSON.stringify(tournamentData)
    })
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;

  }
  catch (error) {
    console.error("Fetch error:", error);
  }
}

async function getSecondRound() {
  try {
    const response = await fetch(`https://127.0.0.1:443/tournament_api/get_second_round_matches/${getTournamentId()}`, {
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
  catch (error) {
    console.error("Fetch error:", error);
  }
}

async function updateMatchResult(match_id, winner) {
  const matchData = {
    winner_id: winner
  };
  try {
    const response = await fetch(`https://127.0.0.1:443/tournament_api/update-match-result/${match_id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getCookie('jwt')
      },
      body: JSON.stringify(matchData)
    })
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Fetch error:", error);
  }
}

async function getNextMatch() {
  try {
    const response = await fetch(`https://127.0.0.1:443/tournament_api/get-next-match/${getTournamentId()}`, {
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
  catch (error) {
    console.error("Fetch error:", error);
  }
}

export { createTournament, startTournament, getTournamentDetails, getFirstRound, getSecondRound, updateMatchResult, getNextMatch };
