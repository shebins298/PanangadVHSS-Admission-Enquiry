// admin.js

// Ensure that only authenticated admin users can access this page.
firebase.auth().onAuthStateChanged(async function (user) {
  if (user) {
    // Check if the logged in user is an admin
    const userRef = db.collection("user").doc(user.uid);
    const doc = await userRef.get();
    if (!doc.exists || doc.data().admin !== true) {
      // Not an admin: sign out and redirect back to login.
      await firebase.auth().signOut();
      window.location.href = "login.html";
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
