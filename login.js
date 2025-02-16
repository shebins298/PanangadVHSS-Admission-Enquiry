// login.js
document.getElementById("googleSignInBtn").addEventListener("click", async function () {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;
    
    // Reference to the user's document in the "user" collection
    const userRef = db.collection("user").doc(user.uid);
    const doc = await userRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      if (data.admin === true) {
        // Admin user: Redirect to admin panel.
        window.location.href = "admin.html";
      } else {
        // Not an admin: Show pending message.
        document.getElementById("message").innerText = "Your login request is sent to admin.";
        await firebase.auth().signOut();
      }
    } else {
      // First time login: add user document with pending status.
      await userRef.set({
        email: user.email,
        displayName: user.displayName,
        admin: false,
        status: "pending"
      });
      document.getElementById("message").innerText = "Your login request is sent to admin.";
      await firebase.auth().signOut();
    }
  } catch (error) {
    console.error("Error during sign in:", error);
    document.getElementById("message").innerText = "Error during sign in. Please try again.";
  }
});
