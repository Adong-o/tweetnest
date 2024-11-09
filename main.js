// Tab Functionality
const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.content');
let calendar;
let scheduledTweets = [];

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs and contents
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    // Add active class to clicked tab and corresponding content
    tab.classList.add('active');
    const contentId = tab.dataset.tab;
    document.getElementById(contentId).classList.add('active');

    // Initialize calendar if calendar tab is selected
    if (contentId === 'calendar' && !calendar) {
      initializeCalendar();
    }
  });
});

// Calendar Initialization
function initializeCalendar() {
  const calendarEl = document.getElementById('calendar-container');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: scheduledTweets.map(tweet => ({
      title: tweet.text.substring(0, 30) + '...',
      start: tweet.time,
      allDay: false
    })),
    eventClick: function(info) {
      alert(`Tweet: ${info.event.title}\nTime: ${info.event.start}`);
    }
  });
  calendar.render();
}

// Modal Functionality
const modal = document.getElementById('tweet-modal');
const addTweetButtons = document.querySelectorAll('.add-tweet-btn');
const closeBtn = document.querySelector('.close-btn');
const tweetForm = document.getElementById('tweet-form');

// Show modal when "Schedule Tweet" is clicked
addTweetButtons.forEach(button => {
  button.addEventListener('click', () => {
    modal.style.display = 'block';
    const timeSlot = button.previousElementSibling.textContent;
    const tweetTime = document.getElementById('tweet-time');
    const now = new Date();
    const [hours, minutes] = timeSlot.split(':');
    now.setHours(
      timeSlot.includes('PM') ? parseInt(hours) + 12 : parseInt(hours),
      parseInt(minutes)
    );
    tweetTime.value = now.toISOString().slice(0, 16);
  });
});

// Close modal when 'x' is clicked
closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  tweetForm.reset();
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    tweetForm.reset();
  }
});

// Handle tweet form submission
tweetForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const tweetText = document.querySelector('.tweet-textarea').value;
  const tweetTime = document.getElementById('tweet-time').value;
  const tweetImage = document.getElementById('tweet-image').files[0];

  if (!tweetText || !tweetTime) {
    alert('Please fill in all required fields');
    return;
  }

  const newTweet = {
    id: Date.now(),
    text: tweetText,
    time: new Date(tweetTime),
    image: tweetImage ? URL.createObjectURL(tweetImage) : null
  };

  scheduledTweets.push(newTweet);
  updateUI(newTweet);
  
  // Close and reset form
  modal.style.display = 'none';
  tweetForm.reset();
});

// Update UI after scheduling tweet
function updateUI(newTweet) {
  // Update total tweets count
  const totalTweetsElement = document.getElementById('total-tweets');
  totalTweetsElement.textContent = scheduledTweets.length;

  // Update calendar if it exists
  if (calendar) {
    calendar.addEvent({
      title: newTweet.text.substring(0, 30) + '...',
      start: newTweet.time,
      allDay: false
    });
  }

  // Add tweet to schedule view
  const scheduleContainer = document.querySelector('.schedule-container');
  const timeSlots = Array.from(scheduleContainer.children);
  
  // Find appropriate time slot
  const tweetHour = newTweet.time.getHours();
  const tweetMinutes = newTweet.time.getMinutes();
  
  timeSlots.forEach(slot => {
    const slotTime = slot.querySelector('.time').textContent;
    const [slotHours, slotMinutes] = slotTime.split(':').map(num => parseInt(num));
    
    if (slotHours === tweetHour && slotMinutes === tweetMinutes) {
      const button = slot.querySelector('.add-tweet-btn');
      button.textContent = 'Tweet Scheduled';
      button.style.backgroundColor = '#34B233';
      button.disabled = true;
    }
  });
}

// Connect X Account button functionality
const connectBtn = document.querySelector('.connect-btn');
connectBtn.addEventListener('click', () => {
  // This would typically integrate with Twitter's OAuth
  alert('This would connect to your Twitter account using OAuth');
});

// Add textarea character count
const tweetTextarea = document.querySelector('.tweet-textarea');
tweetTextarea.addEventListener('input', function() {
  const maxLength = this.getAttribute('maxlength');
  const currentLength = this.value.length;
  
  if (currentLength > maxLength - 20) {
    this.style.color = currentLength >= maxLength ? 'red' : 'orange';
  } else {
    this.style.color = 'inherit';
  }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  // Set default time input to next available slot
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  document.getElementById('tweet-time').value = now.toISOString().slice(0, 16);
  
  // Initialize calendar if it's the active tab
  if (document.querySelector('[data-tab="calendar"]').classList.contains('active')) {
    initializeCalendar();
  }
});