import { main} from './OpenAI.js';

document.addEventListener('DOMContentLoaded', () => {
    const voiceBtn = document.querySelector('.voice-btn');// // select the voice button element
    if(voiceBtn) voiceBtn.addEventListener('click', startListening);// // add click event listener to the voice button
    clearTaskOutput();// // clear previous task output on page load
});
function clearTaskOutput() {
    const taskInfo = document.querySelector('.task-info');/// // select the task output element
    if(taskInfo) document.getElementById('task').innerHTML = '';// // clear the task output element
    if(taskInfo) document.getElementById('urgency').innerHTML = '';// // clear the task output element
    if(taskInfo) document.getElementById('datetime').innerHTML = '';// // clear the task output element
    const Confirmation = document.getElementById('confirmation-area');// // select the confirmation element
    if(Confirmation) Confirmation.innerHTML = '';// // clear the confirmation element
}

function startListening() {
     if('webkitSpeechRecognition' in window) { // if browser supports web speech API
         const recognition = new webkitSpeechRecognition(); //webkitSpeechRecognition is a vendor-prefixed version of the SpeechRecognition API
         recognition.continuous = false; // stop after one result
         recognition.lang = 'en-US';// // set language to English
         recognition.interimResults = false;// // do not show interim results

        recognition.onstart = () => { // when speech recognition starts
            console.log('Listening...');// // log to console
            clearTaskOutput();// // clear previous task output
        };

        recognition.onresult = (event) => { // when speech recognition result is available
            const transcript = event.results[0][0].transcript; //whatever said is here
            processCommand(transcript);// // process the command
        };

        recognition.onerror = (event) => {// // when speech recognition error occurs
            console.error('Speech recognition error:', event.error);// // log error to console
        };

        recognition.start();// // start speech recognition
    }
    else{
        alert('Web Speech API not supported in this browser');// // alert user if browser does not support web speech API
    }
    console.log("response",main('hello'));// // test the main function with a sample command
}

async function processCommand(command){
    try{
        const aiResponse = await main(command);// // call the main function with the command
        console.log('AI Response:', aiResponse);// // log AI response to console
    }
    catch(error){
        console.error('Error processing command:', error);// // log error to console
    }
}


