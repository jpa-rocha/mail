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

  // Add event listener for archive
  var emailid = document.querySelector('#email-id');
  document.querySelector('#archive').addEventListener('click', () => archive_mail(emailid));

  // Add event listener for reply
  document.querySelector('#reply').addEventListener('click', () => reply_email(emailid));
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-email').style.display = 'none';


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
  load_mailbox('sent');
  return false
}


function load_mailbox(mailbox) {

  // Load mails 
  mail_sort(mailbox)

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function mail_sort(mailbox) {

  // Appropriate mailbox is inputed
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // Print emails
    emails.forEach(email =>{

        // Create container assign class and id
        const element = document.createElement('div');
        element.classList.add('email');
        element.id = email.id

        // Create header and assign class
        const header = document.createElement('div');
        header.classList.add('header')
        header.classList.add(email.id)

        // Append email container to email-view
        document.querySelector('#emails-view').append(element);

        // Append header to email container
        document.getElementById(`${email.id}`).append(header);

        // Create span for sender, assign innerHTML and add class to it 
        const sender = document.createElement('span');
        sender.classList.add('sender');
        sender.innerHTML = email.sender

        // Create span for subject, assign innerHTML and add class to it
        const subject = document.createElement('span');
        subject.classList.add('subject');
        subject.innerHTML = email.subject

        // Create span for timestamp, assign innerHTML and add class to it
        const timestamp = document.createElement('span');
        timestamp.classList.add('timestamp');
        timestamp.innerHTML = email.timestamp

        // Append created elements to header as children
        document.getElementsByClassName(`header ${email.id}`)[0].appendChild(sender);
        document.getElementsByClassName(`header ${email.id}`)[0].appendChild(subject);
        document.getElementsByClassName(`header ${email.id}`)[0].appendChild(timestamp);

        // Check if email is read - if not alter background color
        const read = email.read
        if (read === false) {
          document.getElementsByClassName(`header ${email.id}`)[0].style.background = 'lightgrey'
        }
        document.getElementById(`${email.id}`).addEventListener('click', function(){
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read : true
            })
          })
          open_email(email.id)
        })
    })})
}

function open_email(id) {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#read-email').style.display = 'block';

    // Fetch the single email clicked
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {

        // Fill the fields that with the corresponding information
        id = document.getElementById('email-id');
        id.innerHTML = email.id
        sender = document.getElementById('sender');
        sender.innerHTML = email.sender;
        sender = document.getElementById('recipient');
        sender.innerHTML = email.recipients;
        subject = document.getElementById('subject');
        subject.innerHTML = email.subject;
        timestamp = document.getElementById('timestamp');
        timestamp.innerHTML = email.timestamp;
        body = document.getElementById('email-body');
        body.innerHTML = email.body
        archive = document.querySelector('#archive');
        reply = document.querySelector('#reply');
        user = document.querySelector('#useremail');
        archivestatus = email.archived;

        // Sets archive button to "Archive" or "Unarchive"
        if (archivestatus === true) {
          archive.innerHTML = 'Unarchive'
        }
        else {
          archive.innerHTML = 'Archive'
        }

        // Hides reply and archive buttons if email is in the sent category
        if (useremail.textContent !== email.sender){
          reply.style.display = 'inline-block';
          archive.style.display = 'inline-block';
        }
        else if (email.recipients.includes(email.sender)) {
          reply.style.display = 'inline-block';
          archive.style.display = 'inline-block';
        }
        else {
          reply.style.display = 'none';
          archive.style.display = 'none';
        }
});
}

function archive_mail(id) {

  // Get email id
  emailid = parseInt(id.innerHTML);

  // Check if archive button value is Archive or Unarchive
  archive = document.querySelector('#archive');
  if (archive.innerHTML === 'Archive'){
    
    // If email is unarchived set archived to true
    fetch(`/emails/${emailid}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived : true
      })
    })
  }
  else {

    // If email is archived set archived to false
    fetch(`/emails/${emailid}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived : false
      })
    })  
  }

  // Load inbox
  load_mailbox('inbox');
}

function reply_email(id) {
  emailid = parseInt(id.innerHTML);
  fetch(`/emails/${emailid}`)
    .then(response => response.json())
    .then(email => {
      const recipient = email.sender;
      const subject = email.subject;
      const body = email.body;
      const timestamp = email.timestamp;
      if (subject.slice(0,2) === 'Re:'){
        document.querySelector('#compose-recipients').value = recipient;
        document.querySelector('#compose-subject').value = subject;
        document.querySelector('#compose-body').value = `On ${timestamp}, ${recipient} wrote: 
        ${body}`; 
      }
      else{
        document.querySelector('#compose-recipients').value = recipient;
        document.querySelector('#compose-subject').value = `Re: ${subject}`;
        document.querySelector('#compose-body').value = `On ${timestamp}, ${recipient} wrote: 
        "${body}"`; 
      }
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';
      document.querySelector('#read-email').style.display = 'none';
    });
}

