// Steps to complete:

// 1. Create Firebase link
// 2. Create initial train data in database
// 3. Create button for adding new trains - then update the html + update the database
// 4. Create a way to retrieve trains from the trainlist.
// 5. Create a way to calculate the time way. Using difference between start and current time.
//    Then take the difference and modulus by frequency. (This step can be completed in either 3 or 4)

// Set up the firebase configuration settings
var config = {
  apiKey: "AIzaSyCcPFcbAjIsgXGQwE-A3AcOXkeD40qypE8",
  authDomain: "train-times-93583.firebaseapp.com",
  databaseURL: "https://train-times-93583.firebaseio.com",
  storageBucket: "train-times-93583.appspot.com"
};

// Initialize Firebase
firebase.initializeApp(config);

// Grab and store the database object from firebase
var trainData = firebase.database();

// 2. Populate Firebase Database with initial data (in this case, I did this via Firebase GUI)
// 3. Button for adding trains
$("#add-train-btn").on("click", function(event) {
  // Prevent the default form submit behavior
  event.preventDefault();

  // Grabs user input and trims extra whitespaces off from the beginning and end of the string before storage
  var trainName = $("#train-name-input")
    .val()
    .trim();
  var destination = $("#destination-input")
    .val()
    .trim();
  var firstTrain = $("#first-train-input")
    .val()
    .trim();
  var frequency = $("#frequency-input")
    .val()
    .trim();

  // Creates local "temporary" object for holding train data
  var newTrain = {
    name: trainName, // Name of train
    destination: destination, // Where the train is going
    firstTrain: firstTrain, // Time of arrival for the first train
    frequency: frequency // Frequency in minutes between train arrivals
  };

  // Uploads train data to the database at the root level
  trainData.ref().push(newTrain);

  // Logs everything to console
  console.log(newTrain.name);
  console.log(newTrain.destination);
  console.log(newTrain.firstTrain);
  console.log(newTrain.frequency);

  // Alert
  alert("Train successfully added");

  // Clears all of the text-boxes
  $("#train-name-input").val("");
  $("#destination-input").val("");
  $("#first-train-input").val("");
  $("#frequency-input").val("");
});

// 4. Create Firebase event for adding trains to the database and a row in the html when a user adds an entry
trainData.ref().on("child_added", function(childSnapshot, prevChildKey) {
  console.log(childSnapshot.val());

  // Store all of the new train entry's data into variables.
  var tName = childSnapshot.val().name;
  var tDestination = childSnapshot.val().destination;
  var tFrequency = childSnapshot.val().frequency;
  var tFirstTrain = childSnapshot.val().firstTrain;

  // Split the first train's arrival time into hour and minute and store them in an array
  var timeArr = tFirstTrain.split(":");

  // Use the arrival time values to generate a 'moment' time representing that first train's arrival time
  var trainTime = moment()
    .hours(timeArr[0])
    .minutes(timeArr[1]);

  // Get the latest time between the first train's arrival time and the current time right now
  var maxMoment = moment.max(moment(), trainTime);

  // Declare variables (they are not initialized to anything yet and are undefined)
  var tMinutes;
  var tArrival;

  // If the first train is later than the current time, set arrival to the first train time
  if (maxMoment === trainTime) {
    tArrival = trainTime.format("hh:mm A"); // Format the arrival time in 12-hour format with am/pm tagged on at the end
    tMinutes = trainTime.diff(moment(), "minutes"); // Get the difference in minutes between the current time and the first train time
  }
  // If the current time is past the first train time
  else {
    // Calculate the minutes until arrival using hardcore math
    // To calculate the minutes till arrival, take the current time in unix subtract the FirstTrain time
    // and find the modulus between the difference and the frequency.
    var differenceTimes = moment().diff(trainTime, "minutes");
    var tRemainder = differenceTimes % tFrequency;
    tMinutes = tFrequency - tRemainder;
    // To calculate the arrival time, add the tMinutes to the current time
    tArrival = moment()
      .add(tMinutes, "m")
      .format("hh:mm A");
  }
  console.log("tMinutes:", tMinutes);
  console.log("tArrival:", tArrival);

  // Add each train's data into the train table's body as a new row
  $("#train-table > tbody").append(
    $("<tr>").append( // The new row
      $("<td>").text(tName), // Name column
      $("<td>").text(tDestination), // Display where the train is headed
      $("<td>").text(tFrequency), // Display frequency of train arrival in minutes
      $("<td>").text(tArrival), // Display the train's next arrival time
      $("<td>").text(tMinutes) // Display the number of minutes away the train currently is
    )
  );
});

// Assume the following situations.

// (TEST 1)
// First Train of the Day is 3:00 AM
// Assume Train comes every 3 minutes.
// Assume the current time is 3:16 AM....
// What time would the next train be...? ( Let's use our brains first)
// It would be 3:18 -- 2 minutes away

// (TEST 2)
// First Train of the Day is 3:00 AM
// Assume Train comes every 7 minutes.
// Assume the current time is 3:16 AM....
// What time would the next train be...? (Let's use our brains first)
// It would be 3:21 -- 5 minutes away

// ==========================================================

// Solved Mathematically
// Test case 1:
// 16 - 00 = 16
// 16 % 3 = 1 (Modulus is the remainder)
// 3 - 1 = 2 minutes away
// 2 + 3:16 = 3:18

// Solved Mathematically
// Test case 2:
// 16 - 00 = 16
// 16 % 7 = 2 (Modulus is the remainder)
// 7 - 2 = 5 minutes away
// 5 + 3:16 = 3:21
