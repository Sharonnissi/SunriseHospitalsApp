const appointmentForm = document.getElementById('appointmentForm');
const showFormBtn = document.getElementById('showFormBtn');
const popupModal = document.getElementById('popupModal');
const closeBtn = document.getElementById('closeBtn');
const timeInput = document.getElementById('time');

// Show popup modal
function showPopup(message) {
  popupModal.querySelector('p').innerText = message;
  popupModal.style.display = "block";
}

// Close modal when X clicked
closeBtn.onclick = () => popupModal.style.display = "none";

// Close modal if click outside
window.onclick = (event) => {
  if (event.target === popupModal) popupModal.style.display = "none";
}

// Show form only when "Book Now" clicked
showFormBtn.addEventListener('click', () => {
  appointmentForm.style.display = 'flex';
  showFormBtn.style.display = 'none';
});

// 🔹 Time slots configuration
const availableTimes = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30"
];

// Populate time dropdown
function populateTimeOptions(disabledTimes=[]) {
  timeInput.innerHTML = ''; // clear previous options
  availableTimes.forEach(time => {
    const option = document.createElement('option');
    option.value = time;
    option.text = time;
    if(disabledTimes.includes(time)) option.disabled = true; // disable booked
    timeInput.appendChild(option);
  });
}

// Initialize all time options on page load
populateTimeOptions();

// 🔹 Update time slots when date changes
document.getElementById('date').addEventListener('change', async function() {
  const date = this.value;

  try {
    const response = await fetch("http://localhost:5000/appointments");
    const appointments = await response.json();

    // Get booked times for the selected date
    const bookedTimes = appointments
      .filter(a => a.date === date)
      .map(a => a.time);

    // Re-populate time options disabling booked slots
    populateTimeOptions(bookedTimes);

  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
});

// Handle form submission
appointmentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;

  try {
    const response = await fetch("http://localhost:5000/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, date, time })
    });

    const data = await response.json();

    if (response.ok) {
      showPopup(data.message);
      // Refresh time slots to disable newly booked time
      const res = await fetch("http://localhost:5000/appointments");
      const appointments = await res.json();
      const bookedTimes = appointments.filter(a => a.date === date).map(a => a.time);
      populateTimeOptions(bookedTimes);
    } else {
      showPopup("❌ " + data.message);
    }
  } catch (error) {
    showPopup("⚠️ Server error. Try again.");
    console.error(error);
  }

  appointmentForm.reset();
});


