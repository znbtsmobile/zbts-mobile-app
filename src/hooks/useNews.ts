import { useState, useEffect, useCallback } from "react";
import {
  auth,
  db,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  handleFirestoreError,
  OperationType
} from "../services/firebase";
import { NewsItem, NewsCategory } from "../types";
import { playSuccessSound } from "../services/audio";

export const useNews = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "news"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: NewsItem[] = [];
        snapshot.docs.forEach((d: any) => {
          fetched.push({
            id: d.id,
            ...d.data()
          } as NewsItem);
        });
        setNewsItems(fetched);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "news");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const postNews = useCallback(async (
    title: string,
    content: string,
    category: NewsCategory,
    author: string
  ): Promise<string | null> => {
    try {
      const newItem = {
        title: title.trim() || "Taarifa Muhimu",
        content: content.trim(),
        category,
        author: author.trim() || "ZNBTS Staff",
        timestamp: Date.now()
      };

      const docRef = await addDoc(collection(db, "news"), newItem);
      playSuccessSound();
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "news");
      return null;
    }
  }, []);

  const deleteNews = useCallback(async (id: string) => {
    try {
      const docRef = doc(db, "news", id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `news/${id}`);
    }
  }, []);

  return {
    newsItems,
    loading,
    postNews,
    deleteNews
  };
};
