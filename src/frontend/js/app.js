

// // function to check the user's authentication status by sending a request to the django
// // function to check the user's authentication status
// async function checkAuthentication() {
//     console.log('Checking token:', localStorage.getItem('token')); // Debug statement for development
//     try {
//         const response = await fetch('https://127.0.0.1:8000/api/auth_status', {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`,
//             },
//         });

//         if (!response.ok) {
//             // Show authentication dialog if authentication fails
//             showModal('authDialog');
//             return false;
//         }

//         const data = await response.json();
//         return data.isAuthenticated;
//     } catch (error) {
//         console.error('Error checking authentication:', error);
//         return false;
//     }
// }

// // Function to initialize the application
// async function initApp() {
//     const isAuthenticated = await checkAuthentication();
//     if (isAuthenticated) {
//         document.getElementById('mainContent').style.display = 'block'; // Show main content if authenticated
//     } else {
//         showModal('authDialog'); // Show login form if not authenticated
//     }
// }

// // Function to show a modal dialog
// function showModal(modalId) {
//     const modal = document.getElementById(modalId);
//     if (modal) modal.style.display = 'block';
// }

// // Function to close a modal dialog
// function closeModal(modalId) {
//     const modal = document.getElementById(modalId);
//     if (modal) modal.style.display = 'none';
// }

// // Function to handle user login
// async function login(username, password) {
//     try {
//         const response = await fetch('https://127.0.0.1:8000/api/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ username, password }),
//         });

//         if (!response.ok) {
//             throw new Error('Login failed');
//         }

//         const data = await response.json();
//         localStorage.setItem('token', data.token); // Save the token
//         closeModal('authDialog');
//         document.getElementById('mainContent').style.display = 'block'; // Show main content after login
//     } catch (error) {
//         console.error('Login error:', error);
//         alert('Login failed. Please try again.'); // Provide feedback to the user
//     }
// }

// document.addEventListener('DOMContentLoaded', async () => {
//     await initApp();

//     // Login form submission
//     document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
//         e.preventDefault();
//         const username = document.getElementById('username').value;
//         const password = document.getElementById('password').value;
//         await login(username, password);
//     });

//     // Registration form submission
//     document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
//         e.preventDefault();
//         const username = document.getElementById('newUsername').value;
//         const email = document.getElementById('email').value;
//         const password = document.getElementById('newPassword').value;
//         await register(username, email, password);
//     });
// });

// // Additional functions to switch between login and registration forms, if necessary
// function showRegisterForm() {
//     closeModal('authDialog');
//     showModal('registerDialog');
//     // Attach event listener to the registration form submission, similar to the login form
// }

// function showLoginForm() {
//     closeModal('registerDialog');
//     showModal('authDialog');
// }

// // Function to handle user registration
// async function register(username, email, password) {
//     try {
//         const response = await fetch('https://127.0.0.1:8000/api/register', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ username, email, password }),
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.error || 'Registration failed');
//         }

//         const data = await response.json();
//         alert(data.status); // Show success message
//         showLoginForm(); // Switch back to the login form after successful registration
//     } catch (error) {
//         console.error('Registration error:', error);
//         alert(error.message); // Provide feedback to the user
//     }
// }


// // profile page
// async function loadProfilePage() {
//     try {
//         const response = await fetch('profile.html');
//         const htmlContent = await response.text();
//         document.getElementById('page-content').innerHTML = htmlContent;
//         // After loading, fetch and display the actual profile data
//         await loadProfileData(); // Make sure to await this function
//     } catch (error) {
//         console.error('Error loading profile page:', error);
//     }
// }

// // Function to fetch and display profile data
// async function loadProfileData() {
//     try {
//         const profileResponse = await fetch('https://127.0.0.1:8000/profile', {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`,
//             },
//         });

//         if (!profileResponse.ok) {
//             throw new Error('Failed to fetch profile data');
//         }

//         const profileData = await profileResponse.json();

//         // Update UI elements with fetched data
//         document.getElementById('username').textContent = profileData.username || 'N/A';
//         document.getElementById('email').textContent = profileData.email || 'user@example.com';
//         document.getElementById('first_name').textContent = profileData.firstName || 'N/A';
//         document.getElementById('last_name').textContent = profileData.lastName || 'N/A';
//         document.getElementById('phone').textContent = profileData.phone || 'N/A';
//         document.getElementById('address').textContent = profileData.address || 'N/A';
//         document.getElementById('join_date').textContent = profileData.joinDate || 'N/A';
//         document.getElementById('last_activity').textContent = profileData.lastActivity || 'N/A';
//         document.getElementById('twofa_enabled').textContent = profileData.twofaEnabled ? 'Yes' : 'No';
//         if (profileData.profilePicUrl) {
//             document.getElementById('profilePic').src = profileData.profilePicUrl;
//         } else {
//             //change this later 
//             document.getElementById('profilePic').src = 'asessts/profile_pictures/default.png';
//         }
//     } catch (error) {
//         console.error('Error loading profile data:', error);
//     }
// }
