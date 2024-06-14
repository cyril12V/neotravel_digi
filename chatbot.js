document.addEventListener('DOMContentLoaded', function () {
  const chatbotToggler = document.querySelector('.chatbot-toggler');
  const closeBtn = document.querySelector('.close-btn');
  const chatList = document.getElementById('chatList');
  const sendBtn = document.getElementById('sendBtn');
  const userInput = document.getElementById('userInput');
  let currentQuestion = 0;
  let feedbackStage = false;
  const answers = {};

  function saveState() {
    const state = {
      currentQuestion,
      feedbackStage,
      answers,
      chatHTML: chatList.innerHTML
    };
    localStorage.setItem('chatbotState', JSON.stringify(state));
  }

  function loadState() {
    const state = JSON.parse(localStorage.getItem('chatbotState'));
    if (state) {
      currentQuestion = state.currentQuestion;
      feedbackStage = state.feedbackStage;
      Object.assign(answers, state.answers);
      chatList.innerHTML = state.chatHTML;
    }
  }

  chatbotToggler.addEventListener('click', function () {
    document.querySelector('.chatbot').classList.toggle('active');
    document.body.classList.toggle('show-chatbot');
    if (!localStorage.getItem('chatbotState')) {
      setTimeout(displayQuestion, 1500); 
    }
  });

  closeBtn.addEventListener('click', function () {
    document.querySelector('.chatbot').classList.remove('active');
    document.body.classList.remove('show-chatbot');
  });

  loadState();

  const questions = [
    { text: "Quel type de voyage souhaitez-vous organiser ?", options: ["Aller simple", "Aller retour"], name: "typeVoyage" },
    { text: "Combien de participants ?", options: [], type: "number", name: "Nombre_participants" },
    { text: "Lieu de départ", options: [], type: "text", name: "Lieu_depart" },
    { text: "Lieu d'arrivée", options: [], type: "text", name: "Lieu_arrivee" },
    { text: "Date de l'aller", options: [], type: "date", name: "Date_aller" },
    { text: "Horaire aller", options: [], type: "time", name: "Horaire_aller" },
    { text: "Date retour (si aller retour)", options: [], type: "date", name: "Date_retour" },
    { text: "Horaire retour (si aller retour)", options: [], type: "time", name: "Horaire_retour" },
    { text: "Quel est votre nom ?", options: [], type: "text", name: "Nom_prospect" },
    { text: "Quel est votre prénom ?", options: [], type: "text", name: "Prenom_prospect" },
    { text: "Quel est votre numéro de téléphone ?", options: [], type: "tel", name: "Telephone_prospect" },
    { text: "Quel est votre email ?", options: [], type: "email", name: "Email_prospect" },
    { text: "Acceptez-vous les CGU/CGV ?", options: ["Oui"], name: "Acceptation_CGU_CGV" }
  ];

  const feedbackQuestions = [
    { text: "Confirmez-vous ce devis ?", options: ["Oui", "Non", "Je souhaite être contacté par le service client"], name: "Response" },
    { text: "Avez-vous des commentaires ou des questions ?", options: [], type: "text", name: "Message" }
  ];

  function displayQuestion() {
    const questionSet = feedbackStage ? feedbackQuestions : questions;
    if (currentQuestion < questionSet.length) {
      const question = questionSet[currentQuestion];
      displayChatMessage(question.text, 'incoming');
      const inputArea = document.querySelector('.chat-input');
      inputArea.innerHTML = '';

      if (question.options.length > 0) {
        question.options.forEach(option => {
          const button = document.createElement('button');
          button.textContent = option;
          button.classList.add('option-button', 'btn', 'btn-primary', 'm-1'); // Apply custom button class
          button.addEventListener('click', () => {
            answers[question.name] = option;
            displayChatMessage(option, 'outgoing');
            inputArea.innerHTML = ''; // Clear options after selection
            setTimeout(nextQuestion, 1000);
          });
          inputArea.appendChild(button);
        });
      } else {
        const input = document.createElement('input');
        input.type = question.type;
        input.name = question.name;
        input.classList.add('form-control', 'mb-2');
        input.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            answers[question.name] = input.value;
            displayChatMessage(input.value, 'outgoing');
            inputArea.innerHTML = ''; // Clear input after submission
            setTimeout(nextQuestion, 1000);
          }
        });
        inputArea.appendChild(input);
        input.focus();
      }
    } else {
      if (feedbackStage) {
        handleFeedbackResponse();
      } else {
        displayChatMessage('Merci, votre demande a bien été prise en compte et vous allez recevoir le devis par mail sous peu.', 'incoming');
        sendFormData();
      }
    }
  }

  function displayChatMessage(message, sender) {
    const chatMessage = document.createElement('li');
    chatMessage.classList.add('chat', sender);
    chatMessage.innerHTML = `<p>${message}</p>`;
    chatList.appendChild(chatMessage);
    chatList.scrollTo(0, chatList.scrollHeight);
    saveState();
  }

  function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questions.length) {
      const prevQuestion = questions[currentQuestion - 1];
      let message;
      switch (prevQuestion.name) {
        case 'typeVoyage':
          message = `D'accord, vous souhaitez un voyage ${answers.typeVoyage}.`;
          break;
        case 'Nombre_participants':
          message = `Vous serez ${answers.Nombre_participants} participants.`;
          break;
        case 'Lieu_depart':
          message = `Vous partirez de ${answers.Lieu_depart}.`;
          break;
        case 'Lieu_arrivee':
          message = `Votre destination est ${answers.Lieu_arrivee}.`;
          break;
        case 'Date_aller':
          message = `Votre départ est prévu pour le ${answers.Date_aller}.`;
          break;
        case 'Horaire_aller':
          message = `L'heure de départ est ${answers.Horaire_aller}.`;
          break;
        case 'Date_retour':
          message = `Votre retour est prévu pour le ${answers.Date_retour}.`;
          break;
        case 'Horaire_retour':
          message = `L'heure de retour est ${answers.Horaire_retour}.`;
          break;
        case 'Nom_prospect':
          message = `Enchanté, ${answers.Nom_prospect}.`;
          break;
        case 'Prenom_prospect':
          message = `Votre prénom est ${answers.Prenom_prospect}.`;
          break;
        case 'Telephone_prospect':
          message = `Votre numéro de téléphone est ${answers.Telephone_prospect}.`;
          break;
        case 'Email_prospect':
          message = `Votre email est ${answers.Email_prospect}.`;
          break;
        case 'Acceptation_CGU_CGV':
          message = `Merci d'avoir accepté les CGU/CGV.`;
          break;
      }
      if (message) {
        displayChatMessage(message, 'incoming');
        setTimeout(displayQuestion, 1500); 
      } else {
        displayQuestion();
      }
    } else {
      displayQuestion();
    }
  }

  async function sendFormData() {
    console.log('Sending data:', answers);

    try {
      // Envoyer les données au webhook Make
      const response = await fetch('https://hook.eu2.make.com/lsrq8dbxlc6m5ow7u6j0xuj9mc9wjwb1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(answers)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      console.log('Data sent to Make webhook successfully');

      // Attendre 20 secondes avant de traiter la réponse
      await new Promise(resolve => setTimeout(resolve, 20000));

      // Récupérer le lien PDF depuis Airtable
      const pdfLink = await fetchLatestPDFLink();

      // Afficher le lien PDF dans le chatbot sous forme de lien cliquable
      const message = `Voici le lien PDF de votre devis : <a href="${pdfLink}" target="_blank">Télécharger le PDF</a>`;
      displayChatMessage(message, 'incoming');
      feedbackStage = true;
      currentQuestion = 0;
      answers.pdfLink = pdfLink; // Save PDF link to answers
      setTimeout(displayQuestion, 2000); // Start feedback questions after a short delay
    } catch (error) {
      console.error('Error:', error);
      displayChatMessage('Une erreur est survenue lors de la récupération du lien PDF : ' + error.message, 'incoming');
    }
  }

  async function handleFeedbackResponse() {
    const response = answers.Response;
    switch(response) {
      case "Oui":
        displayChatMessage("Merci pour votre confirmation. Nous allons procéder avec votre devis.", 'incoming');
        break;
      case "Non":
        displayChatMessage("Merci pour votre réponse. Si vous souhaitez refaire un devis, n'hésitez pas à nous contacter. Bonne journée !", 'incoming');
        break;
      case "Je souhaite être contacté par le service client":
        displayChatMessage("Un membre de notre équipe de service client vous contactera bientôt.", 'incoming');
        break;
    }
    sendFeedbackData();
  }

  async function sendFeedbackData() {
    const baseId = 'appthL0hSj4SWDLen';
    const tableId = 'rep_client';
    const apiKey = 'patXHHaHw1tWrSej2.f1b2423b9f4e7bbb7bb4aa62e82b8daf0cf95a66c3c5ab93c321d22a0c65f05f';

    const feedbackData = {
      fields: {
        ClientName: `${answers.Nom_prospect} ${answers.Prenom_prospect}`,
        Response: answers.Response,
        Email: answers.Email_prospect,
        Phone: answers.Telephone_prospect,
        Message: answers.Message
      }
    };

    const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error data:', errorData); // Log the error data for further inspection
        throw new Error(`Failed to save feedback to Airtable: ${response.statusText}`);
      }

      console.log('Feedback data saved to Airtable successfully');
      displayChatMessage('Merci pour votre retour, nous vous souhaitons une agréable journée.', 'incoming');
    } catch (error) {
      console.error('Error:', error);
      displayChatMessage('Une erreur est survenue lors de l\'enregistrement de votre réponse : ' + error.message, 'incoming');
    }
  }

  async function fetchLatestPDFLink() {
    const baseId = 'appthL0hSj4SWDLen';
    const tableId = 'tbl8rZfGyfaM9uDoL';
    const apiKey = 'patXHHaHw1tWrSej2.f1b2423b9f4e7bbb7bb4aa62e82b8daf0cf95a66c3c5ab93c321d22a0c65f05f';

    const url = `https://api.airtable.com/v0/${baseId}/${tableId}?fields[]=LienPDF`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error data:', errorData); // Log the error data for further inspection
        throw new Error(`Failed to fetch PDF link from Airtable: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Data received:', data);

      if (data.records.length === 0) {
        throw new Error('No records found');
      }

      // Take the last record
      const pdfLink = data.records[data.records.length - 1].fields.LienPDF;
      return pdfLink;
    } catch (error) {
      console.error('Error fetching PDF link:', error);
      throw error;
    }
  }

  sendBtn.addEventListener('click', () => {
    const input = userInput.value.trim();
    if (input) {
      const questionSet = feedbackStage ? feedbackQuestions : questions;
      answers[questionSet[currentQuestion].name] = input;
      displayChatMessage(input, 'outgoing');
      userInput.value = '';
      setTimeout(nextQuestion, 1000);
    }
  });

  userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && userInput.value.trim()) {
      sendBtn.click();
    }
  });

  loadState();
});
