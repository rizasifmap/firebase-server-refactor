// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

// On Deleting User Delete the DB Node
exports.deleteUserDbNode = functions.auth.user().onDelete((user) => {
    console.log("Deletion request received, will delete uid from database and storage: ", user.uid);

    let del_img_ref = admin.storage().bucket().file("images/img_" + user.uid + ".jpg");
    del_img_ref.delete().then(function() {
      console.log("Uid deletion from storage complete: ", user.uid);
      return true
    })
    .catch(function(error) {
      console.log("Error deleting uid from storage: ", user.uid);
      console.log('Error deleting storage data:', error);
      return false
    });


    let del_ref = admin.database().ref("users/" + user.uid);
    del_ref.remove().then(function() {
        console.log("Uid deletion from database complete: ", user.uid);
        return true
      })
      .catch(function(error) {
        console.log("Error deleting uid from database: ", user.uid);
        console.log('Error deleting db data:', error);
        return false
      });

    return del_ref;
});

// When user adds a connection, the connection should add user too
// Listens for new messages added to /connections/:uid/connections and creates a
// similar connection of the message to /connections/:fid/connections
exports.addCorrespondingConnection = functions.database.ref('/messages/{uid}/connections')
    .onCreate((snapshot, context) => {
      // Grab the current value of what was written to the Realtime Database.
      const original = snapshot.val();
      console.log('Adding sequel connection', context.params.uid, original);

      // return snapshot.ref.parent.child('uppercase').set(uppercase);
      return true;
    });