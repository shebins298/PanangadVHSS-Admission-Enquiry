// admin.js

// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Store the original admin panel content
  const adminContainer = document.querySelector(".admin-container");
  const originalContent = adminContainer.innerHTML;

  // Replace the content with a loading indicator
  adminContainer.innerHTML = `
    <div style="margin-top:50px; text-align:center;">
      <h2>Loading Admin Panel...</h2>
    </div>
  `;

  // Listen for changes in authentication state
  firebase.auth().onAuthStateChanged(async function (user) {
    if (user) {
      console.log("User is logged in:", user.uid);
      // Check if the logged-in user is an admin
      const userRef = db.collection("user").doc(user.uid);
      try {
        const doc = await userRef.get();
        if (!doc.exists || doc.data().admin !== true) {
          console.warn("User is not an admin or admin data missing:", doc.data());
          await firebase.auth().signOut();
          window.location.href = "login.html";
        } else {
          console.log("User is admin. Restoring admin panel...");
          // Restore the original admin panel content
          adminContainer.innerHTML = originalContent;
          // Re-attach the sign out listener (since the DOM was replaced)
          attachSignOutListener();
          // Fetch and display enquiries data
          fetchEnquiries();
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        await firebase.auth().signOut();
        window.location.href = "login.html";
      }
    } else {
      console.warn("No user logged in.");
      window.location.href = "login.html";
    }
  });

  // Function to attach the sign out button listener
  function attachSignOutListener() {
    const signOutBtn = document.getElementById("signOutBtn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", async function () {
        await firebase.auth().signOut();
        window.location.href = "login.html";
      });
    }
  }

  // Function to fetch and display enquiries from Firestore
  function fetchEnquiries() {
    db.collection("enquiries")
      .orderBy("timestamp", "desc")
      .onSnapshot(
        (snapshot) => {
          console.log("Snapshot received. Document count:", snapshot.size);
          const tableBody = document.querySelector("#enquiriesTable tbody");
          tableBody.innerHTML = ""; // Clear any existing rows

          if (snapshot.empty) {
            console.log("No enquiries found.");
            tableBody.innerHTML = `<tr><td colspan="5">No enquiries found.</td></tr>`;
          } else {
            snapshot.forEach((doc) => {
              const enquiry = doc.data();
              console.log("Enquiry doc:", enquiry);
              let timeStr = "";
              if (enquiry.timestamp) {
                try {
                  const date = enquiry.timestamp.toDate();
                  timeStr = date.toLocaleString();
                } catch (err) {
                  console.error("Error formatting timestamp:", err);
                }
              }
              const row = `
                <tr>
                  <td>${enquiry.studentName || ""}</td>
                  <td>${enquiry.classApplying || ""}</td>
                  <td>${enquiry.parentName || ""}</td>
                  <td>${enquiry.phone || ""}</td>
                  <td>${timeStr}</td>
                </tr>
              `;
              tableBody.innerHTML += row;
            });
          }
        },
        (error) => {
          console.error("Error fetching enquiries:", error);
        }
      );
  }
});
