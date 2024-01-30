// Inside userUtils.ts
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

// Function to get a list of users
export const getUsers = async () => {
  const usersCollection = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCollection);
  return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
