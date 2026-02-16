import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth"; // Added signOut import
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  increment,
} from "firebase/firestore";

// --- Types for our Data ---
export interface TopicStat {
  attempts: number;
  correct: number;
  accuracy: number;
}
export interface SubjectStat {
  attempts: number;
  correct: number;
  accuracy: number;
  topics: { [topicName: string]: TopicStat };
}
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  coins: number;
  stats: { [subjectName: string]: SubjectStat };
  testHistory: any[];
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  updateTestResults: (results: any) => Promise<void>;
  logout: () => Promise<void>; // <--- NEW: Added logout type
}

// Create the Context
const UserContext = createContext<UserContextType>({} as UserContextType);

// Custom Hook to use it easily
export const useUser = () => useContext(UserContext);

// The Provider Component
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen for Auth Changes (Login/Logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // User is logged in, fetch their profile
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // First time user? Create a fresh profile
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email!,
            displayName: currentUser.displayName || "Aspirant",
            coins: 100, // Sign up bonus
            stats: {},
            testHistory: [],
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        // User logged out
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 2. Function to update stats after a test
  const updateTestResults = async (results: {
    questions: any[];
    answers: any;
    coinsEarned: number;
  }) => {
    if (!user || !profile) return;

    const userRef = doc(db, "users", user.uid);
    let newStats = { ...profile.stats };
    let totalCorrect = 0;

    // Loop through every question in the test
    results.questions.forEach((q, idx) => {
      const isCorrect = results.answers[idx] === q.correct;
      if (isCorrect) totalCorrect++;
      const sub = q.subject;
      const topic = q.topic || "General";

      // Initialize subject/topic if it doesn't exist
      if (!newStats[sub])
        newStats[sub] = { attempts: 0, correct: 0, accuracy: 0, topics: {} };
      if (!newStats[sub].topics[topic])
        newStats[sub].topics[topic] = { attempts: 0, correct: 0, accuracy: 0 };

      // Update Topic Stats
      const tStat = newStats[sub].topics[topic];
      tStat.attempts++;
      if (isCorrect) tStat.correct++;
      tStat.accuracy = Math.round((tStat.correct / tStat.attempts) * 100);
    });

    // Update Subject Stats (Cumulative)
    Object.keys(newStats).forEach((subKey) => {
      const subject = newStats[subKey];
      // Average accuracy of all topics
      const topicAccuracies = Object.values(subject.topics).map(
        (t) => t.accuracy
      );
      if (topicAccuracies.length > 0) {
        const sum = topicAccuracies.reduce((a, b) => a + b, 0);
        subject.accuracy = Math.round(sum / topicAccuracies.length);
      }
    });

    // Write to Firebase
    await updateDoc(userRef, {
      stats: newStats,
      coins: increment(results.coinsEarned),
      testHistory: arrayUnion({
        date: new Date().toISOString(),
        score: totalCorrect * 2,
        totalQ: results.questions.length,
        subjects: Array.from(
          new Set(results.questions.map((q: any) => q.subject))
        ),
      }),
    });

    // Update local state instantly (so the UI updates without refresh)
    setProfile({
      ...profile,
      stats: newStats,
      coins: profile.coins + results.coinsEarned,
    });
  };

  // 3. LOGOUT FUNCTION (New Addition)
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  return (
    <UserContext.Provider value={{ user, profile, loading, updateTestResults, logout }}>
      {!loading && children}
    </UserContext.Provider>
  );
};