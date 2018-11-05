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
// Listens for new messages added to /users/:uid/connections and creates a
// similar connection of the message to /users/:fid/connections
exports.addCorrespondingConnection = functions.database.ref('/users/{uid}/connections/{fid}')
    .onCreate((snapshot, context) => {

      // Grab the current value of what was written to the Realtime Database.
      var key;
      var fid;

      key = snapshot.key;
      fid = snapshot.child("fid").val();

      var ref = admin.database().ref("users/" + fid + "/connections/" + key);
      let add_ref = ref.set({
        fid: context.params.uid,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      }).then(function() {
        console.log('Adding sequel connection: ', fid + " --> " + context.params.uid);
        return true
      })
      .catch(function(error) {
        console.log("Error adding fid key from database: ", key);
        console.log('Error adding db data:', error);
        return false
      });

      return add_ref;
    });

// When user removes a connection, the connection should remove user too
// Listens for deleted messages added to /users/:uid/connections and deletes the
// similar connection of the message to /users/:fid/connections
exports.deleteCorrespondingConnection = functions.database.ref('/users/{uid}/connections/{fid}')
    .onDelete((snapshot, context) => {
      
      // Grab the current value of what was written to the Realtime Database.
      var key;
      var fid;

      key = snapshot.key;
      fid = snapshot.child("fid").val();

      console.log('Deleting sequel connection: ', fid + " --> " + context.params.uid);

      let del_ref = admin.database().ref("users/" + fid + "/connections/" + key);
      del_ref.remove().then(function() {
        console.log("fid connection ref deletion from database complete: ", key);
        return true
      })
      .catch(function(error) {
        console.log("Error deleting fid key from database: ", key);
        console.log('Error deleting db data:', error);
        return false
      });

      return del_ref;
    });

// When user blocks a connection, the user should be added to the blocked by list of connection
// Listens for messages added to /users/:uid/blocked and adds the
// similar connection of the message to /users/:fid/blockedby
exports.blockedByConnection = functions.database.ref('/users/{uid}/blocked/{conn}')
    .onCreate((snapshot, context) => {
      
      // Grab the current value of what was written to the Realtime Database.
      var key;
      var fid;

      key = snapshot.key;
      fid = snapshot.child("fid").val();

      console.log('Blocking sequel connection: ', fid + " --> " + context.params.uid);

      let add_ref = admin.database().ref("users/" + fid + "/blockedby/" + key);
      add_ref.set({
        fid: context.params.uid,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      }).then(function() {
        console.log('Blocking sequel connection: ', fid + " --> " + context.params.uid);
        return true
      })
      .catch(function(error) {
        console.log("Error blocking fid key from database: ", key);
        console.log('Error blocking db data:', error);
        return false
      });

      return add_ref;
    });

// When user unblocks a connection, the user should be removed from blocked by list of connection
// Listens for messages added to /users/:uid/blocked and removed the
// similar connection of the message from /users/:fid/blockedby
exports.clearBlockedByConnection = functions.database.ref('/users/{uid}/blocked/{conn}')
    .onDelete((snapshot, context) => {
      
      // Grab the current value of what was written to the Realtime Database.
      var key;
      var fid;

      key = snapshot.key;
      fid = snapshot.child("fid").val();

      console.log('unBlocking sequel connection: ', fid + " --> " + context.params.uid);

      let del_ref = admin.database().ref("users/" + fid + "/blockedby/" + key);
      del_ref.remove().then(function() {
        console.log("fid unblock ref deletion from database complete: ", key);
        return true
      })
      .catch(function(error) {
        console.log("Error deleting fid key from database: ", key);
        console.log('Error deleting db data:', error);
        return false
      });

      return del_ref;
    });


// When user provides location access to a connection, the location should be added to the LocAccess list of connection
// Listens for messages added to /users/:uid/locAccess/:aid and adds the
// similar connection of the message to /users/:fid/LocAccess
exports.accessByConnection = functions.database.ref('/users/{uid}/addresses/{lid}/accessTo/{aid}')
.onCreate((snapshot, context) => {
  
  // Grab the current value of what was written to the Realtime Database.
  var key;
  var fid;
  var lid;

  key = snapshot.key;
  fid = snapshot.child("fid").val();
  lid = snapshot.ref.parent.parent.key;

  console.log('Adding sequel access right: ', fid + " --> " + context.params.uid + " --> " + lid);

  let add_ref = admin.database().ref("users/" + fid + "/locAccess/" + key);
  add_ref.set({
    fid: context.params.uid,
    lid: lid,
    timestamp: admin.database.ServerValue.TIMESTAMP,
  }).then(function() {
    console.log('Sequel access right added: ', fid + " --> " + context.params.uid + " --> " + lid);
    return true
  })
  .catch(function(error) {
    console.log("Error adding sequel access right: ", key);
    console.log('Error adding sequel access right:', error);
    return false
  });

  return add_ref;
});

// When user blocks an address access to a connection, the address should be removed from AccessTo list of connection
// Listens for messages added to /users/:uid/addresses/:lid/accessTo and remove the
// similar connection from /users/:fid/locAccess
exports.revokeLocationAccess = functions.database.ref('/users/{uid}/addresses/{lid}/accessTo/{aid}')
    .onDelete((snapshot, context) => {
      
      // Grab the current value of what was written to the Realtime Database.
      var key;
      var fid;
      var lid;
      
      key = snapshot.key;
      fid = snapshot.child("fid").val();
      lid = snapshot.ref.parent.parent.key;
      
      console.log('Removing sequel access right: ', fid + " --> " + context.params.uid + " --> " + lid);

      let del_ref = admin.database().ref("users/" + fid + "/locAccess/" + key);
      del_ref.remove().then(function() {
        console.log("fid deletion from locAccess complete: ", key);
        return true
      })
      .catch(function(error) {
        console.log("Error deleting loc key from database: ", key);
        console.log('Error deleting db data:', error);
        return false
      });

      return del_ref;
    });
