document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Send email
  document.querySelector('#compose-form').addEventListener('submit', post_mail);
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = ''; 

}

function post_mail() {

  const recipients = document.querySelector('#compose-recipients').value
  const subject = document.querySelector('#compose-subject').value
  const body = document.querySelector('#compose-body').value
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
  
  return false
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load recieved mails
  if (mailbox === 'inbox') {
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);
      emails.forEach(email =>{
          const element = document.createElement('div');
          element.classList.add('email');
          element.id = email.id
          const body = document.createElement('div');
          body.classList.add('body')
          body.innerHTML = email.body
          document.querySelector('#emails-view').append(element);
          document.querySelector('#emails-view').append(body);
          const sender = document.createElement('span');
          sender.classList.add('sender');
          const subject = document.createElement('span');
          subject.classList.add('subject');
          const timestamp = document.createElement('span');
          timestamp.classList.add('timestamp');
          sender.innerHTML = email.sender
          subject.innerHTML = email.subject
          timestamp.innerHTML = email.timestamp
          document.getElementById(element.id).appendChild(sender);
          document.getElementById(element.id).appendChild(subject);
          document.getElementById(element.id).appendChild(timestamp);
      })})
  }
}

