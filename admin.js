// admin.js

// Ensure that only authenticated admin users can access this page.
firebase.auth().onAuthStateChanged(async function (user) {
  if (user) {
    // Check if the logged-in user is an admin
    const userRef = db.collection("user").doc(user.uid);
    const doc = await userRef.get();
    if (!doc.exists || doc.data().admin !== true) {
      // Not an admin: sign out and redirect back to login.
      await firebase.auth().signOut();
      window.location.href = "login.html";
    } else {
      // If the user is an admin, fetch the enquiries.
      fetchEnquiries();
    }
  } else {
    // No user logged in, redirect to login.
    window.location.href = "login.html";
  }
});

// Sign out button functionality
document.getElementById("signOutBtn").addEventListener("click", async function () {
  await firebase.auth().signOut();
  window.location.href = "login.html";
});

// Function to fetch and display enquiries data
function fetchEnquiries() {
  // Listen for real-time updates on the enquiries collection,
  // ordering by timestamp (latest first)
  db.collection("enquiries").orderBy("timestamp", "desc")
    .onSnapshot((snapshot) => {
      const tableBody = document.querySelector("#enquiriesTable tbody");
      tableBody.innerHTML = ""; // Clear existing rows

      snapshot.forEach(doc => {
        const enquiry = doc.data();
        // Format the timestamp if it exists
        let timeStr = "";
        if (enquiry.timestamp) {
          const date = enquiry.timestamp.toDate();
          timeStr = date.toLocaleString();
        }

        // Create a table row for this enquiry
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
    }, (error) => {
      console.error("Error fetching enquiries: ", error);
    });
}
