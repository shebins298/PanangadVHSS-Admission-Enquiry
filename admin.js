// admin.js

firebase.auth().onAuthStateChanged(async function (user) {
  if (user) {
    console.log("User is logged in:", user.uid);
    // Check if the logged in user is an admin
    const userRef = db.collection("user").doc(user.uid);
    const doc = await userRef.get();
    if (!doc.exists || doc.data().admin !== true) {
      console.warn("User is not an admin or admin data missing:", doc.data());
      await firebase.auth().signOut();
      window.location.href = "login.html";
    } else {
      console.log("User is admin. Fetching enquiries...");
      fetchEnquiries();
    }
  } else {
    console.warn("No user logged in.");
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
  // Use ordering if you are sure every document has a timestamp
  const enquiriesQuery = db.collection("enquiries").orderBy("timestamp", "desc");
  
  // If ordering is an issue (e.g., some docs missing timestamp), you can use:
  // const enquiriesQuery = db.collection("enquiries");

  enquiriesQuery.onSnapshot((snapshot) => {
    console.log("Snapshot received. Document count:", snapshot.size);
    const tableBody = document.querySelector("#enquiriesTable tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    if (snapshot.empty) {
      console.log("No enquiries found.");
      tableBody.innerHTML = "<tr><td colspan='5'>No enquiries found.</td></tr>";
    } else {
      snapshot.forEach(doc => {
        const enquiry = doc.data();
        console.log("Enquiry doc:", enquiry); // Debug each document

        // Format the timestamp if it exists
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
  }, (error) => {
    console.error("Error fetching enquiries: ", error);
  });
}
