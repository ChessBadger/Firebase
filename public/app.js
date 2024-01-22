import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-storage.js';

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

document.getElementById('uploadButton').addEventListener('click', function () {
  // Get the file
  const file = document.getElementById('imageInput').files[0];
  if (!file) {
    alert('Please select a file.');
    return;
  }

  const storageRef = ref(storage, 'images/' + file.name);

  // Upload file
  const uploadTask = uploadBytesResumable(storageRef, file);

  // Update progress
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
      });
    }
  );
});
