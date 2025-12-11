document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants list HTML
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `<div class="participants-section"><strong>Participants:</strong><ul class="participants-list" id="participants-list-${name}"></ul></div>`;
        } else {
          participantsHTML = `<div class="participants-section"><strong>Participants:</strong><p class="no-participants">No participants yet.</p></div>`;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Render participants with delete icon if any
        if (details.participants.length > 0) {
          const ul = activityCard.querySelector(`#participants-list-${name}`);
          details.participants.forEach((email, idx) => {
            const li = document.createElement('li');
            li.className = 'participant-row';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = email;
            li.appendChild(nameSpan);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-icon';
            deleteBtn.innerHTML = '&#128465;'; // trash icon
            deleteBtn.title = 'Unregister participant';
            deleteBtn.onclick = async () => {
              await unregisterParticipant(name, email);
            };
            li.appendChild(deleteBtn);

            ul.appendChild(li);
          });
        }

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Immediately refresh activities list so UI updates
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Unregister participant function
  async function unregisterParticipant(activityName, email) {
    try {
      const response = await fetch(`/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`, {
        method: "POST"
      });
      if (response.ok) {
        fetchActivities();
      } else {
        alert("Failed to unregister participant.");
      }
    } catch (error) {
      alert("Error unregistering participant.");
    }
  }

  // Initialize app
  fetchActivities();
});
