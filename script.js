import { main } from "./OpenAI.js";

(function checkAuth(){
    const userData = localStorage.getItem("userData"); // // get user data from local storage
    if(!userData){
        // if user data is not found, redirect to login page
        window.location.replace("login.html"); // // redirect to login page
        return; // // exit the function
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    const userData = localStorage.getItem("userData"); // // get user data from local storage
    if(!userData){
        // if user data is not found, redirect to login page
        window.location.replace("login.html"); // // redirect to login page
        return; // // exit the function
    }
    const voiceBtn = document.querySelector(".voice-btn"); // // select the voice button element
    if (voiceBtn) voiceBtn.addEventListener("click", startListening); // // add click event listener to the voice button
    clearTaskOutput(); // // clear previous task output on page load
});


function setDataToLocalStorage(userData) {
    localStorage.setItem("userData", JSON.stringify(userData)); // // set user data to local storage
}

function getDataFromLocalStorage() {
    const userData = localStorage.getItem("userData"); // // get user data from local storage    
    return userData ? JSON.parse(userData) : null;
}

    
function clearTaskOutput() {
    const taskInfo = document.querySelector(".task-info"); /// // select the task output element
    if (taskInfo) document.getElementById("task").innerHTML = ""; // // clear the task output element
    if (taskInfo) document.getElementById("urgency").innerHTML = ""; // // clear the task output element
    if (taskInfo) document.getElementById("datetime").innerHTML = ""; // // clear the task output element
    const Confirmation = document.getElementById("confirmation-area"); // // select the confirmation element
    if (Confirmation) Confirmation.innerHTML = ""; // // clear the confirmation element
}

function startListening() {
    if ("webkitSpeechRecognition" in window) {
        // if browser supports web speech API
        const recognition = new webkitSpeechRecognition(); //webkitSpeechRecognition is a vendor-prefixed version of the SpeechRecognition API
        recognition.continuous = false; // stop after one result
        recognition.lang = "en-US"; // // set language to English
        recognition.interimResults = false; // // do not show interim results

        recognition.onstart = () => {
            // when speech recognition starts
            console.log("Listening..."); // // log to console
            clearTaskOutput(); // // clear previous task output
        };

        recognition.onresult = (event) => {
            // when speech recognition result is available
            const transcript = event.results[0][0].transcript; //whatever said is here
            console.log("Transcript:", transcript); // // log the transcript to console
            processCommand(transcript); // // process the command
        };

        recognition.onerror = (event) => {
            // // when speech recognition error occurs
            console.error("Speech recognition error:", event.error); // // log error to console
        };

        recognition.start(); // // start speech recognition
    } else {
        alert("Web Speech API not supported in this browser"); // // alert user if browser does not support web speech API
    }
}

async function processCommand(command) {
    try {
        console.log("Processing command:", command); // // log command to console

        const jasonResponse = await main(command); // // call the main function with the command
        const aiResponse = JSON.parse(
            jasonResponse.choices[0].message.content
                .replace(/`/g, "")
                .replace(/"/g, '"')
        ); // parse the response and remove extra characters
        console.log("AI Response:", aiResponse); // // log AI response to console

        const requestBody = { // // create request body
            operation: aiResponse.operation,
            task: aiResponse.task,
            urgency: aiResponse.urgency,
            dateTime: aiResponse.datetime,
        };

        console.log("Request Body:", requestBody); // // log request body to console

        document.getElementById("operation").textContent = aiResponse.operation; // // set operation text content
        document.getElementById("task").textContent = aiResponse.task; // // set task text content
        document.getElementById("urgency").textContent = aiResponse.urgency; // // set urgency text content
        document.getElementById("datetime").textContent = aiResponse.datetime; // // set datetime text content

        const confirmationArea = document.getElementById("confirmation-area"); // // select the confirmation area element
        confirmationArea.innerHTML = `
                <div class = "confirmation-area">
                    <button  onclick = "window.confirmTask(true)" class="confirm-btn">Confirm</button> 
                    <button  onclick = "window.confirmTask(false)" class="cancel-btn">Cancel</button>
                </div>
        `;

        window.confirmTask = async function (isConfirmed) {
            // // function to handle confirmation.
            if (isConfirmed) {
                const response = await fetch("http://localhost:8080/api/tasks/", {
                    // // send request to your API endpoint
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });
                console.log("Response:", response); // // log response to console

                if (!response.ok) {
                    // // check if response is ok
                    // // if not, log error to console
                    console.error("request unsuccessful"); // // log error to console
                    throw new Error(`Request failed with status: ${response.status}`); // // throw error if request fails
                }

                document.getElementById("operation").textContent = ""; // // set operation text content
                document.getElementById("task").textContent = ""; // // set task text content
                document.getElementById("urgency").textContent = ""; // // set urgency text content
                document.getElementById("datetime").textContent = ""; // // set datetime text content

                confirmationArea.innerHTML = ""; // // clear confirmation area

                console.log("Response Status:", response.status); // // log response status to console
                const responseData = await response.json(); // // parse the response data
                console.log("Response Data:", responseData); // // log response data to console
                return responseData; // // return the response data
            }
            else {
                // // if user cancels, log to console and clear task output
                console.log("Task cancelled by user"); // // log cancellation to console
                confirmationArea.innerHTML = ""; // // clear confirmation area
                startListening(); // // restart listening for command
            };
        }
    }
    catch (error) {
        console.error("Error processing command:", error); // // log error to console
        return null; // // return null if error occurs
    }
}

function getBackgroundColor(urgency) {
    // // function to get background color based on urgency level
    let backgroundColor;
    switch (urgency.toLowerCase()) {
        case "high":          
            backgroundColor = "#FF0000"; // // set background color to red for high urgency
            break;  
        case "medium":
            backgroundColor = "#FFFF00"; // // set background color to yellow for medium urgency
            break;
        case "low":
            backgroundColor = "#008000";  // // set background color to green for low urgency
            break;
        default:
            backgroundColor = "#808080";  // // set background color to gray for unknown urgency
    }   
}                   
function updateTaskList(task) {
    const todoList = document.getElementById("todo-list"); // select the task list element
    todoList.innerHTML = '';
    const taskStore = new Map(); // create a new map to store tasks
    taskStore = getAllTasks(1); // get all tasks from the server
    console.log("Task Store:", taskStore); // log task store to console
    taskStore.forEach((task, key) => {
      const taskItem = document.createElement("div"); // create a new list item for each task
      taskItem.className = "task-item"; // set class name for the task item
      taskItem.style.backgroundColor = getBackgroundColor(task.urgency); // set background color based on urgency level
  
      taskItem.innerHTML = `
        <div class="task-info">
          <p>Operation: ${task.operation}</p>
          <p>Task: ${task.task}</p>
          <p>DateTime: ${task.datetime}</p>
        </div>
        <div class="task-actions">
          <button onclick="deleteTask(${key})" class="delete-btn">Delete</button>
          <button onclick="updateTask(${key})" class="update-btn">Update</button>
        </div>
      `;
  
      todoList.appendChild(taskItem); // add task item to the task list
    });
  }

async function getAllTasks(userId) {
    try {
        const response = await fetch("http://localhost:8080/api/tasks/all",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                }
            }
        ); // // send request to your API endpoint

        console.log("Response:", response); // // log response to console
        return response.json(); // // parse the response data
    }
    catch (error) {
        console.error("Error fetching tasks:", error); // // log error to console
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    createUserProfileCircle();
});

function createUserProfileCircle() {
    const userProfileContainer = document.getElementById('userProfile');
    
    // Check if user data exists in localStorage
    const userDataString = localStorage.getItem('userData');
    
    if (userDataString) {
        try {
            const userData = JSON.parse(userDataString);
            
            if (userData && userData.email) {
                // Create the elements
                const userCircleDiv = document.createElement('div');
                userCircleDiv.className = 'user-circle';
                
                // Get the first character of the email
                const firstChar = userData.email.charAt(0).toUpperCase();
                userCircleDiv.textContent = firstChar;
                
                // Create dropdown menu
                const dropdownDiv = document.createElement('div');
                dropdownDiv.className = 'user-dropdown';
                
                // User info section
                const userInfoDiv = document.createElement('div');
                userInfoDiv.className = 'user-info';
                userInfoDiv.innerHTML = `
                    <strong>Signed in as</strong><br>
                    <span class="user-email" style="font-size: 15px;">${userData.email}</span>
                `;
                
                // Logout option
                const logoutDiv = document.createElement('div');
                logoutDiv.className = 'dropdown-option logout-option';
                logoutDiv.textContent = 'Sign out';
                logoutDiv.addEventListener('click', () => {
                    localStorage.removeItem('userData');
                    window.location.href = 'login.html';
                });
                
                // Append all elements
                dropdownDiv.appendChild(userInfoDiv);
                dropdownDiv.appendChild(logoutDiv);
                userProfileContainer.appendChild(userCircleDiv);
                userProfileContainer.appendChild(dropdownDiv);
                
                // Toggle dropdown on click
                userCircleDiv.addEventListener('click', () => {
                    dropdownDiv.classList.toggle('active');
                });
                
                // Close dropdown when clicking elsewhere
                document.addEventListener('click', (event) => {
                    if (!userProfileContainer.contains(event.target)) {
                        dropdownDiv.classList.remove('active');
                    }
                });
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
}