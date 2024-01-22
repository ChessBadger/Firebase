import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-storage.js';
import { getDatabase, push, ref as dbRef, onValue, remove } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAhhF_fZ0N3W51VQE1HOIueKwuJxAatG8s',
  authDomain: 'memories-fd7ef.firebaseapp.com',
  projectId: 'memories-fd7ef',
  storageBucket: 'memories-fd7ef.appspot.com',
  messagingSenderId: '372216960941',
  appId: '1:372216960941:web:ddaf45f7febe05cef7b324',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = getStorage(app);
const database = getDatabase(app);

// Upload image and note
document.getElementById('uploadButton').addEventListener('click', async function () {
  const file = document.getElementById('imageInput').files[0];
  const note = document.getElementById('imageNote').value;
  const chosenDate = document.getElementById('imageDate').value; // Get the chosen date

  if (!file) {
    alert('Please select a file.');
    return;
  }

  const storageRef = ref(storage, 'images/' + file.name);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    'state_changed',
    (snapshot) => {
      const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + percentage + '% done');
    },
    (error) => {
      console.error('Upload failed:', error);
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        console.log('File available at', downloadURL);
        saveImageInfo(downloadURL, note, chosenDate);
      });
    }
  );
});

// Save image info to Realtime Database
function saveImageInfo(url, note, date) {
  const imageData = {
    imageUrl: url,
    note: note,
    date: date,
  };

  push(dbRef(database, 'images/'), imageData)
    .then(() => {
      console.log('Image info saved successfully');
    })
    .catch((error) => {
      console.error('Error saving image info: ', error);
    });
  // Refresh the page after successful upload and data save
  window.location.reload();
}

// Function to display images
function displayImages() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = ''; // Clear existing content

  const imagesRef = dbRef(database, 'images/');
  onValue(
    imagesRef,
    (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        const imageUrl = data.imageUrl;
        const note = data.note;
        const date = data.date;

        // Format the date to mm/dd/yyyy
        const formattedDate = formatDate(date);

        const dateElement = document.createElement('p');
        dateElement.textContent = `Date: ${formattedDate}`;

        // Create image element
        const imageElement = document.createElement('img');
        imageElement.src = imageUrl;
        imageElement.style.width = '100%'; // Adjust styling as needed

        // Create note element
        const noteElement = document.createElement('p');
        noteElement.textContent = note;

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteImage(childSnapshot.key, imageUrl);

        // Create container for image and note
        const container = document.createElement('div');
        container.className = 'image-card';
        container.appendChild(dateElement);
        container.appendChild(imageElement);
        container.appendChild(noteElement);
        container.appendChild(deleteButton);

        // Append to gallery
        gallery.appendChild(container);
      });
    },
    {
      onlyOnce: true,
    }
  );
}

// Function to format date to mm/dd/yyyy
function formatDate(dateString) {
  const date = new Date(dateString);
  const formatted = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
  return formatted;
}

// Function to delete image
function deleteImage(imageKey, imageUrl) {
  // Delete the image from Firebase Storage
  const imageRef = ref(storage, imageUrl);
  deleteObject(imageRef)
    .then(() => {
      console.log('Image deleted from storage');
    })
    .catch((error) => {
      console.error('Error deleting image from storage:', error);
    });

  // Delete the image metadata from Firebase Realtime Database
  const imageMetaRef = dbRef(database, 'images/' + imageKey);
  remove(imageMetaRef)
    .then(() => {
      console.log('Image metadata deleted from database');
      displayImages(); // Refresh the gallery
    })
    .catch((error) => {
      console.error('Error deleting image metadata:', error);
    });
}

// Call displayImages when the page loads
document.addEventListener('DOMContentLoaded', displayImages);
